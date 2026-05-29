import { z } from "zod";

/**
 * App settings — key-value configurable yang controllable via admin UI.
 * Setiap key di-validate type spesifik via zod.
 */
export const appSettingsSchema = z.object({
  dp_percentage: z
    .number()
    .int("Harus angka bulat")
    .min(10, "DP minimal 10%")
    .max(100, "DP maksimal 100%"),
  payment_deadline_minutes: z
    .number()
    .int()
    .min(15, "Minimal 15 menit")
    .max(1440, "Maksimal 24 jam (1440 menit)"),
  refund_policy_h1: z
    .number()
    .int()
    .min(0)
    .max(100, "Persentase 0-100"),
  refund_policy_same_day_3h: z
    .number()
    .int()
    .min(0)
    .max(100, "Persentase 0-100"),
  refund_policy_less_3h: z
    .number()
    .int()
    .min(0)
    .max(100, "Persentase 0-100"),
  points_per_hour: z.number().int().min(0).max(1000),
  points_review: z.number().int().min(0).max(100),
  points_referral: z.number().int().min(0).max(1000),
  points_bonus_off_peak: z.number().int().min(0).max(100),
});

export type AppSettingsInput = z.infer<typeof appSettingsSchema>;

/**
 * Payment method — bank/e-wallet account info ditampilkan saat checkout.
 */
export const createPaymentMethodSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(50),
  type: z.enum(["BANK_TRANSFER", "E_WALLET"]),
  accountNumber: z
    .string()
    .trim()
    .min(3, "No rekening minimal 3 karakter")
    .max(50),
  accountHolder: z
    .string()
    .trim()
    .min(2, "Nama pemilik minimal 2 karakter")
    .max(100),
  logoUrl: z.string().url("URL logo tidak valid").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

export type CreatePaymentMethodInput = z.infer<
  typeof createPaymentMethodSchema
>;
export type UpdatePaymentMethodInput = z.infer<
  typeof updatePaymentMethodSchema
>;
