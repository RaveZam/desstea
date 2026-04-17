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
  logTable("categories", categories ?? []);

  // 2. All addon groups
  const { data: addonGroups, error: agErr } = await supabase
    .from("addon_groups")
    .select("id, name, category_id");
  if (agErr) throw new Error(`addon_groups: ${agErr.message}`);
  logTable("addon_groups", addonGroups ?? []);

  // 3. All addon options
  const { data: addonOptions, error: aoErr } = await supabase
    .from("addon_options")
    .select("id, addon_group_id, name, price_modifier, is_available, sort_order");
  if (aoErr) throw new Error(`addon_options: ${aoErr.message}`);
  logTable("addon_options", addonOptions ?? []);

  // 4. Branch availability — Supabase is the source of truth; only available products
  const { data: availability, error: avErr } = await supabase
    .from("branch_product_availability")
    .select("product_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (avErr) throw new Error(`branch_product_availability: ${avErr.message}`);
  logTable("branch_product_availability", availability ?? []);

  const productIds = (availability ?? []).map((a) => a.product_id);
  log(`products to fetch: ${productIds.length}`);

  // 5. Products for this branch
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
    logTable("products", products);

    const activeIds = products.map((p) => p.id);
    if (activeIds.length > 0) {
      const { data: ps, error: psErr } = await supabase
        .from("product_sizes")
        .select("id, product_id, label, size_price, sort_order")
        .in("product_id", activeIds);
      if (psErr) throw new Error(`product_sizes: ${psErr.message}`);
      productSizes = ps ?? [];
      logTable("product_sizes", productSizes);
    }
  } else {
    log("products → none available for this branch");
  }

  log("writing to SQLite...");
  await db.withTransactionAsync(async () => {
    // Clear all existing data so deleted/removed rows don't linger
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
  });

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
  log(`local product IDs: ${localProductIds.length}`, localProductIds);

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
  logTable("products (updated)", updatedProducts);

  // Also catch any new/updated availability records for this branch since last sync
  const { data: newAvailability, error: navErr } = await supabase
    .from("branch_product_availability")
    .select("product_id, is_available")
    .eq("branch_id", branchId)
    .gt("updated_at", lastSyncedAt);
  if (navErr) throw new Error(`branch_product_availability incremental: ${navErr.message}`);
  logTable("branch_product_availability (new/updated)", newAvailability ?? []);

  // Fetch the current full availability list to detect removed/unavailable products
  const { data: currentAvailability, error: curAvErr } = await supabase
    .from("branch_product_availability")
    .select("product_id")
    .eq("branch_id", branchId)
    .eq("is_available", true);
  if (curAvErr) throw new Error(`branch_product_availability current: ${curAvErr.message}`);
  const remoteProductIds = new Set((currentAvailability ?? []).map((a) => a.product_id));
  const removedProductIds = localProductIds.filter((id) => !remoteProductIds.has(id));
  log(`products removed from branch: ${removedProductIds.length}`, removedProductIds);

  // New products added to this branch that aren't in local SQLite yet
  const newProductIds = (newAvailability ?? [])
    .filter((a) => a.is_available)
    .map((a) => a.product_id)
    .filter((id) => !localProductIds.includes(id));

  if (newProductIds.length > 0) {
    log(`new products added to branch: ${newProductIds.length}`, newProductIds);
    const { data, error } = await supabase
      .from("products")
      .select("id, category_id, addon_group_id, name, description, base_price, has_sizes, is_available, created_at, deleted_at")
      .in("id", newProductIds)
      .is("deleted_at", null);
    if (error) throw new Error(`new products: ${error.message}`);
    updatedProducts = [...updatedProducts, ...(data ?? [])];
    logTable("products (newly added to branch)", data ?? []);
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
  logTable("product_sizes (re-fetched)", updatedSizes);

  // Re-fetch addon groups & options for changed products' addon_group_ids
  const addonGroupIds = [
    ...new Set(
      updatedProducts
        .map((p) => p.addon_group_id)
        .filter(Boolean) as string[]
    ),
  ];

  let updatedAddonGroups: any[] = [];
  let updatedAddonOptions: any[] = [];
  if (addonGroupIds.length > 0) {
    const { data: ag, error: agErr } = await supabase
      .from("addon_groups")
      .select("id, name, category_id")
      .in("id", addonGroupIds);
    if (agErr) throw new Error(`addon_groups incremental: ${agErr.message}`);
    updatedAddonGroups = ag ?? [];

    const { data: ao, error: aoErr } = await supabase
      .from("addon_options")
      .select("id, addon_group_id, name, price_modifier, is_available, sort_order")
      .in("addon_group_id", addonGroupIds);
    if (aoErr) throw new Error(`addon_options incremental: ${aoErr.message}`);
    updatedAddonOptions = ao ?? [];
  }
  logTable("addon_groups (re-fetched)", updatedAddonGroups);
  logTable("addon_options (re-fetched)", updatedAddonOptions);

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
  logTable("categories (re-fetched)", updatedCategories);

  // ── Delete: products soft-deleted since last sync ──────────────────────────
  const { data: deletedProducts, error: delErr } = await supabase
    .from("products")
    .select("id, name")
    .not("deleted_at", "is", null)
    .gt("deleted_at", lastSyncedAt);
  if (delErr) throw new Error(`deleted products: ${delErr.message}`);
  logTable("products (deleted)", deletedProducts ?? []);

  const deletedIds = (deletedProducts ?? []).map((p) => p.id);

  if (
    updatedProducts.length === 0 &&
    (newAvailability ?? []).length === 0 &&
    deletedIds.length === 0 &&
    removedProductIds.length === 0
  ) {
    log("✔ nothing changed since last sync — skipping write");
    return;
  }

  // ── Write everything in one transaction ───────────────────────────────────
  log("writing to SQLite...");
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
  });

  log(`✔ INCREMENTAL SYNC complete — synced_at: ${now}`);
  log(`  upserted: ${updatedProducts.length} products, ${updatedSizes.length} sizes, ${updatedAddonGroups.length} addon groups, ${updatedAddonOptions.length} addon options, ${updatedCategories.length} categories`);
  log(`  deleted:  ${deletedIds.length} products (soft-deleted), ${removedProductIds.length} products (removed from branch)`);
}

function logSQLiteTables(): void {
  log("━━━ SQLite snapshot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logTable("categories", db.getAllSync(`SELECT * FROM categories`));
  logTable("addon_groups", db.getAllSync(`SELECT * FROM addon_groups`));
  logTable("addon_options", db.getAllSync(`SELECT * FROM addon_options`));
  logTable("products", db.getAllSync(`SELECT * FROM products`));
  logTable("product_sizes", db.getAllSync(`SELECT * FROM product_sizes`));
  logTable("sync_meta", db.getAllSync(`SELECT * FROM sync_meta`));
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
