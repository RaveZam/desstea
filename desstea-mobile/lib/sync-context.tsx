import { createContext, useCallback, useContext, useState } from "react";

type SyncContextValue = {
  syncVersion: number;
  isSyncing: boolean;
  bumpSync: () => void;
  setSyncing: (v: boolean) => void;
};

const SyncContext = createContext<SyncContextValue>({
  syncVersion: 0,
  isSyncing: true,
  bumpSync: () => {},
  setSyncing: () => {},
});

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncVersion, setSyncVersion] = useState(0);
  const [isSyncing, setIsSyncing] = useState(true);
  const bumpSync = useCallback(() => setSyncVersion((v) => v + 1), []);
  const setSyncing = useCallback((v: boolean) => setIsSyncing(v), []);
  return (
    <SyncContext.Provider value={{ syncVersion, isSyncing, bumpSync, setSyncing }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncVersion() {
  return useContext(SyncContext).syncVersion;
}

export function useIsSyncing() {
  return useContext(SyncContext).isSyncing;
}

export function useBumpSync() {
  return useContext(SyncContext).bumpSync;
}

export function useSetSyncing() {
  return useContext(SyncContext).setSyncing;
}
