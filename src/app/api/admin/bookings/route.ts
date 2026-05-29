import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      ...(status && status !== "ALL" && { status: status as "CONFIRMED" }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, tier: true } },
          court: { include: { location: { select: { name: true } } } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
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
    console.error("Admin get bookings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil data booking" } },
      { status: 500 }
    );
  }
}
