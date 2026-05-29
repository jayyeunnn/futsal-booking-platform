import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations/suggest?q=...
 *
 * Public endpoint — return up to 5 lokasi yang match prefix nama/kota.
 * Dipakai untuk auto-suggest dropdown di booking flow.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (q.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, city: true, address: true },
      take: 5,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: locations });
  } catch (e) {
    console.error("GET /api/locations/suggest error:", e);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal" } },
      { status: 500 },
    );
  }
}
