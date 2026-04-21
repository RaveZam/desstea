"use client";

import Badge from "../../../_components/ui/Badge";
import type { Order, OrderStatus } from "../../../_types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-[400px] bg-white shadow-2xl border-l border-gray-100 flex flex-col transition-transform duration-300 ${
        order ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 font-medium">Order Details</p>
          <h3 className="font-semibold text-gray-900 font-mono text-sm truncate max-w-[260px]">{order?.id ?? ""}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {order && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Status + meta */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800">{order.customerName}</p>
              <p className="text-xs text-gray-400">{order.branchName}</p>
              <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              {order.paymentMethod && (
                <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
              )}
            </div>
            {order.status && (
              <Badge variant={order.status as OrderStatus}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            )}
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-start justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">
                        {item.size !== "-" ? `${item.size} · ` : ""}×{item.quantity} @ ₱{item.unitPrice}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-3">₱{item.lineTotal.toLocaleString()}</p>
                  </div>

                  {/* Addons */}
                  {(item.addons ?? []).length > 0 && (
                    <div className="mt-1 ml-3 space-y-0.5">
                      {(item.addons ?? []).map((addon, aidx) => (
                        <div key={aidx} className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            + {addon.addonName}
                            {addon.quantity > 1 ? ` ×${addon.quantity}` : ""}
                          </span>
                          {addon.priceModifier > 0 && (
                            <span>₱{(addon.priceModifier * addon.quantity).toLocaleString()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Divider + Total */}
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Total</p>
              <p className="text-lg font-bold text-[#6B4F3A]">₱{order.total.toLocaleString()}</p>
            </div>
            {order.cashTendered != null && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Cash Tendered</p>
                  <p className="text-sm text-gray-700">₱{order.cashTendered.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Change</p>
                  <p className="text-sm text-gray-700">₱{(order.cashTendered - order.total).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
