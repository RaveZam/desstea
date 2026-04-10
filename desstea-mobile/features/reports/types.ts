import { OrderItem } from "../../store";

export type CompletedOrder = {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  customerName: string;
  paymentMethod: "Cash" | "GCash";
  subtotal: number;
  tax: number;
  total: number;
  cashAmount?: number;
  change?: number;
  completedAt: Date;
};
