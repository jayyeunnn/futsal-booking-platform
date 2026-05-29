import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, errors } from "@/lib/api-response";
import { isAuthError, requireRole } from "@/lib/auth-helpers";
import {
  updatePaymentMethodSchema,
  type UpdatePaymentMethodInput,
} from "@/lib/validations/settings";

/**
 * PUT /api/admin/payment-methods/[id]
 * Partial update payment method.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const parsed = updatePaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return errors.validation(
        parsed.error.issues[0]?.message ?? "Data tidak valid",
        parsed.error.issues
      );
    }
    const existing = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) return errors.notFound("Payment method tidak ditemukan");

    const data = parsed.data as UpdatePaymentMethodInput;
    const updated = await prisma.paymentMethod.update({
      where: { id: existing.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.accountNumber !== undefined && {
          accountNumber: data.accountNumber,
        }),
        ...(data.accountHolder !== undefined && {
          accountHolder: data.accountHolder,
        }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
    return ok(updated);
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("PUT /api/admin/payment-methods/[id] error:", e);
    return errors.server("Gagal update payment method");
  }
}

/**
 * DELETE /api/admin/payment-methods/[id]
 * Hard delete (no FK constraint to bookings/payments since we store
 * paymentMethod as string snapshot).
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(["ADMIN"]);
    const existing = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) return errors.notFound("Payment method tidak ditemukan");

    await prisma.paymentMethod.delete({ where: { id: existing.id } });
    return ok({ deleted: true });
  } catch (e) {
    if (isAuthError(e))
      return e.status === 403
        ? errors.forbidden(e.message)
        : errors.unauthorized(e.message);
    console.error("DELETE /api/admin/payment-methods/[id] error:", e);
    return errors.server("Gagal hapus payment method");
  }
}
