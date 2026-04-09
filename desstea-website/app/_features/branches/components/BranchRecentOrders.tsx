import Badge from "../../../_components/ui/Badge";
import { getBranchRecentOrders } from "../data/mock-data";
import type { OrderStatus } from "../../../_types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface BranchRecentOrdersProps {
  branchId: string;
}

export default function BranchRecentOrders({ branchId }: BranchRecentOrdersProps) {
  const orders = getBranchRecentOrders(branchId);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        <p className="text-xs text-gray-400 mt-0.5">Latest transactions at this branch</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                No orders found for this branch.
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-gray-50 hover:bg-[#FDFAF7] transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{order.customerName}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                ₱{order.total.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={order.status as OrderStatus}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                {formatDate(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
