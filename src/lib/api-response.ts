import { NextResponse } from "next/server";

/**
 * Standardized API response shape used across all routes.
 * Keep this in sync with frontend fetch helpers.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiError = { success: false, error: { code, message, details } };
  return NextResponse.json(body, { status });
}

export const errors = {
  unauthorized: (message = "Login diperlukan") =>
    fail("AUTH_REQUIRED", message, 401),
  forbidden: (message = "Akses ditolak") => fail("FORBIDDEN", message, 403),
  notFound: (message = "Data tidak ditemukan") =>
    fail("NOT_FOUND", message, 404),
  conflict: (message: string) => fail("CONFLICT", message, 409),
  validation: (message: string, details?: unknown) =>
    fail("VALIDATION_ERROR", message, 422, details),
  server: (message = "Terjadi kesalahan server") =>
    fail("SERVER_ERROR", message, 500),
};
