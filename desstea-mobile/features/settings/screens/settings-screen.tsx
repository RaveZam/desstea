import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GRAY_BG = "#F5F5F7";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const BRAND = "#6B4F3A";

interface SettingsScreenProps {
  sessionId: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={BRAND} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function SettingsScreen({ sessionId }: SettingsScreenProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Settings</Text>

      <Section icon="person-sharp" title="Account">
        <InfoRow label="Name" value="Micheal Aurelio Pogi" />
        <View style={styles.divider} />
        <InfoRow label="Role" value="Cashier" />
        <View style={styles.divider} />
        <InfoRow label="Branch" value="Main Branch" />
      </Section>

      <Section icon="key-sharp" title="Session">
        <InfoRow label="Session ID" value={sessionId} />
      </Section>

      <Section icon="print-sharp" title="Printer">
        <InfoRow label="Bluetooth Printer" value="Not connected" />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: DARK_TEXT,
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});
