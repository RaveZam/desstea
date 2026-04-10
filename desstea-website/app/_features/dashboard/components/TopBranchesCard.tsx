import { topBranches } from "../data/mock-data";

const maxRevenue = topBranches[0].revenue;

export default function TopBranchesCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Branch Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">Revenue per location · past 30 days</p>
        </div>
      </div>

      {/* Branch columns */}
      <div className="grid grid-cols-4 divide-x divide-gray-100">
        {topBranches.map((branch, i) => {
          const aov = Math.round(branch.revenue / branch.orders);
          const pct = (branch.revenue / maxRevenue) * 100;
          const isUp = branch.trend > 0;

          return (
            <div key={branch.name} className={`flex flex-col gap-2.5 ${i === 0 ? "pr-4" : "px-4"}`}>
              {/* Name + rank */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-300 tabular-nums w-3 shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-gray-800 truncate">{branch.name}</span>
              </div>

              {/* Revenue + trend */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  ₱{branch.revenue.toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                    isUp
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {isUp ? "↑" : "↓"} {Math.abs(branch.trend)}%
                </span>
              </div>

              {/* Orders · AOV */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="font-medium text-gray-600">{branch.orders} orders</span>
                <span>·</span>
                <span>₱{aov} avg</span>
              </div>

              {/* Top product */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#C9A84C]">★</span>
                <span className="text-xs text-gray-500 truncate">{branch.topProduct}</span>
              </div>

              {/* Revenue bar */}
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background:
                      i === 0
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
