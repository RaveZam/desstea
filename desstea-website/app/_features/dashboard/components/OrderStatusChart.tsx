"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { orderStatusData } from "../data/mock-data";

const total = orderStatusData.reduce((sum, d) => sum + d.value, 0);

export default function OrderStatusChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col">
      <h3 className="font-semibold text-gray-900">Order Status</h3>
      <p className="text-xs text-gray-400 mt-0.5">Distribution of current orders</p>

      <div className="flex-1 flex items-center justify-center mt-1">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
            >
              {orderStatusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - 7}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#1C1C1E"
                        fontSize={20}
                        fontWeight={600}
                        fontFamily="var(--font-geist-sans), system-ui"
                      >
                        {total.toLocaleString()}
                      </text>
                      <text
                        x={cx}
                        y={cy + 13}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#9CA3AF"
                        fontSize={11}
                        fontFamily="var(--font-geist-sans), system-ui"
                      >
                        total orders
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

      <div className="space-y-1.5 mt-1">
        {orderStatusData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{entry.value.toLocaleString()}</span>
              <span className="text-gray-400 w-10 text-right">
                {((entry.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
