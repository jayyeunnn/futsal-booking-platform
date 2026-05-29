"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { celebrateBig } from "@/lib/confetti";
import { ValidatedInput, validators } from "@/components/shared/ValidatedInput";
import { FieldHint } from "@/components/shared/FieldHint";

type Props = {
  /** Apakah Google OAuth tersedia (env GOOGLE_CLIENT_ID + SECRET ada). */
  googleEnabled: boolean;
};

export default function RegisterForm({ googleEnabled }: Props) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "id";

  const refFromUrl = (searchParams.get("ref") || "").trim().toUpperCase();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: refFromUrl,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(form.password);
  const strengthLabel = ["", "Lemah", "Lemah", "Medium", "Kuat", "Sangat Kuat"][strengthScore] || "";
  const strengthColor = ["", "bg-error", "bg-error", "bg-warning", "bg-accent", "bg-accent"][strengthScore] || "";

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (form.name.length < 2) errors.name = "Nama minimal 2 karakter";
    if (!form.email.includes("@")) errors.email = "Email tidak valid";
    if (form.password.length < 6) errors.password = "Password minimal 6 karakter";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Password tidak cocok";
    if (!agreed) errors.agreed = "Anda harus menyetujui terms";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          referralCode: form.referralCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || "Registrasi gagal";
        setError(msg);
        showToast.error("Registrasi gagal", msg);
        return;
      }

      showToast.success("Akun berhasil dibuat!", "Selamat datang di JayField 🎉");
      celebrateBig();

      // Auto login after register
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/login`);
      }
    } catch {
      const msg = "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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
              {t("register_title")}
            </h1>
            <p className="mt-2 text-text-secondary">{t("register_subtitle")}</p>
          </div>

          {/* Google Register — hanya muncul kalau env-nya ada */}
          {googleEnabled && (
          <Button
            variant="secondary"
            className="w-full h-12 gap-3 text-base"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {t("register_google")}
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

            <ValidatedInput
              label={t("register_name")}
              value={form.name}
              onChange={(v) => updateForm("name", v)}
              validate={validators.minLength(2, "Nama")}
              placeholder="John Doe"
              required
            />

            <ValidatedInput
              type="email"
              label={t("register_email")}
              value={form.email}
              onChange={(v) => updateForm("email", v)}
              validate={validators.email}
              placeholder="email@example.com"
              required
            />
            <FieldHint className="-mt-2">
              Untuk konfirmasi booking & link reset password.
            </FieldHint>

            <ValidatedInput
              type="tel"
              label={t("register_phone")}
              value={form.phone}
              onChange={(v) => updateForm("phone", v)}
              validate={validators.phoneId}
              placeholder="+62 812 xxxx xxxx"
            />
            <FieldHint className="-mt-2">
              Opsional — untuk reminder H-1 booking via WhatsApp di masa depan.
            </FieldHint>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {t("register_password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full h-11 px-4 pr-11 rounded-lg border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    fieldErrors.password ? "border-error" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all`}
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">{strengthLabel}</span>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                {t("register_confirm_password")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateForm("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full h-11 px-4 pr-11 rounded-lg border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                    fieldErrors.confirmPassword ? "border-error" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="mt-1 text-xs text-success flex items-center gap-1">
                  <Check className="h-3 w-3" /> Password cocok
                </p>
              )}
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-error">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setFieldErrors((prev) => ({ ...prev, agreed: "" }));
                }}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="agree" className="text-sm text-text-secondary">
                {t("register_agree")}{" "}
                <Link href="#" className="text-primary hover:text-primary-light underline">
                  {t("register_terms")}
                </Link>
              </label>
            </div>
            {fieldErrors.agreed && (
              <p className="text-xs text-error -mt-2">{fieldErrors.agreed}</p>
            )}

            {/* Referral code */}
            {refFromUrl ? (
              <div className="rounded-lg bg-primary/5 border border-primary/30 px-4 py-3 flex items-center gap-3">
                <Gift className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary">
                    Pakai kode referral
                  </p>
                  <p className="font-mono text-sm font-bold text-primary truncate">
                    {form.referralCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("referralCode", "")}
                  className="text-xs text-text-secondary hover:text-error transition-colors"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Kode referral{" "}
                  <span className="text-text-secondary font-normal">(opsional)</span>
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={form.referralCode}
                  onChange={(e) =>
                    updateForm("referralCode", e.target.value.toUpperCase())
                  }
                  placeholder="JF-XXXXXX"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors uppercase"
                />
              </div>
            )}

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
                t("register_submit")
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            {t("register_has_account")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-primary font-medium hover:text-primary-light transition-colors"
            >
              {tCommon("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
