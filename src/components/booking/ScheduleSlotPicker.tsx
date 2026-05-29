"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SlotStatus = "available" | "pending" | "booked";
type Slot = {
  time: string;
  endTime: string;
  status: SlotStatus;
  price: number;
  dayType: "WEEKDAY" | "WEEKEND";
  timeType: "REGULAR" | "PRIME_TIME";
};

type Props = {
  locale: string;
  locationId: string;
  courtId: string;
  courtName: string;
};

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calendar + time-slot grid. Fetches availability from
 * `/api/courts/[courtId]/availability?date=YYYY-MM-DD`. Selected slots
 * must be CONTIGUOUS (booking is one continuous block) — when the user
 * picks a slot that breaks contiguity we reset to just that slot.
 */
export function ScheduleSlotPicker({
  locale,
  locationId,
  courtId,
  courtName,
}: Props) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEN = locale === "en";

  const t = useCallback(
    (id: string, en: string) => (isEN ? en : id),
    [isEN],
  );

  const monthNames = isEN ? MONTH_NAMES_EN : MONTH_NAMES_ID;
  const dayNames = isEN ? DAY_NAMES_EN : DAY_NAMES_ID;

  // Fetch availability whenever date changes. Plus polling tiap 15 detik
  // supaya slot yang barusan dibooking user lain otomatis nge-refresh
  // tanpa user harus manual reload — reduce booking conflict frustration.
  useEffect(() => {
    const dateStr = formatDateOnly(selectedDate);
    let cancelled = false;
    const ctrl = new AbortController();

    const fetchSlots = (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);

      return fetch(`/api/courts/${courtId}/availability?date=${dateStr}`, {
        signal: ctrl.signal,
        cache: "no-store",
      })
        .then(async (r) => {
          const json = await r.json();
          if (!r.ok || !json.success) {
            throw new Error(
              json?.error?.message ??
                (isEN ? "Failed to load slots" : "Gagal memuat jadwal"),
            );
          }
          if (!cancelled) setSlots(json.data?.slots ?? []);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          if (e instanceof Error && e.name === "AbortError") return;
          // Polling silent gagal — jangan tampilkan error supaya tidak
          // mengganggu UX. Initial load tetap show error.
          if (!silent) {
            setError(
              e instanceof Error
                ? e.message
                : isEN
                  ? "Failed to load slots"
                  : "Gagal memuat jadwal",
            );
            setSlots([]);
          }
        })
        .finally(() => {
          if (!cancelled && !silent) setLoading(false);
        });
    };

    // Initial fetch + polling tiap 15 detik.
    fetchSlots();
    const pollId = setInterval(() => fetchSlots(true), 15000);

    return () => {
      cancelled = true;
      ctrl.abort();
      clearInterval(pollId);
    };
  }, [courtId, selectedDate, isEN]);

  const totalPrice = selectedSlots.reduce((sum, time) => {
    const slot = slots.find((s) => s.time === time);
    return sum + (slot?.price ?? 0);
  }, 0);

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) => {
      // Toggle off if already selected.
      if (prev.includes(time)) return prev.filter((t) => t !== time).sort();
      const next = [...prev, time].sort();
      // Validate contiguity. If gap, reset to just this slot.
      const hours = next.map((s) => parseInt(s.split(":")[0]));
      let contiguous = true;
      for (let i = 1; i < hours.length; i++) {
        if (hours[i] - hours[i - 1] !== 1) {
          contiguous = false;
          break;
        }
      }
      return contiguous ? next : [time];
    });
  };

  // Reset slot selection when date changes.
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  const getDaysInMonth = (m: number, y: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) =>
    new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    currentMonth === selectedDate.getMonth() &&
    currentYear === selectedDate.getFullYear();

  const isPast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleConfirm = () => {
    if (selectedSlots.length === 0) return;
    // Compute startTime / endTime as a single contiguous block.
    const startTime = selectedSlots[0];
    const lastSlotHour = parseInt(
      selectedSlots[selectedSlots.length - 1].split(":")[0],
    );
    const endHour = lastSlotHour + 1;
    const endTime = `${String(endHour % 24).padStart(2, "0")}:00`;

    const params = new URLSearchParams({
      courtId,
      locationId,
      date: formatDateOnly(selectedDate),
      startTime,
      endTime,
      duration: String(selectedSlots.length),
      total: String(totalPrice),
      recurring: isRecurring ? "true" : "false",
    });
    router.push(`/${locale}/booking/confirm?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Calendar + Slots */}
      <div className="lg:col-span-2 space-y-6">
        {/* Calendar */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              aria-label={t("Bulan sebelumnya", "Previous month")}
              className="p-1.5 hover:bg-muted rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-heading font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={nextMonth}
              aria-label={t("Bulan berikutnya", "Next month")}
              className="p-1.5 hover:bg-muted rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {dayNames.map((d, i) => {
              const isWeekendCol = i === 0 || i === 6;
              return (
                <div
                  key={d}
                  className={`py-2 font-medium text-xs ${
                    isWeekendCol ? "text-cta" : "text-text-secondary"
                  }`}
                >
                  {d}
                </div>
              );
            })}
            {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map(
              (_, i) => (
                <div key={`empty-${i}`} />
              ),
            )}
            {Array.from({
              length: getDaysInMonth(currentMonth, currentYear),
            }).map((_, i) => {
              const day = i + 1;
              const past = isPast(day);
              const dateObj = new Date(currentYear, currentMonth, day);
              const dow = dateObj.getDay();
              const isWeekendDay = dow === 0 || dow === 6;
              const selected = isSelected(day);
              const today_ = isToday(day);
              return (
                <button
                  key={day}
                  disabled={past}
                  aria-label={
                    isWeekendDay
                      ? `${day} (weekend — prime time)`
                      : `${day}`
                  }
                  onClick={() => {
                    setSelectedDate(dateObj);
                  }}
                  className={`relative py-2 rounded-lg text-sm transition-colors ${
                    selected
                      ? "bg-primary text-white font-bold"
                      : today_
                        ? "bg-accent/10 text-accent font-bold ring-1 ring-accent/30"
                        : past
                          ? "text-text-secondary/30 cursor-not-allowed"
                          : isWeekendDay
                            ? "hover:bg-cta/10 text-cta font-semibold"
                            : "hover:bg-muted text-text-primary"
                  }`}
                >
                  {day}
                  {/* Tiny dot indicator for weekend (when not selected) — visual cue "ramai/prime" */}
                  {isWeekendDay && !selected && !past && (
                    <span
                      aria-hidden
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cta"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* Legend tipis — kasih konteks ke user soal weekend */}
          <p className="mt-3 text-[11px] text-text-secondary flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cta" />
            {t(
              "Weekend cenderung lebih ramai (harga prime time)",
              "Weekends tend to be busier (prime time pricing)",
            )}
          </p>
        </div>

        {/* Time Slots */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold mb-1">
            {courtName} —{" "}
            {selectedDate.toLocaleDateString(isEN ? "en-US" : "id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {t(
              "Pilih jam yang berurutan untuk durasi booking.",
              "Pick contiguous hours for your booking duration.",
            )}
          </p>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-accent/20 border border-accent" />
              {t("Tersedia", "Available")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-warning/20 border border-warning" />
              {t("Pending", "Pending")}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-error/20 border border-error" />
              {t("Terbooked", "Booked")}
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-text-secondary text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("Memuat jadwal...", "Loading schedule...")}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-error/10 text-error border border-error/30 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <p className="text-center py-8 text-text-secondary text-sm">
              {t(
                "Tidak ada slot tersedia untuk tanggal ini.",
                "No slots available for this date.",
              )}
            </p>
          )}

          {!loading && !error && slots.length > 0 && (
            <div className="space-y-2">
              {slots.map((slot) => {
                const isSelectedSlot = selectedSlots.includes(slot.time);
                const isAvailable = slot.status === "available";
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => toggleSlot(slot.time)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all ${
                      slot.status === "booked"
                        ? "bg-error/5 border-error/30 text-text-secondary/50 cursor-not-allowed"
                        : slot.status === "pending"
                          ? "bg-warning/5 border-warning/30 text-text-secondary/50 cursor-not-allowed"
                          : isSelectedSlot
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "bg-surface border-border hover:border-primary/50 hover:bg-primary/5 text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelectedSlot && <Check className="h-4 w-4 text-primary" />}
                      <span>
                        {slot.time} - {slot.endTime}
                      </span>
                      {slot.timeType === "PRIME_TIME" && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider bg-cta/10 text-cta px-1.5 py-0.5 rounded">
                          Prime
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {isAvailable && (
                        <span className="font-medium">{formatPrice(slot.price)}</span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          slot.status === "available"
                            ? "bg-accent/10 text-accent"
                            : slot.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-error/10 text-error"
                        }`}
                      >
                        {slot.status === "available"
                          ? t("Tersedia", "Available")
                          : slot.status === "pending"
                            ? t("Pending", "Pending")
                            : t("Terbooked", "Booked")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-1">
        <div className="bg-surface border border-border rounded-xl p-5 sticky top-[90px]">
          <h3 className="font-heading font-semibold mb-4">
            {t("Ringkasan", "Summary")}
          </h3>

          {selectedSlots.length > 0 ? (
            <>
              <div className="space-y-2 mb-4 text-sm">
                {selectedSlots.map((time) => {
                  const slot = slots.find((s) => s.time === time);
                  return (
                    <div key={time} className="flex justify-between">
                      <span>
                        {time} - {slot?.endTime ?? ""}
                      </span>
                      <span className="font-medium">
                        {formatPrice(slot?.price ?? 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>{t("Durasi", "Duration")}</span>
                  <span>
                    {selectedSlots.length} {t("jam", "hours")}
                  </span>
                </div>
                <div className="flex justify-between font-heading font-bold text-lg mt-2">
                  <span>{t("Total", "Total")}</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <label className="flex items-start gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">
                  {t(
                    "Jadikan booking berulang (setiap minggu di hari & jam yang sama)",
                    "Make this recurring (every week, same day & time)",
                  )}
                </span>
              </label>

              <Button
                variant="cta"
                className="w-full h-12 text-base font-semibold"
                onClick={handleConfirm}
              >
                {t("Lanjut ke Pembayaran", "Continue to Payment")} →
              </Button>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              {t(
                "Pilih waktu pada jadwal di samping untuk melanjutkan booking.",
                "Pick a time slot to continue your booking.",
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
