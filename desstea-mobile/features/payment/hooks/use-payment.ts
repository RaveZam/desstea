import { useState } from "react";
import { router } from "expo-router";
import { getOrder, completeOrder, setCustomerName } from "../../../store";
import { getItemPrice } from "../../pos/types";

import { saveOrderLocally } from "../../outbox/services/save-order";
import { processOutbox } from "../../outbox/services/outbox-sync";
import { supabase } from "@/lib/supabase";

export type Phase = "name-input" | "select" | "cash-numpad" | "cash-confirmed" | "gcash-wait";

const NUMPAD_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];

export function usePayment() {
  const orderItems = getOrder();
  const total = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

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
      const digit = parseInt(key, 10);
      if (cashInput.includes(".")) {
        const dec = cashInput.split(".")[1];
        if (dec && dec.length >= 2) return;
        setCashInput((p) => p + key);
      } else {
        setCashInput((prev) => {
          const current = parseFloat(prev) || 0;
          return String(current + digit);
        });
      }
    }
  };

  const handleComplete = async () => {
    const paymentMethod = phase === "cash-confirmed" ? "Cash" : "GCash";
    const isCash = phase === "cash-confirmed";

    const { data: sessionData } = await supabase.auth.getSession();
    const branchId =
      sessionData?.session?.user?.user_metadata?.branch_id ?? "";

    await saveOrderLocally({
      orderItems,
      customerName,
      paymentMethod,
      total,
      cashTendered: isCash ? cashAmount : undefined,
      branchId,
    });

    completeOrder();

    processOutbox().catch((err) =>
      console.error("[outbox] post-payment sync failed", err)
    );

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
