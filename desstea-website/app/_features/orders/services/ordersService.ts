import { createAdminClient } from "../../../../lib/supabase/admin";
import { cacheLife, cacheTag } from "next/cache";
import type { Order } from "../../../_types";

export async function listOrders(): Promise<Order[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      branches ( branch_name ),
      order_items (
        *,
        order_item_addons ( * )
      )
    `)
    .order("ordered_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const branch = row.branches as { branch_name: string } | null;
    const rawItems = (row.order_items ?? []) as Record<string, unknown>[];

    const items = rawItems.map((item) => {
      const rawAddons = (item.order_item_addons ?? []) as Record<string, unknown>[];
      const addons = rawAddons.map((a) => ({
        addonName: a.addon_name_snapshot as string,
        priceModifier: a.price_modifier_snapshot as number,
        quantity: a.quantity as number,
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
      };
    });

    return {
      id: row.id as string,
      customerName: (row.customer_name as string | null) ?? "Guest",
      branchId: row.branch_id as string,
      branchName: branch?.branch_name ?? "",
      items,
      total: row.total as number,
      paymentMethod: row.payment_method as string | undefined,
      cashTendered: row.cash_tendered as number | undefined,
      createdAt: row.ordered_at as string,
    } satisfies Order;
  });
}
