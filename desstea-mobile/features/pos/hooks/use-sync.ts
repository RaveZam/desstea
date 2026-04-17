import { useState, useCallback } from "react";
import { syncCatalog } from "@/lib/sync";

type SyncState = "idle" | "syncing" | "done" | "error";

export function useSync(branchId: string | undefined) {
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (!branchId) return;
    setSyncState("syncing");
    setSyncError(null);
    try {
      await syncCatalog(branchId);
      const now = new Date().toISOString();
      setLastSyncedAt(now);
      setSyncState("done");
    } catch (err: any) {
      setSyncError(err?.message ?? "Unknown sync error");
      setSyncState("error");
    }
  }, [branchId]);

  return { sync, syncState, syncError, lastSyncedAt };
}
