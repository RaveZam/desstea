import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useReports } from "../hooks/use-reports";
import { DateFilterBar } from "../components/date-filter-bar";
import { OrderHistoryList } from "../components/order-history-list";
import { usePrintDailySummary } from "../../printer/hooks/use-print-daily-summary";

const GRAY_BG = "#F5F5F7";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";
const BRAND = "#6B4F3A";

export function ReportsScreen() {
  const {
    selectedDate,
    isToday,
    goToPreviousDay,
    goToNextDay,
    orders,
    loading,
    totalRevenue,
    orderCount,
    averageOrderValue,
    cancelOrder,
    toggleReceiptError,
  } = useReports();
  const { printDailySummary } = usePrintDailySummary();
  const [printing, setPrinting] = useState(false);

  const handlePrintSummary = async () => {
    setPrinting(true);
    await printDailySummary(orders, selectedDate);
    setPrinting(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <DateFilterBar
          selectedDate={selectedDate}
          isToday={isToday}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
        />
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sales</Text>
          <Text style={styles.statValue}>₱{totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Orders</Text>
          <Text style={styles.statValue}>{orderCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg. Order</Text>
          <Text style={styles.statValue}>₱{averageOrderValue.toFixed(2)}</Text>
        </View>
      </View>

      {/* Order History */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Order History</Text>
          <TouchableOpacity
            style={[styles.printButton, printing && styles.printButtonDisabled]}
            onPress={handlePrintSummary}
            disabled={printing || loading}
          >
            <Text style={styles.printButtonText}>
              {printing ? "Printing..." : "Print Summary"}
            </Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={BRAND} />
          </View>
        ) : (
          <OrderHistoryList orders={orders} onCancel={cancelOrder} onToggleFlag={toggleReceiptError} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY_TEXT,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: BRAND,
  },
  listSection: {
    flex: 1,
    gap: 12,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  printButton: {
    backgroundColor: BRAND,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  printButtonDisabled: {
    opacity: 0.5,
  },
  printButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: WHITE,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
