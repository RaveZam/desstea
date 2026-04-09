// ── Branch ───────────────────────────────────────────────────

export type BranchStatus = "active" | "inactive" | "maintenance";

export interface Branch {
  id: string;
  name: string;
  address: string;
  contact: string;
  operatingHours: string;
  status: BranchStatus;
}

// ── Order ────────────────────────────────────────────────────

export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface OrderLineItem {
  productName: string;
  quantity: number;
  size: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  branchId: string;
  branchName: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

// ── Product ──────────────────────────────────────────────────

export interface SizeVariant {
  size: "S" | "M" | "L";
  priceAdjustment: number;
}

export interface AddOn {
  name: string;
  price: number;
}

export type ProductCategory = "Coffee" | "Foods" | "Combos";

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: ProductCategory;
  sizes: SizeVariant[];
  addOns: AddOn[];
  availability: string[]; // branch IDs where available
}

// ── User / Account ───────────────────────────────────────────

export type UserRole = "super_admin" | "branch_manager" | "staff";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBranchId: string | null;
  assignedBranchName: string | null;
  status: UserStatus;
  lastLogin: string;
  avatarInitials: string;
}
