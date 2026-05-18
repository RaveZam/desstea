import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";
const GRAY_BG = "#F5F5F7";

export type OrderType = "dine_in" | "takeout" | "delivery";

type Props = {
  customerName: string;
  onChangeName: (name: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  deliveryFee: number;
  onChangeDeliveryFee: (fee: number) => void;
};

export function NameInput({
  customerName,
  onChangeName,
  onConfirm,
  disabled = false,
  orderType,
  onChangeOrderType,
  deliveryFee,
  onChangeDeliveryFee,
}: Props) {
  const canContinue = customerName.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Name</Text>
      <Text style={styles.subtitle}>Enter the customer's name for the order</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Maria Santos"
        placeholderTextColor={GRAY_TEXT}
        value={customerName}
        onChangeText={onChangeName}
        returnKeyType="done"
      />

      <Text style={styles.sectionLabel}>Order Type</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, orderType === "dine_in" && styles.toggleBtnActive]}
          onPress={() => onChangeOrderType("dine_in")}
        >
          <Text
            style={[
              styles.toggleBtnText,
              orderType === "dine_in" && styles.toggleBtnTextActive,
            ]}
          >
            Dine In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, orderType === "takeout" && styles.toggleBtnActive]}
          onPress={() => onChangeOrderType("takeout")}
        >
          <Text
            style={[
              styles.toggleBtnText,
              orderType === "takeout" && styles.toggleBtnTextActive,
            ]}
          >
            Take Out
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, orderType === "delivery" && styles.toggleBtnActive]}
          onPress={() => onChangeOrderType("delivery")}
        >
          <Text
            style={[
              styles.toggleBtnText,
              orderType === "delivery" && styles.toggleBtnTextActive,
            ]}
          >
            Delivery
          </Text>
        </TouchableOpacity>
      </View>

      {orderType === "delivery" && (
        <>
          <Text style={styles.sectionLabel}>Delivery Fee</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={GRAY_TEXT}
            value={deliveryFee > 0 ? String(deliveryFee) : ""}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9.]/g, "");
              const parts = cleaned.split(".");
              const safe = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
              onChangeDeliveryFee(parseFloat(safe) || 0);
            }}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
        onPress={onConfirm}
        disabled={!canContinue}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: GRAY_TEXT,
    marginBottom: 32,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: DARK_TEXT,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: GRAY_TEXT,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnActive: {
    borderColor: ORANGE,
    backgroundColor: "#FFF4ED",
  },
  toggleBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: GRAY_TEXT,
  },
  toggleBtnTextActive: {
    color: ORANGE,
  },
  continueBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
  },
});
