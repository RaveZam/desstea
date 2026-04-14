"use server";

import { revalidatePath } from "next/cache";
import {
  createAccountInSupabase,
  updateAccountInSupabase,
  deleteAccountInSupabase,
} from "./services/accountsService";

export async function createAccount(data: {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "branch_manager";
  assignedBranchId?: string;
  assignedBranchName?: string;
}) {
  const error = await createAccountInSupabase(data);
  if (error) return { error };
  revalidatePath("/accounts");
  return { error: null };
}

export async function updateAccount(
  userId: string,
  data: {
    name: string;
    email: string;
    role: "super_admin" | "branch_manager";
    assignedBranchId?: string;
    assignedBranchName?: string;
  }
) {
  const error = await updateAccountInSupabase(userId, data);
  if (error) return { error };
  revalidatePath("/accounts");
  return { error: null };
}

export async function deleteAccount(userId: string) {
  const error = await deleteAccountInSupabase(userId);
  if (error) return { error };
  revalidatePath("/accounts");
  return { error: null };
}
