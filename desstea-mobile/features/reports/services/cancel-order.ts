import { db } from "@/lib/database";
import { processOutbox } from "@/features/outbox/services/outbox-sync";

export async function cancelOrderLocally(orderId: string, reason: string): Promise<void> {
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE orders SET status = 'cancelled', cancellation_reason = ? WHERE id = ?`,
      [reason, orderId],
    );
    await db.runAsync(
      `INSERT INTO outbox (table_name, record_id, payload, priority, status, action, created_at)
       VALUES (?, ?, ?, ?, 'pending', 'update', ?)`,
      [
        "orders",
        orderId,
        JSON.stringify({ status: "cancelled", cancellation_reason: reason }),
        5,
        now,
      ],
    );
  });

  processOutbox().catch(() => {});
}
