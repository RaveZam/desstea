import { db } from "../database";
import type {
  Category,
  AddonGroup,
  AddonOption,
  Product,
  ProductSize,
  Combo,
  ComboSlot,
  ComboSlotProduct,
  SugarLevel,
} from "./types";

// ── Upserts ─────────────────────────────────────────────────────────────────

export async function upsertCategories(rows: Category[], now: string) {
  for (const c of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO categories (id, name, description, created_at, synced_at)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.name, c.description ?? null, c.created_at ?? null, now],
    );
  }
}

export async function upsertAddonGroups(rows: AddonGroup[], now: string) {
  for (const ag of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO addon_groups (id, name, category_id, synced_at)
       VALUES (?, ?, ?, ?)`,
      [ag.id, ag.name, ag.category_id ?? null, now],
    );
  }
}

export async function upsertAddonOptions(rows: AddonOption[], now: string) {
  for (const ao of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO addon_options
         (id, addon_group_id, name, price_modifier, is_available, sort_order, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ao.id,
        ao.addon_group_id,
        ao.name,
        ao.price_modifier,
        ao.is_available ? 1 : 0,
        ao.sort_order,
        now,
      ],
    );
  }
}

export async function upsertSugarLevels(rows: SugarLevel[], now: string) {
  for (const sl of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO sugar_levels (id, label, sort_order, synced_at)
       VALUES (?, ?, ?, ?)`,
      [sl.id, sl.label, sl.sort_order, now],
    );
  }
}

export async function upsertProducts(rows: Product[], now: string) {
  for (const p of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO products
         (id, category_id, addon_group_id, name, description, base_price,
          has_sizes, has_sugar_level, is_available, created_at, deleted_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.category_id,
        p.addon_group_id ?? null,
        p.name,
        p.description ?? null,
        p.base_price,
        p.has_sizes ? 1 : 0,
        p.has_sugar_level ? 1 : 0,
        p.is_available ? 1 : 0,
        p.created_at ?? null,
        null,
        now,
      ],
    );
  }
}

export async function upsertProductSizes(rows: ProductSize[], now: string) {
  for (const ps of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO product_sizes
         (id, product_id, label, size_price, sort_order, synced_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ps.id, ps.product_id, ps.label, ps.size_price, ps.sort_order, now],
    );
  }
}

export async function upsertCombos(rows: Combo[], now: string) {
  for (const c of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO combos
         (id, name, description, price, is_available, created_at, deleted_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id,
        c.name,
        c.description ?? null,
        c.price,
        c.is_available ? 1 : 0,
        c.created_at ?? null,
        null,
        now,
      ],
    );
  }
}

export async function upsertComboSlots(rows: ComboSlot[], now: string) {
  for (const cs of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO combo_slots (id, combo_id, category_id, sort_order, synced_at)
       VALUES (?, ?, ?, ?, ?)`,
      [cs.id, cs.combo_id, cs.category_id ?? null, cs.sort_order, now],
    );
  }
}

export async function upsertComboSlotProducts(
  rows: ComboSlotProduct[],
  now: string,
) {
  for (const csp of rows) {
    await db.runAsync(
      `INSERT OR REPLACE INTO combo_slot_products (id, combo_slot_id, product_id, quantity, synced_at)
       VALUES (?, ?, ?, ?, ?)`,
      [csp.id, csp.combo_slot_id, csp.product_id, csp.quantity ?? 1, now],
    );
  }
}

// ── Deletes ─────────────────────────────────────────────────────────────────

export async function deleteProductAndSizes(id: string) {
  await db.runAsync(`DELETE FROM product_sizes WHERE product_id = ?`, [id]);
  await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
}

export async function deleteProductSizesByProductId(productId: string) {
  await db.runAsync(`DELETE FROM product_sizes WHERE product_id = ?`, [
    productId,
  ]);
}

export async function deleteComboAndChildren(id: string) {
  await db.runAsync(
    `DELETE FROM combo_slot_products WHERE combo_slot_id IN (SELECT id FROM combo_slots WHERE combo_id = ?)`,
    [id],
  );
  await db.runAsync(`DELETE FROM combo_slots WHERE combo_id = ?`, [id]);
  await db.runAsync(`DELETE FROM combos WHERE id = ?`, [id]);
}

export async function deleteAddonOptionsByGroupIds(groupIds: string[]) {
  for (const groupId of groupIds) {
    await db.runAsync(`DELETE FROM addon_options WHERE addon_group_id = ?`, [
      groupId,
    ]);
  }
}

// ── Bulk clear (full sync) ──────────────────────────────────────────────────

export async function clearAllTables() {
  await db.runAsync(`DELETE FROM combo_slot_products`);
  await db.runAsync(`DELETE FROM combo_slots`);
  await db.runAsync(`DELETE FROM combos`);
  await db.runAsync(`DELETE FROM product_sizes`);
  await db.runAsync(`DELETE FROM products`);
  await db.runAsync(`DELETE FROM addon_options`);
  await db.runAsync(`DELETE FROM addon_groups`);
  await db.runAsync(`DELETE FROM sugar_levels`);
  await db.runAsync(`DELETE FROM categories`);
}

// ── Orphan cleanup (incremental sync) ───────────────────────────────────────

export async function cleanupOrphans() {
  // 1. Remove addon_options whose group is unused or already gone
  await db.runAsync(
    `DELETE FROM addon_options WHERE addon_group_id NOT IN (SELECT DISTINCT addon_group_id FROM products WHERE addon_group_id IS NOT NULL)`,
  );
  // 2. Now safe to remove unused addon_groups
  await db.runAsync(
    `DELETE FROM addon_groups WHERE id NOT IN (SELECT DISTINCT addon_group_id FROM products WHERE addon_group_id IS NOT NULL)`,
  );
  // 3. Remove categories not referenced by any remaining table
  await db.runAsync(
    `DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL) AND id NOT IN (SELECT DISTINCT category_id FROM combo_slots WHERE category_id IS NOT NULL) AND id NOT IN (SELECT DISTINCT category_id FROM addon_groups WHERE category_id IS NOT NULL)`,
  );
}
