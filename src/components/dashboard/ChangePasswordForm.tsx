"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

/**
 * Change-password form for credentials users.
 * Posts to /api/members/change-password.
 * On success, redirects back to the profile page.
 */
export function ChangePasswordForm({ locale }: { locale: string }) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ kind: "err", message: "Konfirmasi password tidak cocok" });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({
        kind: "err",
        message: "Password baru minimal 6 karakter",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/members/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal mengubah password";
        setFeedback({ kind: "err", message: msg });
        showToast.error("Gagal mengubah password", msg);
        return;
      }
      setFeedback({ kind: "ok", message: "Password berhasil diubah" });
      showToast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Brief pause so the user sees the success state.
      setTimeout(() => router.push(`/${locale}/dashboard/profile`), 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengubah password";
      setFeedback({ kind: "err", message: msg });
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChange,
    visible,
    toggle,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    visible: boolean;
    toggle: () => void;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface border border-border rounded-xl p-6 space-y-5"
    >
      {feedback && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedback.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {feedback.kind === "ok" ? (
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <PasswordInput
        label="Password Lama"
        value={currentPassword}
        onChange={setCurrentPassword}
        visible={show.current}
        toggle={() => setShow((s) => ({ ...s, current: !s.current }))}
      />

      <PasswordInput
        label="Password Baru"
        value={newPassword}
        onChange={setNewPassword}
        visible={show.next}
        toggle={() => setShow((s) => ({ ...s, next: !s.next }))}
        placeholder="Minimal 6 karakter"
      />

      <PasswordInput
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={setConfirmPassword}
        visible={show.confirm}
        toggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="cta"
          className="h-11 px-6"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Ubah Password"
          )}
        </Button>
      </div>
    </form>
  );
}
