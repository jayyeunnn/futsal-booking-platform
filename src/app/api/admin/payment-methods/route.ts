import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, created, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  createPaymentMethodSchema,
  type CreatePaymentMethodInput,
} from "@/lib/validations/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payment-methods
 * List all payment methods (active + inactive) for admin management.
 */
export async function GET() {
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const methods = await prisma.paymentMethod.findMany({
      orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    return ok(methods);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("GET /api/admin/payment-methods error:", e);
    return errors.server("Gagal memuat payment methods");
  }
}

/**
 * POST /api/admin/payment-methods
 * Create a new payment method. Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = createPaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const data = parsed.data as CreatePaymentMethodInput;

    const method = await prisma.paymentMethod.create({
      data: {
        name: data.name,
        type: data.type,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    return created(method);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("POST /api/admin/payment-methods error:", e);
    return errors.server("Gagal membuat payment method");
  }
}
