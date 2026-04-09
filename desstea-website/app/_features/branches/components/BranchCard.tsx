"use client";

import Badge from "../../../_components/ui/Badge";
import type { BranchStatus } from "../../../_types";
import type { BranchWithStats } from "../data/mock-data";

const statusDot: Record<BranchStatus, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  maintenance: "bg-amber-500",
};

interface BranchCardProps {
  branch: BranchWithStats;
  onClick: (branch: BranchWithStats) => void;
}

export default function BranchCard({ branch, onClick }: BranchCardProps) {
  return (
    <div
      onClick={() => onClick(branch)}
      className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-[#EDE8E3]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[branch.status]}`} />
            <h3 className="font-semibold text-gray-900 text-sm truncate">{branch.name}</h3>
          </div>
          <p className="text-xs text-gray-400 ml-4 truncate">{branch.address}</p>
        </div>
        <Badge variant={branch.status as BranchStatus} className="ml-2 flex-shrink-0">
          {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#FDFAF7] rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Daily Revenue</p>
          <p className="text-base font-bold text-[#6B4F3A] mt-0.5">
            {branch.dailyRevenue > 0 ? `₱${branch.dailyRevenue.toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="bg-[#FDFAF7] rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Orders Today</p>
          <p className="text-base font-bold text-gray-800 mt-0.5">
            {branch.ordersToday > 0 ? branch.ordersToday : "—"}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2.5">
        <span>{branch.operatingHours}</span>
        <span className="font-medium text-[#6B4F3A] truncate max-w-[120px]">↑ {branch.topProduct}</span>
      </div>
    </div>
  );
}
