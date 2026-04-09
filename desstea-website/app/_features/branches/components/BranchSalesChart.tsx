"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getBranchSalesData, type SalesPeriod } from "../data/mock-data";

const formatRevenue = (value: number) => `₱${(value / 1000).toFixed(0)}K`;

const PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

interface BranchSalesChartProps {
  branchId: string;
}

export default function BranchSalesChart({ branchId }: BranchSalesChartProps) {
  const [period, setPeriod] = useState<SalesPeriod>("week");
  const data = getBranchSalesData(branchId, period);
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Sales Revenue</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Total:{" "}
            <span className="font-semibold text-[#6B4F3A]">₱{total.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === key
                  ? "bg-[#F2EBE5] text-[#6B4F3A]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="branchRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B4F3A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6B4F3A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3E8E2" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            interval={period === "month" ? 4 : 0}
          />
          <YAxis
            tickFormatter={formatRevenue}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [formatRevenue(value as number), "Revenue"]}
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
            fill="url(#branchRevenueGradient)"
            dot={{ r: 3.5, fill: "#6B4F3A", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#E8692A", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
