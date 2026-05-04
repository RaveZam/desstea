import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

function cacheKey(branchId: string) {
  return `branch_name_${branchId}`;
}

export function useBranchName() {
  const { user } = useAuth();
  const branchId: string | undefined = user?.user_metadata?.branch_id;
  const [branchName, setBranchName] = useState<string>("—");

  useEffect(() => {
    if (!branchId) {
      setBranchName("—");
      return;
    }

    // Load cached name immediately so it shows even when offline
    SecureStore.getItemAsync(cacheKey(branchId)).then((cached) => {
      if (cached) setBranchName(cached);
    });

    // Try to fetch fresh from Supabase and update cache
    supabase
      .from("branches")
      .select("branch_name")
      .eq("branch_id", branchId)
      .single()
      .then(({ data }) => {
        if (data?.branch_name) {
          setBranchName(data.branch_name);
          SecureStore.setItemAsync(cacheKey(branchId), data.branch_name).catch(
            () => {},
          );
        }
      });
  }, [branchId]);

  return { branchName, branchId: branchId ?? "—" };
}
