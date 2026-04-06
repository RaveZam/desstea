"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const options = [
  { label: "Last 7 days", range: "Apr 1, 2026 - Apr 7, 2026" },
  { label: "Last 30 days", range: "Mar 8, 2026 - Apr 7, 2026" },
];

export default function DateRangeSelector() {
  const [selected, setSelected] = useState(options[1]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
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
      {/* Single unified pill */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-0 border border-gray-200 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors overflow-hidden"
      >
        {/* Left: calendar icon + date range */}
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-sm text-gray-600 tabular-nums">{selected.range}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Right: preset label + chevron */}
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <span className="text-sm font-medium text-gray-700">{selected.label}</span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown — portalled to body to escape stacking contexts */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { setSelected(opt); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                selected.label === opt.label
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
