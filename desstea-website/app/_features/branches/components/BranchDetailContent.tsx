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
  rangeLabel: string;
}

export default function BranchDetailContent({
  branch,
  data,
  periodLabel,
  rangeLabel,
}: BranchDetailContentProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function handleOrderClick(id: string) {
    const order = await fetchOrderById(id);
    setSelectedOrder(order);
  }

  return (
    <>
      <div className="h-full overflow-y-auto flex flex-col px-5 py-3 gap-4">
        {/* Header */}
        <div className="shrink-0 fade-up fade-up-1">
          <BranchDetailHeader
            branch={branch}
            onEdit={() => setEditOpen(true)}
          />
        </div>

        {/* KPI Cards */}
        <div className="shrink-0 fade-up fade-up-2">
          <BranchStatCards kpis={data.kpis} periodLabel={periodLabel} />
        </div>

        {/* Charts row */}
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 fade-up fade-up-3 overflow-hidden lg:h-[380px]">
          <BranchSalesChart salesByDay={data.salesByDay} rangeLabel={rangeLabel} />
          <OrderStatusChart topCategories={data.topCategories} />
        </div>

        {/* Bottom row */}
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 fade-up fade-up-4">
          <BranchTopProducts products={data.topProducts} />
          <BranchRecentOrders orders={data.recentOrders} onOrderClick={handleOrderClick} />
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
