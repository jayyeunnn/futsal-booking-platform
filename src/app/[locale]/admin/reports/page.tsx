import { redirect } from "next/navigation";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import {
  formatDateOnly,
  parseDateRange,
  type GroupBy,
} from "@/lib/reports";
import {
  getCancellationReport,
  getMemberReport,
  getOccupancyReport,
  getRevenueReport,
  getTopCourts,
} from "@/lib/report-data";
import { ReportsDateFilter } from "@/components/admin/ReportsDateFilter";
import {
  RevenueChart,
  OccupancyChart,
  MemberGrowthChart,
  TopCourtsChart,
  CancellationChart,
} from "@/components/admin/reports/LazyCharts";
import { formatRupiah } from "@/components/admin/reports/format";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
  groupBy?: string;
};

export default async function AdminReportsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  // Layout already enforces auth, but we re-check defensively for direct hits.
  const session = await getSessionUser();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect(`/${params.locale}/dashboard`);
  }

  const { from, to } = parseDateRange(searchParams.from, searchParams.to);
  const groupBy: GroupBy =
    searchParams.groupBy === "week" || searchParams.groupBy === "month"
      ? searchParams.groupBy
      : "day";

  // Fetch every report in parallel — they all read independent slices of the
  // same date range, so parallelism is the most useful optimization here.
  const [revenue, occupancy, members, topCourts, cancellation] =
    await Promise.all([
      getRevenueReport(from, to, groupBy),
      getOccupancyReport(from, to),
      getMemberReport(from, to),
      getTopCourts(from, to, 10),
      getCancellationReport(from, to, "day"),
    ]);

  // The filter UI displays the user-selected (inclusive) end date.
  const inclusiveTo = new Date(to);
  inclusiveTo.setDate(inclusiveTo.getDate() - 1);
  const filterFrom = formatDateOnly(from);
  const filterTo = formatDateOnly(inclusiveTo);

  const summaryCards = [
    {
      icon: DollarSign,
      label: "Total Pendapatan",
      value: formatRupiah(revenue.summary.totalRevenue),
      hint: `${revenue.summary.totalTransactions} transaksi`,
      color: "text-success",
    },
    {
      icon: Calendar,
      label: "Total Booking",
      value: cancellation.summary.totalBookings.toLocaleString("id-ID"),
      hint: `${cancellation.summary.cancelledBookings} dibatalkan (${cancellation.summary.cancellationRate}%)`,
      color: "text-primary",
    },
    {
      icon: Users,
      label: "Member Baru",
      value: members.summary.newInRange.toLocaleString("id-ID"),
      hint: `Total: ${members.summary.cumulativeAtEnd.toLocaleString("id-ID")}`,
      color: "text-info",
    },
    {
      icon: TrendingUp,
      label: "Avg Occupancy",
      value: `${occupancy.summary.occupancyPct}%`,
      hint: `${occupancy.summary.totalBookedHours.toLocaleString("id-ID")} / ${occupancy.summary.totalAvailableHours.toLocaleString("id-ID")} jam`,
      color: "text-cta",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
          Laporan & Analytics
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Ringkasan pendapatan, occupancy, member, dan performa lapangan
        </p>
      </div>

      <ReportsDateFilter from={filterFrom} to={filterTo} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <card.icon className={`h-5 w-5 ${card.color} mb-3`} />
            <p className="text-2xl font-heading font-bold text-text-primary">
              {card.value}
            </p>
            <p className="text-sm text-text-secondary mt-1">{card.label}</p>
            <p className="text-xs text-text-secondary mt-1.5">{card.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <RevenueChart data={revenue.series} groupBy={revenue.groupBy} />
      <OccupancyChart series={occupancy.series} perCourt={occupancy.perCourt} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberGrowthChart
          data={members.series}
          tierDistribution={members.tierDistribution}
        />
        <TopCourtsChart data={topCourts} />
      </div>
      <CancellationChart data={cancellation.series} />
    </div>
  );
}
