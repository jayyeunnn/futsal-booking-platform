import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const type = searchParams.get("type");

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "locationId wajib diisi" } },
        { status: 422 }
      );
    }

    const courts = await prisma.court.findMany({
      where: {
        locationId,
        isActive: true,
        ...(type && { type: type as "INDOOR" | "OUTDOOR" }),
      },
      include: {
        pricing: { where: { isActive: true }, orderBy: { pricePerHour: "asc" }, take: 1 },
        reviews: { where: { isVisible: true }, select: { rating: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = courts.map((court) => ({
      id: court.id,
      name: court.name,
      type: court.type,
      surface: court.surface,
      capacity: court.capacity,
      facilities: court.facilities,
      photos: court.photos,
      priceFrom: court.pricing[0] ? Number(court.pricing[0].pricePerHour) : null,
      avgRating: court.reviews.length > 0
        ? Math.round((court.reviews.reduce((s, r) => s + r.rating, 0) / court.reviews.length) * 10) / 10
        : 0,
      totalReviews: court.reviews.length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get courts error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengambil data lapangan" } },
      { status: 500 }
    );
  }
}
