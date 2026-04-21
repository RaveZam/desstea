import { createAdminClient } from "../../../../lib/supabase/admin";
import type { Branch } from "../../../_types";

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

export async function deleteBranchInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("branch_id", id);
  return error ? error.message : null;
}
