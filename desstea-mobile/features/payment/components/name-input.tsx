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

type Props = {
  customerName: string;
  onChangeName: (name: string) => void;
  onConfirm: () => void;
};

export function NameInput({ customerName, onChangeName, onConfirm }: Props) {
  const canContinue = customerName.trim().length > 0;

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
