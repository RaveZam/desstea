import { createAdminClient } from "../../../../lib/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";
export { type DateRangeKey, getDateBounds } from "./dateUtils";
import { type DateRangeKey, getDateBounds } from "./dateUtils";

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
export type TopCategory = { name: string; revenue: number };
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
  topCategories: TopCategory[];
  branchOverview: BranchOverview[];
};

export async function getDashboardData(range: DateRangeKey): Promise<DashboardData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const supabase = createAdminClient();
  const { start, end } = getDateBounds(range);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const [kpisRes, salesRes, productsRes, categoriesRes, branchRes] = await Promise.all([
    supabase.rpc("get_dashboard_kpis", { start_date: startIso, end_date: endIso }),
    range === "today"
      ? supabase.from("orders").select("ordered_at, total").gte("ordered_at", startIso).lt("ordered_at", endIso)
      : supabase.rpc("get_sales_by_day", { start_date: startIso, end_date: endIso }),
    supabase.rpc("get_top_products", { start_date: startIso, end_date: endIso, lim: 5 }),
    supabase.rpc("get_top_categories", { start_date: startIso, end_date: endIso, lim: 5 }),
    supabase.rpc("get_branch_overview", { start_date: startIso, end_date: endIso }),
  ]);

  if (kpisRes.error) throw new Error(kpisRes.error.message);
  if (salesRes.error) throw new Error(salesRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);
  if (branchRes.error) throw new Error(branchRes.error.message);

  let salesByDay: SalesDay[];
  if (range === "today") {
    const hourlyMap: Record<number, number> = {};
    for (const row of (salesRes.data as { ordered_at: string; total: number }[] ?? [])) {
      const phHour = new Date(new Date(row.ordered_at).getTime() + 8 * 60 * 60 * 1000).getUTCHours();
      hourlyMap[phHour] = (hourlyMap[phHour] ?? 0) + Number(row.total);
    }
    salesByDay = Array.from({ length: 24 }, (_, hr) => ({
      day: hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`,
      revenue: hourlyMap[hr] ?? 0,
    }));
  } else {
    salesByDay = (salesRes.data as SalesDay[]) ?? [];
  }

  return {
    kpis: (kpisRes.data as DashboardKpis[])[0] ?? {
      total_revenue: 0, total_orders: 0, avg_order_value: 0, avg_revenue_per_branch: 0,
      prev_total_revenue: 0, prev_total_orders: 0, prev_avg_order_value: 0, prev_avg_revenue_per_branch: 0,
    },
    salesByDay,
    topProducts: (productsRes.data as TopProduct[]) ?? [],
    topCategories: (categoriesRes.data as TopCategory[]) ?? [],
    branchOverview: (branchRes.data as BranchOverview[]) ?? [],
  };
}
