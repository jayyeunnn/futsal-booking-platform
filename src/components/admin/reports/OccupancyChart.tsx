"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportSection } from "./ReportSection";

type Point = {
  period: string;
  bookedHours: number;
  availableHours: number;
  occupancyPct: number;
};

type CourtRow = {
  courtId: string;
  courtName: string;
  locationName: string;
  bookedHours: number;
  availableHours: number;
  occupancyPct: number;
};

type Props = {
  series: Point[];
  perCourt: CourtRow[];
};

export function OccupancyChart({ series, perCourt }: Props) {
  return (
    <ReportSection
      title="Occupancy Rate"
      description="Persentase jam yang terbooking dibanding total jam operasional (16 jam/hari × jumlah lapangan aktif)"
      csvRows={series}
      csvHeaders={[
        { label: "Tanggal", value: "period" },
        { label: "Jam Terbooking", value: "bookedHours" },
        { label: "Jam Tersedia", value: "availableHours" },
        { label: "Occupancy (%)", value: "occupancyPct" },
      ]}
      csvFilename="occupancy-daily"
    >
      {series.every((d) => d.bookedHours === 0) ? (
        <EmptyChart message="Belum ada booking di rentang ini." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={series}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="#E0E0E0" strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "#616161" }}
                stroke="#E0E0E0"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#616161" }}
                stroke="#E0E0E0"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E0E0E0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(_value, _name, item) => {
                  const point = item.payload as Point;
                  return [
                    `${point.occupancyPct}% (${point.bookedHours} / ${point.availableHours} jam)`,
                    "Occupancy",
                  ];
                }}
              />
              <Bar dataKey="occupancyPct" radius={[4, 4, 0, 0]}>
                {series.map((d) => (
                  <Cell
                    key={d.period}
                    fill={
                      d.occupancyPct >= 75
                        ? "#1B5E20"
                        : d.occupancyPct >= 40
                          ? "#4CAF50"
                          : "#A5D6A7"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {perCourt.length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Per Lapangan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-text-secondary">
                  <th className="px-2 py-2 font-medium">Lapangan</th>
                  <th className="px-2 py-2 font-medium">Lokasi</th>
                  <th className="px-2 py-2 font-medium text-right">
                    Jam Booked
                  </th>
                  <th className="px-2 py-2 font-medium text-right">
                    Jam Tersedia
                  </th>
                  <th className="px-2 py-2 font-medium text-right">
                    Occupancy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perCourt.map((c) => (
                  <tr key={c.courtId}>
                    <td className="px-2 py-2 font-medium text-text-primary">
                      {c.courtName}
                    </td>
                    <td className="px-2 py-2 text-text-secondary">
                      {c.locationName}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-xs">
                      {c.bookedHours}
                    </td>
                    <td className="px-2 py-2 text-right font-mono text-xs">
                      {c.availableHours}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <OccupancyBadge value={c.occupancyPct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportSection>
  );
}

function OccupancyBadge({ value }: { value: number }) {
  const tone =
    value >= 75
      ? "bg-success/10 text-success"
      : value >= 40
        ? "bg-info/10 text-info"
        : "bg-warning/10 text-warning";
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded ${tone}`}>
      {value}%
    </span>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-text-secondary border border-dashed border-border rounded-lg">
      {message}
    </div>
  );
}
