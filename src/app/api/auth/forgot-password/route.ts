import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/emails/render";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP supaya endpoint ini tidak dipakai untuk email-bombing.
    const ip = getClientIp(request);
    const rl = checkRateLimit(
      `forgot:${ip}`,
      RATE_LIMITS.forgotPassword.limit,
      RATE_LIMITS.forgotPassword.windowMs,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Terlalu banyak permintaan. Coba lagi dalam ${rl.retryAfter} detik.`,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        },
      );
    }

    const body = await request.json();

    const validated = forgotPasswordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.issues[0]?.message || "Email tidak valid",
          },
        },
        { status: 422 },
      );
    }

    const { email } = validated.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if user not found — jangan bocorkan apakah
    // email terdaftar (PRD §5.4 security).
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          message: "Jika email terdaftar, link reset password telah dikirim.",
        },
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/id/reset-password?token=${encodeURIComponent(
      token,
    )}&email=${encodeURIComponent(email)}`;

    // Best-effort email send. `sendEmail` jadi no-op kalau RESEND_API_KEY belum
    // di-set, jadi aman di local tanpa kredensial.
    try {
      await sendPasswordResetEmail(email, user.name, resetLink);
    } catch (e) {
      console.error("[forgot-password] email send failed", e);
    }

    if (!process.env.RESEND_API_KEY) {
      // Dev hint biar developer tetap bisa test tanpa setup email service.
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Jika email terdaftar, link reset password telah dikirim.",
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Terjadi kesalahan server. Silakan coba lagi.",
        },
      },
      { status: 500 },
    );
  }
}
