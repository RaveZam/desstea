"use client";

import { useState, useEffect } from "react";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import type { BranchWithStats } from "../data/mock-data";
import type { BranchStatus } from "../../../_types";

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  branch: BranchWithStats | null;
}

const emptyForm = {
  name: "",
  address: "",
  contact: "",
  operatingHours: "",
  status: "active" as BranchStatus,
};

export default function BranchFormModal({ open, onClose, branch }: BranchFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        address: branch.address,
        contact: branch.contact,
        operatingHours: branch.operatingHours,
        status: branch.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [branch, open]);

  const isEdit = !!branch;

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
            placeholder="e.g. SM North EDSA"
          />
        </FormField>

        <FormField label="Address">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            placeholder="Full mall/building address"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact Number">
            <input
              type="text"
              value={form.contact}
              onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="+63 2 8XXX-XXXX"
            />
          </FormField>

          <FormField label="Operating Hours">
            <input
              type="text"
              value={form.operatingHours}
              onChange={(e) => setForm((f) => ({ ...f, operatingHours: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="10:00 AM – 9:00 PM"
            />
          </FormField>
        </div>

        <FormField label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BranchStatus }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors"
          >
            {isEdit ? "Save Changes" : "Add Branch"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
