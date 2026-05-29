import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.issues[0]?.message || "Data tidak valid",
          },
        },
        { status: 422 }
      );
    }

    const { token, email, password } = validated.data;

    // Find token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Token tidak valid atau sudah kadaluarsa. Silakan request ulang.",
          },
        },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Password berhasil diubah. Silakan login dengan password baru.",
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Terjadi kesalahan server. Silakan coba lagi.",
        },
      },
      { status: 500 }
    );
  }
}
