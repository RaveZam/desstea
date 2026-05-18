import { useState } from "react";
import { getOrder, completeOrder, setCustomerName } from "../../../store";
import { getItemPrice } from "../../pos/types";

import { saveOrderLocally, uuidv4 } from "../../outbox/services/save-order";
import { processOutbox } from "../../outbox/services/outbox-sync";
import { supabase } from "@/lib/supabase";
import type { OrderType } from "../components/name-input";

export type Phase = "name-input" | "select" | "cash-numpad" | "cash-confirmed" | "gcash-wait";

const NUMPAD_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

export function usePayment() {
  const orderItems = getOrder();
  const total = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

  const [orderId] = useState(() => uuidv4());
  const [phase, setPhase] = useState<Phase>("name-input");
  const [cashInput, setCashInput] = useState("");
  const [customerName, setCustomerNameState] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [deliveryFee, setDeliveryFee] = useState(0);

  const effectiveDeliveryFee = orderType === "delivery" ? deliveryFee : 0;
  const cashAmount = parseFloat(cashInput) || 0;
  const finalTotal = Math.max(0, total - discountAmount) + effectiveDeliveryFee;
  const change = cashAmount - finalTotal;
  const canConfirm = cashAmount >= finalTotal && cashInput !== "";

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
      setCashInput((p) => p + key);
    }
  };

  const handleComplete = async () => {
    const paymentMethod = phase === "cash-confirmed" ? "Cash" : "GCash";
    const isCash = phase === "cash-confirmed";

    const { data: sessionData } = await supabase.auth.getSession();
    const branchId =
      sessionData?.session?.user?.user_metadata?.branch_id ?? "";

    await saveOrderLocally({
      orderId,
      orderItems,
      customerName,
      paymentMethod,
      total: finalTotal,
      cashTendered: isCash ? cashAmount : undefined,
      branchId,
      discountAmount,
      discountReason,
      orderType,
      deliveryFee: effectiveDeliveryFee,
    });

    completeOrder();

    processOutbox().catch((err) =>
      console.error("[outbox] post-payment sync failed", err)
    );
  };

  const goBackToName = () => setPhase("name-input");
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
    orderId,
    orderItems,
    subtotal: total,
    total: finalTotal,
    phase,
    cashInput,
    cashAmount,
    change,
    canConfirm,
    numpadKeys: NUMPAD_KEYS,
    customerName,
    setCustomerName: setCustomerNameState,
    confirmName,
    goBackToName,
    addBill,
    handleNumpad,
    handleComplete,
    selectCash,
    selectGcash,
    confirmCash,
    changePaymentMethod,
    discountAmount,
    discountReason,
    setDiscountAmount,
    setDiscountReason,
    orderType,
    setOrderType,
    deliveryFee: effectiveDeliveryFee,
    setDeliveryFee,
  };
}
