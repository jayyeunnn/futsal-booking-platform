import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const courtId = params.id;

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Parameter date wajib (YYYY-MM-DD)" } },
        { status: 422 }
      );
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        location: { select: { openTime: true, closeTime: true } },
        pricing: { where: { isActive: true } },
      },
    });

    if (!court || !court.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lapangan tidak ditemukan" } },
        { status: 404 }
      );
    }

    const bookingDate = new Date(dateStr);
    const bookings = await prisma.booking.findMany({
      where: {
        courtId,
        bookingDate,
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
      select: { startTime: true, endTime: true, status: true },
    });

    const openHour = parseInt(court.location.openTime.split(":")[0]);
    const closeHour = court.location.closeTime === "00:00" ? 24 : parseInt(court.location.closeTime.split(":")[0]);
    const dayOfWeek = bookingDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType = isWeekend ? "WEEKEND" : "WEEKDAY";

    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      const booking = bookings.find((b) => {
        const bStart = parseInt(b.startTime.split(":")[0]);
        const bEnd = parseInt(b.endTime.split(":")[0]);
        return hour >= bStart && hour < bEnd;
      });

      let status: "available" | "pending" | "booked" = "available";
      if (booking) {
        status = booking.status === "PENDING_PAYMENT" || booking.status === "PENDING_CONFIRMATION" ? "pending" : "booked";
      }

      const timeType = hour >= 16 ? "PRIME_TIME" : "REGULAR";
      const pricing = court.pricing.find((p) => p.dayType === dayType && p.timeType === timeType);

      slots.push({
        time: timeStr,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
        status,
        price: pricing ? Number(pricing.pricePerHour) : 0,
        dayType,
        timeType,
      });
    }

    return NextResponse.json({ success: true, data: { courtId, date: dateStr, dayType, slots } });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil ketersediaan" } },
      { status: 500 }
    );
  }
}
