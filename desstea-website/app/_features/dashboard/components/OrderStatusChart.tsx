"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label, Tooltip } from "recharts";
import type { TopProduct } from "../services/dashboardService";

const COLORS = ["#6B4F3A", "#C4895A", "#E8692A", "#A07858", "#D4C4B8"];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: TopProduct }[];
}) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const revenue = Number(entry.value);
  const formatted =
    revenue >= 1_000_000
      ? `₱${(revenue / 1_000_000).toFixed(2)}M`
      : `₱${revenue.toLocaleString()}`;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 4px 24px rgba(107,79,58,0.15)",
        border: "1px solid #F2EBE5",
        pointerEvents: "none",
      }}
    >
      <p style={{ fontSize: 11, color: "#B0A090", marginBottom: 3 }}>
        {entry.payload.name}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#6B4F3A", lineHeight: 1 }}>
        {formatted}
      </p>
    </div>
  );
};

type Props = { topProducts: TopProduct[] };

export default function OrderStatusChart({ topProducts }: Props) {
  const totalRevenue = topProducts.reduce(
    (sum, d) => sum + Number(d.revenue),
    0,
  );
  const maxRevenue = topProducts[0]?.revenue ?? 1;

  const formattedTotal =
    totalRevenue >= 1_000_000
      ? `₱${(totalRevenue / 1_000_000).toFixed(1)}M`
      : `₱${(totalRevenue / 1_000).toFixed(0)}K`;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-4 h-full flex flex-col"
      style={{ border: "1px solid #F5EDE7" }}
    >
      <div className="shrink-0 mb-2">
        <h3 className="font-semibold text-gray-900 text-base">Top Products</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          Revenue share · selected period
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={topProducts}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="72%"
              dataKey="revenue"
              strokeWidth={0}
              paddingAngle={2}
              activeOuterRadiusOffset={6}
            >
              {topProducts.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="shrink-0 space-y-2 mt-1">
        {topProducts.map((entry, index) => (
          <div key={entry.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-500 truncate max-w-[110px]">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-700 shrink-0">
                {totalRevenue > 0
                  ? ((Number(entry.revenue) / totalRevenue) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(Number(entry.revenue) / Number(maxRevenue)) * 100}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
