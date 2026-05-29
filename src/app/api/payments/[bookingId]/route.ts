import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login diperlukan" } },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const booking = await prisma.booking.findFirst({
      where: { id: params.bookingId, userId },
      include: {
        court: { include: { location: { select: { name: true, address: true } } } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Booking tidak ditemukan" } },
        { status: 404 }
      );
    }

    const payment = booking.payments[0];
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const selectedMethod = paymentMethods.find(
      (m) => m.name.toLowerCase() === payment?.paymentMethod?.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: booking.id,
          courtName: booking.court.name,
          courtType: booking.court.type,
          locationName: booking.court.location.name,
          locationAddress: booking.court.location.address,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          durationHours: Number(booking.durationHours),
          totalPrice: Number(booking.totalPrice),
          dpAmount: booking.dpAmount ? Number(booking.dpAmount) : null,
          paymentType: booking.paymentType,
          status: booking.status,
        },
        payment: payment ? {
          id: payment.id,
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          proofImageUrl: payment.proofImageUrl,
          expiresAt: payment.expiresAt.toISOString(),
        } : null,
        paymentMethodDetails: selectedMethod ? {
          name: selectedMethod.name,
          type: selectedMethod.type,
          accountNumber: selectedMethod.accountNumber,
          accountHolder: selectedMethod.accountHolder,
        } : null,
      },
    });
  } catch (error) {
    console.error("Get payment info error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil info pembayaran" } },
      { status: 500 }
    );
  }
}
