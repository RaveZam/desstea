"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Pagination } from "../../../_components/ui";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailPanel from "./OrderDetailPanel";
import { useOrdersRealtime } from "../hooks/use-orders-realtime";
import type { Branch, Order } from "../../../_types";

const PAGE_SIZE = 9;

interface OrdersPageContentProps {
  initialOrders: Order[];
  initialBranches: Branch[];
}

export default function OrdersPageContent({
  initialOrders,
  initialBranches,
}: OrdersPageContentProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const handleNewOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setPage(1);
  }, []);

  const { seedKnownIds } = useOrdersRealtime(initialBranches, handleNewOrder);

  useEffect(() => {
    seedKnownIds(initialOrders);
  }, [initialOrders, seedKnownIds]);

  const branchOptions = useMemo(
    () => [
      { value: "all", label: "All Branches" },
      ...initialBranches.map((b) => ({ value: b.id, label: b.name })),
    ],
    [initialBranches],
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branch === "all" || o.branchId === branch;
      return matchSearch && matchBranch;
    });
  }, [search, branch, orders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange() {
    setPage(1);
    setSelected(null);
  }

  return (
    <>
      <div
        className={`h-full flex flex-col transition-all duration-300 ${selected ? "mr-[400px]" : ""}`}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between fade-up fade-up-1 shrink-0">
          <div>
            <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
              Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View and manage all customer orders across branches.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-400">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 pb-3 fade-up fade-up-2 shrink-0">
          <OrderFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              handleFilterChange();
            }}
            branch={branch}
            onBranchChange={(v) => {
              setBranch(v);
              handleFilterChange();
            }}
            branchOptions={branchOptions}
          />
        </div>

        {/* Table — scrollable */}
        <div className="flex-1 px-5 fade-up fade-up-3">
          <OrdersTable
            orders={paginated}
            selectedId={selected?.id ?? null}
            onRowClick={(o) => setSelected(selected?.id === o.id ? null : o)}
          />
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 mb-4 flex items-center justify-between fade-up fade-up-4 shrink-0 border-t border-gray-100 bg-[#F4F6F8]">
          <p className="text-xs text-gray-400">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Slide-over detail panel */}
      <OrderDetailPanel order={selected} onClose={() => setSelected(null)} />

      {/* Overlay for closing panel */}
      {selected && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setSelected(null)}
        />
      )}
    </>
  );
}
