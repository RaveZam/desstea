import { createAdminClient } from "../../../../lib/supabase/admin";
import type { User } from "../../../_types";

export async function listAccounts(): Promise<User[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.listUsers();

  return (data?.users ?? []).map((u) => {
    const meta = u.user_metadata ?? {};
    const fullName: string =
      meta.full_name ?? meta.name ?? u.email?.split("@")[0] ?? "Unknown";
    const initials = fullName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: u.id,
      name: fullName,
      email: u.email ?? "",
      role: (u.app_metadata?.role as User["role"]) ?? "branch_manager",
      assignedBranchId: u.app_metadata?.branch_id ?? null,
      assignedBranchName:
        u.app_metadata?.branch_name ?? u.app_metadata?.Assigned_Branch ?? null,
      status: u.banned_until ? "inactive" : "active",
      lastLogin: u.last_sign_in_at ?? u.created_at ?? new Date().toISOString(),
      avatarInitials: initials,
    };
  });
}

export async function createAccountInSupabase(data: {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "branch_manager";
  assignedBranchId?: string;
  assignedBranchName?: string;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.name },
    app_metadata: {
      role: data.role,
      branch_id: data.assignedBranchId || null,
      branch_name: data.assignedBranchName || null,
    },
  });

  return error ? error.message : null;
}

export async function updateAccountInSupabase(
  userId: string,
  data: {
    name: string;
    email: string;
    role: "super_admin" | "branch_manager";
    assignedBranchId?: string;
    assignedBranchName?: string;
  },
) {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: { full_name: data.name },
    app_metadata: {
      role: data.role,
      branch_id: data.assignedBranchId || null,
      branch_name: data.assignedBranchName || null,
    },
  });

  return error ? error.message : null;
}

export async function deleteAccountInSupabase(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  return error ? error.message : null;
}
