"use client";

import { useState, useEffect } from "react";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import Toggle from "../../../_components/ui/Toggle";
import type { User, UserRole, UserStatus } from "../../../_types";
import { branchOptions } from "../data/mock-data";

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "branch_manager", label: "Branch Manager" },
];

const emptyForm = {
  name: "",
  email: "",
  role: "branch_manager" as UserRole,
  assignedBranchId: "",
  status: "active" as UserStatus,
};

export default function AccountFormModal({ open, onClose, user }: AccountFormModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBranchId: user.assignedBranchId ?? "",
        status: user.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [user, open]);

  const isEdit = !!user;
  const isSuperAdmin = form.role === "super_admin";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Account" : "Add Account"}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name" className="col-span-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="e.g. Maria Santos"
            />
          </FormField>

          <FormField label="Email Address" className="col-span-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="user@desstea.com"
            />
          </FormField>

          <FormField label="Role">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({
                ...f,
                role: e.target.value as UserRole,
                assignedBranchId: e.target.value === "super_admin" ? "" : f.assignedBranchId,
              }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Branch Assignment"
            hint={isSuperAdmin ? "Super Admins have access to all branches." : undefined}
          >
            <select
              value={form.assignedBranchId}
              onChange={(e) => setForm((f) => ({ ...f, assignedBranchId: e.target.value }))}
              disabled={isSuperAdmin}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {branchOptions.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700">Account Status</p>
            <p className="text-xs text-gray-400">
              {form.status === "active" ? "User can log in and access the system." : "User is deactivated and cannot log in."}
            </p>
          </div>
          <Toggle
            checked={form.status === "active"}
            onChange={(v) => setForm((f) => ({ ...f, status: v ? "active" : "inactive" }))}
          />
        </div>

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
            {isEdit ? "Save Changes" : "Add Account"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
