import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  courtId: z.string().min(1, "courtId wajib diisi"),
});

/**
 * GET /api/members/favorites
 * Returns the current user's favorite courts with embed data
 * needed for quick re-booking.
 */
export async function GET() {
  try {
    const auth = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.id },
      include: {
        court: {
          include: {
            location: { select: { id: true, name: true, address: true } },
            pricing: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(favorites);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("GET /api/members/favorites error:", e);
    return errors.server("Gagal memuat favorit");
  }
}

/**
 * POST /api/members/favorites
 * Body: { courtId: string }
 * Adds a court to the user's favorites. Idempotent — returns existing record
 * if already favorited.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid"
      );
    }

    // Verify court exists & is active.
    const court = await prisma.court.findUnique({
      where: { id: parsed.data.courtId },
      select: { id: true, isActive: true },
    });
    if (!court || !court.isActive) {
      return errors.notFound("Lapangan tidak ditemukan atau nonaktif");
    }

    const fav = await prisma.favorite.upsert({
      where: {
        userId_courtId: {
          userId: auth.id,
          courtId: court.id,
        },
      },
      create: { userId: auth.id, courtId: court.id },
      update: {},
    });

    return created(fav);
  } catch (e) {
    if (isAuthError(e)) return errors.unauthorized(e.message);
    console.error("POST /api/members/favorites error:", e);
    return errors.server("Gagal menambah favorit");
  }
}
