"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type Props = {
  /** Apakah Google OAuth tersedia (env GOOGLE_CLIENT_ID + SECRET ada). */
  googleEnabled: boolean;
};

export default function LoginForm({ googleEnabled }: Props) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split("/")[1] || "id";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        showToast.error("Login gagal", result.error);
      } else {
        showToast.success("Selamat datang kembali!");
        // Smart redirect: admin/staff → /admin, user → /dashboard
        const session = await fetch("/api/auth/session").then((r) =>
          r.json()
        );
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "STAFF") {
          router.push(`/${locale}/admin`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
      }
    } catch {
      const msg = "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: `/${locale}/dashboard` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="bg-surface rounded-2xl shadow-lg p-8 border border-border">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href={`/${locale}`}>
              <span className="text-3xl font-heading font-bold text-primary">
                Jay<span className="text-cta">Field</span>
              </span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {t("login_title")}
            </h1>
            <p className="mt-2 text-text-secondary">{t("login_subtitle")}</p>
          </div>

          {/* Google Login — hanya ditampilkan kalau env-nya ada */}
          {googleEnabled && (
          <Button
            variant="secondary"
            className="w-full h-12 gap-3 text-base"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {t("login_google")}
          </Button>
          )}

          {/* Divider — hanya muncul kalau ada provider OAuth */}
          {googleEnabled && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-text-secondary">{tCommon("or")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {t("login_email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {t("login_password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                {t("login_forgot")}
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="cta"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t("login_submit")
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            {t("login_no_account")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary font-medium hover:text-primary-light transition-colors"
            >
              {tCommon("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
