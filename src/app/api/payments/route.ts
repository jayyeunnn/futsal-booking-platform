import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        accountNumber: true,
        accountHolder: true,
        logoUrl: true,
      },
    });

    const bankTransfer = paymentMethods.filter((m) => m.type === "BANK_TRANSFER");
    const eWallet = paymentMethods.filter((m) => m.type === "E_WALLET");

    return NextResponse.json({
      success: true,
      data: { bankTransfer, eWallet },
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil metode pembayaran" } },
      { status: 500 }
    );
  }
}
