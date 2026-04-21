"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRangeKey } from "../services/dashboardService";
import { getDateBounds } from "../services/dashboardService";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "Asia/Manila" });
}

const OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
];

function getRangeDisplay(key: DateRangeKey): string {
  const { start, end } = getDateBounds(key);
  // end is exclusive (start of next day), so display end - 1 day
  const displayEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  if (key === "today") return formatDate(start);
  return `${formatShortDate(start)} – ${formatDate(displayEnd)}`;
}

export default function DateRangeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKey = (searchParams.get("range") as DateRangeKey | null) ?? "30d";

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = OPTIONS.find((o) => o.key === currentKey) ?? OPTIONS[2];

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  }

  function handleSelect(key: DateRangeKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    router.push(`?${params.toString()}`);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-0 border border-gray-200 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-sm text-gray-600 tabular-nums">{getRangeDisplay(currentKey)}</span>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <span className="text-sm font-medium text-gray-700">{selected.label}</span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                currentKey === opt.key
                  ? "text-[#6B4F3A] font-semibold bg-[#F2EBE5]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
