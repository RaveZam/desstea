import { db } from "../database";

const TAG = "[sync]";
const SYNC_META_KEY = "last_synced_at";

export function log(message: string, data?: any) {
  if (data !== undefined) {
    console.log(`${TAG} ${message}`, data);
  } else {
    console.log(`${TAG} ${message}`);
  }
}

export function logTable(label: string, rows: any[]) {
  console.log(
    `${TAG} ┌─ ${label} (${rows.length} row${rows.length !== 1 ? "s" : ""})`,
  );
  rows.forEach((row, i) => {
    const isLast = i === rows.length - 1;
    console.log(`${TAG} ${isLast ? "└" : "├"}─`, row);
  });
  if (rows.length === 0) {
    console.log(`${TAG} └─ (empty)`);
  }
}

export async function getLastSyncedAt(): Promise<string | null> {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = ?`,
    [SYNC_META_KEY],
  );
  return row?.value ?? null;
}

export async function setLastSyncedAt(value: string): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
    [SYNC_META_KEY, value],
  );
}

export async function clearSyncMeta(): Promise<void> {
  await db.runAsync(`DELETE FROM sync_meta WHERE key = ?`, [SYNC_META_KEY]);
}

export function logSQLiteTables(): void {
  log("━━━ SQLite combo snapshot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  logTable("combos", db.getAllSync(`SELECT * FROM combos`));
  logTable("combo_slots", db.getAllSync(`SELECT * FROM combo_slots`));
  logTable(
    "combo_slot_products",
    db.getAllSync(`SELECT * FROM combo_slot_products`),
  );
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}
