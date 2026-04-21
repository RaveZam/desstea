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
}

// ── Order ────────────────────────────────────────────────────

export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface OrderAddon {
  addonName: string;
  priceModifier: number;
  quantity: number;
}

export interface OrderLineItem {
  productName: string;
  quantity: number;
  size: string;
  unitPrice: number;
  lineTotal: number;
  addons?: OrderAddon[];
}

export interface Order {
  id: string;
  customerName: string;
  branchId: string;
  branchName: string;
  items: OrderLineItem[];
  total: number;
  status?: OrderStatus;
  paymentMethod?: string;
  cashTendered?: number;
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
  is_available: boolean;
  sizes: ProductSize[];
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
  is_available: boolean;
  sizes: Omit<ProductSize, "id">[];
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
