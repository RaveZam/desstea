import { BranchesPageContent } from "../../_features/branches";
import { listBranches, getTodayOrdersSummary } from "../../_features/branches/services/branchesService";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const [branches, summary] = await Promise.all([listBranches(), getTodayOrdersSummary()]);
  return <BranchesPageContent initialBranches={branches} summary={summary} />;
}
