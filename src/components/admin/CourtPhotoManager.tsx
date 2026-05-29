"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Trash2,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";

type Props = {
  courtId: string;
  initialPhotos: string[];
};

/**
 * Photo manager: upload via UploadThing, reorder via up/down buttons,
 * delete locally, then persist with PUT /api/admin/courts/[id]/photos.
 */
export function CourtPhotoManager({ courtId, initialPhotos }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  const dirty = JSON.stringify(photos) !== JSON.stringify(initialPhotos);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...photos];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setPhotos(next);
  };

  const remove = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  };

  const onSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/courts/${courtId}/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({
          kind: "err",
          message: json?.error?.message ?? "Gagal simpan foto",
        });
        return;
      }
      setFeedback({ kind: "ok", message: "Foto berhasil disimpan" });
      router.refresh();
    } catch (e) {
      setFeedback({
        kind: "err",
        message: e instanceof Error ? e.message : "Gagal simpan",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {feedback && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            feedback.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {feedback.kind === "ok" ? (
            <Check className="h-4 w-4 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Upload */}
      <div>
        <UploadDropzone
          endpoint="courtPhoto"
          appearance={{
            container: "border-2 border-dashed border-border rounded-xl",
            label: "text-text-secondary text-sm",
            allowedContent: "text-xs text-text-secondary",
            button:
              "ut-ready:bg-primary ut-ready:text-white ut-ready:px-4 ut-ready:h-10 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50",
          }}
          onClientUploadComplete={(res) => {
            const urls = (res ?? []).map((r) => r.url).filter(Boolean);
            setPhotos((prev) => {
              const next = [...prev, ...urls].slice(0, 8);
              return next;
            });
            setFeedback({
              kind: "ok",
              message: `${urls.length} foto ditambahkan. Klik Simpan untuk persist.`,
            });
          }}
          onUploadError={(e) => {
            setFeedback({
              kind: "err",
              message: e.message ?? "Upload gagal",
            });
          }}
        />
        <p className="text-xs text-text-secondary mt-2">
          Maksimal 8 foto · 4MB per foto · Foto pertama dipakai sebagai cover.
        </p>
      </div>

      {/* Photo list */}
      {photos.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          Belum ada foto. Upload di atas untuk mulai.
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((url, i) => (
            <li
              key={url + i}
              className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {i === 0 && (
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-cta text-white">
                  COVER
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-center">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
                    aria-label="Pindah ke atas"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    className="p-1 rounded bg-black/40 text-white hover:bg-black/60 disabled:opacity-30"
                    aria-label="Pindah ke bawah"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-1 rounded bg-error/80 text-white hover:bg-error"
                  aria-label="Hapus foto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button
          variant="cta"
          className="h-10 px-6"
          onClick={onSave}
          disabled={saving || !dirty}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Simpan
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
