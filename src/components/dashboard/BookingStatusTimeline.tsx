import { Check, Hourglass, X, Clock, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import type { BookingStatus } from "@/types";

type StepKey = BookingStatus;
type Step = {
  key: StepKey;
  label: string;
  /** Estimasi durasi yang biasa muncul di stage ini (display only). */
  hint?: string;
};

const FLOW: Step[] = [
  {
    key: "PENDING_PAYMENT",
    label: "Pembayaran",
    hint: "Upload bukti dalam 1 jam",
  },
  {
    key: "PENDING_CONFIRMATION",
    label: "Menunggu Konfirmasi",
    hint: "Biasanya < 1 jam",
  },
  {
    key: "CONFIRMED",
    label: "Dikonfirmasi",
    hint: "Siap main!",
  },
  {
    key: "COMPLETED",
    label: "Selesai",
    hint: "Poin masuk otomatis",
  },
];

const ORDER: Record<BookingStatus, number> = {
  PENDING_PAYMENT: 0,
  PENDING_CONFIRMATION: 1,
  CONFIRMED: 2,
  COMPLETED: 3,
  CANCELLED: -1,
  EXPIRED: -1,
};

type Props = {
  status: BookingStatus;
  createdAt: Date;
  cancelledAt?: Date | null;
  confirmedAt?: Date | null;
  locale: string;
};

/**
 * Visual timeline lifecycle booking — vertical dengan connector line yang
 * berubah warna sesuai progress. Step current pakai pulse animation,
 * step done pakai check icon hijau.
 *
 * Terminated states (CANCELLED / EXPIRED) merah di posisi terakhir.
 */
export function BookingStatusTimeline({
  status,
  createdAt,
  cancelledAt,
  confirmedAt,
  locale,
}: Props) {
  const dateLocale = locale === "id" ? idLocale : enUS;
  const fmt = (d: Date) =>
    format(d, "dd MMM yyyy · HH:mm", { locale: dateLocale });
  const currentIdx = ORDER[status];
  const terminated = status === "CANCELLED" || status === "EXPIRED";

  const lastIdx = FLOW.length - 1;

  return (
    <ol className="relative">
      {FLOW.map((step, i) => {
        const passed = !terminated && i < currentIdx;
        const isCurrent = !terminated && i === currentIdx;
        const isLast = i === lastIdx;

        // Connector line color — green if next step done, gray otherwise.
        const lineColor =
          !terminated && i < currentIdx ? "bg-success" : "bg-border";

        return (
          <li key={step.key} className="relative flex gap-3 pb-5">
            {/* Vertical connector line */}
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-4 top-8 bottom-0 w-0.5 ${lineColor}`}
              />
            )}

            {/* Bullet */}
            <div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                passed
                  ? "bg-success text-white"
                  : isCurrent
                    ? "bg-cta text-white ring-4 ring-cta/20"
                    : "bg-muted text-text-secondary"
              }`}
            >
              {passed ? (
                <Check className="h-4 w-4" />
              ) : isCurrent ? (
                <>
                  <Hourglass className="h-4 w-4" />
                  {/* Pulse ring */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-cta/40 animate-ping motion-reduce:animate-none"
                  />
                </>
              ) : i === lastIdx ? (
                <CalendarCheck className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p
                className={`text-sm ${
                  passed
                    ? "text-text-primary font-medium"
                    : isCurrent
                      ? "text-text-primary font-bold"
                      : "text-text-secondary"
                }`}
              >
                {step.label}
              </p>
              {step.key === "PENDING_PAYMENT" && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {fmt(createdAt)}
                </p>
              )}
              {step.key === "CONFIRMED" && confirmedAt && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {fmt(confirmedAt)}
                </p>
              )}
              {/* Hint hanya muncul di current step (atau saat done) */}
              {step.hint && (passed || isCurrent) && (
                <p
                  className={`text-[11px] mt-0.5 ${
                    isCurrent ? "text-cta font-medium" : "text-text-secondary"
                  }`}
                >
                  {step.hint}
                </p>
              )}
            </div>
          </li>
        );
      })}

      {/* Terminal state (CANCELLED / EXPIRED) */}
      {terminated && (
        <li className="relative flex gap-3 pt-2">
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 bg-error text-white">
            <X className="h-4 w-4" />
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-bold text-error">
              {status === "CANCELLED" ? "Dibatalkan" : "Hangus"}
            </p>
            {cancelledAt && (
              <p className="text-xs text-text-secondary mt-0.5">
                {fmt(cancelledAt)}
              </p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
