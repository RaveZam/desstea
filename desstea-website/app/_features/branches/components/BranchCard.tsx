"use client";

import { useRouter } from "next/navigation";
import Badge from "../../../_components/ui/Badge";
import type { Branch, BranchStatus } from "../../../_types";

interface BranchCardProps {
  branch: Branch;
  orderCount: number;
  totalRevenue: number;
  onEdit: () => void;
  onDelete: () => void;
}

const statusDot: Record<BranchStatus, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  maintenance: "bg-amber-500",
};

export default function BranchCard({ branch, orderCount, totalRevenue, onEdit, onDelete }: BranchCardProps) {
  const router = useRouter();

  const status: BranchStatus = "active";

  return (
    <div
      onClick={() => router.push(`/branches/${branch.id}`)}
      className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-[#EDE8E3]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[status]}`} />
            <h3 className="font-semibold text-gray-900 text-sm truncate">{branch.name}</h3>
          </div>
          <p className="text-xs text-gray-400 ml-4 truncate">{branch.address}</p>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <Badge variant={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#6B4F3A] hover:bg-[#F2EBE5] transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#FDFAF7] rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Daily Revenue</p>
          <p className="text-base font-bold text-[#6B4F3A] mt-0.5">
            {totalRevenue > 0 ? `₱${totalRevenue.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="bg-[#FDFAF7] rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Orders Today</p>
          <p className="text-base font-bold text-gray-800 mt-0.5">
            {orderCount > 0 ? orderCount : "—"}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2.5">
        <span className="truncate max-w-[140px]" title={branch.assigned_account_name ?? undefined}>
          {branch.assigned_account_name ?? "Unassigned"}
        </span>
        <span className="font-medium text-[#6B4F3A] truncate max-w-[120px]">Today</span>
      </div>
    </div>
  );
}
