import { OrdersPageContent } from "../../_features/orders";
import { listOrders } from "../../_features/orders/services/ordersService";
import { listBranches } from "../../_features/branches/services/branchesService";

export default async function OrdersPage() {
  const [orders, branches] = await Promise.all([listOrders(), listBranches()]);
  return (
    <div className="h-full overflow-hidden">
      <OrdersPageContent initialOrders={orders} initialBranches={branches} />
    </div>
  );
}
