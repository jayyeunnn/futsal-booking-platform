import Link from "next/link";
import {
  Calendar,
  Heart,
  Bell,
  Star,
  Building2,
  Sparkles,
  Coins,
  Repeat,
  Tag,
  type LucideIcon,
} from "lucide-react";

type Variant =
  | "no-bookings"
  | "no-favorites"
  | "no-notifications"
  | "no-reviews"
  | "no-locations"
  | "no-promos"
  | "no-points"
  | "no-recurring"
  | "no-data";

type Props = {
  variant: Variant;
  /** Optional override for default copy. */
  title?: string;
  description?: string;
  /** CTA button — Link to internal route or onClick handler. */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Compact layout for inline empty states. */
  compact?: boolean;
};

type Config = {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
};

const CONFIGS: Record<Variant, Config> = {
  "no-bookings": {
    icon: Calendar,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "Belum ada booking",
    description:
      "Lapangan masih kosong nih, yuk pesan sebelum keduluan teman 😎 — booking selesai dalam hitungan menit.",
  },
  "no-favorites": {
    icon: Heart,
    iconColor: "text-error",
    bgColor: "bg-error/10",
    title: "Belum ada lapangan favorit",
    description:
      "Tap tombol hati di lapangan langgananmu — kelak rebook tinggal 2 klik.",
  },
  "no-notifications": {
    icon: Bell,
    iconColor: "text-info",
    bgColor: "bg-info/10",
    title: "Inbox kamu kosong 🎉",
    description:
      "Tenang, kalau ada update booking, pembayaran, atau promo — pasti muncul di sini duluan.",
  },
  "no-reviews": {
    icon: Star,
    iconColor: "text-warning",
    bgColor: "bg-warning/10",
    title: "Belum ada review",
    description:
      "Setelah booking selesai, kamu bisa berbagi pengalaman dan dapat +5 poin sebagai apresiasi.",
  },
  "no-locations": {
    icon: Building2,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "Belum ada lokasi terdaftar",
    description: "Lokasi akan segera ditambahkan. Cek lagi nanti.",
  },
  "no-promos": {
    icon: Sparkles,
    iconColor: "text-cta",
    bgColor: "bg-cta/10",
    title: "Belum ada promo aktif",
    description:
      "Promo baru muncul tiap minggu. Daftar member gratis untuk dapat diskon otomatis tiap booking.",
  },
  "no-points": {
    icon: Coins,
    iconColor: "text-cta",
    bgColor: "bg-cta/10",
    title: "Belum ada riwayat poin",
    description:
      "Mulai booking untuk kumpul poin. Setiap jam booking selesai = +10 poin.",
  },
  "no-recurring": {
    icon: Repeat,
    iconColor: "text-info",
    bgColor: "bg-info/10",
    title: "Belum ada booking berulang",
    description:
      "Saat booking, centang opsi berulang untuk auto-create slot tiap minggu di hari & jam yang sama.",
  },
  "no-data": {
    icon: Tag,
    iconColor: "text-text-secondary",
    bgColor: "bg-muted",
    title: "Tidak ada data",
    description: "Belum ada data untuk ditampilkan.",
  },
};

/**
 * Friendly empty state untuk halaman/list yang kosong.
 * Pakai variant untuk mendapat copy + icon yang sesuai konteks,
 * atau override title/description untuk custom case.
 */
export function EmptyState({
  variant,
  title,
  description,
  action,
  compact = false,
}: Props) {
  const config = CONFIGS[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col items-center text-center ${
        compact ? "py-8" : "py-12"
      } px-4`}
    >
      {/* Decorative blob behind icon — gentle pulse + float supaya nggak sepi.
          Kedua animasi honor `prefers-reduced-motion` via globals.css. */}
      <div className="relative mb-4 float-slow">
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${config.bgColor} animate-pulse motion-reduce:animate-none`}
        />
        <span
          aria-hidden
          className={`absolute -inset-2 rounded-full blur-3xl opacity-30 ${config.bgColor}`}
        />
        <div
          className={`relative w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center ring-4 ring-white/40 dark:ring-surface/40`}
        >
          <Icon className={`h-10 w-10 ${config.iconColor}`} />
        </div>
      </div>

      <h3 className="font-heading font-semibold text-text-primary text-base">
        {title ?? config.title}
      </h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-sm">
        {description ?? config.description}
      </p>

      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center gap-1 h-10 px-5 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-1 h-10 px-5 rounded-lg bg-cta hover:bg-cta-hover text-white text-sm font-semibold transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
