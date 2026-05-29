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
import { formatRupiahShort, formatRupiah } from "./format";

type Point = {
  period: string;
  revenue: number;
  transactions: number;
};

type Props = {
  data: Point[];
  groupBy: "day" | "week" | "month";
};

const GROUP_LABEL: Record<Props["groupBy"], string> = {
  day: "harian",
  week: "mingguan",
  month: "bulanan",
};

export function RevenueChart({ data, groupBy }: Props) {
  return (
    <ReportSection
      title="Pendapatan"
      description={`Total pembayaran terkonfirmasi dikelompokkan per ${GROUP_LABEL[groupBy]}`}
      csvRows={data}
      csvHeaders={[
        { label: "Periode", value: "period" },
        { label: "Pendapatan (Rp)", value: "revenue" },
        { label: "Transaksi", value: "transactions" },
      ]}
      csvFilename={`revenue-${groupBy}`}
    >
      {data.every((d) => d.revenue === 0) ? (
        <EmptyChart message="Belum ada pendapatan di rentang ini." />
      ) : (
        <div className="h-72">
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
                tickFormatter={(v) => formatRupiahShort(Number(v))}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E0E0E0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  return name === "revenue"
                    ? [formatRupiah(numeric), "Pendapatan"]
                    : [String(numeric), "Transaksi"];
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1B5E20"
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
