"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { topProducts } from "../data/mock-data";

const COLORS = ["#6B4F3A", "#C4895A", "#E8692A", "#A07858", "#D4C4B8"];

const totalRevenue = topProducts.reduce((sum, d) => sum + d.revenue, 0);
const maxRevenue = topProducts[0].revenue;

export default function OrderStatusChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 h-full flex flex-col" style={{ border: "1px solid #F5EDE7" }}>
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h3 className="font-semibold text-gray-900 text-base">Top Products</h3>
        <p className="text-sm text-gray-400 mt-0.5">Revenue share · past 30 days</p>
      </div>

      {/* Donut */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topProducts}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="72%"
              dataKey="revenue"
              strokeWidth={0}
              paddingAngle={2}
            >
              {topProducts.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <g>
                      <text
                        x={cx} y={cy - 8}
                        textAnchor="middle" dominantBaseline="central"
                        fill="#1C1C1E" fontSize={14} fontWeight={700}
                        fontFamily="var(--font-geist-sans), system-ui"
                      >
                        ₱{(totalRevenue / 1000).toFixed(0)}K
                      </text>
                      <text
                        x={cx} y={cy + 10}
                        textAnchor="middle" dominantBaseline="central"
                        fill="#B0A090" fontSize={10}
                        fontFamily="var(--font-geist-sans), system-ui"
                      >
                        total revenue
                      </text>
                    </g>
                  );
                }}
                position="center"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar legend */}
      <div className="shrink-0 space-y-2 mt-1">
        {topProducts.map((entry, index) => (
          <div key={entry.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-500 truncate max-w-[110px]">{entry.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700 shrink-0">
                {((entry.revenue / totalRevenue) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(entry.revenue / maxRevenue) * 100}%`,
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
