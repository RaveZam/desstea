import type { BranchWithStats } from "../data/mock-data";
import type { Branch } from "../../../_types";

const UpArrow = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

interface BranchStatCardsProps {
  branch: Branch | BranchWithStats;
}

function getStats(branch: Branch | BranchWithStats) {
  const b = branch as BranchWithStats;
  return {
    dailyRevenue: b.dailyRevenue ?? 0,
    ordersToday: b.ordersToday ?? 0,
    itemsSold: b.itemsSold ?? 0,
  };
}

export default function BranchStatCards({ branch }: BranchStatCardsProps) {
  const { dailyRevenue, ordersToday, itemsSold } = getStats(branch);
  const avgOrderValue = ordersToday > 0 ? Math.round(dailyRevenue / ordersToday) : 0;

  const cards = [
    {
      label: "Today's Revenue",
      value: dailyRevenue > 0 ? `₱${dailyRevenue.toLocaleString()}` : "—",
      change: "+8.2%",
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
      label: "Orders Today",
      value: ordersToday > 0 ? ordersToday.toString() : "—",
      change: "+5.1%",
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
      label: "Avg Order Value",
      value: avgOrderValue > 0 ? `₱${avgOrderValue.toLocaleString()}` : "—",
      change: "-1.4%",
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
      label: "Items Sold",
      value: itemsSold > 0 ? itemsSold.toString() : "—",
      change: "+12.3%",
      favorable: true,
      dark: false,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13" />
          <circle cx="9" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => {
        const isPositive = card.change.startsWith("+");
        const trendColor = card.dark
          ? card.favorable ? "text-emerald-300" : "text-red-300"
          : card.favorable ? "text-emerald-600" : "text-red-500";

        return (
          <div
            key={card.label}
            className={`rounded-2xl p-4 relative overflow-hidden ${
              card.dark ? "text-white" : "bg-white shadow-sm"
            }`}
            style={card.dark ? { background: "linear-gradient(135deg, #6B4F3A 0%, #4E3628 100%)" } : {}}
          >
            {card.dark && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 90% 10%, rgba(232,105,42,0.35) 0%, transparent 60%)" }}
              />
            )}
            <div className="relative flex items-start justify-between mb-3">
              <p className={`text-xs font-medium leading-snug max-w-[70%] ${card.dark ? "text-white/65" : "text-gray-500"}`}>
                {card.label}
              </p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${card.dark ? "bg-white/15" : "bg-[#F2EBE5]"}`}>
                <span className={card.dark ? "text-white/80" : "text-[#6B4F3A]"}>{card.icon}</span>
              </div>
            </div>
            <p className={`relative text-2xl font-semibold tracking-tight mb-2 ${card.dark ? "text-white" : "text-gray-900"}`}>
              {card.value}
            </p>
            <span className={`relative flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              {isPositive ? <UpArrow /> : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
              {card.change} vs yesterday
            </span>
          </div>
        );
      })}
    </div>
  );
}
