"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import BranchCard from "./BranchCard";

import BranchFormModal from "./BranchFormModal";
import BranchDeleteModal from "./BranchDeleteModal";
import { deleteBranch } from "../actions";
import type { Branch } from "../../../_types";
import type { BranchDailySummary } from "../services/branchesService";

interface BranchesPageContentProps {
  initialBranches: Branch[];
  summary: Record<string, BranchDailySummary>;
}

export default function BranchesPageContent({
  initialBranches,
  summary,
}: BranchesPageContentProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAdd() {
    setEditingBranch(null);
    setModalOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setModalOpen(true);
  }

  function handleDelete(branch: Branch) {
    setDeletingBranch(branch);
  }

  function handleConfirmDelete(branch: Branch) {
    startTransition(async () => {
      const result = await deleteBranch(branch.id);
      if (result.error) {
        alert(result.error);
      } else {
        setDeletingBranch(null);
        router.refresh();
      }
    });
  }

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
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Branch
            </button>
          </div>
        </div>

        {/* Count chip */}
        <div className="flex gap-2 fade-up fade-up-2">
          <span className="bg-[#F2EBE5] text-[#6B4F3A] text-xs font-semibold px-3 py-1 rounded-full">
            {initialBranches.length}{" "}
            {initialBranches.length === 1 ? "Branch" : "Branches"}
          </span>
        </div>

        {/* Content */}
        <div className="fade-up fade-up-3">
          {initialBranches.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-gray-400 text-sm">
                No branches yet. Add one to get started.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 xl:grid-cols-3 gap-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
            >
              {initialBranches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  orderCount={summary[branch.id]?.order_count ?? 0}
                  totalRevenue={summary[branch.id]?.total_revenue ?? 0}
                  onEdit={() => openEdit(branch)}
                  onDelete={() => handleDelete(branch)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BranchFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        branch={editingBranch}
      />

      <BranchDeleteModal
        branch={deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isPending}
      />
    </>
  );
}
