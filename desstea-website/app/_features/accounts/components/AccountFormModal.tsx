"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import type { Branch, User, UserRole, UserStatus } from "../../../_types";
import { createAccount, updateAccount } from "../actions";

interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  branches: Branch[];
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Admin Account" },
  { value: "branch_manager", label: "Branch Account" },
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "branch_manager" as UserRole,
  assignedBranchId: "",
  status: "active" as UserStatus,
};

export default function AccountFormModal({
  open,
  onClose,
  user,
  branches,
}: AccountFormModalProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        role: user.role,
        assignedBranchId: user.assignedBranchId ?? "",
        status: user.status,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [user, open]);

  async function handleSubmit() {
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createAccount({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      assignedBranchId: form.assignedBranchId || undefined,
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  async function handleUpdate() {
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await updateAccount(user!.id, {
      name: form.name,
      email: form.email,
      role: form.role,
      assignedBranchId: form.assignedBranchId || undefined,
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

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
          <FormField label="Account Name" className="col-span-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="e.g. Maria Santos, Ipil Echague Branch Account"
            />
          </FormField>

          <FormField label="Email Address" className="col-span-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="user@gmail.com"
            />
          </FormField>

          {!isEdit && (
            <>
              <FormField label="Password">
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                  placeholder="Min. 6 characters"
                />
              </FormField>

              <FormField label="Confirm Password">
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                  placeholder="Re-enter password"
                />
              </FormField>
            </>
          )}

          <FormField label="Role">
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as UserRole,
                  assignedBranchId:
                    e.target.value === "super_admin" ? "" : f.assignedBranchId,
                }))
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Branch Assignment"
            hint={
              isSuperAdmin
                ? "Admin Accounts have access to all branches."
                : undefined
            }
          >
            <select
              value={form.assignedBranchId}
              onChange={(e) =>
                setForm((f) => ({ ...f, assignedBranchId: e.target.value }))
              }
              disabled={isSuperAdmin}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">No Branch (All)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
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
            onClick={isEdit ? handleUpdate : handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Account"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
