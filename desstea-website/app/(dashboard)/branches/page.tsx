import { BranchesPageContent } from "../../_features/branches";
import { listBranches } from "../../_features/branches/services/branchesService";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await listBranches();
  return <BranchesPageContent initialBranches={branches} />;
}
