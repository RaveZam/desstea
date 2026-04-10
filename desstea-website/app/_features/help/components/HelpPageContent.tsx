"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface Guide {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const faqs: FaqItem[] = [
  {
    question: "How do I add a new branch?",
    answer: "Go to Branches in the sidebar and click Add Branch. Fill in the name, address, contact number, and operating hours, then save. The branch will appear in your branch list immediately.",
  },
  {
    question: "Can I assign staff to a specific branch?",
    answer: "Yes. In Accounts, create or edit a user and set their role to Staff or Branch Manager, then select the branch they belong to. They will only see data relevant to their assigned branch.",
  },
  {
    question: "How do I process a refund?",
    answer: "In Orders, find the order you need to refund and click on it to open the detail view. Change the order status to Refunded. This action is logged in the branch's order history.",
  },
  {
    question: "How are daily sales calculated?",
    answer: "Daily sales are the sum of all Completed orders within the calendar day (12:00 AM – 11:59 PM) for each branch, based on the store's configured timezone.",
  },
  {
    question: "Can I set different prices per branch?",
    answer: "Not yet — product prices are currently global across all branches. Branch-specific pricing is on the roadmap for a future release.",
  },
  {
    question: "Who can access the Settings page?",
    answer: "Only Super Admins can modify global settings such as store profile, notifications, and security. Branch Managers can view the Settings page but cannot save any changes.",
  },
];

const guides: Guide[] = [
  {
    title: "Orders Guide",
    description: "Track, filter, and manage customer orders across all branches.",
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
    title: "Products & Menu Guide",
    description: "Add products, set sizes, add-ons, and control branch availability.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    title: "Branch Management",
    description: "Create branches, manage hours, view per-branch analytics.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Accounts & Roles",
    description: "Invite team members, assign roles, and control access levels.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "Reports & Analytics",
    description: "Understand sales trends, top products, and branch performance.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Export & Backup",
    description: "Download order history, product lists, and financial summaries.",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

const shortcuts: { keys: string[]; action: string }[] = [
  { keys: ["Ctrl", "K"], action: "Quick search" },
  { keys: ["Ctrl", "N"], action: "New entry (context-aware)" },
  { keys: ["Esc"], action: "Close modal" },
  { keys: ["Ctrl", "S"], action: "Save form" },
  { keys: ["Ctrl", "/"], action: "Open help" },
  { keys: ["G", "O"], action: "Go to Orders" },
  { keys: ["G", "P"], action: "Go to Products" },
  { keys: ["G", "B"], action: "Go to Branches" },
];

const systemStatus: { name: string; ok: boolean }[] = [
  { name: "API", ok: true },
  { name: "Database", ok: true },
  { name: "CDN", ok: true },
];

const quickSteps = [
  {
    step: 1,
    title: "Add your branches",
    description: "Set up your physical locations with addresses and contact info.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Add your products",
    description: "Build your menu with sizes, add-ons, and branch availability.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Manage orders",
    description: "Track incoming orders, update statuses, and process refunds.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "View analytics",
    description: "Monitor sales trends and performance from the dashboard.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function HelpPageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  function toggleFaq(i: number) {
    setOpenFaq((prev) => (prev === i ? null : i));
  }

  const filteredFaqs = search.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqs;

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Header */}
      <div className="fade-up fade-up-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
              Help &amp; Support
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Find answers, explore guides, and get in touch with the team.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-lg">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles…"
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700 transition-colors"
          />
        </div>
      </div>

      {/* Quick Start */}
      {!search && (
        <div className="fade-up fade-up-2">
          <p className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest mb-3">
            Getting Started
          </p>
          <div className="grid grid-cols-4 gap-3">
            {quickSteps.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#6B4F3A] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#F2EBE5] flex items-center justify-center text-[#6B4F3A]">
                    {s.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ + Feature Guides */}
      <div className="grid grid-cols-2 gap-4 fade-up fade-up-3">
        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Frequently Asked Questions
            {search && filteredFaqs.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          {filteredFaqs.length === 0 ? (
            <p className="text-sm text-gray-400">No results found for &ldquo;{search}&rdquo;.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="py-3">
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-start justify-between gap-3 text-left group"
                    >
                      <span className="text-sm font-medium text-gray-800 group-hover:text-[#6B4F3A] transition-colors">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-4 h-4 flex-shrink-0 text-[#C4B4A6] mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                    {isOpen && (
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Guides */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Feature Guides</h2>
          <div className="space-y-1">
            {guides.map((g) => (
              <button
                key={g.title}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F5EDE7]/60 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F2EBE5] flex items-center justify-center text-[#6B4F3A] flex-shrink-0 group-hover:bg-[#E8D9CF] transition-colors">
                    {g.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-[#C4B4A6] flex-shrink-0 group-hover:text-[#6B4F3A] transition-colors"
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
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts + Contact Support */}
      <div className="grid grid-cols-2 gap-4 fade-up fade-up-4">
        {/* Shortcuts */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Keyboard Shortcuts</h2>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.action} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">{s.action}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <kbd className="text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5 font-mono">
                        {k}
                      </kbd>
                      {i < s.keys.length - 1 && (
                        <span className="text-xs text-gray-300">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div
          className="relative rounded-2xl p-5 flex flex-col justify-between"
          style={{ background: "linear-gradient(135deg, #6B4F3A 0%, #4E3628 100%)" }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.07) 0%, transparent 60%)",
            }}
          />

          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Need more help?</h2>
            <p className="text-sm text-white/70 mt-1">
              Our support team is ready to assist you with any questions or issues.
            </p>

            <div className="mt-4 flex gap-2">
              <button className="bg-white text-[#6B4F3A] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#F2EBE5] transition-colors">
                Email Support
              </button>
              <button className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20">
                Chat with us
              </button>
            </div>

            <p className="text-xs text-white/40 mt-4">
              We typically respond within 2 business hours.
            </p>
          </div>

          {/* System Status */}
          <div className="relative mt-5 pt-4 border-t border-white/10">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              System Status
            </p>
            <div className="flex items-center gap-4">
              {systemStatus.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-xs text-white/60">{s.name}</span>
                </div>
              ))}
              <span className="ml-auto text-xs text-emerald-400 font-semibold">All Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
