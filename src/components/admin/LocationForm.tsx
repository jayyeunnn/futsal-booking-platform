"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Save, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { UploadButton } from "@/lib/uploadthing";

type FormState = {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  openTime: string;
  closeTime: string;
  thumbnailUrl: string;
  description: string;
  isActive: boolean;
};

type Props = {
  locale: string;
  locationId?: string;
  defaultValues?: Partial<FormState>;
};

const empty: FormState = {
  name: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  openTime: "08:00",
  closeTime: "00:00",
  thumbnailUrl: "",
  description: "",
  isActive: true,
};

/**
 * Reusable location form for both create and edit.
 * Includes UploadThing thumbnail uploader (locationThumbnail endpoint).
 */
export function LocationForm({ locale, locationId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...empty, ...defaultValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        phone: form.phone || undefined,
        email: form.email || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        openTime: form.openTime,
        closeTime: form.closeTime,
        thumbnailUrl: form.thumbnailUrl || undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      };

      const url = locationId
        ? `/api/admin/locations/${locationId}`
        : "/api/admin/locations";
      const res = await fetch(url, {
        method: locationId ? "PUT" : "POST",
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

      showToast.success(
        locationId ? "Lokasi diperbarui" : "Lokasi berhasil dibuat"
      );
      router.push(`/${locale}/admin/locations`);
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
        <h2 className="font-heading font-semibold text-text-primary">
          Info Dasar
        </h2>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Nama Lokasi <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="JayField Sudirman"
            required
            minLength={3}
            maxLength={200}
            className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Alamat <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Jl. Jenderal Sudirman No. 10"
              required
              minLength={5}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Kota <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Jakarta Selatan"
              required
              minLength={2}
              maxLength={100}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Lokasi utama JayField di Sudirman..."
            rows={2}
            maxLength={1000}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Kontak
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Telepon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="021-1234567"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="sudirman@jayfield.com"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Operasional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Jam Buka
            </label>
            <input
              type="time"
              value={form.openTime}
              onChange={(e) => update("openTime", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Jam Tutup
            </label>
            <input
              type="time"
              value={form.closeTime}
              onChange={(e) => update("closeTime", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[11px] text-text-secondary mt-1">
              Pakai 00:00 untuk tengah malam.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-text-primary">
          Lokasi Geografis & Foto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              placeholder="-6.224"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              placeholder="106.823"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <p className="text-[11px] text-text-secondary -mt-2">
          Opsional. Tip: copy dari Google Maps (klik kanan di lokasi → coordinat).
        </p>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Foto Cover
          </label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
              {form.thumbnailUrl ? (
                <Image
                  src={form.thumbnailUrl}
                  alt="Thumbnail"
                  width={128}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="h-6 w-6 text-text-secondary opacity-30" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <UploadButton
                endpoint="locationThumbnail"
                appearance={{
                  button:
                    "ut-ready:bg-primary ut-ready:text-white ut-ready:px-4 ut-ready:h-10 rounded-lg text-sm font-medium hover:bg-primary-light",
                  allowedContent: "text-xs text-text-secondary",
                }}
                content={{
                  button: ({ ready, isUploading }) =>
                    isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading
                      </span>
                    ) : ready ? (
                      <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Upload Foto
                      </span>
                    ) : (
                      "Loading..."
                    ),
                }}
                onClientUploadComplete={(res) => {
                  const url = res?.[0]?.url;
                  if (url) {
                    update("thumbnailUrl", url);
                    showToast.success("Foto terupload, klik Simpan");
                  }
                }}
                onUploadError={(e) => {
                  showToast.error(e.message ?? "Upload gagal");
                }}
              />
              {form.thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => update("thumbnailUrl", "")}
                  className="text-xs text-error hover:underline text-left flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Hapus foto
                </button>
              )}
            </div>
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
            <span className="text-sm font-medium text-text-primary">
              Lokasi Aktif
            </span>
            <p className="text-xs text-text-secondary">
              Uncheck untuk sembunyikan dari customer (lokasi tidak akan muncul di publik).
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => router.push(`/${locale}/admin/locations`)}
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
              {locationId ? "Simpan Perubahan" : "Buat Lokasi"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
