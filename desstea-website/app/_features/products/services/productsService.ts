import { createAdminClient } from "../../../../lib/supabase/admin";
import type { Category, Product, ProductFormData } from "../../../_types";

export async function listCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function listProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name ),
      product_sizes ( * ),
      addon_groups ( id, name ),
      branch_product_availability ( branch_id, is_available )
    `)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const sizes = ((row.product_sizes ?? []) as Record<string, unknown>[])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((s) => ({
        id: s.id as string,
        label: s.label as string,
        size_price: s.size_price as number,
        sort_order: s.sort_order as number,
      }));

    const available_branch_ids = ((row.branch_product_availability ?? []) as Record<string, unknown>[])
      .filter((b) => b.is_available === true)
      .map((b) => b.branch_id as string);

    const cat = row.categories as { name: string } | null;
    const addonGroup = row.addon_groups as { id: string; name: string } | null;

    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | null,
      base_price: row.base_price as number,
      category_id: row.category_id as string,
      category_name: cat?.name ?? "",
      has_sizes: row.has_sizes as boolean,
      is_available: row.is_available as boolean,
      is_branch_exclusive: row.is_branch_exclusive as boolean,
      sizes,
      addon_group_id: addonGroup?.id ?? null,
      addon_group_name: addonGroup?.name ?? null,
      available_branch_ids,
      created_at: row.created_at as string,
    } satisfies Product;
  });
}

export async function createProductInSupabase(
  data: ProductFormData,
  allBranchIds: string[]
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: inserted, error: prodErr } = await supabase
    .from("products")
    .insert({
      name: data.name,
      description: data.description || null,
      base_price: data.base_price,
      category_id: data.category_id,
      has_sizes: data.has_sizes,
      is_available: data.is_available,
      is_branch_exclusive: data.is_branch_exclusive,
      addon_group_id: data.addon_group_id || null,
    })
    .select("id")
    .single();
  if (prodErr) return prodErr.message;

  const productId = inserted.id as string;

  if (data.sizes.length > 0) {
    const { error } = await supabase.from("product_sizes").insert(
      data.sizes.map((s) => ({ product_id: productId, label: s.label, size_price: s.size_price, sort_order: s.sort_order }))
    );
    if (error) return error.message;
  }

  const availRows = allBranchIds.map((branchId) => ({
    product_id: productId,
    branch_id: branchId,
    is_available: data.available_branch_ids.includes(branchId),
  }));
  const { error: availErr } = await supabase
    .from("branch_product_availability")
    .upsert(availRows, { onConflict: "product_id,branch_id" });
  if (availErr) return availErr.message;

  return null;
}

export async function updateProductInSupabase(
  id: string,
  data: ProductFormData,
  allBranchIds: string[]
): Promise<string | null> {
  const supabase = createAdminClient();

  const { error: prodErr } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description || null,
      base_price: data.base_price,
      category_id: data.category_id,
      has_sizes: data.has_sizes,
      is_available: data.is_available,
      is_branch_exclusive: data.is_branch_exclusive,
      addon_group_id: data.addon_group_id || null,
    })
    .eq("id", id);
  if (prodErr) return prodErr.message;

  const { error: delSizesErr } = await supabase.from("product_sizes").delete().eq("product_id", id);
  if (delSizesErr) return delSizesErr.message;

  if (data.sizes.length > 0) {
    const { error } = await supabase.from("product_sizes").insert(
      data.sizes.map((s) => ({ product_id: id, label: s.label, size_price: s.size_price, sort_order: s.sort_order }))
    );
    if (error) return error.message;
  }

  const availRows = allBranchIds.map((branchId) => ({
    product_id: id,
    branch_id: branchId,
    is_available: data.available_branch_ids.includes(branchId),
  }));
  const { error: availErr } = await supabase
    .from("branch_product_availability")
    .upsert(availRows, { onConflict: "product_id,branch_id" });
  if (availErr) return availErr.message;

  return null;
}

export async function deleteProductInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  return error ? error.message : null;
}

export async function createCategoryInSupabase(data: {
  name: string;
  description?: string;
}): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").insert({
    name: data.name,
    description: data.description || null,
  });
  return error ? error.message : null;
}

export async function updateCategoryInSupabase(
  id: string,
  data: { name: string; description?: string }
): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: data.name, description: data.description || null })
    .eq("id", id);
  return error ? error.message : null;
}

export async function deleteCategoryInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return error ? error.message : null;
}

// ── Category-level Addon Groups ───────────────────────────────

export interface AddonGroupRow {
  id: string;
  name: string;
  category_id: string | null;
  options: { id: string; name: string; price_modifier: number; is_available: boolean; sort_order: number }[];
}

export async function listAddonGroupTemplates(): Promise<AddonGroupRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("addon_groups")
    .select("id, name, category_id, addon_options ( * )")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((g) => ({
    id: g.id as string,
    name: g.name as string,
    category_id: (g.category_id as string | null) ?? null,
    options: ((g.addon_options ?? []) as Record<string, unknown>[])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((o) => ({
        id: o.id as string,
        name: o.name as string,
        price_modifier: o.price_modifier as number,
        is_available: o.is_available as boolean,
        sort_order: o.sort_order as number,
      })),
  }));
}

export async function createAddonGroupTemplate(data: {
  name: string;
  category_id: string | null;
  options: { name: string; price_modifier: number; is_available: boolean; sort_order: number }[];
}): Promise<string | null> {
  const supabase = createAdminClient();
  const { data: inserted, error: groupErr } = await supabase
    .from("addon_groups")
    .insert({ name: data.name, category_id: data.category_id })
    .select("id")
    .single();
  if (groupErr) return groupErr.message;

  if (data.options.length > 0) {
    const { error: optErr } = await supabase.from("addon_options").insert(
      data.options.map((o) => ({
        addon_group_id: inserted.id,
        name: o.name,
        price_modifier: o.price_modifier,
        is_available: o.is_available,
        sort_order: o.sort_order,
      }))
    );
    if (optErr) return optErr.message;
  }
  return null;
}

export async function updateAddonGroupTemplate(
  id: string,
  data: {
    name: string;
    category_id: string | null;
    options: { name: string; price_modifier: number; is_available: boolean; sort_order: number }[];
  }
): Promise<string | null> {
  const supabase = createAdminClient();
  const { error: groupErr } = await supabase
    .from("addon_groups")
    .update({ name: data.name, category_id: data.category_id })
    .eq("id", id);
  if (groupErr) return groupErr.message;

  const { error: delErr } = await supabase.from("addon_options").delete().eq("addon_group_id", id);
  if (delErr) return delErr.message;

  if (data.options.length > 0) {
    const { error: optErr } = await supabase.from("addon_options").insert(
      data.options.map((o) => ({
        addon_group_id: id,
        name: o.name,
        price_modifier: o.price_modifier,
        is_available: o.is_available,
        sort_order: o.sort_order,
      }))
    );
    if (optErr) return optErr.message;
  }
  return null;
}

export async function deleteAddonGroupTemplate(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("addon_groups").delete().eq("id", id);
  return error ? error.message : null;
}
