import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "AUTH_REQUIRED", message: "Login diperlukan" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, proofImageUrl } = body;

    if (!bookingId || !proofImageUrl) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "bookingId dan proofImageUrl wajib" } },
        { status: 422 }
      );
    }

    const userId = (session.user as { id: string }).id;
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId, status: "PENDING_PAYMENT" },
      include: { payments: { where: { status: "PENDING" } } },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Booking tidak ditemukan atau sudah dibayar" } },
        { status: 404 }
      );
    }

    const payment = booking.payments[0];
    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Data pembayaran tidak ditemukan" } },
        { status: 404 }
      );
    }

    // Check deadline
    if (new Date() > payment.expiresAt) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "EXPIRED" } });
      await prisma.booking.update({ where: { id: bookingId }, data: { status: "EXPIRED" } });
      return NextResponse.json(
        { success: false, error: { code: "PAYMENT_EXPIRED", message: "Batas waktu pembayaran telah lewat." } },
        { status: 410 }
      );
    }

    // Update payment with proof
    await prisma.payment.update({
      where: { id: payment.id },
      data: { proofImageUrl, status: "UPLOADED" },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PENDING_CONFIRMATION" },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin.",
        bookingId,
        status: "PENDING_CONFIRMATION",
      },
    });
  } catch (error) {
    console.error("Upload proof error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal upload bukti pembayaran" } },
      { status: 500 }
    );
  }
}
