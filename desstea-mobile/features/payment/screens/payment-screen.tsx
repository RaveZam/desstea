import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { usePayment } from "../hooks/use-payment";
import { usePrinter } from "../../printer/hooks/use-printer";
import { getCustomerName } from "../../../store";
import { OrderSummaryPanel } from "../components/order-summary-panel";
import { PaymentMethodSelect } from "../components/payment-method-select";
import { CashNumpad } from "../components/cash-numpad";
import { CashConfirmed } from "../components/cash-confirmed";
import { GcashWait } from "../components/gcash-wait";
import { NameInput } from "../components/name-input";

const GRAY_BG = "#F5F5F7";
const WHITE = "#FFFFFF";

export default function PaymentScreen() {
  const {
    orderItems,
    total,
    phase,
    cashInput,
    cashAmount,
    change,
    canConfirm,
    numpadKeys,
    addBill,
    customerName,
    setCustomerName,
    confirmName,
    handleNumpad,
    handleComplete,
    selectCash,
    selectGcash,
    confirmCash,
    changePaymentMethod,
  } = usePayment();

  const { printReceipt } = usePrinter();

  const handlePrintReceipt = (paymentMethod: "Cash" | "GCash") => {
    printReceipt({
      customerName: getCustomerName(),
      paymentMethod,
      items: orderItems,
      total,
      cashTendered: paymentMethod === "Cash" ? cashAmount : undefined,
      change: paymentMethod === "Cash" ? change : undefined,
    });
  };

  const renderPhase = () => {
    switch (phase) {
      case "name-input":
        return (
          <NameInput
            customerName={customerName}
            onChangeName={setCustomerName}
            onConfirm={confirmName}
          />
        );
      case "select":
        return (
          <PaymentMethodSelect
            onSelectCash={selectCash}
            onSelectGcash={selectGcash}
          />
        );
      case "cash-numpad":
        return (
          <CashNumpad
            cashInput={cashInput}
            cashAmount={cashAmount}
            total={total}
            canConfirm={canConfirm}
            numpadKeys={numpadKeys}
            onNumpad={handleNumpad}
            onAddBill={addBill}
            onConfirm={confirmCash}
            onChangeMethod={changePaymentMethod}
          />
        );
      case "cash-confirmed":
        return (
          <CashConfirmed
            cashAmount={cashAmount}
            total={total}
            change={change}
            onComplete={handleComplete}
            onPrintReceipt={() => handlePrintReceipt("Cash")}
          />
        );
      case "gcash-wait":
        return (
          <GcashWait
            total={total}
            onComplete={handleComplete}
            onChangeMethod={changePaymentMethod}
            onPrintReceipt={() => handlePrintReceipt("GCash")}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mainRow}>
        <OrderSummaryPanel
          orderItems={orderItems}
          total={total}
        />
        <View style={styles.rightPanel}>{renderPhase()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
  },
  rightPanel: {
    width: 360,
    backgroundColor: GRAY_BG,
  },
});
