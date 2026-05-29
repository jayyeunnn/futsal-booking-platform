"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  /** Daftar URL image. Ukuran otomatis pakai object-contain. */
  images: string[];
  /** Caption opsional per image (panjangnya sama dengan `images`). */
  captions?: string[];
  /** Index image yang dibuka. -1 = lightbox tertutup. */
  openIndex: number;
  /** Dipanggil saat lightbox harus tertutup (close btn / ESC / backdrop). */
  onClose: () => void;
  /** Dipanggil saat user navigasi ke index tertentu. */
  onChange: (next: number) => void;
};

/**
 * Lightbox modal — full-screen image viewer dengan keyboard nav,
 * swipe-friendly tap zones, dan accessibility built-in.
 *
 * Trigger: parent kelola `openIndex` state, set ke index image saat klik.
 * `openIndex = -1` berarti tertutup.
 */
export function Lightbox({
  images,
  captions,
  openIndex,
  onClose,
  onChange,
}: Props) {
  const [mounted, setMounted] = useState(false);

  // Avoid SSR hydration mismatch — hanya render di client.
  useEffect(() => setMounted(true), []);

  // Keyboard navigation — ESC untuk tutup, panah kiri/kanan untuk navigate.
  useEffect(() => {
    if (openIndex < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && openIndex > 0) onChange(openIndex - 1);
      if (e.key === "ArrowRight" && openIndex < images.length - 1)
        onChange(openIndex + 1);
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, images.length, onClose, onChange]);

  if (!mounted || openIndex < 0 || !images[openIndex]) return null;

  const hasPrev = openIndex > 0;
  const hasNext = openIndex < images.length - 1;
  const caption = captions?.[openIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium z-10">
        {openIndex + 1} / {images.length}
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(openIndex - 1);
          }}
          aria-label="Sebelumnya"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(openIndex + 1);
          }}
          aria-label="Berikutnya"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image — stop propagation supaya klik image nggak nutup */}
      <div
        className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[openIndex]}
          alt={caption ?? `Image ${openIndex + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
        {caption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/70 text-white text-sm max-w-[90%] text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
