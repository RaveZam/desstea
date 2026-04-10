// ── KPI Stats ────────────────────────────────────────────────

export interface KpiItem {
  label: string;
  value: string;
  change: string;
  favorable: boolean;
  dark: boolean;
  icon: React.ReactNode;
}

// ── Sales Chart ──────────────────────────────────────────────

export const salesData = [
  { day: "Mar 1", revenue: 7200 },
  { day: "Mar 5", revenue: 8400 },
  { day: "Mar 10", revenue: 9100 },
  { day: "Mar 15", revenue: 7800 },
  { day: "Mar 20", revenue: 11200 },
  { day: "Mar 25", revenue: 10400 },
  { day: "Mar 30", revenue: 12600 },
];

// ── Order Status ─────────────────────────────────────────────

export const orderStatusData = [
  { name: "Completed", value: 1284, color: "#6B4F3A" },
  { name: "Pending", value: 389, color: "#E8692A" },
  { name: "Cancelled", value: 174, color: "#D1CBC5" },
];

// ── Top Products ─────────────────────────────────────────────

export const topProducts = [
  { name: "Classic Milk Tea", revenue: 312450 },
  { name: "Matcha Latte", revenue: 278900 },
  { name: "Brown Sugar Boba", revenue: 241300 },
  { name: "Taro Tea", revenue: 198750 },
  { name: "Wintermelon Tea", revenue: 164200 },
];

// ── Top Branches ─────────────────────────────────────────────

export const topBranches = [
  {
    name: "Santiago City",
    revenue: 198500,
    orders: 412,
    trend: +14.2,
    topProduct: "Brown Sugar Boba",
    status: "On Fire" as const,
  },
  {
    name: "Cauayan City",
    revenue: 176300,
    orders: 368,
    trend: +6.8,
    topProduct: "Classic Milk Tea",
    status: "Steady" as const,
  },
  {
    name: "Ipil, Echague",
    revenue: 164800,
    orders: 298,
    trend: -2.1,
    topProduct: "Matcha Latte",
    status: "Watch" as const,
  },
  {
    name: "Cabugao, Echague",
    revenue: 135400,
    orders: 241,
    trend: -8.4,
    topProduct: "Taro Tea",
    status: "Needs Boost" as const,
  },
];

// ── Date Range Options ───────────────────────────────────────

export const dateRangeOptions = [
  { label: "Last 7 days", range: "Apr 1, 2026 - Apr 7, 2026" },
  { label: "Last 30 days", range: "Mar 8, 2026 - Apr 7, 2026" },
];

// ── Shared Styles ────────────────────────────────────────────

export const rankStyles = [
  { bg: "bg-[#C9A84C]/15", text: "text-[#C9A84C]" },
  { bg: "bg-[#9EA5AD]/15", text: "text-[#9EA5AD]" },
  { bg: "bg-[#B5754A]/15", text: "text-[#B5754A]" },
  { bg: "bg-gray-100", text: "text-gray-400" },
  { bg: "bg-gray-100", text: "text-gray-400" },
];
