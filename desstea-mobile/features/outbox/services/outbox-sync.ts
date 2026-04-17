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

  for (const entry of rows) {
    const payload = JSON.parse(entry.payload) as Record<string, unknown>;

    // Skip order_items and addons whose parent order failed
    if (entry.table_name === "order_items") {
      const orderId = payload["order_id"] as string | undefined;
      if (orderId && failedOrderIds.has(orderId)) continue;
    }
    if (entry.table_name === "order_item_addons") {
      // We need to find the order_id via the order_item; check against known failed orders
      // by looking up the order_item's order_id from the local DB
      const orderItemId = payload["order_item_id"] as string | undefined;
      if (orderItemId) {
        const row = db.getFirstSync<{ order_id: string }>(
          `SELECT order_id FROM order_items WHERE id = ?`,
          [orderItemId]
        );
        if (row && failedOrderIds.has(row.order_id)) continue;
      }
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

    console.warn(`[outbox] failed to sync ${entry.table_name}#${entry.record_id}:`, error.message);
  }
}
