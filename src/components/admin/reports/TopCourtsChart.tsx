"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportSection } from "./ReportSection";

type Row = {
  courtId: string;
  courtName: string;
  locationName: string;
  bookings: number;
  totalHours: number;
};

type Props = {
  data: Row[];
};

export function TopCourtsChart({ data }: Props) {
  // Recharts uses dataKey from the row directly. We pass through `courtName`
  // for the axis label and a combined display for the tooltip.
  return (
    <ReportSection
      title="Top Lapangan"
      description="10 lapangan dengan booking terbanyak di rentang waktu yang dipilih"
      csvRows={data}
      csvHeaders={[
        { label: "Lapangan", value: "courtName" },
        { label: "Lokasi", value: "locationName" },
        { label: "Jumlah Booking", value: "bookings" },
        { label: "Total Jam", value: "totalHours" },
      ]}
      csvFilename="top-courts"
    >
      {data.length === 0 ? (
        <EmptyChart message="Belum ada booking di rentang ini." />
      ) : (
        <div style={{ height: Math.max(220, data.length * 36 + 32) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="#E0E0E0" strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#616161" }}
                stroke="#E0E0E0"
                allowDecimals={false}
              />
              <YAxis
                dataKey="courtName"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: "#1A1A1A" }}
                stroke="#E0E0E0"
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E0E0E0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(_value, _name, item) => {
                  const row = item.payload as Row;
                  return [
                    `${row.bookings} booking · ${row.totalHours} jam`,
                    row.locationName,
                  ];
                }}
              />
              <Bar
                dataKey="bookings"
                fill="#FF6D00"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportSection>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-text-secondary border border-dashed border-border rounded-lg">
      {message}
    </div>
  );
}
