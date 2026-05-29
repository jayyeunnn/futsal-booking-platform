"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { showToast } from "@/lib/toast";

type Props = {
  bookingId: string;
  /** If a proof was already uploaded earlier (status `UPLOADED`), show preview instead of dropzone. */
  existingProofUrl?: string | null;
  /** Whether the booking's payment deadline has passed — disables upload. */
  isExpired?: boolean;
};

/**
 * Real UploadThing wiring for payment proof.
 *
 * 1. UploadDropzone uploads to UploadThing using the `paymentProof` endpoint.
 * 2. On `onClientUploadComplete`, POSTs the resulting URL to
 *    `/api/payments/upload-proof` together with `bookingId`.
 * 3. Surfaces success/error via the shared `showToast` helper and refreshes
 *    the page so the booking status flips to PENDING_CONFIRMATION.
 */
export function PaymentProofUploader({
  bookingId,
  existingProofUrl,
  isExpired = false,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    existingProofUrl ?? null
  );

  // If proof already uploaded, just show the preview — don't allow re-upload.
  if (uploadedUrl) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Bukti Pembayaran
        </h2>
        <a
          href={uploadedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border bg-muted"
        >
          <Image
            src={uploadedUrl}
            alt="Bukti pembayaran"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
          />
        </a>
        <p className="mt-3 text-xs text-text-secondary">
          Bukti telah diupload. Menunggu konfirmasi admin (biasanya {"<"} 1 jam).
        </p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-xl p-5 text-sm text-error">
        <p className="font-medium">Batas waktu pembayaran telah lewat.</p>
        <p className="mt-1 text-xs">
          Booking ini sudah expired. Silakan buat booking baru.
        </p>
      </div>
    );
  }

  const submitProof = async (url: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/upload-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, proofImageUrl: url }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg =
          json?.error?.message ?? "Gagal menyimpan bukti pembayaran.";
        showToast.error("Upload gagal", msg);
        return;
      }
      setUploadedUrl(url);
      showToast.success(
        "Bukti pembayaran terkirim",
        "Menunggu konfirmasi admin."
      );
      router.refresh();
    } catch (e) {
      showToast.error(
        "Upload gagal",
        e instanceof Error ? e.message : "Terjadi kesalahan jaringan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        Upload Bukti Transfer
      </h2>
      <p className="text-xs text-text-secondary mb-3">
        Klik atau drag foto bukti transfer (max 4MB, format gambar).
      </p>

      <UploadDropzone
        endpoint="paymentProof"
        appearance={{
          container:
            "border-2 border-dashed border-border rounded-xl py-6 ut-uploading:opacity-60",
          label: "text-text-primary text-sm font-medium",
          allowedContent: "text-xs text-text-secondary",
          button:
            "ut-ready:bg-primary ut-ready:text-white ut-ready:px-4 ut-ready:h-10 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50",
        }}
        onClientUploadComplete={(res) => {
          const url = res?.[0]?.url;
          if (!url) {
            showToast.error(
              "Upload gagal",
              "URL file tidak ditemukan dari server upload."
            );
            return;
          }
          // Forward URL to our API to persist on the payment record.
          void submitProof(url);
        }}
        onUploadError={(e) => {
          showToast.error("Upload gagal", e.message ?? "Gagal upload file.");
        }}
        onUploadBegin={() => {
          showToast.info("Mengunggah bukti...", "Mohon tunggu sebentar.");
        }}
      />

      {submitting && (
        <p className="mt-3 text-xs text-text-secondary flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Menyimpan ke server...
        </p>
      )}
    </div>
  );
}
