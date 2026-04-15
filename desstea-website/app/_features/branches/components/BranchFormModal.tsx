"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import { createBranch, updateBranch } from "../actions";
import type { Branch } from "../../../_types";

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const emptyForm = { name: "", address: "" };

export default function BranchFormModal({ open, onClose, branch }: BranchFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branch) {
      setForm({ name: branch.name, address: branch.address });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [branch, open]);

  const isEdit = !!branch;

  async function handleSubmit() {
    if (!form.name.trim() || !form.address.trim()) {
      setError("Branch name and address are required.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = isEdit
      ? await updateBranch(branch!.id, form)
      : await createBranch(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Branch" : "Add Branch"}
      size="md"
    >
      <div className="space-y-4">
        <FormField label="Branch Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            placeholder="e.g. Ipil, Echague"
          />
        </FormField>

        <FormField label="Address">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            placeholder="Full address"
          />
        </FormField>

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Branch"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
