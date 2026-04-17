export type DbAddon = {
  id: string;
  addon_name_snapshot: string;
  price_modifier_snapshot: number;
  quantity: number;
};

export type DbOrderItem = {
  id: string;
  product_name_snapshot: string;
  size_label_snapshot: string | null;
  quantity: number;
  unit_price_snapshot: number;
  total_price: number;
  addons: DbAddon[];
};

export type CompletedOrder = {
  id: string;
  customerName: string;
  paymentMethod: "Cash" | "GCash";
  total: number;
  cashTendered: number | null;
  cashChange: number | null;
  completedAt: Date;
  items: DbOrderItem[];
  syncStatus: "synced" | "pending";
};
