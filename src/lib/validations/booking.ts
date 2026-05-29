import { z } from "zod";

export const createBookingSchema = z.object({
  courtId: z.string().min(1, "Lapangan wajib dipilih"),
  bookingDate: z.string().min(1, "Tanggal wajib dipilih"),
  startTime: z.string().min(1, "Waktu mulai wajib dipilih"),
  endTime: z.string().min(1, "Waktu selesai wajib dipilih"),
  paymentType: z.enum(["DP", "FULL"]),
  paymentMethod: z.string().min(1, "Metode pembayaran wajib dipilih"),
  promoCode: z.string().optional(),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(5, "Alasan pembatalan minimal 5 karakter"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
