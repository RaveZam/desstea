import * as Network from "expo-network";
import { db } from "@/lib/database";
import { supabase } from "@/lib/supabase";

type OutboxRow = {
  id: number;
  table_name: string;
  record_id: string;
  payload: string;
  priority: number;
  status: string;
  created_at: string;
};

export async function processOutbox(): Promise<void> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) return;

  const rows = db.getAllSync<OutboxRow>(
    `SELECT * FROM outbox WHERE status = 'pending' ORDER BY priority ASC, id ASC`
  );

  if (rows.length === 0) return;

  // Track order IDs that failed so we can skip their children
  const failedOrderIds = new Set<string>();

  const failedOrderItemIds = new Set<string>();

  for (const entry of rows) {
    const payload = JSON.parse(entry.payload) as Record<string, unknown>;

    // Skip order_items whose parent order failed
    if (entry.table_name === "order_items") {
      const orderId = payload["order_id"] as string | undefined;
      if (orderId && failedOrderIds.has(orderId)) continue;
    }
    // Skip addons/selections whose parent order or order_item failed
    if (
      entry.table_name === "order_item_addons" ||
      entry.table_name === "order_item_combo_selections"
    ) {
      const orderItemId = payload["order_item_id"] as string | undefined;
      if (orderItemId && failedOrderItemIds.has(orderItemId)) continue;
      if (orderItemId) {
        const row = db.getFirstSync<{ order_id: string }>(
          `SELECT order_id FROM order_items WHERE id = ?`,
          [orderItemId]
        );
        if (row && failedOrderIds.has(row.order_id)) continue;
      }
    }

    // Strip generated columns that Supabase computes server-side
    if (entry.table_name === "order_items") {
      delete payload["total_price"];
    }

    const { error } = await supabase
      .from(entry.table_name)
      .insert(payload);

    if (!error) {
      db.runSync(`DELETE FROM outbox WHERE id = ?`, [entry.id]);
      continue;
    }

    // Unique violation — already synced, treat as success
    if (error.code === "23505") {
      db.runSync(`DELETE FROM outbox WHERE id = ?`, [entry.id]);
      continue;
    }

    // Parent order failed — record so children get skipped
    if (entry.table_name === "orders") {
      failedOrderIds.add(entry.record_id);
    }
    if (entry.table_name === "order_items") {
      failedOrderItemIds.add(entry.record_id);
    }

    console.warn(`[outbox] failed to sync ${entry.table_name}#${entry.record_id}:`, error.message);
  }
}
