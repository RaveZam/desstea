"use client";

import { useState } from "react";
import BranchCard from "./BranchCard";
import BranchComparisonChart from "./BranchComparisonChart";
import BranchFormModal from "./BranchFormModal";
import { mockBranches, type BranchWithStats } from "../data/mock-data";

type ViewMode = "grid" | "comparison";

export default function BranchesPageContent() {
  const [view, setView] = useState<ViewMode>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchWithStats | null>(null);

  function openAdd() {
    setEditingBranch(null);
    setModalOpen(true);
  }

  function openEdit(branch: BranchWithStats) {
    setEditingBranch(branch);
    setModalOpen(true);
  }

  const active = mockBranches.filter((b) => b.status === "active").length;
  const maintenance = mockBranches.filter((b) => b.status === "maintenance").length;
  const inactive = mockBranches.filter((b) => b.status === "inactive").length;

  return (
    <>
      <div className="px-5 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between fade-up fade-up-1">
          <div>
            <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
              Branches
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all DessTea branch locations and track performance.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  view === "grid" ? "bg-[#F2EBE5] text-[#6B4F3A]" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setView("comparison")}
                className={`px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 ${
                  view === "comparison" ? "bg-[#F2EBE5] text-[#6B4F3A]" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </button>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Branch
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 fade-up fade-up-2">
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            {active} Active
          </span>
          {maintenance > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
              {maintenance} Maintenance
            </span>
          )}
          {inactive > 0 && (
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
              {inactive} Inactive
            </span>
          )}
        </div>

        {/* Content */}
        <div className="fade-up fade-up-3">
          {view === "grid" ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {mockBranches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} onClick={openEdit} />
              ))}
            </div>
          ) : (
            <BranchComparisonChart />
          )}
        </div>
      </div>

      <BranchFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        branch={editingBranch}
      />
    </>
  );
}
