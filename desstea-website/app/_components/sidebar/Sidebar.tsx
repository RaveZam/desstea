const navItems = [
  {
    label: "Dashboard",
    active: true,
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
    label: "Schedule",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Team",
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

const generalItems = [
  {
    label: "Settings",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "Help",
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
  return (
    <aside className="w-52 h-screen bg-white flex flex-col flex-shrink-0 border-r border-gray-100 overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <img src="/logo.jpg" alt="DessTea" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <span className="font-bold text-gray-900 text-[15px] tracking-tight">DessTea</span>
      </div>

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">Menu</p>
        <nav className="space-y-0.5 mb-5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center justify-between py-2 pr-3 pl-3 rounded-r-xl text-sm transition-colors border-l-[3px] ${
                item.active
                  ? "bg-[#F2EBE5] text-[#6B4F3A] font-semibold border-[#6B4F3A] rounded-l-none"
                  : "text-gray-600 hover:bg-gray-50 border-transparent rounded-xl"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={item.active ? "text-[#6B4F3A]" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-[#6B4F3A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">General</p>
        <nav className="space-y-0.5">
          {generalItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile App Promo */}
      <div className="p-3 mt-2 flex-shrink-0">
        <div className="bg-[#6B4F3A] rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-[#5A3F2E] rounded-full opacity-60" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-[#E8692A] rounded-full opacity-25" />
          <div className="relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <p className="text-xs leading-snug">
              <span className="font-bold">Download</span> our<br />Mobile App
            </p>
            <p className="text-[10px] text-white/50 mt-0.5">Get easy in another way</p>
            <button className="mt-3 w-full bg-[#E8692A] hover:bg-[#52B788] text-white text-xs font-semibold py-2 rounded-xl transition-colors">
              Download
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
