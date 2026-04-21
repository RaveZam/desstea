import type { BranchOverview } from "../services/dashboardService";

type Props = { branches: BranchOverview[] };

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₱${(n / 1_000).toFixed(1)}K`;
  return `₱${n.toFixed(0)}`;
}

const RANK_STYLES = [
  {
    crown: "#C9A84C",
    accentLine: "linear-gradient(90deg, #B8922A, #E0C060)",
    cardBg: "linear-gradient(145deg, #FFFDF0 0%, #FBF5D0 100%)",
    cardBorder: "#EAD98A",
    cardShadow:
      "0 1px 3px rgba(180,150,30,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    badgeBg: "rgba(180,150,30,0.12)",
    badgeColor: "#9A7A1A",
    barTrack: "rgba(180,150,30,0.12)",
    barFill: "linear-gradient(90deg, #B8922A, #E0C060)",
    barGlow: "0 0 6px rgba(180,150,30,0.35)",
  },
  {
    crown: "#A0AAB4",
    accentLine: "linear-gradient(90deg, #8E9BAA, #C2CDD6)",
    cardBg: "linear-gradient(145deg, #F8F9FA 0%, #F1F3F5 100%)",
    cardBorder: "#DDE1E6",
    cardShadow:
      "0 1px 3px rgba(140,155,170,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    badgeBg: "rgba(140,155,170,0.12)",
    badgeColor: "#6B7A8D",
    barTrack: "rgba(140,155,170,0.12)",
    barFill: "linear-gradient(90deg, #8E9BAA, #C2CDD6)",
    barGlow: "none",
  },
  {
    crown: "#B87333",
    accentLine: "linear-gradient(90deg, #A0522D, #CD853F)",
    cardBg: "linear-gradient(145deg, #FBF6F1 0%, #F5EDE3 100%)",
    cardBorder: "#E8D5C0",
    cardShadow:
      "0 1px 3px rgba(160,82,45,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    badgeBg: "rgba(160,82,45,0.1)",
    badgeColor: "#A0522D",
    barTrack: "rgba(160,82,45,0.1)",
    barFill: "linear-gradient(90deg, #A0522D, #CD853F)",
    barGlow: "none",
  },
] as const;

const DEFAULT_STYLE = {
  crown: null,
  accentLine: null,
  cardBg: "#FAFAF9",
  cardBorder: "#F0EEEC",
  cardShadow: "0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
  badgeBg: "rgba(0,0,0,0.05)",
  badgeColor: "#9CA3AF",
  barTrack: "rgba(0,0,0,0.06)",
  barFill: "linear-gradient(90deg, #6B4F3A, #A07858)",
  barGlow: "none",
};

export default function TopBranchesCard({ branches }: Props) {
  const maxRevenue = branches[0]?.revenue ?? 1;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-4"
      style={{ border: "1px solid #F5EDE7" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Branch Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Revenue per location · selected period
          </p>
        </div>
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: branches.length > 3 ? "420px" : undefined }}
      >
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {branches.map((branch, i) => {
            const aov =
              branch.orders > 0
                ? Math.round(Number(branch.revenue) / Number(branch.orders))
                : 0;
            const pct = (Number(branch.revenue) / Number(maxRevenue)) * 100;
            const isUp = branch.trend !== null && branch.trend > 0;
            const rank = RANK_STYLES[i] ?? DEFAULT_STYLE;

            return (
              <div
                key={branch.branch_name}
                className="flex flex-col gap-2.5 rounded-xl p-3 relative overflow-hidden transition-shadow duration-150"
                style={{
                  background: rank.cardBg,
                  border: `1px solid ${rank.cardBorder}`,
                  boxShadow: rank.cardShadow,
                }}
              >
                {rank.accentLine && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                    style={{ background: rank.accentLine }}
                  />
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-800 truncate leading-tight">
                    {branch.branch_name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="text-[10px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: rank.badgeBg,
                        color: rank.badgeColor,
                      }}
                    >
                      {i + 1}
                    </span>
                    {rank.crown && (
                      <div className="pb-1">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={rank.crown}
                        >
                          <path d="M2 19h20v2H2v-2zm2-2l2-9 4 4 2-4 2 4 4-4 2 9H4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-lg font-bold tracking-tight text-gray-900">
                    {formatRevenue(Number(branch.revenue))}
                  </span>
                  {branch.trend !== null && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                    >
                      {isUp ? "↑" : "↓"} {Math.abs(branch.trend)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="font-medium text-gray-500">
                    {Number(branch.orders).toLocaleString()}
                  </span>
                  <span>orders</span>
                  <span className="mx-0.5 opacity-40">·</span>
                  <span>₱{aov.toLocaleString()} avg</span>
                </div>

                {branch.top_product && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#C9A84C]">★</span>
                    <span className="text-[11px] text-gray-400 truncate">
                      {branch.top_product}
                    </span>
                  </div>
                )}

                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: rank.barTrack }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: rank.barFill,
                      boxShadow: rank.barGlow,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
