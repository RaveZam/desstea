"use client";

import { useState } from "react";
import { Toggle } from "../../../_components/ui";

type Tab = "general" | "notifications" | "hours" | "receipt" | "security";

interface DaySchedule {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  group: string;
  icon: React.ReactNode;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  current: boolean;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    id: "hours",
    label: "Business Hours",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "receipt",
    label: "Receipt",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const defaultHours: DaySchedule[] = [
  { day: "Monday",    open: true, openTime: "07:00", closeTime: "22:00" },
  { day: "Tuesday",   open: true, openTime: "07:00", closeTime: "22:00" },
  { day: "Wednesday", open: true, openTime: "07:00", closeTime: "22:00" },
  { day: "Thursday",  open: true, openTime: "07:00", closeTime: "22:00" },
  { day: "Friday",    open: true, openTime: "07:00", closeTime: "22:00" },
  { day: "Saturday",  open: true, openTime: "08:00", closeTime: "23:00" },
  { day: "Sunday",    open: true, openTime: "08:00", closeTime: "23:00" },
];

const mockSessions: Session[] = [
  { id: "1", device: "Chrome on Windows 11", location: "Makati, PH", lastSeen: "Now", current: true },
  { id: "2", device: "Safari on iPhone 15", location: "BGC, PH", lastSeen: "2 hours ago", current: false },
  { id: "3", device: "Chrome on MacBook Pro", location: "Ortigas, PH", lastSeen: "Yesterday", current: false },
];

function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}

