export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
}

export interface AddonGroup {
  id: string;
  name: string;
  category_id: string | null;
}

export interface AddonOption {
  id: string;
  addon_group_id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  addon_group_id: string | null;
  name: string;
  description: string | null;
  base_price: number;
  has_sizes: boolean;
  is_available: boolean;
  created_at: string | null;
  deleted_at: string | null;
}

export interface ProductSize {
  id: string;
  product_id: string;
  label: string;
  size_price: number;
  sort_order: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string | null;
  deleted_at: string | null;
}

export interface ComboSlot {
  id: string;
  combo_id: string;
  category_id: string | null;
  sort_order: number;
}

export interface ComboSlotProduct {
  id: string;
  combo_slot_id: string;
  product_id: string;
  quantity: number;
}
