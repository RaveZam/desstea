import { Suspense } from "react";
import { BranchesPageContent } from "../../_features/branches";
import { listBranches, getTodayOrdersSummary } from "../../_features/branches/services/branchesService";
import Loading from "./loading";

async function BranchesContent() {
  const [branches, summary] = await Promise.all([listBranches(), getTodayOrdersSummary()]);
  return <BranchesPageContent initialBranches={branches} summary={summary} />;
}

export default function BranchesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BranchesContent />
    </Suspense>
  );
}
