import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        courts: { where: { isActive: true }, select: { id: true, type: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      phone: loc.phone,
      openTime: loc.openTime,
      closeTime: loc.closeTime,
      thumbnailUrl: loc.thumbnailUrl,
      totalCourts: loc.courts.length,
      indoorCourts: loc.courts.filter((c) => c.type === "INDOOR").length,
      outdoorCourts: loc.courts.filter((c) => c.type === "OUTDOOR").length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil data lokasi" } },
      { status: 500 }
    );
  }
}
