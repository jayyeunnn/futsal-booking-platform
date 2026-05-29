import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import {
  applyReferralOnRegister,
  ensureReferralCode,
} from "@/lib/referrals";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP — cegah spam akun baru.
    const ip = getClientIp(request);
    const rl = checkRateLimit(
      `register:${ip}`,
      RATE_LIMITS.register.limit,
      RATE_LIMITS.register.windowMs,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Terlalu banyak percobaan registrasi. Coba lagi dalam ${rl.retryAfter} detik.`,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfter) },
        },
      );
    }

    const body = await request.json();

    // Validate input
    const validated = registerSchema.safeParse({
      ...body,
      confirmPassword: body.password, // API doesn't need confirm, handled by client
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.issues[0]?.message || "Data tidak valid",
            details: validated.error.issues,
          },
        },
        { status: 422 }
      );
    }

    const { name, email, phone, password, referralCode } = body as {
      name: string;
      email: string;
      phone?: string;
      password: string;
      referralCode?: string;
    };

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_EMAIL",
            message: "Email sudah terdaftar. Silakan login atau gunakan email lain.",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with Bronze tier (default member)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "USER",
        tier: "BRONZE",
        totalPoints: 0,
        totalBookings: 0,
        provider: "credentials",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        createdAt: true,
      },
    });

    // Apply referral code (non-fatal: log on failure).
    if (referralCode && referralCode.trim().length > 0) {
      try {
        await applyReferralOnRegister(user.id, referralCode);
      } catch (e) {
        console.error("[register] applyReferralOnRegister failed", e);
      }
    }

    // Ensure every new user has their own referral code (non-fatal).
    try {
      await ensureReferralCode(user.id);
    } catch (e) {
      console.error("[register] ensureReferralCode failed", e);
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
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
