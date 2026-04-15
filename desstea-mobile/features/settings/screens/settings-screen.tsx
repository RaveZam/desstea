import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const GRAY_BG = "#F5F5F7";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const BRAND = "#6B4F3A";

interface SettingsScreenProps {
  sessionId: string;
  user: User | null;
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

function formatRole(role: string | undefined): string {
  if (!role) return "—";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SettingsScreen({ sessionId, user }: SettingsScreenProps) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const meta = user?.user_metadata ?? {};
  const fullName: string = meta.full_name ?? user?.email?.split("@")[0] ?? "—";
  const email: string = user?.email ?? "—";
  const role: string = formatRole(meta.role);
  const branchId: string | undefined = meta.branch_id;

  const [branchName, setBranchName] = useState<string>("—");

  useEffect(() => {
    if (!branchId) {
      setBranchName("—");
      return;
    }
    supabase
      .from("branches")
      .select("branch_name")
      .eq("branch_id", branchId)
      .single()
      .then(({ data }) => {
        setBranchName(data?.branch_name ?? branchId);
      });
  }, [branchId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Settings</Text>

      <Section icon="person-sharp" title="Account">
        <InfoRow label="Name" value={fullName} />
        <View style={styles.divider} />
        <InfoRow label="Email" value={email} />
        <View style={styles.divider} />
        <InfoRow label="Role" value={role} />
        <View style={styles.divider} />
        <InfoRow label="Branch" value={branchName} />
      </Section>

      <Section icon="key-sharp" title="Session">
        <InfoRow label="Session ID" value={sessionId} />
      </Section>

      <Section icon="print-sharp" title="Printer">
        <InfoRow label="Bluetooth Printer" value="Not connected" />
      </Section>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={18} color="#C0392B" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#F5C6C2",
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C0392B",
  },
});
