import { supabase } from "./supabase";
import { db } from "./database";

const SYNC_META_KEY = "last_synced_at";
const TAG = "[sync]";

function log(message: string, data?: any) {
  if (data !== undefined) {
    console.log(`${TAG} ${message}`, data);
  } else {
    console.log(`${TAG} ${message}`);
  }
}

function logTable(label: string, rows: any[]) {
  console.log(`${TAG} ┌─ ${label} (${rows.length} row${rows.length !== 1 ? "s" : ""})`);
  rows.forEach((row, i) => {
    const isLast = i === rows.length - 1;
    console.log(`${TAG} ${isLast ? "└" : "├"}─`, row);
  });
  if (rows.length === 0) {
    console.log(`${TAG} └─ (empty)`);
  }
}

async function getLastSyncedAt(): Promise<string | null> {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = ?`,
    [SYNC_META_KEY]
  );
  return row?.value ?? null;
}

async function setLastSyncedAt(value: string): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
    [SYNC_META_KEY, value]
  );
}

export async function resetSync(): Promise<void> {
  await db.runAsync(`DELETE FROM sync_meta WHERE key = ?`, [SYNC_META_KEY]);
  log("sync watermark cleared — next syncCatalog will run a full sync");
}

// ─────────────────────────────────────────────────────────────────────────────
// Full sync — used on first run (no watermark yet)
// ─────────────────────────────────────────────────────────────────────────────
async function fullSync(branchId: string, now: string): Promise<void> {
  log(`▶ FULL SYNC — branch: ${branchId}`);

  // 1. All categories
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, name, description, created_at")
    .is("deleted_at", null);
  if (catErr) throw new Error(`categories: ${catErr.message}`);
  // 2. All addon groups
  const { data: addonGroups, error: agErr } = await supabase
    .from("addon_groups")
    .select("id, name, category_id");
  if (agErr) throw new Error(`addon_groups: ${agErr.message}`);

  // 3. All addon options
  const { data: addonOptions, error: aoErr } = await supabase
    .from("addon_options")
    .select("id, addon_group_id, name, price_modifier, is_available, sort_order");
  if (aoErr) throw new Error(`addon_options: ${aoErr.message}`);

  // 4. Branch availability — Supabase is the source of truth; only available products
  const { data: availability, error: avErr } = await supabase
    .from("branch_product_availability")
    .select("product_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (avErr) throw new Error(`branch_product_availability: ${avErr.message}`);

  const productIds = (availability ?? []).map((a) => a.product_id);

  // 5. Branch combo availability — source of truth for which combos this branch has
  const { data: comboAvailability, error: caErr } = await supabase
    .from("branch_combo_availability")
    .select("combo_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (caErr) throw new Error(`branch_combo_availability: ${caErr.message}`);
  logTable("branch_combo_availability", comboAvailability ?? []);

  const comboIds = (comboAvailability ?? []).map((a) => a.combo_id);

  let combos: any[] = [];
  let comboSlots: any[] = [];
  let comboSlotProducts: any[] = [];
  if (comboIds.length > 0) {
    const { data: c, error: cErr } = await supabase
      .from("combos")
      .select("id, name, description, price, is_available, created_at, deleted_at")
      .in("id", comboIds)
      .is("deleted_at", null);
    if (cErr) throw new Error(`combos: ${cErr.message}`);
    combos = c ?? [];
    logTable("combos", combos);

    const { data: cs, error: csErr } = await supabase
      .from("combo_slots")
      .select("id, combo_id, category_id, sort_order")
      .in("combo_id", comboIds);
    if (csErr) throw new Error(`combo_slots: ${csErr.message}`);
    comboSlots = cs ?? [];
    logTable("combo_slots", comboSlots);

    const slotIds = comboSlots.map((s) => s.id);
    if (slotIds.length > 0) {
      const { data: csp, error: cspErr } = await supabase
        .from("combo_slot_products")
        .select("id, slot_id, product_id, quantity")
        .in("slot_id", slotIds);
      if (cspErr) throw new Error(`combo_slot_products: ${cspErr.message}`);
      comboSlotProducts = (csp ?? []).map((r) => ({ ...r, combo_slot_id: r.slot_id }));
      logTable("combo_slot_products", comboSlotProducts);
    }
  } else {
    log("combos → none available for this branch");
  }

  // 6. Products for this branch
  let products: any[] = [];
  let productSizes: any[] = [];
  if (productIds.length > 0) {
    const { data: p, error: pErr } = await supabase
      .from("products")
      .select("id, category_id, addon_group_id, name, description, base_price, has_sizes, is_available, created_at, deleted_at")
      .in("id", productIds)
      .is("deleted_at", null);
    if (pErr) throw new Error(`products: ${pErr.message}`);
    products = p ?? [];

    const activeIds = products.map((p) => p.id);
    if (activeIds.length > 0) {
      const { data: ps, error: psErr } = await supabase
        .from("product_sizes")
        .select("id, product_id, label, size_price, sort_order")
        .in("product_id", activeIds);
      if (psErr) throw new Error(`product_sizes: ${psErr.message}`);
      productSizes = ps ?? [];
    }
  }

  log("writing to SQLite...");
  await db.runAsync(`PRAGMA foreign_keys = OFF`);
  await db.withTransactionAsync(async () => {
    // Clear all existing data so deleted/removed rows don't linger
    await db.runAsync(`DELETE FROM combo_slot_products`);
    await db.runAsync(`DELETE FROM combo_slots`);
    await db.runAsync(`DELETE FROM combos`);
    await db.runAsync(`DELETE FROM product_sizes`);
    await db.runAsync(`DELETE FROM products`);
    await db.runAsync(`DELETE FROM addon_options`);
    await db.runAsync(`DELETE FROM addon_groups`);
    await db.runAsync(`DELETE FROM categories`);

    for (const c of categories ?? []) {
      await db.runAsync(
        `INSERT INTO categories (id, name, description, created_at, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.name, c.description ?? null, c.created_at ?? null, now]
      );
    }
    for (const ag of addonGroups ?? []) {
      await db.runAsync(
        `INSERT INTO addon_groups (id, name, category_id, synced_at)
         VALUES (?, ?, ?, ?)`,
        [ag.id, ag.name, ag.category_id ?? null, now]
      );
    }
    for (const ao of addonOptions ?? []) {
      await db.runAsync(
        `INSERT INTO addon_options
           (id, addon_group_id, name, price_modifier, is_available, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ao.id, ao.addon_group_id, ao.name, ao.price_modifier, ao.is_available ? 1 : 0, ao.sort_order, now]
      );
    }
    for (const p of products) {
      await db.runAsync(
        `INSERT INTO products
           (id, category_id, addon_group_id, name, description, base_price,
            has_sizes, is_available, created_at, deleted_at, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.category_id, p.addon_group_id ?? null, p.name, p.description ?? null,
         p.base_price, p.has_sizes ? 1 : 0, p.is_available ? 1 : 0,
         p.created_at ?? null, null, now]
      );
    }
    for (const ps of productSizes) {
      await db.runAsync(
        `INSERT INTO product_sizes
           (id, product_id, label, size_price, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ps.id, ps.product_id, ps.label, ps.size_price, ps.sort_order, now]
      );
    }
    for (const c of combos) {
      await db.runAsync(
        `INSERT INTO combos
           (id, name, description, price, is_available, created_at, deleted_at, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.description ?? null, c.price, c.is_available ? 1 : 0,
         c.created_at ?? null, null, now]
      );
    }
    for (const cs of comboSlots) {
      await db.runAsync(
        `INSERT INTO combo_slots (id, combo_id, category_id, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [cs.id, cs.combo_id, cs.category_id ?? null, cs.sort_order, now]
      );
    }
    for (const csp of comboSlotProducts) {
      await db.runAsync(
        `INSERT INTO combo_slot_products (id, combo_slot_id, product_id, quantity, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [csp.id, csp.combo_slot_id, csp.product_id, csp.quantity ?? 1, now]
      );
    }
  });
  await db.runAsync(`PRAGMA foreign_keys = ON`);

  log(`✔ FULL SYNC complete — synced_at: ${now}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Incremental sync — only processes changes since last_synced_at
// ─────────────────────────────────────────────────────────────────────────────
async function incrementalSync(branchId: string, lastSyncedAt: string, now: string): Promise<void> {
  log(`▶ INCREMENTAL SYNC — branch: ${branchId} | since: ${lastSyncedAt}`);

  // Get locally known product IDs from SQLite products table (source of truth for local state)
  const localProductRows = db.getAllSync<{ id: string }>(`SELECT id FROM products`);
  const localProductIds = localProductRows.map((r) => r.id);
  // ── Upsert: products updated since last sync (branch-filtered, not deleted) ──
  let updatedProducts: any[] = [];
  if (localProductIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, category_id, addon_group_id, name, description, base_price, has_sizes, is_available, created_at, deleted_at")
      .in("id", localProductIds)
      .is("deleted_at", null)
      .gt("updated_at", lastSyncedAt);
    if (error) throw new Error(`products incremental: ${error.message}`);
    updatedProducts = data ?? [];
  }
  // Also catch any new/updated availability records for this branch since last sync
  const { data: newAvailability, error: navErr } = await supabase
    .from("branch_product_availability")
    .select("product_id, is_available")
    .eq("branch_id", branchId)
    .gt("updated_at", lastSyncedAt);
  if (navErr) throw new Error(`branch_product_availability incremental: ${navErr.message}`);
  // Fetch the current full availability list to detect removed/unavailable products
  const { data: currentAvailability, error: curAvErr } = await supabase
    .from("branch_product_availability")
    .select("product_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (curAvErr) throw new Error(`branch_product_availability current: ${curAvErr.message}`);
  const remoteProductIds = new Set((currentAvailability ?? []).map((a) => a.product_id));
  const removedProductIds = localProductIds.filter((id) => !remoteProductIds.has(id));
  // New products added to this branch that aren't in local SQLite yet
  const newProductIds = (newAvailability ?? [])
    .filter((a) => a.is_available)
    .map((a) => a.product_id)
    .filter((id) => !localProductIds.includes(id));

  if (newProductIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select("id, category_id, addon_group_id, name, description, base_price, has_sizes, is_available, created_at, deleted_at")
      .in("id", newProductIds)
      .is("deleted_at", null);
    if (error) throw new Error(`new products: ${error.message}`);
    updatedProducts = [...updatedProducts, ...(data ?? [])];
  }

  const changedProductIds = updatedProducts.map((p) => p.id);

  // Re-fetch sizes for all changed products
  let updatedSizes: any[] = [];
  if (changedProductIds.length > 0) {
    const { data, error } = await supabase
      .from("product_sizes")
      .select("id, product_id, label, size_price, sort_order")
      .in("product_id", changedProductIds);
    if (error) throw new Error(`product_sizes incremental: ${error.message}`);
    updatedSizes = data ?? [];
  }
  // Re-fetch addon groups & options for changed products' addon_group_ids
  const productAddonGroupIds = new Set(
    updatedProducts
      .map((p) => p.addon_group_id)
      .filter(Boolean) as string[]
  );

  // Also independently query addon groups & options updated since last sync
  const { data: changedAddonGroups, error: cagErr } = await supabase
    .from("addon_groups")
    .select("id, name, category_id")
    .gt("updated_at", lastSyncedAt);
  if (cagErr) throw new Error(`addon_groups incremental: ${cagErr.message}`);

  const { data: changedAddonOptions, error: caoErr } = await supabase
    .from("addon_options")
    .select("id, addon_group_id, name, price_modifier, is_available, sort_order")
    .gt("updated_at", lastSyncedAt);
  if (caoErr) throw new Error(`addon_options incremental: ${caoErr.message}`);

  // Merge: addon group IDs from changed products + independently changed groups/options
  const addonGroupIds = [
    ...new Set([
      ...productAddonGroupIds,
      ...(changedAddonGroups ?? []).map((ag) => ag.id),
      ...(changedAddonOptions ?? []).map((ao) => ao.addon_group_id),
    ]),
  ];

  let updatedAddonGroups: any[] = [];
  let updatedAddonOptions: any[] = [];
  if (addonGroupIds.length > 0) {
    const { data: ag, error: agErr } = await supabase
      .from("addon_groups")
      .select("id, name, category_id")
      .in("id", addonGroupIds);
    if (agErr) throw new Error(`addon_groups fetch: ${agErr.message}`);
    updatedAddonGroups = ag ?? [];

    const { data: ao, error: aoErr } = await supabase
      .from("addon_options")
      .select("id, addon_group_id, name, price_modifier, is_available, sort_order")
      .in("addon_group_id", addonGroupIds);
    if (aoErr) throw new Error(`addon_options fetch: ${aoErr.message}`);
    updatedAddonOptions = ao ?? [];
  }
  // Re-fetch categories for changed products
  const categoryIds = [
    ...new Set(updatedProducts.map((p) => p.category_id).filter(Boolean) as string[]),
  ];
  let updatedCategories: any[] = [];
  if (categoryIds.length > 0) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, created_at")
      .in("id", categoryIds)
      .is("deleted_at", null);
    if (error) throw new Error(`categories incremental: ${error.message}`);
    updatedCategories = data ?? [];
  }
  // ── Delete: products soft-deleted since last sync ──────────────────────────
  const { data: deletedProducts, error: delErr } = await supabase
    .from("products")
    .select("id, name")
    .not("deleted_at", "is", null)
    .gt("deleted_at", lastSyncedAt);
  if (delErr) throw new Error(`deleted products: ${delErr.message}`);
  const deletedIds = (deletedProducts ?? []).map((p) => p.id);

  // ── Combos: check branch_combo_availability for changes, then fetch updated combos ──
  const localComboRows = db.getAllSync<{ id: string }>(`SELECT id FROM combos`);
  const localComboIds = localComboRows.map((r) => r.id);

  // Upsert: combos updated since last sync (already locally known, not deleted)
  let updatedCombos: any[] = [];
  if (localComboIds.length > 0) {
    const { data, error } = await supabase
      .from("combos")
      .select("id, name, description, price, is_available, created_at, deleted_at")
      .in("id", localComboIds)
      .is("deleted_at", null)
      .gt("updated_at", lastSyncedAt);
    if (error) throw new Error(`combos incremental: ${error.message}`);
    updatedCombos = data ?? [];
  }

  // Also catch any new/updated availability records for this branch since last sync
  const { data: newComboAvailability, error: ncaErr } = await supabase
    .from("branch_combo_availability")
    .select("combo_id, is_available")
    .eq("branch_id", branchId)
    .gt("updated_at", lastSyncedAt);
  if (ncaErr) throw new Error(`branch_combo_availability incremental: ${ncaErr.message}`);
  logTable("branch_combo_availability (new/updated)", newComboAvailability ?? []);

  // Current full list of available combo IDs for this branch
  const { data: currentComboAvail, error: ccaErr } = await supabase
    .from("branch_combo_availability")
    .select("combo_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (ccaErr) throw new Error(`branch_combo_availability current: ${ccaErr.message}`);
  const remoteComboIds = new Set((currentComboAvail ?? []).map((a) => a.combo_id));
  const removedComboIds = localComboIds.filter((id) => !remoteComboIds.has(id));
  log(`combos removed from branch: ${removedComboIds.length}`, removedComboIds);

  // New combos added to this branch that aren't in local SQLite yet
  const newComboIds = (newComboAvailability ?? [])
    .filter((a) => a.is_available)
    .map((a) => a.combo_id)
    .filter((id) => !localComboIds.includes(id));

  if (newComboIds.length > 0) {
    const { data, error } = await supabase
      .from("combos")
      .select("id, name, description, price, is_available, created_at, deleted_at")
      .in("id", newComboIds)
      .is("deleted_at", null);
    if (error) throw new Error(`new combos: ${error.message}`);
    updatedCombos = [...updatedCombos, ...(data ?? [])];
  }

  // ── Delete: combos soft-deleted since last sync ──────────────────────────
  const { data: deletedCombos, error: delComboErr } = await supabase
    .from("combos")
    .select("id, name")
    .not("deleted_at", "is", null)
    .gt("deleted_at", lastSyncedAt);
  if (delComboErr) throw new Error(`deleted combos: ${delComboErr.message}`);
  const deletedComboIds = (deletedCombos ?? []).map((c) => c.id);

  logTable("combos (updated)", updatedCombos);

  let updatedComboSlots: any[] = [];
  let updatedComboSlotProducts: any[] = [];
  const updatedComboIds = (updatedCombos ?? []).map((c) => c.id);
  if (updatedComboIds.length > 0) {
    const { data: cs, error: csErr } = await supabase
      .from("combo_slots")
      .select("id, combo_id, category_id, sort_order")
      .in("combo_id", updatedComboIds);
    if (csErr) throw new Error(`combo_slots incremental: ${csErr.message}`);
    updatedComboSlots = cs ?? [];

    const slotIds = updatedComboSlots.map((s) => s.id);
    if (slotIds.length > 0) {
      const { data: csp, error: cspErr } = await supabase
        .from("combo_slot_products")
        .select("id, slot_id, product_id, quantity")
        .in("slot_id", slotIds);
      if (cspErr) throw new Error(`combo_slot_products incremental: ${cspErr.message}`);
      updatedComboSlotProducts = (csp ?? []).map((r) => ({ ...r, combo_slot_id: r.slot_id }));
    }
  }

  if (
    updatedProducts.length === 0 &&
    (newAvailability ?? []).length === 0 &&
    deletedIds.length === 0 &&
    removedProductIds.length === 0 &&
    updatedAddonGroups.length === 0 &&
    updatedAddonOptions.length === 0 &&
    updatedCombos.length === 0 &&
    (newComboAvailability ?? []).length === 0 &&
    deletedComboIds.length === 0 &&
    removedComboIds.length === 0
  ) {
    log("✔ nothing changed since last sync — skipping write");
    return;
  }

  // ── Write everything in one transaction ───────────────────────────────────
  log("writing to SQLite...");
  await db.runAsync(`PRAGMA foreign_keys = OFF`);
  await db.withTransactionAsync(async () => {
    for (const c of updatedCategories) {
      await db.runAsync(
        `INSERT OR REPLACE INTO categories (id, name, description, created_at, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.name, c.description ?? null, c.created_at ?? null, now]
      );
    }
    for (const ag of updatedAddonGroups) {
      await db.runAsync(
        `INSERT OR REPLACE INTO addon_groups (id, name, category_id, synced_at)
         VALUES (?, ?, ?, ?)`,
        [ag.id, ag.name, ag.category_id ?? null, now]
      );
    }
    for (const groupId of addonGroupIds) {
      await db.runAsync(
        `DELETE FROM addon_options WHERE addon_group_id = ?`,
        [groupId]
      );
    }
    for (const ao of updatedAddonOptions) {
      await db.runAsync(
        `INSERT OR REPLACE INTO addon_options
           (id, addon_group_id, name, price_modifier, is_available, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ao.id, ao.addon_group_id, ao.name, ao.price_modifier, ao.is_available ? 1 : 0, ao.sort_order, now]
      );
    }
    for (const p of updatedProducts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO products
           (id, category_id, addon_group_id, name, description, base_price,
            has_sizes, is_available, created_at, deleted_at, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.category_id, p.addon_group_id ?? null, p.name, p.description ?? null,
         p.base_price, p.has_sizes ? 1 : 0, p.is_available ? 1 : 0,
         p.created_at ?? null, null, now]
      );
      await db.runAsync(`DELETE FROM product_sizes WHERE product_id = ?`, [p.id]);
    }
    for (const ps of updatedSizes) {
      await db.runAsync(
        `INSERT OR REPLACE INTO product_sizes
           (id, product_id, label, size_price, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ps.id, ps.product_id, ps.label, ps.size_price, ps.sort_order, now]
      );
    }
    for (const id of deletedIds) {
      await db.runAsync(`DELETE FROM product_sizes WHERE product_id = ?`, [id]);
      await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
    }
    // Products removed from or made unavailable for this branch
    for (const id of removedProductIds) {
      await db.runAsync(`DELETE FROM product_sizes WHERE product_id = ?`, [id]);
      await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
    }
    // Combos soft-deleted since last sync
    for (const id of deletedComboIds) {
      await db.runAsync(`DELETE FROM combo_slot_products WHERE combo_slot_id IN (SELECT id FROM combo_slots WHERE combo_id = ?)`, [id]);
      await db.runAsync(`DELETE FROM combo_slots WHERE combo_id = ?`, [id]);
      await db.runAsync(`DELETE FROM combos WHERE id = ?`, [id]);
    }
    // Combos removed from or made unavailable for this branch
    for (const id of removedComboIds) {
      await db.runAsync(`DELETE FROM combo_slot_products WHERE combo_slot_id IN (SELECT id FROM combo_slots WHERE combo_id = ?)`, [id]);
      await db.runAsync(`DELETE FROM combo_slots WHERE combo_id = ?`, [id]);
      await db.runAsync(`DELETE FROM combos WHERE id = ?`, [id]);
    }
    for (const c of updatedCombos) {
      await db.runAsync(`DELETE FROM combo_slot_products WHERE combo_slot_id IN (SELECT id FROM combo_slots WHERE combo_id = ?)`, [c.id]);
      await db.runAsync(`DELETE FROM combo_slots WHERE combo_id = ?`, [c.id]);
      await db.runAsync(
        `INSERT OR REPLACE INTO combos
           (id, name, description, price, is_available, created_at, deleted_at, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.description ?? null, c.price, c.is_available ? 1 : 0,
         c.created_at ?? null, null, now]
      );
    }
    for (const cs of updatedComboSlots) {
      await db.runAsync(
        `INSERT OR REPLACE INTO combo_slots (id, combo_id, category_id, sort_order, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [cs.id, cs.combo_id, cs.category_id ?? null, cs.sort_order, now]
      );
    }
    for (const csp of updatedComboSlotProducts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO combo_slot_products (id, combo_slot_id, product_id, quantity, synced_at)
         VALUES (?, ?, ?, ?, ?)`,
        [csp.id, csp.combo_slot_id, csp.product_id, csp.quantity ?? 1, now]
      );
    }

    // ── Clean up orphaned rows (children first to respect FK constraints) ──
    // 1. Remove addon_options whose group is unused or already gone
    await db.runAsync(`DELETE FROM addon_options WHERE addon_group_id NOT IN (SELECT DISTINCT addon_group_id FROM products WHERE addon_group_id IS NOT NULL)`);
    // 2. Now safe to remove unused addon_groups
    await db.runAsync(`DELETE FROM addon_groups WHERE id NOT IN (SELECT DISTINCT addon_group_id FROM products WHERE addon_group_id IS NOT NULL)`);
    // 3. Remove categories not referenced by any remaining table
    await db.runAsync(`DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL) AND id NOT IN (SELECT DISTINCT category_id FROM combo_slots WHERE category_id IS NOT NULL) AND id NOT IN (SELECT DISTINCT category_id FROM addon_groups WHERE category_id IS NOT NULL)`);
  });
  await db.runAsync(`PRAGMA foreign_keys = ON`);

  log(`✔ INCREMENTAL SYNC complete — synced_at: ${now}`);
  log(`  combos: upserted ${updatedCombos.length}, deleted ${deletedComboIds.length}, removed ${removedComboIds.length}`);
}

function logSQLiteTables(): void {
  log("━━━ SQLite combo snapshot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logTable("combos", db.getAllSync(`SELECT * FROM combos`));
  logTable("combo_slots", db.getAllSync(`SELECT * FROM combo_slots`));
  logTable("combo_slot_products", db.getAllSync(`SELECT * FROM combo_slot_products`));
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
export async function syncCatalog(branchId: string): Promise<void> {
  const now = new Date().toISOString();
  const lastSyncedAt = await getLastSyncedAt();
  log(`syncCatalog called — mode: ${lastSyncedAt === null ? "FULL" : "INCREMENTAL"}`);

  try {
    if (lastSyncedAt === null) {
      await fullSync(branchId, now);
    } else {
      await incrementalSync(branchId, lastSyncedAt, now);
    }
    await setLastSyncedAt(now);
    logSQLiteTables();
  } catch (err) {
    console.error(`${TAG} ✖ SYNC FAILED`, err);
    throw err;
  }
}
