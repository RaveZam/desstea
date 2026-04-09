"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { branchRevenueData } from "../data/mock-data";

const formatRevenue = (v: number) => `₱${(v / 1000).toFixed(0)}K`;

export default function BranchComparisonChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Daily Revenue by Branch</h3>
        <p className="text-xs text-gray-400 mt-0.5">Active branches only</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={branchRevenueData}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3E8E2" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatRevenue}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [formatRevenue(v as number), "Revenue"]}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 16px rgba(107,79,58,0.15)",
              fontSize: 13,
            }}
            cursor={{ fill: "#F2EBE5" }}
          />
          <Bar dataKey="revenue" fill="#6B4F3A" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
