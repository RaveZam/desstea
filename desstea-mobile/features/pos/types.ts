export type LocalProduct = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string;
  has_sizes: number; // SQLite 0 | 1
  is_available: number;
  addon_group_id: string | null;
};

export type LocalCategory = {
  id: string;
  name: string;
};

export type LocalCombo = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: number;
};

export type LocalSize = {
  id: string;
  label: string;
  size_price: number;
  sort_order: number;
};

export type LocalAddonOption = {
  id: string;
  addon_group_id: string;
  name: string;
  price_modifier: number;
  is_available: number;
  sort_order: number;
};

export type AddonWithQty = {
  option: LocalAddonOption;
  qty: number;
};

export type ProductCustomization = {
  size: LocalSize | null;
  addonOptions: AddonWithQty[];
};

export type ComboSlotSelection = {
  slotId: string;
  slotName: string;
  productId: string;
  productName: string;
  addonGroupId: string | null;
  addons: AddonWithQty[];
};

export type OrderItem = {
  itemType: "product" | "combo";
  product: LocalProduct;
  combo?: LocalCombo;
  comboSelections?: ComboSlotSelection[];
  quantity: number;
  customization?: ProductCustomization;
  categoryLabel?: string;
};

export function getItemPrice(item: OrderItem): number {
  if (item.itemType === "combo") {
    const addonTotal = (item.comboSelections ?? []).reduce((sum, sel) => {
      return sum + sel.addons.reduce((s, aq) => s + aq.option.price_modifier * aq.qty, 0);
    }, 0);
    return item.product.base_price + addonTotal;
  }
  const base = item.customization?.size?.size_price ?? item.product.base_price;
  const addons = (item.customization?.addonOptions ?? []).reduce(
    (sum, aq) => sum + aq.option.price_modifier * aq.qty,
    0
  );
  return base + addons;
}

export function getItemKey(item: OrderItem): string {
  if (item.itemType === "combo") {
    if (item.comboSelections && item.comboSelections.length > 0) {
      const selKey = item.comboSelections
        .map((s) => {
          const addonKey = s.addons
            .filter((aq) => aq.qty > 0)
            .map((aq) => `${aq.option.id}x${aq.qty}`)
            .sort()
            .join("|");
          return `${s.slotId}:${s.productId}:${addonKey}`;
        })
        .sort()
        .join(",");
      return `combo__${item.product.id}__${selKey}`;
    }
    return `combo__${item.product.id}`;
  }
  if (!item.customization) return item.product.id;
  const sizeKey = item.customization.size?.id ?? "no-size";
  const addonKey = item.customization.addonOptions
    .filter((aq) => aq.qty > 0)
    .map((aq) => `${aq.option.id}x${aq.qty}`)
    .sort()
    .join(",");
  return `${item.product.id}__${sizeKey}__${addonKey}`;
}
