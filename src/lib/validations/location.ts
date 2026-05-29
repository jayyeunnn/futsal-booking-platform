import { z } from "zod";

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const locationBaseShape = {
  name: z.string().trim().min(3, "Nama lokasi minimal 3 karakter").max(200),
  address: z.string().trim().min(5, "Alamat minimal 5 karakter"),
  city: z.string().trim().min(2, "Kota minimal 2 karakter").max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  openTime: z
    .string()
    .regex(timeRegex, "Format jam tidak valid (HH:mm)")
    .default("08:00"),
  closeTime: z
    .string()
    .regex(timeRegex, "Format jam tidak valid (HH:mm)")
    .default("00:00"),
  thumbnailUrl: z
    .string()
    .url("URL thumbnail tidak valid")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
} as const;

export const createLocationSchema = z.object(locationBaseShape);
export const updateLocationSchema = z.object(locationBaseShape).partial();

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
