import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useReports } from "../hooks/use-reports";
import { DateFilterBar } from "../components/date-filter-bar";
import { OrderHistoryList } from "../components/order-history-list";

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
  } = useReports();

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
        <Text style={styles.sectionTitle}>Order History</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={BRAND} />
          </View>
        ) : (
          <OrderHistoryList orders={orders} />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
