import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BRAND = "#6B4F3A";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";

type Props = {
  selectedDate: Date;
  isToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DateFilterBar({ selectedDate, isToday, onPrevious, onNext }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.arrowBtn} onPress={onPrevious}>
        <Ionicons name="chevron-back" size={20} color={BRAND} />
      </TouchableOpacity>

      <Text style={styles.dateText}>
        {isToday ? `Today, ${formatDate(selectedDate)}` : formatDate(selectedDate)}
      </Text>

      <TouchableOpacity
        style={[styles.arrowBtn, isToday && styles.arrowDisabled]}
        onPress={onNext}
        disabled={isToday}
      >
        <Ionicons name="chevron-forward" size={20} color={isToday ? GRAY_TEXT : BRAND} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F2EBE5",
  },
  arrowDisabled: {
    backgroundColor: "#F5F5F7",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK_TEXT,
    minWidth: 200,
    textAlign: "center",
  },
});
