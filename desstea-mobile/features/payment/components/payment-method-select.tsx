import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const GREEN = "#2A7D4F";
const GREEN_LIGHT = "#E8F5EE";
const GCASH_BLUE = "#0068FF";
const GCASH_LIGHT = "#EEF5FF";

type Props = {
  onSelectCash: () => void;
  onSelectGcash: () => void;
};

export function PaymentMethodSelect({ onSelectCash, onSelectGcash }: Props) {
  return (
    <View style={[styles.phaseWrap, styles.phaseCentered]}>
      <Text style={styles.phaseTitle}>Payment Method</Text>
      <Text style={styles.phaseSubtitle}>How will the customer pay?</Text>

      <View style={styles.methodRow}>
        <TouchableOpacity
          style={[styles.methodCard, { borderColor: GREEN }]}
          onPress={onSelectCash}
          activeOpacity={0.85}
        >
          <View style={[styles.methodIconWrap, { backgroundColor: GREEN_LIGHT }]}>
            <Ionicons name="cash-outline" size={38} color={GREEN} />
          </View>
          <Text style={[styles.methodLabel, { color: GREEN }]}>Cash</Text>
          <Text style={styles.methodSub}>Physical currency</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, { borderColor: GCASH_BLUE }]}
          onPress={onSelectGcash}
          activeOpacity={0.85}
        >
          <View style={[styles.methodIconWrap, { backgroundColor: GCASH_LIGHT }]}>
            <Ionicons name="phone-portrait-outline" size={38} color={GCASH_BLUE} />
          </View>
          <Text style={[styles.methodLabel, { color: GCASH_BLUE }]}>GCash</Text>
          <Text style={styles.methodSub}>Mobile payment</Text>
        </TouchableOpacity>
      </View>
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
  phaseSubtitle: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginTop: 4,
    marginBottom: 28,
    textAlign: "center",
  },
  methodRow: {
    flexDirection: "row",
    gap: 14,
  },
  methodCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  methodIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  methodLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  methodSub: {
    fontSize: 12,
    color: GRAY_TEXT,
  },
});
