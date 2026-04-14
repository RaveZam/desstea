"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import type { User } from "../../../_types";
import { deleteAccount } from "../actions";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export default function DeleteAccountModal({
  open,
  onClose,
  user,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setInput("");
    setError(null);
    onClose();
  }

  async function handleDelete() {
    if (!user) return;
    if (input !== user.email) {
      setError("Email does not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await deleteAccount(user.id);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      handleClose();
    }
  }

  if (!user) return null;

  const confirmed = input === user.email;

  return (
    <Modal open={open} onClose={handleClose} title="Delete Account" size="sm">
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
          <div className="text-xs text-red-700 space-y-1">
            <p className="font-semibold">This action cannot be undone.</p>
            <p>
              The account <span className="font-medium">{user.name}</span> will
              be permanently deleted and will lose all access.
            </p>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            To confirm, type the account email{" "}
            <span className="font-semibold text-gray-800">{user.email}</span>{" "}
            below:
          </p>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
            placeholder={user.email}
            autoComplete="off"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
