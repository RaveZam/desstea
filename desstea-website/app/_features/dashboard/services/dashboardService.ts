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

  const rangeMs = end.getTime() - start.getTime();
  const prevStartIso = new Date(start.getTime() - rangeMs).toISOString();
  const prevEndIso = startIso;

  const [curOrdersRes, prevOrdersRes, itemsRes, productsRes, branchesRes, activeBranchesRes] = await Promise.all([
    supabase.from("orders")
      .select("id, total, branch_id, ordered_at")
      .neq("status", "cancelled")
      .gte("ordered_at", startIso)
      .lt("ordered_at", endIso),
    supabase.from("orders")
      .select("id, total, branch_id")
      .neq("status", "cancelled")
      .gte("ordered_at", prevStartIso)
      .lt("ordered_at", prevEndIso),
    supabase.from("order_items")
      .select("product_name_snapshot, product_id, total_price, orders!inner(branch_id)")
      .neq("orders.status", "cancelled")
      .gte("orders.ordered_at", startIso)
      .lt("orders.ordered_at", endIso),
    supabase.from("products").select("id, categories(name)"),
    supabase.from("branches").select("branch_id, branch_name").is("deleted_at", null),
    supabase.from("branches").select("branch_name").is("deleted_at", null),
  ]);

  if (curOrdersRes.error) throw new Error(curOrdersRes.error.message);
  if (prevOrdersRes.error) throw new Error(prevOrdersRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);

  type OrderRow = { id: string; total: number; branch_id: string; ordered_at: string };
  type PrevOrderRow = { id: string; total: number; branch_id: string };
  type ItemRow = { product_name_snapshot: string; product_id: string | null; total_price: number; orders: { branch_id: string }[] };
  type ProductRow = { id: string; categories: { name: string } | null };
  type BranchRow = { branch_id: string; branch_name: string };

  const curOrders = (curOrdersRes.data ?? []) as OrderRow[];
  const prevOrders = (prevOrdersRes.data ?? []) as PrevOrderRow[];
  const items = (itemsRes.data ?? []) as ItemRow[];
  const products = (productsRes.data ?? []) as ProductRow[];
  const branches = (branchesRes.data ?? []) as BranchRow[];

  // ── KPIs ──────────────────────────────────────────────────────
  const totalRevenue = curOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = curOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const distinctBranches = new Set(curOrders.map((o) => o.branch_id)).size;
  const avgRevenuePerBranch = distinctBranches > 0 ? totalRevenue / distinctBranches : 0;

  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
  const prevCount = prevOrders.length;
  const prevAvgOrderValue = prevCount > 0 ? prevRevenue / prevCount : 0;
  const prevDistinctBranches = new Set(prevOrders.map((o) => o.branch_id)).size;
  const prevAvgRevenuePerBranch = prevDistinctBranches > 0 ? prevRevenue / prevDistinctBranches : 0;

  // ── Sales by day/hour ─────────────────────────────────────────
  let salesByDay: SalesDay[];
  if (range === "today") {
    const hourlyMap: Record<number, number> = {};
    for (const o of curOrders) {
      const phHour = new Date(new Date(o.ordered_at).getTime() + 8 * 60 * 60 * 1000).getUTCHours();
      hourlyMap[phHour] = (hourlyMap[phHour] ?? 0) + Number(o.total);
    }
    salesByDay = Array.from({ length: 24 }, (_, hr) => ({
      day: hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`,
      revenue: hourlyMap[hr] ?? 0,
    }));
  } else {
    const dayRevMap: Record<string, number> = {};
    for (const o of curOrders) {
      const phDate = new Date(new Date(o.ordered_at).getTime() + 8 * 60 * 60 * 1000);
      const key = `${phDate.getUTCFullYear()}-${String(phDate.getUTCMonth() + 1).padStart(2, "0")}-${String(phDate.getUTCDate()).padStart(2, "0")}`;
      dayRevMap[key] = (dayRevMap[key] ?? 0) + Number(o.total);
    }
    salesByDay = [];
    const cur = new Date(start);
    while (cur < end) {
      const phCur = new Date(cur.getTime() + 8 * 60 * 60 * 1000);
      const key = `${phCur.getUTCFullYear()}-${String(phCur.getUTCMonth() + 1).padStart(2, "0")}-${String(phCur.getUTCDate()).padStart(2, "0")}`;
      const label = phCur.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      salesByDay.push({ day: label, revenue: dayRevMap[key] ?? 0 });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  // ── Top products ──────────────────────────────────────────────
  const productRevMap: Record<string, number> = {};
  for (const item of items) {
    const name = item.product_name_snapshot;
    productRevMap[name] = (productRevMap[name] ?? 0) + Number(item.total_price);
  }
  const topProducts: TopProduct[] = Object.entries(productRevMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Top categories ────────────────────────────────────────────
  const productCatMap: Record<string, string> = {};
  for (const p of products) {
    if (p.categories) productCatMap[p.id] = p.categories.name;
  }
  const catRevMap: Record<string, number> = {};
  for (const item of items) {
    if (!item.product_id) continue;
    const catName = productCatMap[item.product_id];
    if (!catName) continue;
    catRevMap[catName] = (catRevMap[catName] ?? 0) + Number(item.total_price);
  }
  const topCategories: TopCategory[] = Object.entries(catRevMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Branch overview ───────────────────────────────────────────
  const activeBranchNames = new Set(
    (activeBranchesRes.data ?? []).map((b) => (b as { branch_name: string }).branch_name),
  );

  const branchStats: Record<string, { revenue: number; orders: number }> = {};
  for (const o of curOrders) {
    if (!branchStats[o.branch_id]) branchStats[o.branch_id] = { revenue: 0, orders: 0 };
    branchStats[o.branch_id].revenue += Number(o.total);
    branchStats[o.branch_id].orders += 1;
  }

  const prevBranchRevMap: Record<string, number> = {};
  for (const o of prevOrders) {
    prevBranchRevMap[o.branch_id] = (prevBranchRevMap[o.branch_id] ?? 0) + Number(o.total);
  }

  const branchProductRevMap: Record<string, Record<string, number>> = {};
  for (const item of items) {
    const bid = item.orders[0]?.branch_id;
    if (!bid) continue;
    if (!branchProductRevMap[bid]) branchProductRevMap[bid] = {};
    const name = item.product_name_snapshot;
    branchProductRevMap[bid][name] = (branchProductRevMap[bid][name] ?? 0) + Number(item.total_price);
  }

  const branchOverview: BranchOverview[] = branches
    .filter((b) => activeBranchNames.has(b.branch_name))
    .map((b) => {
      const stats = branchStats[b.branch_id] ?? { revenue: 0, orders: 0 };
      const prevRev = prevBranchRevMap[b.branch_id] ?? 0;
      const trend = prevRev > 0 ? Math.round(((stats.revenue - prevRev) / prevRev) * 1000) / 10 : null;
      const prodMap = branchProductRevMap[b.branch_id] ?? {};
      const topProductEntry = Object.entries(prodMap).sort((a, b2) => b2[1] - a[1])[0];
      return {
        branch_name: b.branch_name,
        revenue: stats.revenue,
        orders: stats.orders,
        trend,
        top_product: topProductEntry ? topProductEntry[0] : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return {
    kpis: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      avg_order_value: avgOrderValue,
      avg_revenue_per_branch: avgRevenuePerBranch,
      prev_total_revenue: prevRevenue,
      prev_total_orders: prevCount,
      prev_avg_order_value: prevAvgOrderValue,
      prev_avg_revenue_per_branch: prevAvgRevenuePerBranch,
    },
    salesByDay,
    topProducts,
    topCategories,
    branchOverview,
  };
}
