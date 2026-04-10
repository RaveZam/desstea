import { useState, useCallback } from "react";
import { getSalesHistory } from "../../../store";
import { CompletedOrder } from "../types";

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

  const allHistory = getSalesHistory();
  const orders: CompletedOrder[] = allHistory.filter((o) =>
    isSameDay(o.completedAt, selectedDate),
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    selectedDate,
    isToday,
    goToPreviousDay,
    goToNextDay,
    orders,
    totalRevenue,
    orderCount,
    averageOrderValue,
  };
}
