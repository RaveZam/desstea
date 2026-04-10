// In-memory store to pass order data between POS screen and payment screen
import { OrderItem } from "./features/pos/data/products";
import { CompletedOrder } from "./features/reports/types";

export type { OrderItem };

let _order: OrderItem[] = [];
let _shouldReset = false;
let _customerName = "";
let _salesHistory: CompletedOrder[] = [];
let _orderCounter = 0;

export function setOrder(items: OrderItem[]): void {
  _order = [...items];
  _shouldReset = false;
}

export function getOrder(): OrderItem[] {
  return _order;
}

export type CompleteOrderParams = {
  paymentMethod: "Cash" | "GCash";
  subtotal: number;
  tax: number;
  total: number;
  cashAmount?: number;
  change?: number;
};

export function completeOrder(params: CompleteOrderParams): void {
  _orderCounter += 1;
  const order: CompletedOrder = {
    id: `ORD-${String(_orderCounter).padStart(3, "0")}`,
    orderNumber: _orderCounter,
    items: [..._order],
    customerName: _customerName,
    paymentMethod: params.paymentMethod,
    subtotal: params.subtotal,
    tax: params.tax,
    total: params.total,
    cashAmount: params.cashAmount,
    change: params.change,
    completedAt: new Date(),
  };
  _salesHistory.push(order);
  _order = [];
  _shouldReset = true;
  _customerName = "";
}

export function getSalesHistory(): CompletedOrder[] {
  return _salesHistory;
}

export function getOrderById(id: string): CompletedOrder | undefined {
  return _salesHistory.find((o) => o.id === id);
}

export function getShouldReset(): boolean {
  return _shouldReset;
}

export function clearResetFlag(): void {
  _shouldReset = false;
}

export function setCustomerName(name: string): void {
  _customerName = name;
}

export function getCustomerName(): string {
  return _customerName;
}
