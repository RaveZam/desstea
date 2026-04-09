"use client";

import { SearchInput } from "../../../_components/ui";
import type { OrderStatus } from "../../../_types";
import { branchOptions } from "../data/mock-data";

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const statusColors: Record<OrderStatus | "all", string> = {
  all: "bg-gray-100 text-gray-600",
  pending: "bg-orange-100 text-orange-700",
  completed: "bg-[#F2EBE5] text-[#6B4F3A]",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-red-100 text-red-600",
};

interface OrderFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  branch: string;
  onBranchChange: (v: string) => void;
  status: OrderStatus | "all";
  onStatusChange: (v: OrderStatus | "all") => void;
}

export default function OrderFilters({
  search,
  onSearchChange,
  branch,
  onBranchChange,
  status,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search order ID or customer…"
        className="w-60"
      />

      <select
        value={branch}
        onChange={(e) => onBranchChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700"
      >
        {branchOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex gap-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              status === opt.value
                ? statusColors[opt.value]
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
