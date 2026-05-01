"use server";

import { createAdminClient } from "../../../../lib/supabase/admin";
import type { Order } from "../../../_types";

export async function fetchOrderById(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      branches ( branch_name ),
      order_items (
        *,
        order_item_addons ( * ),
        order_item_combo_selections ( * )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const branch = data.branches as { branch_name: string } | null;
  const rawItems = (data.order_items ?? []) as Record<string, unknown>[];

  const items = rawItems.map((item) => {
    const rawAddons = (item.order_item_addons ?? []) as Record<string, unknown>[];
    const addons = rawAddons.map((a) => ({
      addonName: a.addon_name_snapshot as string,
      priceModifier: a.price_modifier_snapshot as number,
      quantity: a.quantity as number,
    }));
    const rawComboSelections = (item.order_item_combo_selections ?? []) as Record<
      string,
      unknown
    >[];
    const comboSelections = rawComboSelections.map((selection) => ({
      slotName: selection.slot_name_snapshot as string,
      productName: selection.product_name_snapshot as string,
    }));

    const unitPrice = item.unit_price_snapshot as number;
    const qty = item.quantity as number;

    return {
      productName: item.product_name_snapshot as string,
      quantity: qty,
      size: (item.size_label_snapshot as string | null) ?? "-",
      sugarLevel: (item.sugar_level_snapshot as string | null) ?? null,
      unitPrice,
      lineTotal: (item.total_price as number | null) ?? unitPrice * qty,
      addons,
      comboSelections,
    };
  });

  return {
    id: data.id as string,
    customerName: (data.customer_name as string | null) ?? "Guest",
    branchId: data.branch_id as string,
    branchName: branch?.branch_name ?? "",
    items,
    total: data.total as number,
    status: data.status as Order["status"],
    paymentMethod: data.payment_method as string | undefined,
    cashTendered: data.cash_tendered as number | undefined,
    createdAt: data.ordered_at as string,
  };
}
