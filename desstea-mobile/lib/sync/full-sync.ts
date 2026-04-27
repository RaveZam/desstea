import { db } from "../database";
import { log, logTable } from "./helpers";
import {
  fetchAllCategories,
  fetchAllAddonGroups,
  fetchAllAddonOptions,
  fetchAvailableProductIds,
  fetchAvailableComboIds,
  fetchCombosByIds,
  fetchComboSlotsByComboIds,
  fetchComboSlotProductsBySlotIds,
  fetchProductsByIds,
  fetchProductSizesByProductIds,
} from "./fetch";
import {
  clearAllTables,
  upsertCategories,
  upsertAddonGroups,
  upsertAddonOptions,
  upsertProducts,
  upsertProductSizes,
  upsertCombos,
  upsertComboSlots,
  upsertComboSlotProducts,
} from "./write";

export async function fullSync(branchId: string, now: string): Promise<void> {
  log(`▶ FULL SYNC — branch: ${branchId}`);

  // Fetch all reference data
  const [categories, addonGroups, addonOptions, productIds, comboIds] =
    await Promise.all([
      fetchAllCategories(),
      fetchAllAddonGroups(),
      fetchAllAddonOptions(),
      fetchAvailableProductIds(branchId),
      fetchAvailableComboIds(branchId),
    ]);

  logTable(
    "branch_combo_availability",
    comboIds.map((id) => ({ combo_id: id })),
  );

  // Fetch combos + children
  const combos = await fetchCombosByIds(comboIds);
  logTable("combos", combos);

  const comboSlots = await fetchComboSlotsByComboIds(comboIds);
  logTable("combo_slots", comboSlots);

  const slotIds = comboSlots.map((s) => s.id);
  const comboSlotProducts = await fetchComboSlotProductsBySlotIds(slotIds);
  logTable("combo_slot_products", comboSlotProducts);

  if (comboIds.length === 0) {
    log("combos → none available for this branch");
  }

  // Fetch products + sizes
  const products = await fetchProductsByIds(productIds);
  const activeIds = products.map((p) => p.id);
  const productSizes = await fetchProductSizesByProductIds(activeIds);

  // Write everything in one transaction
  log("writing to SQLite...");
  await db.runAsync(`PRAGMA foreign_keys = OFF`);
  await db.withTransactionAsync(async () => {
    await clearAllTables();
    await upsertCategories(categories, now);
    await upsertAddonGroups(addonGroups, now);
    await upsertAddonOptions(addonOptions, now);
    await upsertProducts(products, now);
    await upsertProductSizes(productSizes, now);
    await upsertCombos(combos, now);
    await upsertComboSlots(comboSlots, now);
    await upsertComboSlotProducts(comboSlotProducts, now);
  });
  await db.runAsync(`PRAGMA foreign_keys = ON`);

  log(`✔ FULL SYNC complete — synced_at: ${now}`);
}
