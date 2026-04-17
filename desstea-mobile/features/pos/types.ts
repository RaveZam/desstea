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

export type ProductCustomization = {
  size: LocalSize | null;
  addonOptions: LocalAddonOption[];
};

export type OrderItem = {
  product: LocalProduct;
  quantity: number;
  customization?: ProductCustomization;
};

export function getItemPrice(item: OrderItem): number {
  const base = item.customization?.size?.size_price ?? item.product.base_price;
  const addons = (item.customization?.addonOptions ?? []).reduce(
    (sum, ao) => sum + ao.price_modifier,
    0
  );
  return base + addons;
}

export function getItemKey(item: OrderItem): string {
  if (!item.customization) return item.product.id;
  const sizeKey = item.customization.size?.id ?? "no-size";
  const addonKey = item.customization.addonOptions
    .map((a) => a.id)
    .sort()
    .join(",");
  return `${item.product.id}__${sizeKey}__${addonKey}`;
}
