"use client";

/**
 * Client-side lazy wrappers for the heavy recharts-based chart components.
 *
 * Why this exists:
 *   recharts pulls in d3-shape / d3-scale and weighs ~80KB minified. The
 *   admin reports page is the only consumer, but it's rendered as a server
 *   component so we cannot use `next/dynamic` with `ssr: false` directly
 *   inside the page. Instead we declare a thin client wrapper here and let
 *   Next code-split the recharts bundle to its own chunk that's only fetched
 *   when the reports page is visited (and then cached for subsequent admins).
 *
 * The wrappers preserve the same prop signatures as the underlying charts
 * so the page-level call sites don't need to change.
 */

import dynamic from "next/dynamic";

const ChartSkeleton = ({ heightClass = "h-72" }: { heightClass?: string }) => (
  <div
    className={`${heightClass} bg-muted/50 rounded-xl border border-dashed border-border animate-pulse flex items-center justify-center text-xs text-text-secondary`}
  >
    Memuat chart…
  </div>
);

export const RevenueChart = dynamic(
  () => import("./RevenueChart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const OccupancyChart = dynamic(
  () => import("./OccupancyChart").then((m) => m.OccupancyChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const MemberGrowthChart = dynamic(
  () => import("./MemberGrowthChart").then((m) => m.MemberGrowthChart),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-64" /> }
);

export const TopCourtsChart = dynamic(
  () => import("./TopCourtsChart").then((m) => m.TopCourtsChart),
  { ssr: false, loading: () => <ChartSkeleton heightClass="h-64" /> }
);

export const CancellationChart = dynamic(
  () => import("./CancellationChart").then((m) => m.CancellationChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
