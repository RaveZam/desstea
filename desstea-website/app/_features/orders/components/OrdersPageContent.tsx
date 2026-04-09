"use client";

import { useState, useMemo } from "react";
import { Pagination } from "../../../_components/ui";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailPanel from "./OrderDetailPanel";
import { mockOrders } from "../data/mock-data";
import type { Order, OrderStatus } from "../../../_types";

const PAGE_SIZE = 10;

export default function OrdersPageContent() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branch === "all" || o.branchId === branch;
      const matchStatus = status === "all" || o.status === status;
      return matchSearch && matchBranch && matchStatus;
    });
  }, [search, branch, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange() {
    setPage(1);
    setSelected(null);
  }

  return (
    <>
      <div
        className={`px-5 py-4 space-y-4 transition-all duration-300 ${selected ? "mr-[400px]" : ""}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between fade-up fade-up-1">
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
        <div className="fade-up fade-up-2">
          <OrderFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); handleFilterChange(); }}
            branch={branch}
            onBranchChange={(v) => { setBranch(v); handleFilterChange(); }}
            status={status}
            onStatusChange={(v) => { setStatus(v); handleFilterChange(); }}
          />
        </div>

        {/* Table */}
        <div className="fade-up fade-up-3">
          <OrdersTable
            orders={paginated}
            selectedId={selected?.id ?? null}
            onRowClick={(o) => setSelected(selected?.id === o.id ? null : o)}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between fade-up fade-up-4">
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

      {/* Overlay for closing panel on mobile */}
      {selected && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setSelected(null)}
        />
      )}
    </>
  );
}
