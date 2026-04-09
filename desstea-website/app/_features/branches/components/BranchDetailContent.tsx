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

interface BranchDetailContentProps {
  branchId: string;
}

export default function BranchDetailContent({ branchId }: BranchDetailContentProps) {
  const [editOpen, setEditOpen] = useState(false);
  const branch = getBranchById(branchId);

  if (!branch) {
    return (
      <div className="px-5 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">Branch not found.</p>
          <Link
            href="/branches"
            className="text-[#E8692A] text-sm font-semibold hover:underline"
          >
            ← Back to Branches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-4 space-y-3">
        {/* Header */}
        <div className="fade-up fade-up-1">
          <BranchDetailHeader branch={branch} onEdit={() => setEditOpen(true)} />
        </div>

        {/* KPI Cards */}
        <div className="fade-up fade-up-2">
          <BranchStatCards branch={branch} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-3 items-stretch">
          <div className="col-span-2 flex flex-col">
            <BranchSalesChart branchId={branchId} />
          </div>
          <div className="flex flex-col">
            <BranchOrderStatusChart branchId={branchId} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-4">
          <div>
            <BranchTopProducts branchId={branchId} />
          </div>
          <div className="col-span-2">
            <BranchRecentOrders branchId={branchId} />
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
