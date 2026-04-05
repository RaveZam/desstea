import { useState } from "react";
import { router } from "expo-router";
import { getOrder, completeOrder, setCustomerName } from "../../../store";
import { getItemPrice } from "../../pos/data/products";

export type Phase = "name-input" | "select" | "cash-numpad" | "cash-confirmed" | "gcash-wait";

const NUMPAD_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

export function usePayment() {
  const orderItems = getOrder();
  const subtotal = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const [phase, setPhase] = useState<Phase>("name-input");
  const [cashInput, setCashInput] = useState("");
  const [customerName, setCustomerNameState] = useState("");

  const cashAmount = parseFloat(cashInput) || 0;
  const change = cashAmount - total;
  const canConfirm = cashAmount >= total && cashInput !== "";

  const confirmName = () => {
    if (customerName.trim()) {
      setCustomerName(customerName.trim());
      setPhase("select");
    }
  };

  const addBill = (bill: number) => {
    setCashInput((prev) => {
      const current = parseFloat(prev) || 0;
      return String(current + bill);
    });
  };

  const handleNumpad = (key: string) => {
    if (key === "⌫") {
      setCashInput((p) => p.slice(0, -1));
    } else if (key === ".") {
      if (!cashInput.includes(".")) setCashInput((p) => p + ".");
    } else {
      if (cashInput.includes(".")) {
        const dec = cashInput.split(".")[1];
        if (dec && dec.length >= 2) return;
      }
      if (cashInput === "0") {
        setCashInput(key);
      } else {
        setCashInput((p) => p + key);
      }
    }
  };

  const handleComplete = () => {
    completeOrder();
    router.back();
  };

  const selectCash = () => setPhase("cash-numpad");
  const selectGcash = () => setPhase("gcash-wait");
  const confirmCash = () => {
    if (canConfirm) setPhase("cash-confirmed");
  };
  const changePaymentMethod = () => {
    setPhase("select");
    setCashInput("");
  };

  return {
    orderItems,
    subtotal,
    tax,
    total,
    phase,
    cashInput,
    cashAmount,
    change,
    canConfirm,
    numpadKeys: NUMPAD_KEYS,
    customerName,
    setCustomerName: setCustomerNameState,
    confirmName,
    addBill,
    handleNumpad,
    handleComplete,
    selectCash,
    selectGcash,
    confirmCash,
    changePaymentMethod,
  };
}
