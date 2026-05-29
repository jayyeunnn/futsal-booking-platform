import { z } from "zod";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const createRecurringBookingSchema = z.object({
  courtId: z.string().min(1, "Lapangan wajib dipilih"),
  /** 0=Sunday, 1=Monday, ..., 6=Saturday — matches JS Date.getDay(). */
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Format jam tidak valid (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Format jam tidak valid (HH:mm)"),
  /** ISO date string for the first booking. */
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  /** Optional ISO date string. Null = berlaku sampai user batalkan. */
  endDate: z.string().nullable().optional(),
});

export const updateRecurringBookingSchema = z.object({
  isActive: z.boolean().optional(),
  endDate: z.string().nullable().optional(),
});

export type CreateRecurringBookingInput = z.infer<
  typeof createRecurringBookingSchema
>;
export type UpdateRecurringBookingInput = z.infer<
  typeof updateRecurringBookingSchema
>;
