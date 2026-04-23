import { db } from "@/lib/database";

const RETENTION_DAYS = 30;

/**
 * Deletes orders (and their items/addons) older than RETENTION_DAYS days,
 * measured in Philippine time (UTC+8). Skips any orders still pending in
 * the outbox so we never lose unsynced data.
 */
export async function cleanOldOrders(): Promise<void> {
  await db.withTransactionAsync(async () => {
    // Collect IDs of orders older than cutoff that have already been synced.
    // SQLite has no timezone support, so we shift "now" by +8 hours to get
    // the current PH wall-clock time before subtracting the retention window.
    const staleOrders = await db.getAllAsync<{ id: string }>(
      `SELECT o.id
       FROM orders o
       WHERE datetime(o.ordered_at) < datetime('now', '+8 hours', '-${RETENTION_DAYS} days')
         AND o.id NOT IN (
           SELECT record_id
           FROM outbox
           WHERE table_name = 'orders'
             AND status    = 'pending'
         )`
    );

    if (staleOrders.length === 0) return;

    const ids = staleOrders.map((r) => r.id);
    const placeholders = ids.map(() => "?").join(", ");

    // 1. addons — leaf nodes, delete first
    await db.runAsync(
      `DELETE FROM order_item_addons
       WHERE order_item_id IN (
         SELECT id FROM order_items WHERE order_id IN (${placeholders})
       )`,
      ids
    );

    // 2. items
    await db.runAsync(
      `DELETE FROM order_items WHERE order_id IN (${placeholders})`,
      ids
    );

    // 3. orders — root
    await db.runAsync(
      `DELETE FROM orders WHERE id IN (${placeholders})`,
      ids
    );

    // 4. outbox — clean up sync metadata for deleted records
    await db.runAsync(
      `DELETE FROM outbox
       WHERE table_name IN ('orders', 'order_items', 'order_item_addons')
         AND record_id IN (${placeholders})`,
      ids
    );

    console.log(`[clean-old-orders] removed ${ids.length} order(s) older than ${RETENTION_DAYS} days`);
  });
}
