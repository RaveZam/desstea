"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/orders",
    badge: "8+",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    label: "Branches",
    href: "/branches",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/products",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

const generalItems: { label: string; href?: string; icon: React.ReactNode }[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "Help",
    href: "/help",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: "Logout",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-52 h-screen flex flex-col flex-shrink-0 border-r border-[#EDE8E3] overflow-hidden" style={{ background: "#FDFAF7" }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <img src="/logo.jpg" alt="DessTea" className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-black" />
        <div className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-gray-900 text-base tracking-tight">DessTea</span>
          <span className="text-xs text-[#A08C7A] font-normal">Sales Management</span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest px-2 mb-1.5">Menu</p>
        <nav className="space-y-0.5 mb-5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between py-2 pr-3 pl-3 rounded-r-xl text-sm transition-colors border-l-[3px] ${
                  active
                    ? "bg-[#F2EBE5] text-[#6B4F3A] font-semibold border-[#6B4F3A] rounded-l-none"
                    : "text-gray-600 hover:bg-[#F5EDE7]/60 border-transparent rounded-xl"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={active ? "text-[#6B4F3A]" : "text-[#C4B4A6]"}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {"badge" in item && item.badge && (
                  <span className="bg-[#E8692A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <p className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest px-2 mb-1.5">General</p>
        <nav className="space-y-0.5">
          {generalItems.map((item) => {
            if (item.href) {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 py-2 pr-3 pl-3 rounded-r-xl text-sm transition-colors border-l-[3px] ${
                    active
                      ? "bg-[#F2EBE5] text-[#6B4F3A] font-semibold border-[#6B4F3A] rounded-l-none"
                      : "text-gray-600 hover:bg-[#F5EDE7]/60 border-transparent rounded-xl"
                  }`}
                >
                  <span className={active ? "text-[#6B4F3A]" : "text-[#C4B4A6]"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            }
            return (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm text-gray-600 hover:bg-[#F5EDE7]/60 transition-colors"
              >
                <span className="text-[#C4B4A6]">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="px-3 py-3 border-t border-[#EDE8E3]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F2EBE5] transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            MA
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Michael Aurelio</p>
            <p className="text-[10px] text-[#A08C7A] truncate">Branch Manager</p>
          </div>
          <svg className="w-3 h-3 text-[#C4B4A6] ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
