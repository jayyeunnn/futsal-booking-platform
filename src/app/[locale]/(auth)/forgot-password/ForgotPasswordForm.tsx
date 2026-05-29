"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "id";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Gagal mengirim email reset");
        return;
      }

      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
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

          {sent ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
                Email Terkirim!
              </h1>
              <p className="text-text-secondary text-sm mb-2">
                Kami telah mengirim link reset password ke:
              </p>
              <p className="text-primary font-medium mb-6">{email}</p>
              <p className="text-text-secondary text-sm mb-8">
                Silakan cek inbox atau folder spam Anda. Link berlaku selama 1 jam.
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("forgot_back")}
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-text-primary">
                  {t("forgot_title")}
                </h1>
                <p className="mt-2 text-text-secondary text-sm">
                  {t("forgot_subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Email
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

                <Button
                  type="submit"
                  variant="cta"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    t("forgot_submit")
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("forgot_back")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
