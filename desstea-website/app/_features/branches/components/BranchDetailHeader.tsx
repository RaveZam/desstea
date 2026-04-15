"use client";

import { useRouter } from "next/navigation";
import type { Branch } from "../../../_types";

interface BranchDetailHeaderProps {
  branch: Branch;
  onEdit: () => void;
}

export default function BranchDetailHeader({ branch, onEdit }: BranchDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Back link */}
      <button
        onClick={() => router.push("/branches")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#6B4F3A] transition-colors mb-3"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Branches
      </button>

      {/* Branch name row */}
      <div className="flex items-start justify-between">
        <h1 className="font-display text-[28px] font-semibold text-gray-900 tracking-tight leading-tight">
          {branch.name}
        </h1>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Branch
        </button>
      </div>

      {/* Address */}
      <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {branch.address}
      </div>
    </div>
  );
}
