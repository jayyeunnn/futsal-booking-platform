/**
 * Generate file .ics (iCalendar) untuk booking — supaya user bisa langsung
 * "Add to Google Calendar" / Apple Calendar tanpa input ulang.
 *
 * Format spec: RFC 5545. Kita pakai single VEVENT yang minimal tapi valid.
 */

type IcsBookingInput = {
  /** Booking ID untuk UID stable. */
  bookingId: string;
  /** Judul event. Contoh: "Futsal di Lapangan 1 — JayField Sudirman". */
  title: string;
  /** Lokasi (alamat lengkap). */
  location: string;
  /** Description / catatan tambahan. */
  description?: string;
  /** Tanggal booking (Date object, time akan di-merge dari startTime). */
  bookingDate: Date;
  /** Format "HH:mm". */
  startTime: string;
  /** Format "HH:mm". "00:00" akan di-treat sebagai end-of-day. */
  endTime: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format Date ke "YYYYMMDDTHHmmss" tanpa Z (floating timezone, local). */
function formatLocal(d: Date): string {
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

/** Escape string untuk ICS — comma, semicolon, newline. */
function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Build ICS content untuk satu booking.
 * Return: string dengan content lengkap (BEGIN:VCALENDAR sampai END).
 */
export function buildBookingIcs(input: IcsBookingInput): string {
  const [sh, sm] = input.startTime.split(":").map((x) => parseInt(x, 10));
  const [eh, em] = input.endTime.split(":").map((x) => parseInt(x, 10));

  const start = new Date(input.bookingDate);
  start.setHours(sh, sm ?? 0, 0, 0);

  const end = new Date(input.bookingDate);
  // endTime "00:00" artinya tengah malam (24:00), jadi advance hari sekali.
  if (eh === 0 && em === 0) {
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else {
    end.setHours(eh, em ?? 0, 0, 0);
  }

  const now = formatLocal(new Date());
  const uid = `${input.bookingId}@jayfield.com`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JayField//Booking//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `LOCATION:${escapeIcs(input.location)}`,
    input.description ? `DESCRIPTION:${escapeIcs(input.description)}` : "",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT1H",
    `DESCRIPTION:${escapeIcs("Reminder: " + input.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

/**
 * Trigger download file .ics di browser. Safe to call only on client.
 */
export function downloadIcs(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Build URL "Add to Google Calendar" — fallback untuk user yang nggak
 * bisa download .ics (mis. di mobile).
 */
export function googleCalendarUrl(input: IcsBookingInput): string {
  const [sh, sm] = input.startTime.split(":").map((x) => parseInt(x, 10));
  const [eh, em] = input.endTime.split(":").map((x) => parseInt(x, 10));

  const start = new Date(input.bookingDate);
  start.setHours(sh, sm ?? 0, 0, 0);
  const end = new Date(input.bookingDate);
  if (eh === 0 && em === 0) {
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else {
    end.setHours(eh, em ?? 0, 0, 0);
  }

  const fmt = (d: Date) => formatLocal(d).replace(/[-:]/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: input.description ?? "",
    location: input.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
