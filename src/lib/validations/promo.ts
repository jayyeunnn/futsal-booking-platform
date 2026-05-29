import { z } from "zod";

const tierEnum = z.enum(["BRONZE", "SILVER", "GOLD"]);

/**
 * Inner shape — partial-able fields without refinements.
 * Refinements (cross-field validation) applied on top of this.
 */
const promoBaseShape = {
  code: z
    .string()
    .trim()
    .min(3, "Kode minimal 3 karakter")
    .max(50, "Kode maksimal 50 karakter")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Kode hanya boleh huruf besar, angka, underscore, dan dash"
    ),
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z
    .number()
    .positive("Nilai diskon harus lebih dari 0")
    .max(10_000_000, "Nilai diskon terlalu besar"),
  minBooking: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z
    .number()
    .int("Batas penggunaan harus angka bulat")
    .min(1)
    .optional()
    .nullable(),
  perUserLimit: z
    .number()
    .int("Batas per user harus angka bulat")
    .min(1, "Minimal 1 kali per user")
    .max(100, "Maksimal 100 kali per user")
    .default(1),
  memberOnly: z.boolean().default(false),
  minTier: tierEnum.optional().nullable(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  isActive: z.boolean().default(true),
} as const;

const promoBaseObject = z.object(promoBaseShape);
const promoPartialObject = promoBaseObject.partial();

/**
 * Validate cross-field rules:
 *  - PERCENTAGE discount must be 1-100
 *  - endDate > startDate
 */
const refinements = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodTypeAny
) =>
  schema
    .refine(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        if (data.discountType === "PERCENTAGE" && data.discountValue !== undefined) {
          return data.discountValue >= 1 && data.discountValue <= 100;
        }
        return true;
      },
      {
        message: "Diskon persentase harus antara 1-100",
        path: ["discountValue"],
      }
    )
    .refine(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data: any) => {
        if (!data.startDate || !data.endDate) return true;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      },
      {
        message: "Tanggal selesai harus setelah tanggal mulai",
        path: ["endDate"],
      }
    );

export const createPromoSchema = refinements(promoBaseObject);
export const updatePromoSchema = refinements(promoPartialObject);

export type CreatePromoInput = z.infer<typeof promoBaseObject>;
export type UpdatePromoInput = z.infer<typeof promoPartialObject>;
