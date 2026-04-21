import type { BranchOverview } from "../services/dashboardService";

type Props = { branches: BranchOverview[] };

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`;
  return `₱${n.toFixed(0)}`;
}

export default function TopBranchesCard({ branches }: Props) {
  const maxRevenue = branches[0]?.revenue ?? 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4" style={{ border: "1px solid #F5EDE7" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Branch Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">Revenue per location · selected period</p>
        </div>
      </div>

      <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${branches.length}, 1fr)` }}>
        {branches.map((branch, i) => {
          const aov = branch.orders > 0 ? Math.round(Number(branch.revenue) / Number(branch.orders)) : 0;
          const pct = (Number(branch.revenue) / Number(maxRevenue)) * 100;
          const isUp = branch.trend !== null && branch.trend > 0;

          return (
            <div key={branch.branch_name} className={`flex flex-col gap-2.5 ${i === 0 ? "pr-4" : "px-4"}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-300 tabular-nums w-3 shrink-0">{i + 1}</span>
                <span className="text-sm font-semibold text-gray-800 truncate">{branch.branch_name}</span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  {formatRevenue(Number(branch.revenue))}
                </span>
                {branch.trend !== null && (
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {isUp ? "↑" : "↓"} {Math.abs(branch.trend)}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="font-medium text-gray-600">{Number(branch.orders).toLocaleString()} orders</span>
                <span>·</span>
                <span>₱{aov.toLocaleString()} avg</span>
              </div>

              {branch.top_product && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#C9A84C]">★</span>
                  <span className="text-xs text-gray-500 truncate">{branch.top_product}</span>
                </div>
              )}

              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: i === 0
                      ? "linear-gradient(90deg, #E8692A, #F4A261)"
                      : "linear-gradient(90deg, #6B4F3A, #A07858)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
