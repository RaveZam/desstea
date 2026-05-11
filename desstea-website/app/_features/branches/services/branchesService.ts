import { createAdminClient } from "../../../../lib/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";
import type { Branch } from "../../../_types";
import { getDateBounds, type DateRangeKey } from "../../dashboard/services/dateUtils";
import type { TopCategory, TopProduct } from "../../dashboard/services/dashboardService";

// ── Branch detail data types ─────────────────────────────────

export type BranchKpis = {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  items_sold: number;
  prev_total_revenue: number;
  prev_total_orders: number;
  prev_avg_order_value: number;
};

export type BranchSalesDay = { day: string; revenue: number };

export type BranchRecentOrder = {
  id: string;
  customerName: string;
  itemCount: number;
  total: number;
  createdAt: string;
  status: string;
};

export type BranchDetailData = {
  kpis: BranchKpis;
  salesByDay: BranchSalesDay[];
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  recentOrders: BranchRecentOrder[];
};

function resolveDisplayName(u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): string {
  const meta = u.user_metadata ?? {};
  return (meta.full_name as string | undefined)
    ?? (meta.name as string | undefined)
    ?? u.email?.split("@")[0]
    ?? u.id;
}

function mapRow(row: Record<string, unknown>, nameMap: Record<string, string>): Branch {
  const accountId = (row.assigned_account_id as string | null) ?? null;
  return {
    id: row.branch_id as string,
    name: row.branch_name as string,
    address: row.branch_address as string,
    assigned_account_id: accountId,
    assigned_account_name: accountId ? (nameMap[accountId] ?? null) : null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: (row.deleted_at as string | null) ?? null,
  };
}

export async function listBranches(): Promise<Branch[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("branches");
  const supabase = createAdminClient();
  const [{ data, error }, { data: usersData, error: usersError }] = await Promise.all([
    supabase.from("branches").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  if (error) throw new Error(error.message);

  console.log("[listBranches] branches fetched:", (data ?? []).length);
  if (usersError) {
    console.error("[listBranches] failed to fetch auth users:", usersError.message);
  } else {
    console.log("[listBranches] auth users fetched:", usersData?.users?.length ?? 0);
  }

  // Key is raw_user_meta_data.branch_id (the branch's own ID), not the user's UUID
  const nameByBranchId: Record<string, string> = {};
  for (const u of usersData?.users ?? []) {
    const branchId = u.user_metadata?.branch_id as string | undefined;
    console.log(`[listBranches] user="${resolveDisplayName(u)}" user_metadata.branch_id=${branchId ?? "null"}`);
    if (branchId) nameByBranchId[branchId] = resolveDisplayName(u);
  }

  const branches = (data ?? []).map((row) => {
    const branchId = row.branch_id as string;
    const resolvedName = nameByBranchId[branchId] ?? null;
    console.log(`[listBranches] branch="${row.branch_name}" id=${branchId} resolved_name=${resolvedName ?? "null"}`);
    return { ...mapRow(row, {}), assigned_account_name: resolvedName };
  });
  return branches;
}

export async function getBranchByIdFromDB(id: string): Promise<Branch | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("branches");
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("branches")
    .select("*")
    .eq("branch_id", id)
    .is("deleted_at", null)
    .single();
  if (!data) return null;

  console.log(`[getBranchByIdFromDB] looking up branch id=${id}`);

  // Find the user whose raw_user_meta_data.branch_id matches this branch's ID
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    console.error(`[getBranchByIdFromDB] failed to fetch auth users:`, usersError.message);
  }

  let resolvedName: string | null = null;
  for (const u of usersData?.users ?? []) {
    const branchId = u.user_metadata?.branch_id as string | undefined;
    console.log(`[getBranchByIdFromDB] user="${resolveDisplayName(u)}" user_metadata.branch_id=${branchId ?? "null"}`);
    if (branchId === id) {
      resolvedName = resolveDisplayName(u);
      console.log(`[getBranchByIdFromDB] matched user="${resolvedName}" for branch ${id}`);
      break;
    }
  }

  if (!resolvedName) {
    console.warn(`[getBranchByIdFromDB] no user found with user_metadata.branch_id=${id}`);
  }

  return { ...mapRow(data, {}), assigned_account_name: resolvedName };
}

export async function createBranchInSupabase(data: {
  name: string;
  address: string;
}): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("branches")
    .insert({ branch_name: data.name, branch_address: data.address });
  return error ? error.message : null;
}

export async function updateBranchInSupabase(
  id: string,
  data: { name: string; address: string }
): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("branches")
    .update({
      branch_name: data.name,
      branch_address: data.address,
    })
    .eq("branch_id", id);
  return error ? error.message : null;
}

