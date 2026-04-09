"use client";

import Badge from "../../../_components/ui/Badge";
import type { Order, OrderStatus } from "../../../_types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface OrdersTableProps {
  orders: Order[];
  selectedId: string | null;
  onRowClick: (order: Order) => void;
}

export default function OrdersTable({ orders, selectedId, onRowClick }: OrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                No orders found.
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onRowClick(order)}
              className={`border-b border-gray-50 cursor-pointer transition-colors ${
                selectedId === order.id ? "bg-[#F2EBE5]" : "hover:bg-[#FDFAF7]"
              }`}
            >
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{order.customerName}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{order.branchName}</td>
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
