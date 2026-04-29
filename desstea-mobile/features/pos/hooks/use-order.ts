import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { setOrder, getShouldReset, clearResetFlag } from "../../../store";
import {
  LocalProduct,
  LocalCombo,
  ProductCustomization,
  ComboSlotSelection,
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

  const addToOrder = (product: LocalProduct, customization?: ProductCustomization, categoryLabel?: string) => {
    const newItem: OrderItem = { itemType: "product", product, quantity: 1, customization, categoryLabel };
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

  const addComboToOrder = (combo: LocalCombo, selections: ComboSlotSelection[] = []) => {
    const proxyProduct: LocalProduct = {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      base_price: combo.price,
      category_id: "__combos__",
      has_sizes: 0,
      has_sugar_level: 0,
      is_available: 1,
      addon_group_id: null,
    };
    const newItem: OrderItem = {
      itemType: "combo",
      product: proxyProduct,
      combo,
      comboSelections: selections,
      quantity: 1,
      categoryLabel: "C",
    };
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

  const total = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

  const commitOrder = () => {
    setOrder(orderItems);
  };

  return {
    orderItems,
    addToOrder,
    addComboToOrder,
    updateQuantity,
    total,
    commitOrder,
  };
}
