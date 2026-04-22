import { Suspense } from "react";
import {
  StatCards,
  SalesChart,
  OrderStatusChart,
  TopBranchesCard,
  TopProductsCard,
  DateRangeSelector,
} from "../_features/dashboard";
import {
  getDashboardData,
  type DateRangeKey,
} from "../_features/dashboard/services/dashboardService";
import Loading from "./loading";

const PERIOD_LABELS: Record<DateRangeKey, string> = {
  today: "yesterday",
  "7d": "prior 7 days",
  "30d": "prior 30 days",
};

const RANGE_LABELS: Record<DateRangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range = (
    ["today", "7d", "30d"].includes(rawRange ?? "") ? rawRange : "30d"
  ) as DateRangeKey;

  const data = await getDashboardData(range);

  return (
    <div className="h-full overflow-y-auto flex flex-col px-5 py-3 gap-4">
      {/* Page title row */}
      <div className="shrink-0 flex items-center justify-between fade-up fade-up-1">
        <div>
          <h1 className="font-display text-[32px] font-semibold text-gray-900 tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Track, manage, and grow your tea business with ease.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <DateRangeSelector />
          <button className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Row 1: KPI cards */}
      <div className="shrink-0 fade-up fade-up-2">
        <StatCards kpis={data.kpis} periodLabel={PERIOD_LABELS[range]} />
      </div>

      {/* Row 2: Sales chart + Top Products donut */}
      <div
        className="shrink-0 grid gap-4 fade-up fade-up-3"
        style={{ gridTemplateColumns: "2fr 1fr", height: 320 }}
      >
        <SalesChart
          salesByDay={data.salesByDay}
          rangeLabel={RANGE_LABELS[range]}
        />
        <OrderStatusChart topCategories={data.topCategories} />
      </div>

      {/* Row 3: Branch overview + Top products list */}
      <div
        className="shrink-0 grid gap-4 fade-up fade-up-4"
        style={{ gridTemplateColumns: "3fr 1fr" }}
      >
        <TopBranchesCard branches={data.branchOverview} />
        <TopProductsCard products={data.topProducts} />
      </div>
    </div>
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
