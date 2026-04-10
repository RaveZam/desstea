import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#E8692A";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const GREEN = "#2A7D4F";

type Props = {
  cashAmount: number;
  total: number;
  change: number;
  onComplete: () => void;
  onPrintReceipt: () => void;
};

export function CashConfirmed({ cashAmount, total, change, onComplete, onPrintReceipt }: Props) {
  return (
    <View style={[styles.phaseWrap, styles.phaseCentered]}>
      <View style={styles.bigIconCircle}>
        <Ionicons name="checkmark" size={48} color={WHITE} />
      </View>
      <Text style={[styles.phaseTitle, { marginTop: 14 }]}>Payment Confirmed</Text>

      <View style={styles.changeCard}>
        <View style={styles.changeRow}>
          <Text style={styles.changeLabel}>Amount Paid</Text>
          <Text style={styles.changeAmt}>₱{cashAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.changeRow}>
          <Text style={styles.changeLabel}>Total</Text>
          <Text style={styles.changeAmt}>₱{total.toFixed(2)}</Text>
        </View>
        <View style={styles.changeDivider} />
        <View style={styles.changeRow}>
          <Text style={styles.changeLabelBig}>Change</Text>
          <Text style={styles.changeAmtBig}>₱{change.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onComplete} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Complete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.printBtn} onPress={onPrintReceipt} activeOpacity={0.8}>
        <Ionicons name="print-outline" size={16} color={ORANGE} />
        <Text style={styles.printBtnText}>Print Receipt</Text>
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
  phaseCentered: {
    justifyContent: "center",
  },
  phaseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DARK_TEXT,
    textAlign: "center",
  },
  bigIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  changeCard: {
    width: "100%",
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  changeAmt: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  changeDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 2,
  },
  changeLabelBig: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  changeAmtBig: {
    fontSize: 28,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: -0.5,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  printBtnText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: "600",
  },
});
