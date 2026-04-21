import type { BranchRecentOrder } from "../services/branchesService";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

interface BranchRecentOrdersProps {
  orders: BranchRecentOrder[];
}

export default function BranchRecentOrders({ orders }: BranchRecentOrdersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        <p className="text-xs text-gray-400 mt-0.5">Latest transactions · selected period</p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 text-sm">
                  No orders for this period.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50 hover:bg-[#FDFAF7] transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-medium text-gray-800">{order.customerName}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  ₱{order.total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
