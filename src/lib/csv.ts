/**
 * Tiny CSV serialization helpers used by the admin reports module.
 *
 * No third-party dependency: we want predictable escaping that handles
 * Indonesian text (commas, quotes, newlines) without surprises.
 */

type CsvCell = string | number | boolean | null | undefined | Date;

/** Escape a single cell per RFC 4180 (quote when needed, double internal quotes). */
function escapeCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toISOString();
  } else if (typeof value === "boolean") {
    str = value ? "true" : "false";
  } else {
    str = String(value);
  }
  // Quote if contains comma, quote, newline, or leading/trailing whitespace.
  if (/[",\r\n]/.test(str) || /^\s|\s$/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type CsvHeader<T> = {
  /** Column display label in the first row. */
  label: string;
  /** Either a key on T or a function returning the cell value. */
  value: keyof T | ((row: T) => CsvCell);
};

/**
 * Serialize an array of objects to CSV text. Headers control the column order
 * and labels — pass them explicitly so the output is deterministic.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers: CsvHeader<T>[]
): string {
  const headerLine = headers.map((h) => escapeCell(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const raw =
          typeof h.value === "function"
            ? h.value(row)
            : (row[h.value] as CsvCell);
        return escapeCell(raw);
      })
      .join(",")
  );
  // Prepend BOM so Excel opens UTF-8 correctly.
  return ["\uFEFF" + headerLine, ...dataLines].join("\r\n");
}

/**
 * Trigger a browser download for the given CSV string.
 * Safe to call only on the client (uses `document` and `URL.createObjectURL`).
 */
export function downloadCsv(filename: string, csvBody: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([csvBody], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revoke so Safari has time to finalize the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
