"use client";

import { useState, useEffect } from "react";
import Modal from "../../../_components/ui/Modal";
import type { Branch } from "../../../_types";

interface BranchDeleteModalProps {
  branch: Branch | null;
  onClose: () => void;
  onConfirm: (branch: Branch) => void;
  isDeleting: boolean;
}

export default function BranchDeleteModal({
  branch,
  onClose,
  onConfirm,
  isDeleting,
}: BranchDeleteModalProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput("");
  }, [branch]);

  if (!branch) return null;

  const confirmed = input === branch.name;

  return (
    <Modal open={!!branch} onClose={onClose} title="Delete Branch" size="sm">
      <div className="space-y-4">
        {/* Danger banner */}
        <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-red-700 leading-snug">
            This action <strong>cannot be undone</strong>. The branch will be
            permanently removed from the system.
          </p>
        </div>

        {/* Branch name display */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">
            Branch to delete
          </p>
          <p className="text-sm font-semibold text-gray-900">{branch.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{branch.address}</p>
        </div>

        {/* Confirmation input */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-600">
            Type{" "}
            <span className="font-semibold text-gray-900 select-all font-mono bg-gray-100 px-1 py-0.5 rounded">
              {branch.name}
            </span>{" "}
            to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 font-mono"
            placeholder={branch.name}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => confirmed && onConfirm(branch)}
            disabled={!confirmed || isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-red-700"
          >
            {isDeleting ? "Deleting…" : "Delete Branch"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