export type BranchDailySummary = {
  order_count: number;
  total_revenue: number;
};

export async function getTodayOrdersSummary(): Promise<Record<string, BranchDailySummary>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");
  const supabase = createAdminClient();
  const { start, end } = getDateBounds("today");
  const { data, error } = await supabase
    .from("orders")
    .select("branch_id, total")
    .neq("status", "cancelled")
    .gte("ordered_at", start.toISOString())
    .lt("ordered_at", end.toISOString());
  if (error) {
    console.error("[getTodayOrdersSummary] error:", error.message);
    return {};
  }
  const map: Record<string, BranchDailySummary> = {};
  for (const row of (data ?? []) as { branch_id: string; total: number }[]) {
    if (!map[row.branch_id]) map[row.branch_id] = { order_count: 0, total_revenue: 0 };
    map[row.branch_id].order_count += 1;
    map[row.branch_id].total_revenue += Number(row.total);
  }
  return map;
}

export async function getBranchDetailData(branchId: string, range: DateRangeKey): Promise<BranchDetailData> {
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

  const [curOrdersRes, prevOrdersRes, recentOrdersRes, productsRes] = await Promise.all([
    supabase.from("orders")
      .select("id, total, ordered_at")
      .eq("branch_id", branchId)
      .neq("status", "cancelled")
      .gte("ordered_at", startIso)
      .lt("ordered_at", endIso),
    supabase.from("orders")
      .select("id, total")
      .eq("branch_id", branchId)
      .neq("status", "cancelled")
      .gte("ordered_at", prevStartIso)
      .lt("ordered_at", prevEndIso),
    supabase.from("orders")
      .select("id, customer_name, total, ordered_at, status, order_items(count)")
      .eq("branch_id", branchId)
      .gte("ordered_at", startIso)
      .lt("ordered_at", endIso)
      .order("ordered_at", { ascending: false })
      .limit(10),
    supabase.from("products").select("id, categories(name)"),
  ]);

  if (curOrdersRes.error) throw new Error(curOrdersRes.error.message);
  if (prevOrdersRes.error) throw new Error(prevOrdersRes.error.message);

  type CurOrderRow = { id: string; total: number; ordered_at: string };
  type PrevOrderRow = { id: string; total: number };
  type ProductRow = { id: string; categories: { name: string } | null };

  const curOrders = (curOrdersRes.data ?? []) as CurOrderRow[];
  const prevOrders = (prevOrdersRes.data ?? []) as PrevOrderRow[];
  const products = (productsRes.data ?? []) as ProductRow[];

  // Fetch order_items for current period orders
  const curOrderIds = curOrders.map((o) => o.id);
  type ItemRow = { product_name_snapshot: string; product_id: string | null; total_price: number; quantity: number };
  let items: ItemRow[] = [];
  if (curOrderIds.length > 0) {
    const itemsRes = await supabase.from("order_items")
      .select("product_name_snapshot, product_id, total_price, quantity")
      .in("order_id", curOrderIds);
    if (itemsRes.error) throw new Error(itemsRes.error.message);
    items = (itemsRes.data ?? []) as ItemRow[];
  }

  // ── KPIs ──────────────────────────────────────────────────────
  const totalRevenue = curOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = curOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const itemsSold = items.reduce((s, i) => s + Number(i.quantity), 0);

  const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
  const prevCount = prevOrders.length;
  const prevAvgOrderValue = prevCount > 0 ? prevRevenue / prevCount : 0;

  // ── Sales by day/hour ─────────────────────────────────────────
  let salesByDay: BranchSalesDay[];
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

  // ── Recent orders ─────────────────────────────────────────────
  const recentOrders: BranchRecentOrder[] = (recentOrdersRes.data ?? []).map((row) => {
    const countArr = row.order_items as { count: number }[] | null;
    return {
      id: row.id as string,
      customerName: (row.customer_name as string | null) ?? "Guest",
      itemCount: Number(countArr?.[0]?.count ?? 0),
      total: Number(row.total),
      createdAt: row.ordered_at as string,
      status: (row.status as string | null) ?? "completed",
    };
  });

  return {
    kpis: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      avg_order_value: avgOrderValue,
      items_sold: itemsSold,
      prev_total_revenue: prevRevenue,
      prev_total_orders: prevCount,
      prev_avg_order_value: prevAvgOrderValue,
    },
    salesByDay,
    topProducts,
    topCategories,
    recentOrders,
  };
}

export async function deleteBranchInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("branches")
    .update({ deleted_at: new Date().toISOString() })
    .eq("branch_id", id);
  return error ? error.message : null;
}
