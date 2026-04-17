import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { setOrder, getShouldReset, clearResetFlag } from "../../../store";
import {
  LocalProduct,
  ProductCustomization,
  OrderItem,
  getItemKey,
  getItemPrice,
} from "../types";

export function useOrder() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (getShouldReset()) {
        setOrderItems([]);
        clearResetFlag();
      }
    }, []),
  );

  const addToOrder = (product: LocalProduct, customization?: ProductCustomization) => {
    const newItem: OrderItem = { product, quantity: 1, customization };
    const key = getItemKey(newItem);
    setOrderItems((prev) => {
      const existing = prev.find((item) => getItemKey(item) === key);
      if (existing) {
        return prev.map((item) =>
          getItemKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          getItemKey(item) === itemKey
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const commitOrder = () => {
    setOrder(orderItems);
  };

  return {
    orderItems,
    addToOrder,
    updateQuantity,
    subtotal,
    tax,
    total,
    commitOrder,
  };
}
