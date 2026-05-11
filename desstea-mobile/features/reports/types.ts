export type DbAddon = {
  id: string;
  addon_name_snapshot: string;
  price_modifier_snapshot: number;
  quantity: number;
};

export type DbComboSelection = {
  id: string;
  combo_slot_id: string;
  slot_name_snapshot: string;
  product_id: string;
  product_name_snapshot: string;
  upgrade_price: number;
};

export type DbOrderItem = {
  id: string;
  combo_id: string | null;
  product_name_snapshot: string;
  size_label_snapshot: string | null;
  sugar_level_snapshot: string | null;
  temp_snapshot: string | null;
  flavor_snapshot: string | null;
  quantity: number;
  unit_price_snapshot: number;
  total_price: number;
  addons: DbAddon[];
  comboSelections: DbComboSelection[];
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
