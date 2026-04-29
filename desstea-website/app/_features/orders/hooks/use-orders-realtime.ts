"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Branch, Order } from "@/app/_types";

const POLL_INTERVAL = 2000;

export function useOrdersRealtime(
  branches: Branch[],
  onNewOrder: (order: Order) => void,
) {
  const branchesRef = useRef(branches);
  branchesRef.current = branches;

  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  const knownIdsRef = useRef<Set<string>>(new Set());

  const seedKnownIds = useCallback((orders: Order[]) => {
    for (const o of orders) knownIdsRef.current.add(o.id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function poll() {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            order_item_addons ( * )
          )
        `)
        .order("ordered_at", { ascending: false })
        .limit(20);

      if (error || !data || !active) return;

      for (const row of data) {
        if (knownIdsRef.current.has(row.id)) continue;

        knownIdsRef.current.add(row.id);

        const branch = branchesRef.current.find((b) => b.id === row.branch_id);
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

        const newOrder: Order = {
          id: row.id,
          customerName: row.customer_name ?? "Guest",
          branchId: row.branch_id,
          branchName: branch?.name ?? "",
          items,
          total: row.total,
          paymentMethod: row.payment_method ?? undefined,
          cashTendered: row.cash_tendered ?? undefined,
          createdAt: row.ordered_at,
        };

        onNewOrderRef.current(newOrder);

        toast.success("New order received!", {
          description: `${newOrder.customerName} · ₱${newOrder.total.toFixed(2)} · ${newOrder.branchName}`,
          duration: 6000,
        });
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { seedKnownIds };
}
