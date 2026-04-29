import { db } from "../database";
import { log, logTable } from "./helpers";
import {
  fetchProductsUpdatedSince,
  fetchProductAvailabilityChangedSince,
  fetchAvailableProductIds,
  fetchProductsByIds,
  fetchProductSizesByProductIds,
  fetchDeletedProductsSince,
  fetchAddonGroupsUpdatedSince,
  fetchAddonOptionsUpdatedSince,
  fetchAddonGroupsByIds,
  fetchAddonOptionsByGroupIds,
  fetchCategoriesByIds,
  fetchSugarLevelsUpdatedSince,
  fetchCombosUpdatedSince,
  fetchComboAvailabilityChangedSince,
  fetchAvailableComboIds,
  fetchCombosByIds,
  fetchDeletedCombosSince,
  fetchComboSlotsByComboIds,
  fetchComboSlotProductsBySlotIds,
} from "./fetch";
import {
  upsertCategories,
  upsertAddonGroups,
  upsertAddonOptions,
  upsertProducts,
  upsertProductSizes,
  upsertSugarLevels,
  upsertCombos,
  upsertComboSlots,
  upsertComboSlotProducts,
  deleteProductAndSizes,
  deleteProductSizesByProductId,
  deleteAddonOptionsByGroupIds,
  deleteComboAndChildren,
  cleanupOrphans,
} from "./write";
import type {
  Product,
  ProductSize,
  Category,
  AddonGroup,
  AddonOption,
  Combo,
  ComboSlot,
  ComboSlotProduct,
} from "./types";

// ── Product change detection ────────────────────────────────────────────────

interface ProductChanges {
  updatedProducts: Product[];
  updatedSizes: ProductSize[];
  deletedIds: string[];
  removedProductIds: string[];
  updatedCategories: Category[];
}

async function detectProductChanges(
  branchId: string,
  lastSyncedAt: string,
): Promise<ProductChanges> {
  const localProductRows = db.getAllSync<{ id: string }>(
    `SELECT id FROM products`,
  );
  const localProductIds = localProductRows.map((r) => r.id);

  // Products updated since last sync (locally known, not deleted)
  let updatedProducts = await fetchProductsUpdatedSince(
    localProductIds,
    lastSyncedAt,
  );

  // Availability changes since last sync
  const changedAvailability = await fetchProductAvailabilityChangedSince(
    branchId,
    lastSyncedAt,
  );

  // Current full availability → detect removals
  const remoteProductIds = new Set(await fetchAvailableProductIds(branchId));
  const removedProductIds = localProductIds.filter(
    (id) => !remoteProductIds.has(id),
  );

  // New products added to this branch (not locally known yet)
  const newProductIds = changedAvailability
    .filter((a) => a.is_available)
    .map((a) => a.product_id)
    .filter((id) => !localProductIds.includes(id));

  if (newProductIds.length > 0) {
    const newProducts = await fetchProductsByIds(newProductIds);
    updatedProducts = [...updatedProducts, ...newProducts];
  }

  // Sizes for all changed products
  const changedProductIds = updatedProducts.map((p) => p.id);
  const updatedSizes = await fetchProductSizesByProductIds(changedProductIds);

  // Deleted products
  const deletedProducts = await fetchDeletedProductsSince(lastSyncedAt);
  const deletedIds = deletedProducts.map((p) => p.id);

  // Categories for changed products
  const categoryIds = [
    ...new Set(
      updatedProducts.map((p) => p.category_id).filter(Boolean) as string[],
    ),
  ];
  const updatedCategories = await fetchCategoriesByIds(categoryIds);

  return {
    updatedProducts,
    updatedSizes,
    deletedIds,
    removedProductIds,
    updatedCategories,
  };
}

// ── Addon change detection ──────────────────────────────────────────────────

interface AddonChanges {
  updatedAddonGroups: AddonGroup[];
  updatedAddonOptions: AddonOption[];
  addonGroupIds: string[];
}

