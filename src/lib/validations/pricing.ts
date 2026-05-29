import { z } from "zod";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Single pricing row — 1 kombinasi day_type × time_type per court.
 */
export const pricingRowSchema = z.object({
  dayType: z.enum(["WEEKDAY", "WEEKEND"]),
  timeType: z.enum(["REGULAR", "PRIME_TIME"]),
  startHour: z.string().regex(timeRegex, "Format jam tidak valid (HH:mm)"),
  endHour: z.string().regex(timeRegex, "Format jam tidak valid (HH:mm)"),
  pricePerHour: z
    .number()
    .min(0, "Harga harus >= 0")
    .max(100_000_000, "Harga terlalu besar"),
  isActive: z.boolean().default(true),
});

/**
 * Bulk update — admin sekaligus replace semua pricing rows untuk 1 court.
 * Lebih ergonomis daripada CRUD per row.
 */
export const bulkUpdatePricingSchema = z.object({
  rows: z.array(pricingRowSchema).min(1, "Minimal 1 baris harga"),
});

export type PricingRowInput = z.infer<typeof pricingRowSchema>;
export type BulkUpdatePricingInput = z.infer<typeof bulkUpdatePricingSchema>;
