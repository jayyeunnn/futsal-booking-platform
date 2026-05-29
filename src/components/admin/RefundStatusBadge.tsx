type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSED";

const STYLE: Record<RefundStatus, { label: string; className: string }> = {
  REQUESTED: { label: "Menunggu", className: "bg-warning/10 text-warning" },
  APPROVED: { label: "Disetujui", className: "bg-info/10 text-info" },
  REJECTED: { label: "Ditolak", className: "bg-error/10 text-error" },
  PROCESSED: { label: "Selesai", className: "bg-success/10 text-success" },
};

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const s = STYLE[status];
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-1 rounded ${s.className}`}
    >
      {s.label}
    </span>
  );
}
