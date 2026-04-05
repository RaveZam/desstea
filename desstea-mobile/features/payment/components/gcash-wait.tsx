import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const GCASH_BLUE = "#0068FF";

type Props = {
  total: number;
  onComplete: () => void;
  onChangeMethod: () => void;
};

export function GcashWait({ total, onComplete, onChangeMethod }: Props) {
  return (
    <View style={[styles.phaseWrap, styles.phaseCentered]}>
      <View style={styles.bigIconCircle}>
        <Ionicons name="phone-portrait" size={42} color={WHITE} />
      </View>
      <Text style={[styles.phaseTitle, { marginTop: 14, color: GCASH_BLUE }]}>
        GCash Payment
      </Text>

      <View style={[styles.changeCard, { borderColor: "#BFDBFE" }]}>
        <Text style={styles.gcashAmount}>₱{total.toFixed(2)}</Text>
        <Text style={styles.gcashWaitText}>Waiting for payment...</Text>
        <View style={styles.dotRow}>
          <View style={[styles.dot, { backgroundColor: GCASH_BLUE }]} />
          <View style={[styles.dot, { backgroundColor: GCASH_BLUE, opacity: 0.5 }]} />
          <View style={[styles.dot, { backgroundColor: GCASH_BLUE, opacity: 0.2 }]} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: GCASH_BLUE }]}
        onPress={onComplete}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Complete</Text>
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
    backgroundColor: GCASH_BLUE,
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
  gcashAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: DARK_TEXT,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  gcashWaitText: {
    fontSize: 15,
    color: GRAY_TEXT,
    textAlign: "center",
    marginTop: 4,
  },
  dotRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
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
