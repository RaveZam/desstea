import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export function useBranchName() {
  const { user } = useAuth();
  const branchId: string | undefined = user?.user_metadata?.branch_id;
  const [branchName, setBranchName] = useState<string>("—");

  useEffect(() => {
    if (!branchId) {
      setBranchName("—");
      return;
    }
    supabase
      .from("branches")
      .select("branch_name")
      .eq("branch_id", branchId)
      .single()
      .then(({ data }) => {
        setBranchName(data?.branch_name ?? branchId);
      });
  }, [branchId]);

  return { branchName, branchId: branchId ?? "—" };
}
