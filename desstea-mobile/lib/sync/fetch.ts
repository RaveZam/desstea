import { supabase } from "../supabase";
import type {
  Category,
  AddonGroup,
  AddonOption,
  Product,
  ProductSize,
  Combo,
  ComboSlot,
  ComboSlotProduct,
} from "./types";

// ── Generic helper ──────────────────────────────────────────────────────────

async function query<T>(
  table: string,
  select: string,
  build: (q: any) => any = (q) => q,
): Promise<T[]> {
  const { data, error } = await build(supabase.from(table).select(select));
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data as T[]) ?? [];
}

// ── Categories ──────────────────────────────────────────────────────────────

export function fetchAllCategories(): Promise<Category[]> {
  return query("categories", "id, name, description, created_at", (q) =>
    q.is("deleted_at", null),
  );
}

export function fetchCategoriesByIds(ids: string[]): Promise<Category[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("categories", "id, name, description, created_at", (q) =>
    q.in("id", ids).is("deleted_at", null),
  );
}

// ── Addon groups ────────────────────────────────────────────────────────────

export function fetchAllAddonGroups(): Promise<AddonGroup[]> {
  return query("addon_groups", "id, name, category_id");
}

export function fetchAddonGroupsByIds(ids: string[]): Promise<AddonGroup[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("addon_groups", "id, name, category_id", (q) =>
    q.in("id", ids),
  );
}

export function fetchAddonGroupsUpdatedSince(
  since: string,
): Promise<AddonGroup[]> {
  return query("addon_groups", "id, name, category_id", (q) =>
    q.gt("updated_at", since),
  );
}

// ── Addon options ───────────────────────────────────────────────────────────

const ADDON_OPTION_COLS =
  "id, addon_group_id, name, price_modifier, is_available, sort_order";

export function fetchAllAddonOptions(): Promise<AddonOption[]> {
  return query("addon_options", ADDON_OPTION_COLS);
}

export function fetchAddonOptionsByGroupIds(
  groupIds: string[],
): Promise<AddonOption[]> {
  if (groupIds.length === 0) return Promise.resolve([]);
  return query("addon_options", ADDON_OPTION_COLS, (q) =>
    q.in("addon_group_id", groupIds),
  );
}

export function fetchAddonOptionsUpdatedSince(
  since: string,
): Promise<AddonOption[]> {
  return query("addon_options", ADDON_OPTION_COLS, (q) =>
    q.gt("updated_at", since),
  );
}

// ── Products ────────────────────────────────────────────────────────────────

const PRODUCT_COLS =
  "id, category_id, addon_group_id, name, description, base_price, has_sizes, is_available, created_at, deleted_at";

export function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("products", PRODUCT_COLS, (q) =>
    q.in("id", ids).is("deleted_at", null),
  );
}

export function fetchProductsUpdatedSince(
  ids: string[],
  since: string,
): Promise<Product[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("products", PRODUCT_COLS, (q) =>
    q.in("id", ids).is("deleted_at", null).gt("updated_at", since),
  );
}

export function fetchDeletedProductsSince(
  since: string,
): Promise<{ id: string; name: string }[]> {
  return query("products", "id, name", (q) =>
    q.not("deleted_at", "is", null).gt("deleted_at", since),
  );
}

// ── Product sizes ───────────────────────────────────────────────────────────

export function fetchProductSizesByProductIds(
  productIds: string[],
): Promise<ProductSize[]> {
  if (productIds.length === 0) return Promise.resolve([]);
  return query(
    "product_sizes",
    "id, product_id, label, size_price, sort_order",
    (q) => q.in("product_id", productIds),
  );
}

// ── Branch product availability ─────────────────────────────────────────────

export function fetchAvailableProductIds(
  branchId: string,
): Promise<string[]> {
  return query<{ product_id: string }>(
    "branch_product_availability",
    "product_id",
    (q) => q.eq("branch_id", branchId).eq("is_available", true),
  ).then((rows) => rows.map((r) => r.product_id));
}

export function fetchProductAvailabilityChangedSince(
  branchId: string,
  since: string,
): Promise<{ product_id: string; is_available: boolean }[]> {
  return query("branch_product_availability", "product_id, is_available", (q) =>
    q.eq("branch_id", branchId).gt("updated_at", since),
  );
}

// ── Branch combo availability ───────────────────────────────────────────────

export function fetchAvailableComboIds(branchId: string): Promise<string[]> {
  return query<{ combo_id: string }>(
    "branch_combo_availability",
    "combo_id",
    (q) => q.eq("branch_id", branchId).eq("is_available", true),
  ).then((rows) => rows.map((r) => r.combo_id));
}

export function fetchComboAvailabilityChangedSince(
  branchId: string,
  since: string,
): Promise<{ combo_id: string; is_available: boolean }[]> {
  return query("branch_combo_availability", "combo_id, is_available", (q) =>
    q.eq("branch_id", branchId).gt("updated_at", since),
  );
}

// ── Combos ──────────────────────────────────────────────────────────────────

const COMBO_COLS =
  "id, name, description, price, is_available, created_at, deleted_at";

export function fetchCombosByIds(ids: string[]): Promise<Combo[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("combos", COMBO_COLS, (q) =>
    q.in("id", ids).is("deleted_at", null),
  );
}

export function fetchCombosUpdatedSince(
  ids: string[],
  since: string,
): Promise<Combo[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return query("combos", COMBO_COLS, (q) =>
    q.in("id", ids).is("deleted_at", null).gt("updated_at", since),
  );
}

export function fetchDeletedCombosSince(
  since: string,
): Promise<{ id: string; name: string }[]> {
  return query("combos", "id, name", (q) =>
    q.not("deleted_at", "is", null).gt("deleted_at", since),
  );
}

// ── Combo slots & slot products ─────────────────────────────────────────────

export function fetchComboSlotsByComboIds(
  comboIds: string[],
): Promise<ComboSlot[]> {
  if (comboIds.length === 0) return Promise.resolve([]);
  return query("combo_slots", "id, combo_id, category_id, sort_order", (q) =>
    q.in("combo_id", comboIds),
  );
}

export async function fetchComboSlotProductsBySlotIds(
  slotIds: string[],
): Promise<ComboSlotProduct[]> {
  if (slotIds.length === 0) return [];
  const rows = await query<{
    id: string;
    slot_id: string;
    product_id: string;
    quantity: number;
  }>("combo_slot_products", "id, slot_id, product_id, quantity", (q) =>
    q.in("slot_id", slotIds),
  );
  return rows.map((r) => ({
    id: r.id,
    combo_slot_id: r.slot_id,
    product_id: r.product_id,
    quantity: r.quantity,
  }));
}
