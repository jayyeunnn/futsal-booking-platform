"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, Send } from "lucide-react";
import { showToast } from "@/lib/toast";

type Props = {
  /** The user's unique referral code, e.g. "JF-AB12CD" */
  code: string;
  /** Full shareable registration URL with the ?ref= query param baked in */
  shareUrl: string;
  /** Reward amount displayed in the share message */
  rewardPoints: number;
};

/**
 * Copies text to clipboard with a fallback for older browsers / non-secure
 * contexts (where `navigator.clipboard` is undefined). Returns true on success.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }

  if (typeof document === "undefined") return false;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

export default function ReferralShareCard({ code, shareUrl, rewardPoints }: Props) {
  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);

  const message = `Halo! Daftar di JayField pakai kode referral aku: ${code} — kalau kamu booking pertama kali, aku dapet ${rewardPoints} poin. Cobain yuk: ${shareUrl}`;

  const flashCopied = (which: "code" | "link") => {
    setCopiedField(which);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      flashCopied("code");
      showToast.success("Kode tersalin", code);
    } else {
      showToast.error("Gagal menyalin", "Salin manual dari kotak di atas");
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      flashCopied("link");
      showToast.success("Link tersalin", "Tinggal paste di chat");
    } else {
      showToast.error("Gagal menyalin link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      // Fall back to copying the link.
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: "Yuk main futsal di JayField",
        text: message,
        url: shareUrl,
      });
    } catch {
      // User cancelled — silent.
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(
    `Daftar JayField pakai kode referral ${code}!`
  )}`;

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
      <p className="text-xs uppercase tracking-wider text-white/80">
        Kode referral kamu
      </p>

      {/* Big code display */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-3xl sm:text-4xl font-bold tracking-wider truncate">
            {code}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          aria-label="Salin kode"
          className="shrink-0 p-3 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/35 transition-colors"
        >
          {copiedField === "code" ? (
            <Check className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Share URL with copy */}
      <div className="mt-4">
        <p className="text-xs text-white/80 mb-1">Atau bagikan link ini</p>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/15 px-3 py-2">
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 bg-transparent text-sm text-white/95 placeholder-white/50 focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-primary text-xs font-semibold hover:bg-white/90 transition-colors"
          >
            {copiedField === "link" ? (
              <>
                <Check className="h-3.5 w-3.5" /> Tersalin
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#229ED9] hover:bg-[#1a87bb] text-white text-sm font-medium transition-colors"
        >
          <Send className="h-4 w-4" />
          Telegram
        </a>
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors col-span-2 sm:col-span-1"
        >
          <Share2 className="h-4 w-4" />
          {canNativeShare ? "Bagikan" : "Salin link"}
        </button>
      </div>
    </div>
  );
}
