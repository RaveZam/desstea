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
import { salesData } from "../data/mock-data";


const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 4px 24px rgba(107,79,58,0.13)",
        border: "1px solid #F2EBE5",
      }}
    >
      <p style={{ fontSize: 10, color: "#B0A090", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#6B4F3A", lineHeight: 1 }}>
        ₱{(payload[0].value / 1000).toFixed(1)}K
      </p>
    </div>
  );
};

export default function SalesChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 h-full flex flex-col" style={{ border: "1px solid #F5EDE7" }}>
      {/* Header */}
      <div className="shrink-0 flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">Sales Revenue</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-gray-900">₱66,700</span>
            <span className="text-sm font-semibold text-emerald-500 flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              12.5% vs last month
            </span>
          </div>
        </div>
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
          Mar 2026
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4895A" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#C4895A" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#EDE0D8"
              strokeWidth={1}
              strokeDasharray="0"
            />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#B0A090" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 12, fill: "#B0A090" }}
              axisLine={false}
              tickLine={false}
              width={46}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4B8A8", strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8B5E3C"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#E8692A", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
