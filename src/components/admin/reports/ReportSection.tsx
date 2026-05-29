"use client";

import { Download } from "lucide-react";
import { downloadCsv, toCsv, type CsvHeader } from "@/lib/csv";

type Props<T extends Record<string, unknown>> = {
  title: string;
  description?: string;
  /** Rows to export when the user clicks "Export CSV". */
  csvRows: T[];
  csvHeaders: CsvHeader<T>[];
  csvFilename: string;
  children: React.ReactNode;
  /** Right-side slot (e.g. extra controls). Renders left of the export button. */
  actions?: React.ReactNode;
};

/**
 * Card wrapper used by every report section.
 * Provides a consistent header + a CSV export button driven by `csvRows`.
 */
export function ReportSection<T extends Record<string, unknown>>({
  title,
  description,
  csvRows,
  csvHeaders,
  csvFilename,
  actions,
  children,
}: Props<T>) {
  const onExport = () => {
    const body = toCsv(csvRows, csvHeaders);
    downloadCsv(csvFilename, body);
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <button
            type="button"
            onClick={onExport}
            disabled={csvRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-primary hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}
