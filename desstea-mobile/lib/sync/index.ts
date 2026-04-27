import {
  log,
  getLastSyncedAt,
  setLastSyncedAt,
  clearSyncMeta,
  logSQLiteTables,
} from "./helpers";
import { fullSync } from "./full-sync";
import { incrementalSync } from "./incremental-sync";

const TAG = "[sync]";

export async function resetSync(): Promise<void> {
  await clearSyncMeta();
  log("sync watermark cleared — next syncCatalog will run a full sync");
}

export async function syncCatalog(branchId: string): Promise<void> {
  const now = new Date().toISOString();
  const lastSyncedAt = await getLastSyncedAt();
  log(
    `syncCatalog called — mode: ${lastSyncedAt === null ? "FULL" : "INCREMENTAL"}`,
  );

  try {
    if (lastSyncedAt === null) {
      await fullSync(branchId, now);
    } else {
      await incrementalSync(branchId, lastSyncedAt, now);
    }
    await setLastSyncedAt(now);
    logSQLiteTables();
  } catch (err) {
    console.error(`${TAG} ✖ SYNC FAILED`, err);
    throw err;
  }
}
