import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#E8692A";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";

const BILLS: { value: number; bg: string; color: string }[] = [
  { value: 1000, bg: "#D6EEF8", color: "#1A6A9A" },
  { value: 500,  bg: "#FDF3CC", color: "#8A6E00" },
  { value: 200,  bg: "#D4EDDA", color: "#1A6B35" },
  { value: 100,  bg: "#C8D8F0", color: "#1A3A7A" },
  { value: 50,   bg: "#FADBD8", color: "#A93226" },
];

type Props = {
  cashInput: string;
  cashAmount: number;
  total: number;
  canConfirm: boolean;
  numpadKeys: string[];
  onNumpad: (key: string) => void;
  onAddBill: (bill: number) => void;
  onConfirm: () => void;
  onChangeMethod: () => void;
};

export function CashNumpad({
  cashInput,
  cashAmount,
  total,
  canConfirm,
  numpadKeys,
  onNumpad,
  onAddBill,
  onConfirm,
  onChangeMethod,
}: Props) {
  return (
    <View style={[styles.phaseWrap, styles.phaseTop]}>
      <Text style={styles.phaseTitle}>Cash Payment</Text>

      <View style={styles.amountDisplay}>
        <Text style={styles.amountLabel}>Amount Received</Text>
        <Text style={styles.amountValue}>₱ {cashInput || "0"}</Text>
        {cashAmount > 0 && cashAmount < total && (
          <Text style={styles.insufficientText}>
            Need ₱{(total - cashAmount).toFixed(2)} more
          </Text>
        )}
      </View>

      <View style={styles.billsRow}>
        {BILLS.map(({ value, bg, color }) => (
          <TouchableOpacity
            key={value}
            style={[styles.billBtn, { backgroundColor: bg }]}
            onPress={() => onAddBill(value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.billBtnText, { color }]}>₱{value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.numpadGrid}>
        {numpadKeys.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.numkey, key === "⌫" && styles.numkeyBack]}
            onPress={() => onNumpad(key)}
            activeOpacity={0.65}
          >
            {key === "⌫" ? (
              <Ionicons name="backspace-outline" size={22} color={DARK_TEXT} />
            ) : (
              <Text style={styles.numkeyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, !canConfirm && styles.primaryBtnDisabled]}
        onPress={onConfirm}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Confirm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.changeModeBtn} onPress={onChangeMethod}>
        <Text style={styles.changeModeText}>← Change payment method</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  phaseWrap: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: "center",
  },
  phaseTop: {
    justifyContent: "flex-start",
  },
  phaseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DARK_TEXT,
    textAlign: "center",
  },
  amountDisplay: {
    width: "100%",
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
    color: DARK_TEXT,
    letterSpacing: -0.5,
  },
  insufficientText: {
    fontSize: 12,
    color: "#D32F2F",
    marginTop: 4,
  },
  billsRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
    marginBottom: 12,
  },
  billBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  billBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  numpadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    marginBottom: 14,
  },
  numkey: {
    width: "31%",
    height: 52,
    backgroundColor: WHITE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  numkeyBack: {
    backgroundColor: "#FDECEA",
  },
  numkeyText: {
    fontSize: 20,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#D6D6D6",
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  changeModeBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  changeModeText: {
    fontSize: 13,
    color: GRAY_TEXT,
  },
});
