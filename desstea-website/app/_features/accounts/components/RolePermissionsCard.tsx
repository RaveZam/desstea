"use client";

import { useState } from "react";

const permissions = [
  {
    role: "Super Admin",
    color: "bg-purple-100 text-purple-700",
    items: [
      "Access all branches and data",
      "Manage user accounts and roles",
      "Add/edit/deactivate branches",
      "Full product catalog management",
      "View all orders and reports",
      "Export and audit logs",
    ],
  },
  {
    role: "Branch Manager",
    color: "bg-blue-100 text-blue-700",
    items: [
      "Access assigned branch only",
      "View branch orders and stats",
      "Manage branch staff accounts",
      "Update product availability",
      "Process order refunds",
    ],
  },
  {
    role: "Staff",
    color: "bg-gray-100 text-gray-600",
    items: [
      "Access assigned branch only",
      "View and process orders",
      "Update order status",
      "View product catalog",
    ],
  },
];

export default function RolePermissionsCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FDFAF7] transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#6B4F3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Role Permissions Reference</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3 border-t border-gray-50">
          {permissions.map((p) => (
            <div key={p.role} className="pt-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${p.color}`}>
                {p.role}
              </span>
              <ul className="space-y-1">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-gray-500">
                    <svg className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
