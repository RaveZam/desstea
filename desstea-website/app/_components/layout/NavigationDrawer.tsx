"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountModal from "./AccountModal";

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
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/products",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

type Props = {
  email: string;
  displayName: string;
  initials: string;
};

export default function NavigationDrawer({
  email,
  displayName,
  initials,
}: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  // Close on ESC + lock body scroll while open (delayed restore for animation)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) return;
    const timeout = setTimeout(() => {
      document.body.style.overflow = "";
    }, 300);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Close drawer on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Hamburger Button — mobile only */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F2EBE5] transition-colors cursor-pointer group lg:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="w-[18px] h-[14px] relative flex flex-col justify-between">
          <span
            className="block h-[2px] w-full bg-[#6B4F3A] rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center"
            style={{
              transform: isOpen
                ? "translateY(6px) rotate(45deg)"
                : "translateY(0) rotate(0)",
            }}
          />
          <span
            className="block h-[2px] w-full bg-[#6B4F3A] rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)]"
            style={{
              opacity: isOpen ? 0 : 1,
              transform: isOpen ? "scaleX(0)" : "scaleX(1)",
            }}
          />
          <span
            className="block h-[2px] w-full bg-[#6B4F3A] rounded-full transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)] origin-center"
            style={{
              transform: isOpen
                ? "translateY(-6px) rotate(-45deg)"
                : "translateY(0) rotate(0)",
            }}
          />
        </div>
      </button>

      {/* Backdrop — mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          isOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Drawer / Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:translate-x-0 lg:shadow-none lg:border-r lg:border-[#EDE8E3] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#FDFAF7" }}
      >
        {/* Drawer Header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-2.5 border-b border-[#EDE8E3]">
          <img
            src="/logo.jpg"
            alt="DessTea"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-black"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-semibold text-gray-900 text-base tracking-tight">
              DessTea
            </span>
            <span className="text-xs text-[#A08C7A] font-normal">
              Sales Management
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2EBE5] transition-colors cursor-pointer lg:hidden"
            aria-label="Close menu"
          >
            <svg
              className="w-4 h-4 text-[#A08C7A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="px-3 pt-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest px-2 mb-1.5">
            Menu
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 py-2.5 pr-3 pl-3 rounded-r-xl text-sm transition-colors border-l-[3px] ${
                    active
                      ? "bg-[#F2EBE5] text-[#6B4F3A] font-semibold border-[#6B4F3A] rounded-l-none"
                      : "text-gray-600 hover:bg-[#F5EDE7]/60 border-transparent rounded-xl"
                  }`}
                >
                  <span
                    className={active ? "text-[#6B4F3A]" : "text-[#C4B4A6]"}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="px-3 py-3 border-t border-[#EDE8E3]">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F2EBE5] transition-colors cursor-pointer w-full text-left group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#A08C7A] truncate">{email}</p>
            </div>
            <svg
              className="w-3 h-3 text-[#C4B4A6] ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        displayName={displayName}
        email={email}
      />
    </>
  );
}
