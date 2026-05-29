/**
 * Lightweight in-memory rate limiter.
 *
 * Cocok untuk single-instance deploy (Vercel serverless tetap pakai per-isolate
 * memory, jadi efektif untuk burst protection per warm instance). Untuk
 * production multi-region yang ketat, ganti ke Upstash/Redis-based limiter
 * — interface `checkRateLimit` ini sengaja dibuat compatible.
 *
 * Algoritma: fixed window per key. Setelah `windowMs` lewat, counter di-reset.
 * Cocok untuk endpoint mutating yang spam-prone (login, register, booking).
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** Hapus bucket yang sudah expired secara periodik supaya memory tidak bocor. */
function gc(now: number) {
  // Bersihkan setiap 100 entry — cukup murah untuk dipanggil tiap check.
  if (buckets.size < 1000) return;
  buckets.forEach((b, key) => {
    if (b.resetAt <= now) buckets.delete(key);
  });
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  /** Detik sampai window reset — dipakai untuk header `Retry-After`. */
  retryAfter: number;
};

/**
 * Cek apakah `key` masih dalam quota.
 * @param key Identifier unik. Sebaiknya gabungkan endpoint + IP/userId.
 * @param limit Berapa kali request diperbolehkan dalam window.
 * @param windowMs Durasi window dalam millisecond.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  gc(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const newBucket: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, newBucket);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: newBucket.resetAt,
      retryAfter: 0,
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
    retryAfter: 0,
  };
}

/**
 * Resolve client IP dari NextRequest. Fallback ke "anonymous" kalau tidak
 * ketemu (biar tetap jalan di local dev).
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

/**
 * Preset rate limit untuk endpoint sensitive.
 * Angka konservatif, di-tune supaya nggak nyiksa user normal tapi ngeblok
 * attacker yang spam.
 */
export const RATE_LIMITS = {
  /** Login: 10 percobaan per 5 menit per IP. */
  login: { limit: 10, windowMs: 5 * 60 * 1000 },
  /** Register: 5 akun baru per 15 menit per IP. */
  register: { limit: 5, windowMs: 15 * 60 * 1000 },
  /** Forgot password: 5 request per 15 menit per IP. */
  forgotPassword: { limit: 5, windowMs: 15 * 60 * 1000 },
  /** Booking POST: 20 booking per 5 menit per user. */
  booking: { limit: 20, windowMs: 5 * 60 * 1000 },
  /** Promo validate: 30 percobaan per 5 menit per user. */
  promoValidate: { limit: 30, windowMs: 5 * 60 * 1000 },
} as const;
