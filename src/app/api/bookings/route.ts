import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createBookingSchema } from "@/lib/validations/booking";
import { getMemberDiscountPct } from "@/lib/rewards";
import { validateDiscountCode } from "@/lib/promos";
import { createNotification } from "@/lib/notifications";
import { sendBookingCreatedEmail } from "@/emails/render";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { MemberTier } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login diperlukan" } },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      userId,
      ...(status && { status: status as "CONFIRMED" | "COMPLETED" | "CANCELLED" }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          court: { include: { location: { select: { name: true, address: true } } } },
          payments: { select: { id: true, status: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: { page, totalPages: Math.ceil(total / limit), totalItems: total },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil booking" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login diperlukan" } },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    // Rate limit per user — cegah spam booking.
    const rl = checkRateLimit(
      `booking:${userId}`,
      RATE_LIMITS.booking.limit,
      RATE_LIMITS.booking.windowMs,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Terlalu banyak booking dalam waktu singkat. Coba lagi dalam ${rl.retryAfter} detik.`,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        },
      );
    }

    const body = await request.json();
    const validated = createBookingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.issues[0]?.message || "Data tidak valid" } },
        { status: 422 }
      );
    }

    const { courtId, bookingDate, startTime, endTime, paymentType, paymentMethod } = validated.data;

    // Verify court
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { pricing: { where: { isActive: true } } },
    });

    if (!court || !court.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lapangan tidak ditemukan" } },
        { status: 404 }
      );
    }

    // Double booking check
    const date = new Date(bookingDate);
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId,
        bookingDate: date,
        status: { notIn: ["CANCELLED", "EXPIRED"] },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: { code: "BOOKING_CONFLICT", message: "Jadwal sudah terbooked" } },
        { status: 409 }
      );
    }

    // Calculate price
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    const durationHours = endHour - startHour;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

    let totalPrice = 0;
    for (let h = startHour; h < endHour; h++) {
      const timeType = h >= 16 ? "PRIME_TIME" : "REGULAR";
      const pricing = court.pricing.find((p) => p.dayType === dayType && p.timeType === timeType);
      totalPrice += pricing ? Number(pricing.pricePerHour) : 0;
    }

    // Apply member tier discount (Bronze 0%, Silver 10%, Gold 20%).
    const userTier = ((session.user as { tier?: string }).tier ?? "BRONZE") as MemberTier;
    const memberDiscountPct = getMemberDiscountPct(userTier);
    const memberDiscount =
      memberDiscountPct > 0
        ? Math.ceil((totalPrice * memberDiscountPct) / 100)
        : 0;
    const subtotal = totalPrice;
    totalPrice = totalPrice - memberDiscount;

    // Apply optional promo/redemption code on top of member discount.
    let promoDiscount = 0;
    let appliedPromoId: string | null = null;
    let appliedRedemptionId: string | null = null;
    let appliedCodeLabel: string | null = null;

    if (validated.data.promoCode) {
      const hourlyRate = totalPrice / durationHours;
      const result = await validateDiscountCode({
        code: validated.data.promoCode,
        totalAmount: totalPrice,
        userId,
        userTier,
        hourlyRate,
      });
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: { code: result.code, message: result.message } },
          { status: 400 }
        );
      }
      promoDiscount = result.discountAmount;
      totalPrice = result.finalAmount;
      if (result.kind === "promo") {
        appliedPromoId = result.promoId;
        appliedCodeLabel = result.code;
      } else {
        appliedRedemptionId = result.redemptionId;
        appliedCodeLabel = result.code;
      }
    }

    const dpAmount = paymentType === "DP" ? Math.ceil(totalPrice * 0.5) : null;
    const payableAmount = paymentType === "DP" ? dpAmount! : totalPrice;

    // Create booking + payment + bump promo/redemption usage atomically.
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          userId,
          courtId,
          bookingDate: date,
          startTime,
          endTime,
          durationHours,
          totalPrice,
          dpAmount,
          paymentType: paymentType as "DP" | "FULL",
          status: "PENDING_PAYMENT",
          isRecurring: validated.data.isRecurring,
          notes: validated.data.notes,
        },
      });

      await tx.payment.create({
        data: {
          bookingId: created.id,
          amount: payableAmount,
          paymentMethod,
          paymentType: paymentType as "DP" | "FULL",
          status: "PENDING",
          expiresAt,
        },
      });

      // Bump promo usage counter atomically.
      if (appliedPromoId) {
        await tx.promo.update({
          where: { id: appliedPromoId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Mark redemption as used atomically.
      if (appliedRedemptionId) {
        await tx.redemption.update({
          where: { id: appliedRedemptionId },
          data: { usedAt: new Date(), usedBookingId: created.id },
        });
      }

      return created;
    });

    // If user opted in to recurring, create a template so future weeks
    // are generated by the daily cron job. Idempotent — same court/dayOfWeek/time
    // for the user is reused if already exists & active.
    if (validated.data.isRecurring) {
      const dayOfWeek = date.getDay();
      const existing = await prisma.recurringBooking.findFirst({
        where: {
          userId,
          courtId,
          dayOfWeek,
          startTime,
          endTime,
          isActive: true,
        },
        select: { id: true },
      });
      const recurring = existing
        ? existing
        : await prisma.recurringBooking.create({
            data: {
              userId,
              courtId,
              dayOfWeek,
              startTime,
              endTime,
              startDate: date,
              isActive: true,
            },
            select: { id: true },
          });
      // Link this booking to the template for traceability.
      await prisma.booking.update({
        where: { id: booking.id },
        data: { recurringId: recurring.id },
      });
    }

    // Notify user (in-app + email). Best-effort — never block the response.
    const bookingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (bookingUser) {
      const formattedDate = format(date, "EEEE, dd MMMM yyyy", {
        locale: idLocale,
      });
      const formattedDeadline = format(expiresAt, "HH:mm 'WIB'", {
        locale: idLocale,
      });
      void createNotification({
        userId,
        title: "Booking Dibuat",
        message: `Selesaikan pembayaran dalam 1 jam. Jadwal ${formattedDate} ${startTime}-${endTime} di ${court.name}.`,
        type: "BOOKING",
        actionUrl: `/dashboard/bookings`,
      }).catch((e) => console.error("[bookings] in-app notif failed", e));

      void sendBookingCreatedEmail(bookingUser.email, {
        userName: bookingUser.name,
        bookingId: booking.id,
        courtName: court.name,
        locationName: (await prisma.location.findUnique({
          where: { id: court.locationId },
          select: { name: true },
        }))?.name ?? "—",
        bookingDate: formattedDate,
        startTime,
        endTime,
        paymentType: paymentType as "DP" | "FULL",
        payableAmount,
        paymentDeadline: formattedDeadline,
      }).catch((e) => console.error("[bookings] email failed", e));
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          bookingId: booking.id,
          subtotal,
          memberDiscountPct,
          memberDiscount,
          promoDiscount,
          appliedCode: appliedCodeLabel,
          totalPrice,
          dpAmount,
          payableAmount,
          paymentDeadline: expiresAt.toISOString(),
          status: "PENDING_PAYMENT",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal membuat booking" } },
      { status: 500 }
    );
  }
}
