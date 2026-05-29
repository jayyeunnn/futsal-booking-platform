import { Check, MapPin, Building2, Calendar, CreditCard } from "lucide-react";

type StepKey = "location" | "court" | "schedule" | "confirm";

type Step = {
  key: StepKey;
  icon: React.ComponentType<{ className?: string }>;
  labelId: string;
  labelEn: string;
};

const STEPS: Step[] = [
  { key: "location", icon: MapPin, labelId: "Lokasi", labelEn: "Location" },
  { key: "court", icon: Building2, labelId: "Lapangan", labelEn: "Court" },
  { key: "schedule", icon: Calendar, labelId: "Jadwal", labelEn: "Schedule" },
  { key: "confirm", icon: CreditCard, labelId: "Bayar", labelEn: "Pay" },
];

type Props = {
  current: StepKey;
  locale: string;
};

/**
 * Visual step indicator untuk alur booking 4 step.
 * Server component — tidak butuh state, props-driven.
 *
 * Mobile: compact (cuma current step + counter "Step X/4").
 * Desktop: full pills dengan label & icon, garis penghubung antar step.
 */
export function BookingStepper({ current, locale }: Props) {
  const isEN = locale === "en";
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  const stepLabel = isEN
    ? `Step ${currentIdx + 1} of ${STEPS.length}`
    : `Langkah ${currentIdx + 1} dari ${STEPS.length}`;

  return (
    <nav
      aria-label={isEN ? "Booking progress" : "Progres booking"}
      className="mb-6"
    >
      {/* Mobile: ringkas. Cuma current step + counter. */}
      <div className="md:hidden flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {(() => {
            const Icon = STEPS[currentIdx].icon;
            return (
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </span>
            );
          })()}
          <div className="min-w-0">
            <p className="text-[11px] text-text-secondary uppercase tracking-wider">
              {stepLabel}
            </p>
            <p className="text-sm font-semibold text-text-primary truncate">
              {isEN ? STEPS[currentIdx].labelEn : STEPS[currentIdx].labelId}
            </p>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1 shrink-0">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= currentIdx ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-xl p-3">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;
          const label = isEN ? step.labelEn : step.labelId;

          return (
            <li key={step.key} className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg flex-1 transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : isCompleted
                      ? "text-success"
                      : "text-text-secondary"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCompleted
                      ? "bg-success text-white"
                      : isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-text-secondary"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    {idx + 1}
                  </p>
                  <p
                    className={`text-sm leading-none ${
                      isCurrent ? "font-bold" : "font-medium"
                    }`}
                  >
                    {label}
                  </p>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <span
                  className={`flex-shrink-0 h-px w-4 ${
                    idx < currentIdx ? "bg-success" : "bg-border"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
