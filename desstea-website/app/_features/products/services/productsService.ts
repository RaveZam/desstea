import { createAdminClient } from "../../../../lib/supabase/admin";
import type { Category, Product, ProductFormData } from "../../../_types";

export async function listCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
      has_sugar_level: row.has_sugar_level as boolean,
      is_available: row.is_available as boolean,
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
      has_sugar_level: data.has_sugar_level,
      is_available: data.is_available,
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
      has_sugar_level: data.has_sugar_level,
      is_available: data.is_available,
      addon_group_id: data.addon_group_id || null,
      updated_at: new Date().toISOString(),
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
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
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
  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
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
    .update({ name: data.name, category_id: data.category_id, updated_at: new Date().toISOString() })
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

// ── Combos ────────────────────────────────────────────────────

export interface ComboSlotProductRow {
  product_id: string;
  product_name: string;
  base_price: number;
  quantity: number;
}

export interface ComboSlotRow {
  id: string;
  sort_order: number;
  category_id: string;
  category_name: string;
  products: ComboSlotProductRow[];
}

export interface ComboRow {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at: string;
  slots: ComboSlotRow[];
  available_branch_ids: string[];
}

export async function listCombos(): Promise<ComboRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("combos")
    .select(`
      id, name, price, is_available, created_at,
      branch_combo_availability ( branch_id, is_available ),
      combo_slots (
        id, sort_order, category_id,
        categories ( name ),
        combo_slot_products (
          product_id, quantity,
          products ( name, base_price )
        )
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const available_branch_ids = ((row.branch_combo_availability ?? []) as Record<string, unknown>[])
      .filter((b) => b.is_available === true)
      .map((b) => b.branch_id as string);

    return {
      id: row.id as string,
      name: row.name as string,
      price: row.price as number,
      is_available: row.is_available as boolean,
      created_at: row.created_at as string,
      available_branch_ids,
      slots: ((row.combo_slots ?? []) as Record<string, unknown>[])
        .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
        .map((slot) => {
          const cat = slot.categories as { name: string } | null;
          return {
            id: slot.id as string,
            sort_order: slot.sort_order as number,
            category_id: slot.category_id as string,
            category_name: cat?.name ?? "",
            products: ((slot.combo_slot_products ?? []) as Record<string, unknown>[]).map((sp) => {
              const prod = sp.products as { name: string; base_price: number } | null;
              return {
                product_id: sp.product_id as string,
                product_name: prod?.name ?? "",
                base_price: (prod?.base_price as number) ?? 0,
                quantity: sp.quantity as number,
              };
            }),
          };
        }),
    };
  });
}

export async function createComboInSupabase(
  data: {
    name: string;
    price: number;
    is_available: boolean;
    slots: { category_id: string; products: { product_id: string; quantity: number }[] }[];
    available_branch_ids: string[];
  },
  allBranchIds: string[]
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: inserted, error: comboErr } = await supabase
    .from("combos")
    .insert({ name: data.name, price: data.price, is_available: data.is_available })
    .select("id")
    .single();
  if (comboErr) return comboErr.message;

  const comboId = inserted.id as string;

  for (let i = 0; i < data.slots.length; i++) {
    const slot = data.slots[i];
    const { data: slotInserted, error: slotErr } = await supabase
      .from("combo_slots")
      .insert({ combo_id: comboId, category_id: slot.category_id, sort_order: i })
      .select("id")
      .single();
    if (slotErr) return slotErr.message;

    const validProducts = slot.products.filter((p) => p.product_id);
    if (validProducts.length > 0) {
      const { error: spErr } = await supabase
        .from("combo_slot_products")
        .insert(validProducts.map((p) => ({ slot_id: slotInserted.id, product_id: p.product_id, quantity: p.quantity })));
      if (spErr) return spErr.message;
    }
  }

  const availRows = allBranchIds.map((branchId) => ({
    combo_id: comboId,
    branch_id: branchId,
    is_available: data.available_branch_ids.includes(branchId),
  }));
  const { error: availErr } = await supabase
    .from("branch_combo_availability")
    .upsert(availRows, { onConflict: "combo_id,branch_id" });
  if (availErr) return availErr.message;

  return null;
}

export async function updateComboInSupabase(
  id: string,
  data: {
    name: string;
    price: number;
    is_available: boolean;
    slots: { category_id: string; products: { product_id: string; quantity: number }[] }[];
    available_branch_ids: string[];
  },
  allBranchIds: string[]
): Promise<string | null> {
  const supabase = createAdminClient();

  const { error: comboErr } = await supabase
    .from("combos")
    .update({ name: data.name, price: data.price, is_available: data.is_available, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (comboErr) return comboErr.message;

  const { data: existingSlots, error: fetchErr } = await supabase
    .from("combo_slots")
    .select("id")
    .eq("combo_id", id);
  if (fetchErr) return fetchErr.message;

  if (existingSlots && existingSlots.length > 0) {
    const slotIds = existingSlots.map((s) => s.id as string);
    const { error: delSpErr } = await supabase
      .from("combo_slot_products")
      .delete()
      .in("slot_id", slotIds);
    if (delSpErr) return delSpErr.message;

    const { error: delSlotErr } = await supabase
      .from("combo_slots")
      .delete()
      .eq("combo_id", id);
    if (delSlotErr) return delSlotErr.message;
  }

  for (let i = 0; i < data.slots.length; i++) {
    const slot = data.slots[i];
    const { data: slotInserted, error: slotErr } = await supabase
      .from("combo_slots")
      .insert({ combo_id: id, category_id: slot.category_id, sort_order: i })
      .select("id")
      .single();
    if (slotErr) return slotErr.message;

    const validProducts = slot.products.filter((p) => p.product_id);
    if (validProducts.length > 0) {
      const { error: spErr } = await supabase
        .from("combo_slot_products")
        .insert(validProducts.map((p) => ({ slot_id: slotInserted.id, product_id: p.product_id, quantity: p.quantity })));
      if (spErr) return spErr.message;
    }
  }

  const availRows = allBranchIds.map((branchId) => ({
    combo_id: id,
    branch_id: branchId,
    is_available: data.available_branch_ids.includes(branchId),
  }));
  const { error: availErr } = await supabase
    .from("branch_combo_availability")
    .upsert(availRows, { onConflict: "combo_id,branch_id" });
  if (availErr) return availErr.message;

  return null;
}

export async function deleteComboInSupabase(id: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("combos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return error ? error.message : null;
}