export default function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  // General
  const [storeName, setStoreName] = useState("DessTea");
  const [tagline, setTagline] = useState("Your Comfort Cup");
  const [email, setEmail] = useState("hello@desstea.ph");
  const [phone, setPhone] = useState("+63 917 123 4567");
  const [address, setAddress] = useState("Unit 12, The Hub, BGC, Taguig");
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [currency, setCurrency] = useState("PHP");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [language, setLanguage] = useState("en");

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "new_order",
      title: "New Order Received",
      description: "Get notified whenever a new order is placed at any branch.",
      enabled: true,
      group: "Order Alerts",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      ),
    },
    {
      id: "low_stock",
      title: "Low Stock Alert",
      description: "Alert when a product's inventory falls below the minimum threshold.",
      enabled: true,
      group: "Order Alerts",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      id: "failed_payment",
      title: "Failed Payment",
      description: "Immediate alert when a payment transaction fails or is declined.",
      enabled: true,
      group: "Order Alerts",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      id: "daily_summary",
      title: "Daily Summary Report",
      description: "Receive a daily recap of sales, orders, and top products each evening.",
      enabled: true,
      group: "Reports & Analytics",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    },
    {
      id: "weekly_analytics",
      title: "Weekly Analytics",
      description: "Every Monday, receive a performance summary of the previous week.",
      enabled: false,
      group: "Reports & Analytics",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "branch_status",
      title: "Branch Status Changes",
      description: "Notify when a branch goes offline, under maintenance, or comes back online.",
      enabled: false,
      group: "Reports & Analytics",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ]);

  function toggleNotification(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  }

  // Business hours
  const [hours, setHours] = useState<DaySchedule[]>(defaultHours);
  const [applyAllBranches, setApplyAllBranches] = useState(false);

  function updateDay(index: number, field: keyof DaySchedule, value: string | boolean) {
    setHours((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  // Receipt
  const [includeLogo, setIncludeLogo] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [showOrderId, setShowOrderId] = useState(true);
  const [footerMessage, setFooterMessage] = useState("Thank you for choosing DessTea!");
  const [receiptWidth, setReceiptWidth] = useState<"58mm" | "80mm">("80mm");

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [requirePwWakeup, setRequirePwWakeup] = useState(true);
  const [twoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const inputClass =
    "w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700 transition-colors";

  const cardClass = "bg-white rounded-2xl shadow-sm p-5";

  const orderGroups = ["Order Alerts", "Reports & Analytics"];

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between fade-up fade-up-1">
        <div>
          <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
            Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store preferences, notifications, and security.
          </p>
        </div>
      </div>

      {/* Body: left tabs + right content */}
      <div className="flex gap-5 fade-up fade-up-2 items-start">
        {/* Left tab nav */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-2 space-y-0.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                    active
                      ? "bg-[#F2EBE5] text-[#6B4F3A] font-semibold"
                      : "text-gray-600 hover:bg-[#F5EDE7]/60"
                  }`}
                >
                  <span className={active ? "text-[#6B4F3A]" : "text-[#C4B4A6]"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* GENERAL */}
          {activeTab === "general" && (
            <>
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Store Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Store Name</label>
                    <input className={inputClass} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Tagline</label>
                    <input className={inputClass} value={tagline} onChange={(e) => setTagline(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Contact Email</label>
                    <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Contact Phone</label>
                    <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Main Address</label>
                    <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Localization</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Timezone</label>
                    <select className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      <option value="Asia/Manila">Asia/Manila (PHT, UTC+8)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Currency</label>
                    <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="PHP">PHP — Philippine Peso (₱)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="SGD">SGD — Singapore Dollar (S$)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Date Format</label>
                    <select className={inputClass} value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Language</label>
                    <select className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="fil">Filipino</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className={cardClass}>
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Notification Preferences</h2>
              <div className="space-y-6">
                {orderGroups.map((group) => (
                  <div key={group}>
                    <p className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest mb-3">{group}</p>
                    <div className="space-y-1">
                      {notifications
                        .filter((n) => n.group === group)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#F5EDE7]/40 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#F2EBE5] flex items-center justify-center text-[#6B4F3A] flex-shrink-0 mt-0.5">
                                {n.icon}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{n.description}</p>
                              </div>
                            </div>
                            <Toggle checked={n.enabled} onChange={() => toggleNotification(n.id)} />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUSINESS HOURS */}
          {activeTab === "hours" && (
            <>
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Operating Hours</h2>
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-[120px_72px_1fr_1fr] gap-3 px-3 pb-1 border-b border-gray-100">
                    <span className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest">Day</span>
                    <span className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest">Open</span>
                    <span className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest">Opens at</span>
                    <span className="text-[10px] font-semibold text-[#C4B4A6] uppercase tracking-widest">Closes at</span>
                  </div>
                  {hours.map((d, i) => (
                    <div
                      key={d.day}
                      className={`grid grid-cols-[120px_72px_1fr_1fr] gap-3 items-center px-3 py-2 rounded-xl transition-colors ${
                        d.open ? "hover:bg-gray-50" : "opacity-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">{d.day}</span>
                      <Toggle checked={d.open} onChange={(v) => updateDay(i, "open", v)} />
                      {d.open ? (
                        <>
                          <input
                            type="time"
                            value={d.openTime}
                            onChange={(e) => updateDay(i, "openTime", e.target.value)}
                            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700"
                          />
                          <input
                            type="time"
                            value={d.closeTime}
                            onChange={(e) => updateDay(i, "closeTime", e.target.value)}
                            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700"
                          />
                        </>
                      ) : (
                        <div className="col-span-2 flex items-center">
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">Closed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyAllBranches}
                      onChange={(e) => setApplyAllBranches(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#6B4F3A] cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Apply these hours to all branches</span>
                  </label>
                  <button className="bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
                    Save Hours
                  </button>
                </div>
              </div>
            </>
          )}

          {/* RECEIPT */}
          {activeTab === "receipt" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Settings */}
              <div className={cardClass + " space-y-5"}>
                <h2 className="text-sm font-semibold text-gray-800">Receipt Settings</h2>

                <div className="space-y-4">
                  {[
                    { label: "Include Logo", desc: "Print DessTea logo at the top.", value: includeLogo, onChange: setIncludeLogo },
                    { label: "Show Tax Breakdown", desc: "Display VAT and tax lines separately.", value: showTax, onChange: setShowTax },
                    { label: "Show Order ID", desc: "Print order reference number.", value: showOrderId, onChange: setShowOrderId },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{row.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
                      </div>
                      <Toggle checked={row.value} onChange={row.onChange} />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-medium">Footer Message</label>
                  <textarea
                    rows={2}
                    value={footerMessage}
                    onChange={(e) => setFooterMessage(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">Receipt Width</label>
                  <div className="flex gap-3">
                    {(["58mm", "80mm"] as const).map((w) => (
                      <label key={w} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="receiptWidth"
                          value={w}
                          checked={receiptWidth === w}
                          onChange={() => setReceiptWidth(w)}
                          className="accent-[#6B4F3A]"
                        />
                        <span className="text-sm text-gray-700">{w}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm">
                  Save Receipt Settings
                </button>
              </div>

              {/* Preview */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Preview</h2>
                <div className="flex justify-center">
                  <div
                    className="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center font-mono text-xs text-gray-700 shadow-sm"
                    style={{ width: receiptWidth === "80mm" ? "220px" : "160px" }}
                  >
                    {includeLogo && (
                      <div className="mb-2">
                        <div className="text-base font-bold text-[#6B4F3A] font-display">DessTea</div>
                        <div className="text-[10px] text-gray-400">Your Comfort Cup</div>
                      </div>
                    )}
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    {showOrderId && (
                      <div className="text-left text-[10px] text-gray-500 mb-1">Order #DT-20240409-001</div>
                    )}
                    <div className="text-left text-[10px] text-gray-500 mb-1">Apr 9, 2026  10:32 AM</div>
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    <div className="text-left space-y-0.5 text-[10px]">
                      <div className="flex justify-between"><span>Caramel Milk Tea</span><span>₱95</span></div>
                      <div className="flex justify-between"><span>Brown Sugar Latte</span><span>₱110</span></div>
                      <div className="flex justify-between"><span>Cheese Tart ×2</span><span>₱120</span></div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    {showTax && (
                      <>
                        <div className="flex justify-between text-[10px]"><span>Subtotal</span><span>₱325</span></div>
                        <div className="flex justify-between text-[10px] text-gray-400"><span>VAT (12%)</span><span>₱39</span></div>
                      </>
                    )}
                    <div className="flex justify-between text-[10px] font-bold mt-1"><span>TOTAL</span><span>₱{showTax ? "364" : "325"}</span></div>
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    {footerMessage && (
                      <div className="text-[10px] text-gray-400 italic">{footerMessage}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4">
              {/* Change password */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Change Password</h2>
                <div className="space-y-3 max-w-sm">
                  {[
                    { label: "Current Password", value: currentPw, onChange: setCurrentPw, show: showCurrentPw, toggleShow: () => setShowCurrentPw((v) => !v) },
                    { label: "New Password", value: newPw, onChange: setNewPw, show: showNewPw, toggleShow: () => setShowNewPw((v) => !v) },
                    { label: "Confirm New Password", value: confirmPw, onChange: setConfirmPw, show: showConfirmPw, toggleShow: () => setShowConfirmPw((v) => !v) },
                  ].map((field) => (
                    <div key={field.label} className="space-y-1">
                      <label className="text-xs text-gray-500 font-medium">{field.label}</label>
                      <div className="relative">
                        <input
                          type={field.show ? "text" : "password"}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-9 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] text-gray-700"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={field.toggleShow}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {field.show ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm mt-1">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Session settings */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Session Settings</h2>
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Session Timeout</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className={inputClass}
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                      <option value="480">8 hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Require password on wakeup</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ask for password after session timeout.</p>
                    </div>
                    <Toggle checked={requirePwWakeup} onChange={setRequirePwWakeup} />
                  </div>
                </div>
              </div>

              {/* 2FA */}
              <div className={cardClass}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Two-Factor Authentication</h2>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Add an extra layer of security to your account using an authenticator app or SMS.
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
                    {twoFAEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <button className="mt-4 border border-[#6B4F3A] text-[#6B4F3A] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F2EBE5] transition-colors">
                  {twoFAEnabled ? "Manage 2FA" : "Enable 2FA"}
                </button>
              </div>

              {/* Active sessions */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Active Sessions</h2>
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F2EBE5] flex items-center justify-center text-[#6B4F3A] flex-shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                            {s.device}
                            {s.current && (
                              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Current</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.location} · {s.lastSeen}</p>
                        </div>
                      </div>
                      {!s.current && (
                        <button
                          onClick={() => revokeSession(s.id)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
