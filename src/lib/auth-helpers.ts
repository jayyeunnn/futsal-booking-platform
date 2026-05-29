import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole, MemberTier } from "@/types";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  tier: MemberTier;
};

/**
 * Get current session user, or null when not signed in.
 * Use this in route handlers / server actions.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as Partial<SessionUser> & { email?: string | null };
  if (!u.id || !u.email || !u.role || !u.tier) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    tier: u.tier,
  };
}

/**
 * Throws when user is not authenticated. Returns a typed user otherwise.
 * Wrap in try/catch and convert to API response.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError("AUTH_REQUIRED", "Login diperlukan", 401);
  }
  return user;
}

export async function requireRole(
  roles: UserRole | UserRole[]
): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) {
    throw new AuthError("FORBIDDEN", "Akses ditolak", 403);
  }
  return user;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function isAuthError(e: unknown): e is AuthError {
  return e instanceof AuthError;
}