async function detectAddonChanges(
  lastSyncedAt: string,
  productAddonGroupIds: Set<string>,
): Promise<AddonChanges> {
  // Independently query groups & options updated since last sync
  const [changedAddonGroups, changedAddonOptions] = await Promise.all([
    fetchAddonGroupsUpdatedSince(lastSyncedAt),
    fetchAddonOptionsUpdatedSince(lastSyncedAt),
  ]);

  // Merge: addon group IDs from changed products + independently changed groups/options
  const addonGroupIds = [
    ...new Set([
      ...productAddonGroupIds,
      ...changedAddonGroups.map((ag) => ag.id),
      ...changedAddonOptions.map((ao) => ao.addon_group_id),
    ]),
  ];

  const [updatedAddonGroups, updatedAddonOptions] = await Promise.all([
    fetchAddonGroupsByIds(addonGroupIds),
    fetchAddonOptionsByGroupIds(addonGroupIds),
  ]);

  return { updatedAddonGroups, updatedAddonOptions, addonGroupIds };
}

// ── Combo change detection ──────────────────────────────────────────────────

interface ComboChanges {
  updatedCombos: Combo[];
  updatedComboSlots: ComboSlot[];
  updatedComboSlotProducts: ComboSlotProduct[];
  deletedComboIds: string[];
  removedComboIds: string[];
  newComboAvailability: { combo_id: string; is_available: boolean }[];
}

async function detectComboChanges(
  branchId: string,
  lastSyncedAt: string,
): Promise<ComboChanges> {
  const localComboRows = db.getAllSync<{ id: string }>(
    `SELECT id FROM combos`,
  );
  const localComboIds = localComboRows.map((r) => r.id);

  // Combos updated since last sync (locally known, not deleted)
  let updatedCombos = await fetchCombosUpdatedSince(
    localComboIds,
    lastSyncedAt,
  );

  // Availability changes since last sync
  const newComboAvailability = await fetchComboAvailabilityChangedSince(
    branchId,
    lastSyncedAt,
  );
  logTable(
    "branch_combo_availability (new/updated)",
    newComboAvailability,
  );

  // Current full availability → detect removals
  const remoteComboIds = new Set(await fetchAvailableComboIds(branchId));
  const removedComboIds = localComboIds.filter(
    (id) => !remoteComboIds.has(id),
  );
  log(
    `combos removed from branch: ${removedComboIds.length}`,
    removedComboIds,
  );

  // New combos added to this branch (not locally known yet)
  const newComboIds = newComboAvailability
    .filter((a) => a.is_available)
    .map((a) => a.combo_id)
    .filter((id) => !localComboIds.includes(id));

  if (newComboIds.length > 0) {
    const newCombos = await fetchCombosByIds(newComboIds);
    updatedCombos = [...updatedCombos, ...newCombos];
  }

  // Deleted combos
  const deletedCombos = await fetchDeletedCombosSince(lastSyncedAt);
  const deletedComboIds = deletedCombos.map((c) => c.id);

  logTable("combos (updated)", updatedCombos);

  // Slots and slot products for updated combos
  const updatedComboIds = updatedCombos.map((c) => c.id);
  const updatedComboSlots = await fetchComboSlotsByComboIds(updatedComboIds);
  const slotIds = updatedComboSlots.map((s) => s.id);
  const updatedComboSlotProducts =
    await fetchComboSlotProductsBySlotIds(slotIds);

  return {
    updatedCombos,
    updatedComboSlots,
    updatedComboSlotProducts,
    deletedComboIds,
    removedComboIds,
    newComboAvailability,
  };
}

// ── Main incremental sync ───────────────────────────────────────────────────

