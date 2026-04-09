import type { Branch, BranchStatus } from "../../../_types";
import { mockOrders } from "../../orders/data/mock-data";

export interface BranchWithStats extends Branch {
  dailyRevenue: number;
  ordersToday: number;
  topProduct: string;
  staffCount: number;
}

export const mockBranches: BranchWithStats[] = [
  {
    id: "br-1",
    name: "Ipil, Echague",
    address: "Ipil, Echague, Isabela",
    contact: "+63 78 123-4001",
    operatingHours: "9:00 AM – 8:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 18500,
    ordersToday: 62,
    topProduct: "Classic Milk Tea",
    staffCount: 5,
  },
  {
    id: "br-2",
    name: "Cabugao, Echague",
    address: "Cabugao, Echague, Isabela",
    contact: "+63 78 123-4002",
    operatingHours: "9:00 AM – 8:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 15200,
    ordersToday: 49,
    topProduct: "Brown Sugar Boba",
    staffCount: 4,
  },
  {
    id: "br-3",
    name: "Santiago City",
    address: "Santiago City, Isabela",
    contact: "+63 78 123-4003",
    operatingHours: "9:00 AM – 9:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 22300,
    ordersToday: 74,
    topProduct: "Matcha Latte",
    staffCount: 6,
  },
  {
    id: "br-4",
    name: "Cauayan City",
    address: "Cauayan City, Isabela",
    contact: "+63 78 123-4004",
    operatingHours: "9:00 AM – 9:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 19800,
    ordersToday: 65,
    topProduct: "Taro Tea",
    staffCount: 5,
  },
];

export const branchRevenueData = mockBranches
  .filter((b) => b.dailyRevenue > 0)
  .map((b) => ({ name: b.name, revenue: b.dailyRevenue }))
  .sort((a, b) => b.revenue - a.revenue);

// ── Branch Detail Helpers ─────────────────────────────────────

export function getBranchById(id: string): BranchWithStats | undefined {
  return mockBranches.find((b) => b.id === id);
}

// Simple deterministic pseudo-random based on seed string
function seededRand(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0;
  h = (Math.imul(h ^ index, 0x119de1f3)) | 0;
  return Math.abs(h) / 2147483647;
}

export type SalesPeriod = "today" | "week" | "month";

export function getBranchSalesData(branchId: string, period: SalesPeriod) {
  const branch = getBranchById(branchId);
  const base = branch ? branch.dailyRevenue : 10000;

  if (period === "today") {
    const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm"];
    return hours.map((hour, i) => ({
      label: hour,
      revenue: Math.round(base * 0.06 * (0.6 + seededRand(branchId + "today", i) * 0.8)),
    }));
  }

  if (period === "week") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      label: day,
      revenue: Math.round(base * (0.7 + seededRand(branchId + "week", i) * 0.6)),
    }));
  }

  // month
  const days = Array.from({ length: 30 }, (_, i) => `Apr ${i + 1}`);
  return days.map((day, i) => ({
    label: day,
    revenue: Math.round(base * (0.6 + seededRand(branchId + "month", i) * 0.8)),
  }));
}

export function getBranchOrderStatus(branchId: string) {
  const branch = getBranchById(branchId);
  const total = branch ? branch.ordersToday : 0;
  if (total === 0) return [
    { name: "Completed", value: 0, color: "#6B4F3A" },
    { name: "Pending", value: 0, color: "#E8692A" },
    { name: "Cancelled", value: 0, color: "#D1CBC5" },
    { name: "Refunded", value: 0, color: "#EF4444" },
  ];
  const completed = Math.round(total * 0.68);
  const pending = Math.round(total * 0.2);
  const cancelled = Math.round(total * 0.08);
  const refunded = total - completed - pending - cancelled;
  return [
    { name: "Completed", value: completed, color: "#6B4F3A" },
    { name: "Pending", value: pending, color: "#E8692A" },
    { name: "Cancelled", value: cancelled, color: "#D1CBC5" },
    { name: "Refunded", value: Math.max(0, refunded), color: "#EF4444" },
  ];
}

const ALL_PRODUCTS = [
  "Classic Milk Tea",
  "Matcha Latte",
  "Brown Sugar Boba",
  "Taro Tea",
  "Wintermelon Tea",
  "Ube Milk Tea",
  "Okinawa Milk Tea",
  "Tiger Milk Tea",
];

export function getBranchTopProducts(branchId: string) {
  // Aggregate from real orders
  const revenueMap: Record<string, number> = {};
  for (const order of mockOrders) {
    if (order.branchId !== branchId) continue;
    for (const item of order.items) {
      revenueMap[item.productName] = (revenueMap[item.productName] ?? 0) + item.lineTotal;
    }
  }

  // Supplement with generated data so there are always 5 products
  const branch = getBranchById(branchId);
  const base = branch ? branch.dailyRevenue : 5000;
  ALL_PRODUCTS.forEach((name, i) => {
    if (!(name in revenueMap)) {
      revenueMap[name] = Math.round(base * (0.4 + seededRand(branchId + name, i) * 0.4));
    } else {
      // Scale up real values so they look meaningful
      revenueMap[name] = revenueMap[name] * 80 + Math.round(base * 0.2);
    }
  });

  return Object.entries(revenueMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function getBranchRecentOrders(branchId: string) {
  return mockOrders
    .filter((o) => o.branchId === branchId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}
