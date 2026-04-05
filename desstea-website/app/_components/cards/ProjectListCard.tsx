const projects = [
  {
    name: "New Menu Design",
    due: "Due date: Apr 15, 2026",
    dot: "bg-blue-500",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    name: "Supplier Onboarding",
    due: "Due date: Apr 18, 2026",
    dot: "bg-yellow-500",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    name: "App Integration",
    due: "Due date: Apr 22, 2026",
    dot: "bg-purple-500",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,18 22,12 16,6" />
        <polyline points="8,6 2,12 8,18" />
      </svg>
    ),
  },
  {
    name: "Optimize Workflow",
    due: "Due date: May 1, 2026",
    dot: "bg-orange-500",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    name: "Staff Training",
    due: "Due date: May 5, 2026",
    dot: "bg-[#E8692A]",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export default function ProjectListCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Projects</h3>
        <button className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 font-medium px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </button>
      </div>

      <div className="space-y-2.5">
        {projects.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <div className={`w-7 h-7 ${p.dot} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate leading-tight">{p.name}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{p.due}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
