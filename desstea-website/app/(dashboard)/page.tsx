import {
  StatCards,
  SalesChart,
  OrderStatusChart,
  TopProductsCard,
  TopBranchesCard,
  DateRangeSelector,
} from "../_features/dashboard";

export default function DashboardPage() {
  return (
    <div className="px-5 py-4 space-y-3">
      {/* Page title row */}
      <div className="flex items-start justify-between fade-up fade-up-1">
        <div>
          <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track, manage, and grow your tea business with ease.
          </p>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <DateRangeSelector />
          <button className="flex items-center gap-2 bg-[#E8692A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Row 1: KPI cards */}
      <div className="fade-up fade-up-2">
        <StatCards />
      </div>

      {/* Row 2: Sales trend + Order status */}
      <div className="grid gap-3 fade-up fade-up-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <SalesChart />
        <OrderStatusChart />
      </div>

      {/* Row 3: Top products + Top branches */}
      <div className="grid grid-cols-2 gap-3 fade-up fade-up-4">
        <TopProductsCard />
        <TopBranchesCard />
      </div>
    </div>
  );
}
