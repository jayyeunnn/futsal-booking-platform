import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+?62|0)[0-9]{8,13}$/,
      "Nomor HP tidak valid (gunakan format 08xxx atau +62xxx)"
    )
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Password baru harus berbeda dari password lama",
    path: ["newPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
