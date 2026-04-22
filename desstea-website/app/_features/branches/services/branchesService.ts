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
  };
}

export async function listBranches(): Promise<Branch[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("branches");
  const supabase = createAdminClient();
  const [{ data, error }, { data: usersData, error: usersError }] = await Promise.all([
    supabase.from("branches").select("*").order("created_at", { ascending: false }),
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
  const { data, error } = await supabase.rpc("get_today_orders_summary");
  if (error) {
    console.error("[getTodayOrdersSummary] error:", error.message);
    return {};
  }
  const map: Record<string, BranchDailySummary> = {};
  for (const row of data ?? []) {
    map[row.branch_id] = {
      order_count: Number(row.order_count),
      total_revenue: Number(row.total_revenue),
    };
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

  const [kpisRes, salesRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
    supabase.rpc("get_branch_kpis", { branch_id_filter: branchId, start_date: startIso, end_date: endIso }),
    supabase.rpc("get_branch_sales_by_day", { branch_id_filter: branchId, start_date: startIso, end_date: endIso }),
    supabase.rpc("get_branch_top_products", { branch_id_filter: branchId, start_date: startIso, end_date: endIso, lim: 5 }),
    supabase.rpc("get_branch_top_categories", { branch_id_filter: branchId, start_date: startIso, end_date: endIso, lim: 5 }),
    supabase
      .from("orders")
      .select("id, customer_name, total, ordered_at, order_items(count)")
      .eq("branch_id", branchId)
      .gte("ordered_at", startIso)
      .lt("ordered_at", endIso)
      .order("ordered_at", { ascending: false })
      .limit(10),
  ]);

  const rawKpis = (kpisRes.data as BranchKpis[] | null)?.[0];
  const emptyKpis: BranchKpis = {
    total_revenue: 0, total_orders: 0, avg_order_value: 0, items_sold: 0,
    prev_total_revenue: 0, prev_total_orders: 0, prev_avg_order_value: 0,
  };

  const recentOrders: BranchRecentOrder[] = (ordersRes.data ?? []).map((row) => {
    const countArr = row.order_items as { count: number }[] | null;
    return {
      id: row.id as string,
      customerName: (row.customer_name as string | null) ?? "Guest",
      itemCount: Number(countArr?.[0]?.count ?? 0),
      total: Number(row.total),
      createdAt: row.ordered_at as string,
    };
  });

  return {
    kpis: rawKpis ? {
      total_revenue: Number(rawKpis.total_revenue),
      total_orders: Number(rawKpis.total_orders),
      avg_order_value: Number(rawKpis.avg_order_value),
      items_sold: Number(rawKpis.items_sold),
      prev_total_revenue: Number(rawKpis.prev_total_revenue),
      prev_total_orders: Number(rawKpis.prev_total_orders),
      prev_avg_order_value: Number(rawKpis.prev_avg_order_value),
    } : emptyKpis,
    salesByDay: (salesRes.data as BranchSalesDay[]) ?? [],
    topProducts: (productsRes.data as TopProduct[]) ?? [],
    topCategories: (categoriesRes.data as TopCategory[]) ?? [],
    recentOrders,
  };
}

export async function deleteBranchInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("branch_id", id);
  return error ? error.message : null;
}
