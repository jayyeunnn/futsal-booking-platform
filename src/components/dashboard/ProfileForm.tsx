"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, User, Camera, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { showToast } from "@/lib/toast";

type Props = {
  defaultValues: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
};

/**
 * Editable profile form (name, phone, avatar).
 * Email is locked because changing it requires re-verification (Phase 3).
 */
export function ProfileForm({ defaultValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultValues.name);
  const [phone, setPhone] = useState(defaultValues.phone);
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/members/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatarUrl }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json?.error?.message ?? "Gagal menyimpan";
        setFeedback({ kind: "err", message: msg });
        showToast.error("Profil gagal disimpan", msg);
        return;
      }
      setFeedback({ kind: "ok", message: "Profil berhasil disimpan" });
      showToast.success("Profil berhasil disimpan");
      // Refresh server components (sidebar header user info, dashboard).
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      setFeedback({ kind: "err", message: msg });
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSave}
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

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Foto Profil
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <UploadButton
              endpoint="avatar"
              appearance={{
                button:
                  "ut-ready:bg-primary ut-ready:text-white ut-ready:px-4 ut-ready:h-10 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50",
                allowedContent: "text-xs text-text-secondary",
              }}
              content={{
                button: ({ ready, isUploading }) =>
                  isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </span>
                  ) : ready ? (
                    <span className="flex items-center gap-2">
                      <Camera className="h-4 w-4" /> Upload Foto
                    </span>
                  ) : (
                    "Loading..."
                  ),
              }}
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.url;
                if (url) {
                  setAvatarUrl(url);
                  setFeedback({
                    kind: "ok",
                    message: "Foto terupload. Klik Simpan untuk menyimpan.",
                  });
                }
              }}
              onUploadError={(e) => {
                setFeedback({
                  kind: "err",
                  message: e.message ?? "Upload gagal",
                });
              }}
            />
            {avatarUrl && (
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl("");
                  setFeedback({
                    kind: "ok",
                    message: "Foto dihapus. Klik Simpan untuk menyimpan.",
                  });
                }}
                className="text-xs text-error hover:underline text-left"
              >
                Hapus foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Email (locked) */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={defaultValues.email}
          disabled
          className="w-full h-11 px-4 rounded-lg border border-border bg-muted text-text-secondary cursor-not-allowed"
        />
        <p className="text-xs text-text-secondary mt-1">
          Email tidak bisa diubah. Hubungi admin jika perlu mengganti.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          No. WhatsApp
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxx atau +62xxx"
          className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

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
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
