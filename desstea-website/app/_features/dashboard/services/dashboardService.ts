import { createAdminClient } from "../../../../lib/supabase/admin";

export type DateRangeKey = "today" | "7d" | "30d";

export type DashboardKpis = {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  avg_revenue_per_branch: number;
  prev_total_revenue: number;
  prev_total_orders: number;
  prev_avg_order_value: number;
  prev_avg_revenue_per_branch: number;
};

export type SalesDay = { day: string; revenue: number };
export type TopProduct = { name: string; revenue: number };
export type BranchOverview = {
  branch_name: string;
  revenue: number;
  orders: number;
  trend: number | null;
  top_product: string | null;
};

export type DashboardData = {
  kpis: DashboardKpis;
  salesByDay: SalesDay[];
  topProducts: TopProduct[];
  branchOverview: BranchOverview[];
};

export function getDateBounds(range: DateRangeKey): { start: Date; end: Date } {
  // Anchor everything to Philippine time (UTC+8)
  const phOffset = 8 * 60 * 60 * 1000;
  const now = new Date();
  const phNow = new Date(now.getTime() + phOffset);
  const todayStartUtc = Date.UTC(
    phNow.getUTCFullYear(),
    phNow.getUTCMonth(),
    phNow.getUTCDate()
  );
  const todayStart = new Date(todayStartUtc - phOffset);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  if (range === "today") return { start: todayStart, end: tomorrowStart };
  if (range === "7d")
    return {
      start: new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: tomorrowStart,
    };
  // 30d
  return {
    start: new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000),
    end: tomorrowStart,
  };
}

export async function getDashboardData(range: DateRangeKey): Promise<DashboardData> {
  const supabase = createAdminClient();
  const { start, end } = getDateBounds(range);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const [kpisRes, salesRes, productsRes, branchRes] = await Promise.all([
    supabase.rpc("get_dashboard_kpis", { start_date: startIso, end_date: endIso }),
    supabase.rpc("get_sales_by_day", { start_date: startIso, end_date: endIso }),
    supabase.rpc("get_top_products", { start_date: startIso, end_date: endIso, lim: 5 }),
    supabase.rpc("get_branch_overview", { start_date: startIso, end_date: endIso }),
  ]);

  if (kpisRes.error) throw new Error(kpisRes.error.message);
  if (salesRes.error) throw new Error(salesRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (branchRes.error) throw new Error(branchRes.error.message);

  return {
    kpis: (kpisRes.data as DashboardKpis[])[0] ?? {
      total_revenue: 0, total_orders: 0, avg_order_value: 0, avg_revenue_per_branch: 0,
      prev_total_revenue: 0, prev_total_orders: 0, prev_avg_order_value: 0, prev_avg_revenue_per_branch: 0,
    },
    salesByDay: (salesRes.data as SalesDay[]) ?? [],
    topProducts: (productsRes.data as TopProduct[]) ?? [],
    branchOverview: (branchRes.data as BranchOverview[]) ?? [],
  };
}
