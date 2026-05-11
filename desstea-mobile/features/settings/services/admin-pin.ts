import { db } from "@/lib/database";

export function getAdminPin(): string | null {
  const row = db.getFirstSync<{ pin: string }>(
    "SELECT pin FROM admin_pin WHERE id = 1"
  );
  return row?.pin ?? null;
}

export async function setAdminPin(pin: string): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO admin_pin (id, pin) VALUES (1, ?)",
    [pin]
  );
}

export function isPinSet(): boolean {
  return getAdminPin() !== null;
}
