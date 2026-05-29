"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportSection } from "./ReportSection";

type Point = {
  period: string;
  newMembers: number;
  cumulativeMembers: number;
};

type Props = {
  data: Point[];
  tierDistribution: Record<"BRONZE" | "SILVER" | "GOLD", number>;
};

export function MemberGrowthChart({ data, tierDistribution }: Props) {
  const totalMembers =
    tierDistribution.BRONZE + tierDistribution.SILVER + tierDistribution.GOLD;

  return (
    <ReportSection
      title="Pertumbuhan Member"
      description="Registrasi member baru dan total kumulatif sepanjang rentang"
      csvRows={data}
      csvHeaders={[
        { label: "Tanggal", value: "period" },
        { label: "Member Baru", value: "newMembers" },
        { label: "Kumulatif", value: "cumulativeMembers" },
      ]}
      csvFilename="member-growth"
    >
      {data.every((d) => d.newMembers === 0) ? (
        <EmptyChart message="Belum ada registrasi member di rentang ini." />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient
                  id="memberGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#1B5E20" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E0E0E0" strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "#616161" }}
                stroke="#E0E0E0"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#616161" }}
                stroke="#E0E0E0"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E0E0E0",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  String(value ?? 0),
                  name === "cumulativeMembers" ? "Kumulatif" : "Member Baru",
                ]}
              />
              <Area
                type="monotone"
                dataKey="cumulativeMembers"
                stroke="#1B5E20"
                strokeWidth={2}
                fill="url(#memberGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Distribusi Tier (Saat Ini)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <TierCard
            tier="BRONZE"
            count={tierDistribution.BRONZE}
            total={totalMembers}
            color="text-amber-700"
            bg="bg-amber-700/10"
          />
          <TierCard
            tier="SILVER"
            count={tierDistribution.SILVER}
            total={totalMembers}
            color="text-slate-700"
            bg="bg-slate-300/40"
          />
          <TierCard
            tier="GOLD"
            count={tierDistribution.GOLD}
            total={totalMembers}
            color="text-yellow-700"
            bg="bg-yellow-100"
          />
        </div>
      </div>
    </ReportSection>
  );
}

function TierCard({
  tier,
  count,
  total,
  color,
  bg,
}: {
  tier: string;
  count: number;
  total: number;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`rounded-xl p-3 ${bg}`}>
      <p className={`text-[10px] font-bold uppercase ${color}`}>{tier}</p>
      <p className={`text-2xl font-heading font-bold ${color}`}>{count}</p>
      <p className="text-xs text-text-secondary">{pct}% dari total</p>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-text-secondary border border-dashed border-border rounded-lg">
      {message}
    </div>
  );
}
