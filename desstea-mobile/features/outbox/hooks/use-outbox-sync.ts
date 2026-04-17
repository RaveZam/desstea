import { useEffect } from "react";
import * as Network from "expo-network";
import { processOutbox } from "../services/outbox-sync";

export function useOutboxSync() {
  useEffect(() => {
    processOutbox().catch((err) =>
      console.error("[outbox] startup sync failed", err)
    );

    const subscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected) {
        processOutbox().catch((err) =>
          console.error("[outbox] reconnect sync failed", err)
        );
      }
    });

    return () => subscription.remove();
  }, []);
}
