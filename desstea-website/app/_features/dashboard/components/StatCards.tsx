import type { KpiItem } from "../data/mock-data";

const kpis: KpiItem[] = [
  {
    label: "Total Sales Revenue",
    value: "₱1,245,890",
    change: "+12.5%",
    favorable: true,
    dark: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: "Total Number of Orders",
    value: "1,847",
    change: "+8.3%",
    favorable: true,
    dark: false,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Average Order Value",
    value: "₱674.50",
    change: "-2.1%",
    favorable: false,
    dark: false,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    label: "Avg Sale per Branch",
    value: "₱311,472",
    change: "+5.8%",
    favorable: true,
    dark: false,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

const UpArrow = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const DownArrow = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((kpi) => {
        const isPositive = kpi.change.startsWith("+");
        const trendColor = kpi.dark
          ? kpi.favorable
            ? "text-emerald-300"
            : "text-red-300"
          : kpi.favorable
          ? "text-emerald-600"
          : "text-red-500";

        return (
          <div
            key={kpi.label}
            className={`rounded-2xl p-3 relative overflow-hidden ${
              kpi.dark ? "text-white" : "bg-white"
            }`}
            style={
              kpi.dark
                ? { background: "linear-gradient(135deg, #6B4F3A 0%, #4E3628 100%)" }
                : { border: "1px solid #F0E8E2", boxShadow: "0 1px 4px rgba(107,79,58,0.06)" }
            }
          >
            {/* Subtle radial glow on dark card */}
            {kpi.dark && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 90% 10%, rgba(232,105,42,0.35) 0%, transparent 60%)",
                }}
              />
            )}

            <div className="relative flex items-start justify-between mb-2">
              <p className={`text-sm font-medium leading-snug max-w-[70%] ${kpi.dark ? "text-white/65" : "text-gray-500"}`}>
                {kpi.label}
              </p>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  kpi.dark ? "bg-white/15" : "bg-[#F2EBE5]"
                }`}
              >
                <span className={kpi.dark ? "text-white/80" : "text-[#6B4F3A]"}>
                  {kpi.icon}
                </span>
              </div>
            </div>

            <p className={`relative text-2xl font-semibold tracking-tight mb-1.5 ${kpi.dark ? "text-white" : "text-gray-900"}`}>
              {kpi.value}
            </p>

            <span className={`relative flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              {isPositive ? <UpArrow /> : <DownArrow />}
              {kpi.change} vs last month
            </span>
          </div>
        );
      })}
    </div>
  );
}
