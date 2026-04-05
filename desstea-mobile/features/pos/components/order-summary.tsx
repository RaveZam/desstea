import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ORANGE = "#E8692A";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";

type Props = {
  subtotal: number;
  tax: number;
  total: number;
  canPay: boolean;
  onPrintTest: () => void;
  onContinueToPayment: () => void;
};

export function OrderSummary({
  subtotal,
  tax,
  total,
  canPay,
  onPrintTest,
  onContinueToPayment,
}: Props) {
  return (
    <View style={styles.orderSummary}>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>VAT (12%)</Text>
        <Text style={styles.summaryValue}>₱{tax.toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.printBtn}
        activeOpacity={0.8}
        onPress={onPrintTest}
      >
        <Text style={styles.printBtnText}>🖨️ Print Hello World</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.paymentBtn, !canPay && styles.paymentBtnDisabled]}
        activeOpacity={0.8}
        disabled={!canPay}
        onPress={onContinueToPayment}
      >
        <Text style={styles.paymentBtnText}>Continue to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  orderSummary: {
    gap: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK_TEXT,
  },
  paymentBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },
  paymentBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  paymentBtnDisabled: {
    backgroundColor: "#D6D6D6",
  },
  printBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  printBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "600",
  },
});
