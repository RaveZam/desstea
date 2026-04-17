import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/database";
import { CompletedOrder, DbOrderItem, DbAddon } from "../types";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useReports() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const today = startOfDay(new Date());
  const isToday = isSameDay(selectedDate, today);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate((d) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    if (isToday) return;
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });
  }, [isToday]);

  const loadOrders = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d2 = String(date.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d2}`;

      const rawOrders = await db.getAllAsync<{
        id: string;
        customer_name: string | null;
        total: number;
        payment_method: string;
        ordered_at: string;
        cash_tendered: number | null;
        cash_change: number | null;
      }>(
        `SELECT id, customer_name, total, payment_method, ordered_at, cash_tendered, cash_change
         FROM orders WHERE date(ordered_at, 'localtime') = ? ORDER BY ordered_at DESC`,
        [dateStr]
      );

      if (rawOrders.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = rawOrders.map((o) => o.id);
      const placeholders = orderIds.map(() => "?").join(",");
      const pendingRows = await db.getAllAsync<{ record_id: string }>(
        `SELECT record_id FROM outbox WHERE table_name = 'orders' AND status = 'pending' AND record_id IN (${placeholders})`,
        orderIds
      );
      const pendingSet = new Set(pendingRows.map((r) => r.record_id));

      const completed: CompletedOrder[] = [];

      for (const raw of rawOrders) {
        const rawItems = await db.getAllAsync<{
          id: string;
          product_name_snapshot: string;
          size_label_snapshot: string | null;
          quantity: number;
          unit_price_snapshot: number;
          total_price: number;
        }>(
          `SELECT id, product_name_snapshot, size_label_snapshot, quantity, unit_price_snapshot, total_price
           FROM order_items WHERE order_id = ?`,
          [raw.id]
        );

        const items: DbOrderItem[] = [];
        for (const ri of rawItems) {
          const addons = await db.getAllAsync<DbAddon>(
            `SELECT id, addon_name_snapshot, price_modifier_snapshot, quantity
             FROM order_item_addons WHERE order_item_id = ?`,
            [ri.id]
          );
          items.push({ ...ri, addons });
        }

        completed.push({
          id: raw.id,
          customerName: raw.customer_name ?? "Guest",
          paymentMethod: raw.payment_method as "Cash" | "GCash",
          total: raw.total,
          cashTendered: raw.cash_tendered,
          cashChange: raw.cash_change,
          completedAt: new Date(raw.ordered_at),
          items,
          syncStatus: pendingSet.has(raw.id) ? "pending" : "synced",
        });
      }

      setOrders(completed);
    } catch (err) {
      console.error("[reports] failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(selectedDate);
  }, [selectedDate, loadOrders]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    selectedDate,
    isToday,
    goToPreviousDay,
    goToNextDay,
    orders,
    loading,
    totalRevenue,
    orderCount,
    averageOrderValue,
    refresh: () => loadOrders(selectedDate),
  };
}
