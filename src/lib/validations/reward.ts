import { z } from "zod";

const tierEnum = z.enum(["BRONZE", "SILVER", "GOLD"]);
const rewardTypeEnum = z.enum([
  "DISCOUNT_PERCENT",
  "DISCOUNT_AMOUNT",
  "FREE_SESSION",
  "MERCHANDISE",
]);

/**
 * Inner shape for reward CRUD. Refinements (cross-field validation)
 * applied on top — `value` rules differ per `type`.
 */
const rewardBaseShape = {
  /**
   * Stable identifier — di-persist ke `Redemption.rewardKey`. Lowercase +
   * snake_case enforced by regex untuk konsistensi dengan reward lama
   * (`discount_10`, `free_session`, dst.).
   */
  code: z
    .string()
    .trim()
    .min(3, "Kode minimal 3 karakter")
    .max(50, "Kode maksimal 50 karakter")
    .regex(
      /^[a-z0-9_]+$/,
      "Kode hanya boleh huruf kecil, angka, dan underscore"
    ),
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(200),
  nameEn: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
  pointsCost: z
    .number()
    .int("Biaya poin harus angka bulat")
    .positive("Biaya poin harus lebih dari 0")
    .max(1_000_000, "Biaya poin terlalu besar"),
  type: rewardTypeEnum,
  value: z
    .number()
    .int("Nilai harus angka bulat")
    .min(1, "Nilai harus lebih dari 0")
    .max(10_000_000, "Nilai terlalu besar"),
  validForDays: z
    .number()
    .int("Validity harus angka bulat")
    .min(1, "Validity minimum 1 hari")
    .max(365, "Validity maksimum 365 hari")
    .default(60),
  minTier: tierEnum.optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z
    .number()
    .int("Urutan harus angka bulat")
    .min(0)
    .max(9999)
    .default(0),
} as const;

const rewardBaseObject = z.object(rewardBaseShape);
const rewardPartialObject = rewardBaseObject.partial();

/**
 * Validate cross-field rules:
 *   - DISCOUNT_PERCENT: value 1-100 (interpreted as %).
 *   - FREE_SESSION: value 1-12 (jam free).
 *   - MERCHANDISE: value harus 1 (placeholder, tidak dipakai di redemption flow).
 *   - DISCOUNT_AMOUNT: value 1000-10_000_000 (rupiah).
 */
const refinements = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodTypeAny
) =>
  schema.refine(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (data.type === undefined || data.value === undefined) return true;
      if (data.type === "DISCOUNT_PERCENT") {
        return data.value >= 1 && data.value <= 100;
      }
      if (data.type === "FREE_SESSION") {
        return data.value >= 1 && data.value <= 12;
      }
      if (data.type === "DISCOUNT_AMOUNT") {
        return data.value >= 1000;
      }
      return true; // MERCHANDISE — value bebas (1 biasanya).
    },
    {
      message:
        "Nilai tidak sesuai tipe reward (Persen 1-100, Free Session 1-12 jam, Nominal min 1.000)",
      path: ["value"],
    }
  );

export const createRewardSchema = refinements(rewardBaseObject);
export const updateRewardSchema = refinements(rewardPartialObject);

export type CreateRewardInput = z.infer<typeof rewardBaseObject>;
export type UpdateRewardInput = z.infer<typeof rewardPartialObject>;
