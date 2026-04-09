import type { Branch, BranchStatus } from "../../../_types";

export interface BranchWithStats extends Branch {
  dailyRevenue: number;
  ordersToday: number;
  topProduct: string;
  staffCount: number;
}

export const mockBranches: BranchWithStats[] = [
  {
    id: "br-1",
    name: "SM North EDSA",
    address: "SM City North EDSA, Quezon City",
    contact: "+63 2 8441-1234",
    operatingHours: "10:00 AM – 9:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 42800,
    ordersToday: 138,
    topProduct: "Classic Milk Tea",
    staffCount: 8,
  },
  {
    id: "br-2",
    name: "Glorietta Makati",
    address: "Glorietta 4, Makati City",
    contact: "+63 2 8817-5678",
    operatingHours: "10:00 AM – 10:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 38500,
    ordersToday: 122,
    topProduct: "Matcha Latte",
    staffCount: 7,
  },
  {
    id: "br-3",
    name: "SM Megamall",
    address: "SM Megamall, Ortigas, Mandaluyong",
    contact: "+63 2 8636-9012",
    operatingHours: "10:00 AM – 9:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 35200,
    ordersToday: 109,
    topProduct: "Brown Sugar Boba",
    staffCount: 7,
  },
  {
    id: "br-4",
    name: "Robinsons Ermita",
    address: "Robinsons Place Manila, Ermita, Manila",
    contact: "+63 2 8525-3456",
    operatingHours: "10:00 AM – 9:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 28700,
    ordersToday: 91,
    topProduct: "Taro Tea",
    staffCount: 6,
  },
  {
    id: "br-5",
    name: "Ayala Cebu",
    address: "Ayala Center Cebu, Cebu City",
    contact: "+63 32 888-7890",
    operatingHours: "10:00 AM – 9:30 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 24300,
    ordersToday: 78,
    topProduct: "Wintermelon Tea",
    staffCount: 5,
  },
  {
    id: "br-6",
    name: "SM Seaside Cebu",
    address: "SM Seaside City, South Road Properties, Cebu City",
    contact: "+63 32 889-1234",
    operatingHours: "10:00 AM – 9:00 PM",
    status: "maintenance" as BranchStatus,
    dailyRevenue: 0,
    ordersToday: 0,
    topProduct: "Classic Milk Tea",
    staffCount: 5,
  },
  {
    id: "br-7",
    name: "Eastwood Libis",
    address: "Eastwood City, Libis, Quezon City",
    contact: "+63 2 8470-5678",
    operatingHours: "11:00 AM – 10:00 PM",
    status: "active" as BranchStatus,
    dailyRevenue: 19800,
    ordersToday: 63,
    topProduct: "Ube Milk Tea",
    staffCount: 5,
  },
  {
    id: "br-8",
    name: "Festival Mall Alabang",
    address: "Festival Supermall, Muntinlupa City",
    contact: "+63 2 8850-9012",
    operatingHours: "10:00 AM – 9:00 PM",
    status: "inactive" as BranchStatus,
    dailyRevenue: 0,
    ordersToday: 0,
    topProduct: "Matcha Latte",
    staffCount: 0,
  },
];

export const branchRevenueData = mockBranches
  .filter((b) => b.dailyRevenue > 0)
  .map((b) => ({ name: b.name, revenue: b.dailyRevenue }))
  .sort((a, b) => b.revenue - a.revenue);
