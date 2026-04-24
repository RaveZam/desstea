"use server";

import { revalidatePath } from "next/cache";
import type { ProductFormData } from "../../_types";
import {
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
  createCategoryInSupabase,
  updateCategoryInSupabase,
  deleteCategoryInSupabase,
  createAddonGroupTemplate,
  updateAddonGroupTemplate,
  deleteAddonGroupTemplate,
  createComboInSupabase,
  updateComboInSupabase,
  deleteComboInSupabase,
} from "./services/productsService";
import { listBranches } from "../branches/services/branchesService";

export async function createProduct(data: ProductFormData): Promise<{ error: string | null }> {
  const branches = await listBranches();
  const allBranchIds = branches.map((b) => b.id);
  const error = await createProductInSupabase(data, allBranchIds);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<{ error: string | null }> {
  const branches = await listBranches();
  const allBranchIds = branches.map((b) => b.id);
  const error = await updateProductInSupabase(id, data, allBranchIds);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const error = await deleteProductInSupabase(id);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function createCategory(data: {
  name: string;
  description?: string;
}): Promise<{ error: string | null }> {
  const error = await createCategoryInSupabase(data);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function updateCategory(
  id: string,
  data: { name: string; description?: string }
): Promise<{ error: string | null }> {
  const error = await updateCategoryInSupabase(id, data);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  const error = await deleteCategoryInSupabase(id);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function createAddonGroup(data: {
  name: string;
  category_id: string | null;
  options: { name: string; price_modifier: number; is_available: boolean; sort_order: number }[];
}): Promise<{ error: string | null }> {
  const error = await createAddonGroupTemplate(data);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function updateAddonGroup(
  id: string,
  data: {
    name: string;
    category_id: string | null;
    options: { name: string; price_modifier: number; is_available: boolean; sort_order: number }[];
  }
): Promise<{ error: string | null }> {
  const error = await updateAddonGroupTemplate(id, data);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function deleteAddonGroup(id: string): Promise<{ error: string | null }> {
  const error = await deleteAddonGroupTemplate(id);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function createCombo(data: {
  name: string;
  price: number;
  is_available: boolean;
  slots: { category_id: string; products: { product_id: string; quantity: number }[] }[];
  available_branch_ids: string[];
}): Promise<{ error: string | null }> {
  const branches = await listBranches();
  const allBranchIds = branches.map((b) => b.id);
  const error = await createComboInSupabase(data, allBranchIds);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function updateCombo(
  id: string,
  data: {
    name: string;
    price: number;
    is_available: boolean;
    slots: { category_id: string; products: { product_id: string; quantity: number }[] }[];
    available_branch_ids: string[];
  }
): Promise<{ error: string | null }> {
  const branches = await listBranches();
  const allBranchIds = branches.map((b) => b.id);
  const error = await updateComboInSupabase(id, data, allBranchIds);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}

export async function deleteCombo(id: string): Promise<{ error: string | null }> {
  const error = await deleteComboInSupabase(id);
  if (error) return { error };
  revalidatePath("/products");
  return { error: null };
}
