import { AccountsPageContent } from "../../_features/accounts";
import { listAccounts } from "../../_features/accounts/services/accountsService";
import { listBranches } from "../../_features/branches/services/branchesService";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [users, branches] = await Promise.all([listAccounts(), listBranches()]);
  return <AccountsPageContent initialUsers={users} initialBranches={branches} />;
}
