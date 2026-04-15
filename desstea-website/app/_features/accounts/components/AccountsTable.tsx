"use client";

import Badge from "../../../_components/ui/Badge";
import type { Branch, User, UserRole } from "../../../_types";

function formatLastLogin(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const roleLabel: Record<UserRole, string> = {
  super_admin: "Admin Account",
  branch_manager: "Branch Account",
};

const avatarGradient: Record<string, string> = {
  RG: "from-purple-500 to-purple-700",
  PL: "from-purple-400 to-purple-600",
  SC: "from-emerald-500 to-emerald-700",
  MV: "from-blue-500 to-blue-700",
  JS: "from-pink-500 to-pink-700",
  RC: "from-blue-400 to-blue-600",
  DO: "from-gray-400 to-gray-600",
  KR: "from-orange-400 to-orange-600",
  MD: "from-rose-400 to-rose-600",
  AG: "from-sky-400 to-sky-600",
  CP: "from-teal-400 to-teal-600",
  BA: "from-gray-300 to-gray-500",
  GT: "from-lime-400 to-lime-600",
  EM: "from-amber-400 to-amber-600",
  LF: "from-gray-300 to-gray-500",
};

interface AccountsTableProps {
  users: User[];
  branches: Branch[];
  onRowClick: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function AccountsTable({ users, branches, onRowClick, onDelete }: AccountsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onRowClick(user)}
              className="border-b border-gray-50 cursor-pointer hover:bg-[#FDFAF7] transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient[user.avatarInitials] ?? "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                  >
                    {user.avatarInitials}
                  </div>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={user.role as UserRole}>
                  {roleLabel[user.role]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {user.assignedBranchId
                  ? (branches.find((b) => b.id === user.assignedBranchId)?.name ?? <span className="text-gray-300">—</span>)
                  : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.status === "active" ? "text-emerald-600" : "text-gray-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {user.status === "active" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                {formatLastLogin(user.lastLogin)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete account"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
