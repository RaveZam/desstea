"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mar 1", revenue: 7200 },
  { day: "Mar 5", revenue: 8400 },
  { day: "Mar 10", revenue: 9100 },
  { day: "Mar 15", revenue: 7800 },
  { day: "Mar 20", revenue: 11200 },
  { day: "Mar 25", revenue: 10400 },
  { day: "Mar 30", revenue: 12600 },
];

const formatRevenue = (value: number) => `₱${(value / 1000).toFixed(0)}K`;

export default function SalesChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Sales Revenue</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Total:{" "}
            <span className="font-semibold text-[#6B4F3A]">₱66,700</span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B4F3A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6B4F3A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3E8E2" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRevenue}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatRevenue(value), "Revenue"]}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 16px rgba(107,79,58,0.15)",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6B4F3A"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ r: 3.5, fill: "#6B4F3A", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#E8692A", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
