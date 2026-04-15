"use client";

import { useState } from "react";
import Link from "next/link";
import { getBranchById } from "../data/mock-data";
import BranchDetailHeader from "./BranchDetailHeader";
import BranchStatCards from "./BranchStatCards";
import BranchSalesChart from "./BranchSalesChart";
import BranchOrderStatusChart from "./BranchOrderStatusChart";
import BranchTopProducts from "./BranchTopProducts";
import BranchRecentOrders from "./BranchRecentOrders";
import BranchFormModal from "./BranchFormModal";
import type { Branch } from "../../../_types";

interface BranchDetailContentProps {
  branch: Branch;
}

export default function BranchDetailContent({ branch }: BranchDetailContentProps) {
  const [editOpen, setEditOpen] = useState(false);

  // Use mock stats if available for this branch ID, otherwise show zeros
  const mockStats = getBranchById(branch.id) ?? {
    ...branch,
    contact: "—",
    operatingHours: "—",
    status: "active" as const,
    dailyRevenue: 0,
    ordersToday: 0,
    topProduct: "—",
    staffCount: 0,
  };

  return (
    <>
      <div className="px-5 py-4 space-y-3">
        {/* Header */}
        <div className="fade-up fade-up-1">
          <BranchDetailHeader branch={branch} onEdit={() => setEditOpen(true)} />
        </div>

        {/* KPI Cards */}
        <div className="fade-up fade-up-2">
          <BranchStatCards branch={mockStats} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-3 items-stretch">
          <div className="col-span-2 flex flex-col">
            <BranchSalesChart branchId={branch.id} />
          </div>
          <div className="flex flex-col">
            <BranchOrderStatusChart branchId={branch.id} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-4">
          <div>
            <BranchTopProducts branchId={branch.id} />
          </div>
          <div className="col-span-2">
            <BranchRecentOrders branchId={branch.id} />
          </div>
        </div>
      </div>

      <BranchFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        branch={branch}
      />
    </>
  );
}
