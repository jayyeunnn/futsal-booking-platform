"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

type Role = "USER" | "STAFF" | "ADMIN";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
};

type Props = {
  locale: string;
  /** When set, form is in edit mode (no email change, password optional). */
  userId?: string;
  defaultValues?: Partial<FormState>;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "STAFF",
  isActive: true,
};

/**
 * Reusable user form for create + edit (admin only).
 * - Email is locked in edit mode (changing it requires re-verification).
 * - Password optional in edit mode (kosongkan = no change).
 */
export function AdminUserForm({ locale, userId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    ...empty,
    ...defaultValues,
    password: "", // never prefill password
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(userId);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone || undefined,
        role: form.role,
        isActive: form.isActive,
      };

      if (!isEdit) {
        payload.email = form.email;
        payload.password = form.password;
      } else if (form.password) {
        payload.password = form.password;
      }

      const url = userId
        ? `/api/admin/users/${userId}`
        : "/api/admin/users";
      const res = await fetch(url, {
        method: userId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menyimpan";
        setError(msg);
        showToast.error(msg);
        return;
      }
      showToast.success(userId ? "User diperbarui" : "User berhasil dibuat");
      router.push(`/${locale}/admin/users`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">Akun</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Nama Lengkap <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Email <span className="text-error">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={isEdit}
              required={!isEdit}
              className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm focus:outline-none focus:ring-2 ${
                isEdit
                  ? "border-border bg-muted text-text-secondary cursor-not-allowed"
                  : "border-border focus:ring-primary/20 focus:border-primary text-text-primary"
              }`}
            />
            {isEdit && (
              <p className="text-[11px] text-text-secondary mt-1">
                Email tidak bisa diubah (butuh verifikasi ulang).
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              No. WhatsApp
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="08xxx atau +62xxx"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Role <span className="text-error">*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value as Role)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="USER">USER (Customer)</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <p className="text-[11px] text-text-secondary mt-1">
              STAFF: konfirmasi booking & payment. ADMIN: full access.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Password{" "}
            {!isEdit && <span className="text-error">*</span>}
            {isEdit && (
              <span className="text-xs text-text-secondary ml-1">
                (kosongkan jika tidak ingin diubah)
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required={!isEdit}
              minLength={isEdit ? undefined : 8}
              maxLength={100}
              placeholder={isEdit ? "Kosongkan untuk skip" : "Min 8 karakter"}
              className="w-full h-10 px-3 pr-11 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">Aktif</span>
            <p className="text-xs text-text-secondary">
              Uncheck untuk nonaktifkan akun (tidak bisa login).
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => router.push(`/${locale}/admin/users`)}
          disabled={saving}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="cta"
          className="h-10 px-6"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {userId ? "Simpan Perubahan" : "Buat User"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
