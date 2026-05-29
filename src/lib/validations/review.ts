import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId wajib diisi"),
  rating: z
    .number()
    .int("Rating harus angka")
    .min(1, "Rating minimal 1")
    .max(5, "Rating maksimal 5"),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