export async function incrementalSync(
  branchId: string,
  lastSyncedAt: string,
  now: string,
): Promise<void> {
  log(`▶ INCREMENTAL SYNC — branch: ${branchId} | since: ${lastSyncedAt}`);

  const productChanges = await detectProductChanges(branchId, lastSyncedAt);

  const productAddonGroupIds = new Set(
    productChanges.updatedProducts
      .map((p) => p.addon_group_id)
      .filter(Boolean) as string[],
  );
  const addonChanges = await detectAddonChanges(
    lastSyncedAt,
    productAddonGroupIds,
  );

  const comboChanges = await detectComboChanges(branchId, lastSyncedAt);

  const sugarLevels = await fetchSugarLevelsUpdatedSince(lastSyncedAt);
  log(`sugar_levels fetched (incremental): ${sugarLevels.length}`);
  logTable("sugar_levels (incremental)", sugarLevels);

  // Check if anything changed
  if (
    productChanges.updatedProducts.length === 0 &&
    productChanges.deletedIds.length === 0 &&
    productChanges.removedProductIds.length === 0 &&
    addonChanges.updatedAddonGroups.length === 0 &&
    addonChanges.updatedAddonOptions.length === 0 &&
    comboChanges.updatedCombos.length === 0 &&
    comboChanges.newComboAvailability.length === 0 &&
    comboChanges.deletedComboIds.length === 0 &&
    comboChanges.removedComboIds.length === 0 &&
    sugarLevels.length === 0
  ) {
    log("✔ nothing changed since last sync");
    return;
  }

  // Write everything in one transaction
  log("writing to SQLite...");
  await db.runAsync(`PRAGMA foreign_keys = OFF`);
  await db.withTransactionAsync(async () => {
    await upsertSugarLevels(sugarLevels, now);

    // Categories
    await upsertCategories(productChanges.updatedCategories, now);

    // Addons: clear options for affected groups, then re-insert
    await upsertAddonGroups(addonChanges.updatedAddonGroups, now);
    await deleteAddonOptionsByGroupIds(addonChanges.addonGroupIds);
    await upsertAddonOptions(addonChanges.updatedAddonOptions, now);

    // Products: upsert + clear sizes for changed products
    for (const p of productChanges.updatedProducts) {
      await deleteProductSizesByProductId(p.id);
    }
    const sugarProducts = productChanges.updatedProducts.filter((p) => p.has_sugar_level);
    log(`products with has_sugar_level=true (incremental): ${sugarProducts.length}`);
    if (sugarProducts.length > 0) {
      logTable("products (has_sugar_level, incremental)", sugarProducts.map((p) => ({ id: p.id, name: p.name, has_sugar_level: p.has_sugar_level })));
    }
    await upsertProducts(productChanges.updatedProducts, now);
    await upsertProductSizes(productChanges.updatedSizes, now);

    // Delete soft-deleted and removed products
    for (const id of productChanges.deletedIds) {
      await deleteProductAndSizes(id);
    }
    for (const id of productChanges.removedProductIds) {
      await deleteProductAndSizes(id);
    }

    // Combos: delete soft-deleted and removed
    for (const id of comboChanges.deletedComboIds) {
      await deleteComboAndChildren(id);
    }
    for (const id of comboChanges.removedComboIds) {
      await deleteComboAndChildren(id);
    }

    // Combos: upsert (clear children first, then re-insert)
    for (const c of comboChanges.updatedCombos) {
      await deleteComboAndChildren(c.id);
    }
    await upsertCombos(comboChanges.updatedCombos, now);
    await upsertComboSlots(comboChanges.updatedComboSlots, now);
    await upsertComboSlotProducts(comboChanges.updatedComboSlotProducts, now);

    // Clean up orphaned rows
    await cleanupOrphans();
  });
  await db.runAsync(`PRAGMA foreign_keys = ON`);

  log(`✔ INCREMENTAL SYNC complete — synced_at: ${now}`);
  log(
    `  combos: upserted ${comboChanges.updatedCombos.length}, deleted ${comboChanges.deletedComboIds.length}, removed ${comboChanges.removedComboIds.length}`,
  );
}
