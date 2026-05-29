"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportSection } from "./ReportSection";

type Point = {
  period: string;
  total: number;
  cancelled: number;
  cancellationRate: number;
};

type Props = {
  data: Point[];
};

export function CancellationChart({ data }: Props) {
  return (
    <ReportSection
      title="Cancellation Rate"
      description="Persentase booking yang dibatalkan / kadaluwarsa per hari (numerator: CANCELLED + EXPIRED)"
      csvRows={data}
      csvHeaders={[
        { label: "Tanggal", value: "period" },
        { label: "Total Booking", value: "total" },
        { label: "Cancelled/Expired", value: "cancelled" },
        { label: "Cancellation Rate (%)", value: "cancellationRate" },
      ]}
      csvFilename="cancellation-rate"
    >
      {data.every((d) => d.total === 0) ? (
        <EmptyChart message="Belum ada booking di rentang ini." />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
                  const p = item.payload as Point;
                  return [
                    `${p.cancellationRate}% (${p.cancelled} dari ${p.total})`,
                    "Cancellation",
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="cancellationRate"
                stroke="#F44336"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
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
