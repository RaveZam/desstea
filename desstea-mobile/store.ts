// In-memory store to pass order data between POS screen and payment screen
import { OrderItem } from "./features/pos/types";

export type { OrderItem };

let _order: OrderItem[] = [];
let _shouldReset = false;
let _customerName = "";

export function setOrder(items: OrderItem[]): void {
  _order = [...items];
  _shouldReset = false;
}

export function getOrder(): OrderItem[] {
  return _order;
}

export function completeOrder(): void {
  _order = [];
  _shouldReset = true;
  _customerName = "";
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
