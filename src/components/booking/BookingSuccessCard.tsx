"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  MessageCircle,
  QrCode,
  Share2,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import { showToast } from "@/lib/toast";
import {
  buildBookingIcs,
  downloadIcs,
  googleCalendarUrl,
} from "@/lib/calendar-export";

type Props = {
  bookingId: string;
  courtName: string;
  locationName: string;
  locationAddress: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  /** Public booking URL untuk shared link. */
  shareUrl: string;
  /** Locale untuk format tanggal. */
  locale: string;
};

/**
 * Premium success card untuk booking yang sudah CONFIRMED.
 * Berisi:
 *   - QR code yang bisa di-tunjukin ke admin saat datang
 *   - Tombol "Add to Calendar" (download .ics) atau buka Google Calendar
 *   - Tombol "Share via WhatsApp"
 *   - Copy booking ID
 */
export function BookingSuccessCard({
  bookingId,
  courtName,
  locationName,
  locationAddress,
  bookingDate,
  startTime,
  endTime,
  shareUrl,
  locale,
}: Props) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR code lazily — only when user toggles open. QR berisi
  // booking ID supaya admin bisa scan langsung di tempat.
  useEffect(() => {
    if (!showQr || qrUrl) return;
    QRCode.toDataURL(`JAYFIELD-BOOKING:${bookingId}`, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: { dark: "#1B5E20", light: "#FFFFFF" },
    })
      .then(setQrUrl)
      .catch((err) => {
        console.error("[booking] QR gen failed", err);
        showToast.error("Gagal membuat QR code");
      });
  }, [showQr, qrUrl, bookingId]);

  const dateStr = bookingDate.toLocaleDateString(
    locale === "en" ? "en-US" : "id-ID",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const icsInput = {
    bookingId,
    title: `Futsal di ${courtName} — ${locationName}`,
    location: `${locationName} (${locationAddress})`,
    description: `Booking ID: ${bookingId}\nLink: ${shareUrl}`,
    bookingDate,
    startTime,
    endTime,
  };

  const handleCalendarDownload = () => {
    const ics = buildBookingIcs(icsInput);
    downloadIcs(`jayfield-${bookingId}`, ics);
    showToast.success(
      "File kalender diunduh",
      "Buka file untuk add ke Calendar",
    );
  };

  const handleGoogleCalendar = () => {
    const url = googleCalendarUrl(icsInput);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const waMessage = `Halo! Aku sudah booking lapangan futsal nih:\n\n📍 ${locationName}\n⚽ ${courtName}\n📅 ${dateStr}\n⏰ ${startTime} - ${endTime}\n\nDetail: ${shareUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Booking JayField",
          text: waMessage,
          url: shareUrl,
        });
      } catch {
        // User cancelled — silent.
      }
    } else {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(bookingId);
      setCopied(true);
      showToast.success("Booking ID tersalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast.error("Gagal menyalin");
    }
  };

  return (
    <div className="bg-gradient-to-br from-success/10 via-success/5 to-primary/5 border border-success/30 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
          <Check className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-text-primary">
            Booking siap!
          </h3>
          <p className="text-xs text-text-secondary">
            Tunjukan QR code ini ke admin saat datang.
          </p>
        </div>
      </div>

      {/* QR Toggle */}
      <button
        type="button"
        onClick={() => setShowQr((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {showQr ? "Tutup QR" : "Tampilkan QR Code"}
          </span>
        </div>
        <span className="text-xs text-text-secondary">
          ID: {bookingId.slice(0, 8)}…
        </span>
      </button>

      {/* QR Display */}
      {showQr && (
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-border">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrUrl}
              alt="QR Code booking"
              width={240}
              height={240}
              className="block"
            />
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center text-text-secondary">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Tersalin
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Salin ID lengkap
              </>
            )}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleCalendarDownload}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-surface border border-border text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to Calendar
        </button>
        <button
          type="button"
          onClick={handleGoogleCalendar}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-surface border border-border text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Google Cal
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-medium transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Bagikan
        </button>
      </div>
    </div>
  );
}
