"use client";

import { useState } from "react";
import BranchDetailHeader from "./BranchDetailHeader";
import BranchStatCards from "./BranchStatCards";
import BranchSalesChart from "./BranchSalesChart";
import BranchTopProducts from "./BranchTopProducts";
import BranchRecentOrders from "./BranchRecentOrders";
import BranchFormModal from "./BranchFormModal";
import { OrderStatusChart } from "../../dashboard";
import OrderDetailPanel from "../../orders/components/OrderDetailPanel";
import { fetchOrderById } from "../../orders/actions/fetchOrderById";
import type { Branch, Order } from "../../../_types";
import type { BranchDetailData } from "../services/branchesService";

interface BranchDetailContentProps {
  branch: Branch;
  data: BranchDetailData;
  periodLabel: string;
}

export default function BranchDetailContent({
  branch,
  data,
  periodLabel,
}: BranchDetailContentProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function handleOrderClick(id: string) {
    const order = await fetchOrderById(id);
    setSelectedOrder(order);
  }

  return (
    <>
      <div className="px-5 py-4 space-y-3">
        {/* Header */}
        <div className="fade-up fade-up-1">
          <BranchDetailHeader
            branch={branch}
            onEdit={() => setEditOpen(true)}
          />
        </div>

        {/* KPI Cards */}
        <div className="fade-up fade-up-2">
          <BranchStatCards kpis={data.kpis} periodLabel={periodLabel} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-3 items-stretch" style={{ height: 400 }}>
          <div className="col-span-2 flex flex-col">
            <BranchSalesChart salesByDay={data.salesByDay} />
          </div>
          <div className="flex flex-col">
            <OrderStatusChart topCategories={data.topCategories} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-3 fade-up fade-up-4" style={{ height: 340 }}>
          <div className="flex flex-col">
            <BranchTopProducts products={data.topProducts} />
          </div>
          <div className="col-span-2 flex flex-col min-h-0">
            <BranchRecentOrders orders={data.recentOrders} onOrderClick={handleOrderClick} />
          </div>
        </div>
      </div>

      <BranchFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        branch={branch}
      />

      <OrderDetailPanel
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
