// ── Branch ───────────────────────────────────────────────────

export type BranchStatus = "active" | "inactive" | "maintenance";

export interface Branch {
  id: string;
  name: string;
  address: string;
  assigned_account_id: string | null;
  assigned_account_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Order ────────────────────────────────────────────────────

export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface OrderAddon {
  addonName: string;
  priceModifier: number;
  quantity: number;
}

export interface OrderComboSelection {
  slotName: string;
  productName: string;
  upgradePrice: number;
}

export interface OrderLineItem {
  productName: string;
  quantity: number;
  size: string;
  sugarLevel: string | null;
  temp: string | null;
  flavor: string | null;
  unitPrice: number;
  lineTotal: number;
  addons?: OrderAddon[];
  comboSelections?: OrderComboSelection[];
}

export interface Order {
  id: string;
  customerName: string;
  branchId: string;
  branchName: string;
  items: OrderLineItem[];
  total: number;
  status?: OrderStatus;
  cancellationReason?: string;
  paymentMethod?: string;
  cashTendered?: number;
  discountAmount?: number;
  discountReason?: string;
  createdAt: string;
}

// ── Product ──────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProductSize {
  id?: string;
  label: string;
  size_price: number;
  sort_order: number;
}

export interface ProductFlavor {
  id?: string;
  label: string;
  temperature: string | null;
  sort_order: number;
}

export interface AddonOption {
  id?: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
}

export interface AddonGroup {
  id?: string;
  name: string;
  category_id?: string | null;
  options: AddonOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string;
  category_name: string;
  has_sizes: boolean;
  has_sugar_level: boolean;
  is_hot_cold: boolean;
  has_flavors: boolean;
  is_available: boolean;
  sizes: ProductSize[];
  flavors: ProductFlavor[];
  addon_group_id: string | null;
  addon_group_name: string | null;
  available_branch_ids: string[];
  created_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  has_sizes: boolean;
  has_sugar_level: boolean;
  is_hot_cold: boolean;
  has_flavors: boolean;
  is_available: boolean;
  sizes: Omit<ProductSize, "id">[];
  flavors: Omit<ProductFlavor, "id">[];
  addon_group_id: string | null;
  available_branch_ids: string[];
}

// ── User / Account ───────────────────────────────────────────

export type UserRole = "super_admin" | "branch_manager";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBranchId: string | null;
  status: UserStatus;
  lastLogin: string;
  avatarInitials: string;
}
