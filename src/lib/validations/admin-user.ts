import { z } from "zod";

const roleEnum = z.enum(["USER", "STAFF", "ADMIN"]);

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+?62|0)[0-9]{8,13}$/,
      "Nomor HP tidak valid (gunakan format 08xxx atau +62xxx)"
    )
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password minimal 8 karakter").max(100),
  role: roleEnum,
  isActive: z.boolean().default(true),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?62|0)[0-9]{8,13}$/, "Nomor HP tidak valid")
    .optional()
    .or(z.literal("")),
  /** Optional password change. Empty string = no change. */
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100)
    .optional()
    .or(z.literal("")),
  role: roleEnum.optional(),
  isActive: z.boolean().optional(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
