"use client";

import { SearchInput } from "../../../_components/ui";
import { branchOptions } from "../data/mock-data";

interface OrderFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  branch: string;
  onBranchChange: (v: string) => void;
}

export default function OrderFilters({
  search,
  onSearchChange,
  branch,
  onBranchChange,
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
    </div>
  );
}
