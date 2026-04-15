"use server";

import { revalidatePath } from "next/cache";
import {
  createBranchInSupabase,
  updateBranchInSupabase,
  deleteBranchInSupabase,
} from "./services/branchesService";

export async function createBranch(data: { name: string; address: string }) {
  const error = await createBranchInSupabase(data);
  if (error) return { error };
  revalidatePath("/branches");
  return { error: null };
}

export async function updateBranch(id: string, data: { name: string; address: string }) {
  const error = await updateBranchInSupabase(id, data);
  if (error) return { error };
  revalidatePath("/branches");
  revalidatePath(`/branches/${id}`);
  return { error: null };
}

export async function deleteBranch(id: string) {
  const error = await deleteBranchInSupabase(id);
  if (error) return { error };
  revalidatePath("/branches");
  return { error: null };
}
