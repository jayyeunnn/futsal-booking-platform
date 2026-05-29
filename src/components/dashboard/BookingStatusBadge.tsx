import { BookingStatus } from "@/types";

const STATUS_STYLE: Record<BookingStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Belum Bayar",
    className: "bg-warning/10 text-warning",
  },
  PENDING_CONFIRMATION: {
    label: "Menunggu Konfirmasi",
    className: "bg-info/10 text-info",
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    className: "bg-success/10 text-success",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-primary/10 text-primary",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-error/10 text-error",
  },
  EXPIRED: {
    label: "Hangus",
    className: "bg-text-secondary/10 text-text-secondary",
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-1 rounded ${s.className}`}
    >
      {s.label}
    </span>
  );
}
