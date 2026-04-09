"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "../../../_components/ui";
import AccountsTable from "./AccountsTable";
import AccountFormModal from "./AccountFormModal";
import RolePermissionsCard from "./RolePermissionsCard";
import { mockUsers, roleOptions } from "../data/mock-data";
import type { User, UserRole, UserStatus } from "../../../_types";

export default function AccountsPageContent() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = role === "all" || u.role === role;
      const matchStatus = status === "all" || u.status === status;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, role, status]);

  function openAdd() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setModalOpen(true);
  }

  const activeCount = mockUsers.filter((u) => u.status === "active").length;

  return (
    <>
      <div className="px-5 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between fade-up fade-up-1">
          <div>
            <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
              Accounts
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage team members, roles, and branch access.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400">{activeCount} active users</span>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Role permissions reference */}
        <div className="fade-up fade-up-2">
          <RolePermissionsCard />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 fade-up fade-up-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email…"
            className="w-60"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | "all")}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700"
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <div className="flex gap-1">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  status === s
                    ? s === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : s === "inactive"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-[#F2EBE5] text-[#6B4F3A]"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="fade-up fade-up-4">
          <AccountsTable users={filtered} onRowClick={openEdit} />
        </div>
      </div>

      <AccountFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
      />
    </>
  );
}
