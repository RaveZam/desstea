import { AccountsPageContent } from "../../_features/accounts";
import { listAccounts } from "../../_features/accounts/services/accountsService";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const users = await listAccounts();
  return <AccountsPageContent initialUsers={users} />;
}
