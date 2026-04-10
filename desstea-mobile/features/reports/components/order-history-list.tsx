import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompletedOrder } from "../types";
import { getItemPrice } from "../../pos/data/products";
import { OrderDetailModal } from "./order-detail-modal";

const BRAND = "#6B4F3A";
const BRAND_LIGHT = "#F2EBE5";
const DARK = "#1C1C1E";
const MID = "#48484A";
const GRAY = "#8E8E93";
const WHITE = "#FFFFFF";
const DIVIDER = "#EFEFEF";
const GCASH_COLOR = "#0070E0";
const CASH_COLOR = "#2D7D46";

type Props = {
  orders: CompletedOrder[];
  onReprint: (order: CompletedOrder) => void;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildItemSummary(order: CompletedOrder): string {
  const names = order.items.map((i) => {
    const base = i.product.name;
    const qty = i.quantity > 1 ? ` ×${i.quantity}` : "";
    const size = i.customization ? ` (${i.customization.size[0]})` : "";
    return `${base}${size}${qty}`;
  });
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

function OrderRow({
  order,
  onPress,
}: {
  order: CompletedOrder;
  onPress: () => void;
}) {
  const isGcash = order.paymentMethod === "GCash";
  const paymentColor = isGcash ? GCASH_COLOR : CASH_COLOR;
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const itemSummary = buildItemSummary(order);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left accent stripe by payment method */}
      <View style={[styles.stripe, { backgroundColor: paymentColor }]} />

      <View style={styles.cardInner}>
        {/* ── TOP ROW ── */}
        <View style={styles.topRow}>
          <View style={styles.orderNumBadge}>
            <Text style={styles.orderNumText}>
              #{String(order.orderNumber).padStart(3, "0")}
            </Text>
          </View>

          <Text style={styles.customerName} numberOfLines={1}>
            {order.customerName}
          </Text>

          <Text style={styles.total}>₱{order.total.toFixed(2)}</Text>
        </View>

        {/* ── BOTTOM ROW ── */}
        <View style={styles.bottomRow}>
          {/* Item summary */}
          <Text style={styles.itemSummary} numberOfLines={1}>
            {itemSummary}
          </Text>

          <View style={styles.metaRight}>
            {/* Payment chip */}
            <View style={[styles.payChip, { backgroundColor: paymentColor + "18" }]}>
              <Ionicons
                name={isGcash ? "phone-portrait-outline" : "cash-outline"}
                size={11}
                color={paymentColor}
              />
              <Text style={[styles.payChipText, { color: paymentColor }]}>
                {order.paymentMethod}
              </Text>
            </View>

            {/* Item count */}
            <Text style={styles.itemCount}>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>

            {/* Time */}
            <Text style={styles.time}>{formatTime(order.completedAt)}</Text>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={14} color={GRAY} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function OrderHistoryList({ orders, onReprint }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="receipt-outline" size={40} color={BRAND} />
        </View>
        <Text style={styles.emptyTitle}>No orders for this day</Text>
        <Text style={styles.emptySubtitle}>
          Completed orders will show up here after checkout.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            onPress={() => setSelectedOrder(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        style={styles.flatList}
      />

      <OrderDetailModal
        order={selectedOrder}
        visible={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        onReprint={onReprint}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
    gap: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: WHITE,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  stripe: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 6,
  },
  orderNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: 0.4,
  },
  customerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: DARK,
    letterSpacing: -0.2,
  },
  total: {
    fontSize: 17,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: -0.3,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemSummary: {
    flex: 1,
    fontSize: 12,
    color: MID,
    lineHeight: 16,
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  payChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  payChipText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemCount: {
    fontSize: 11,
    color: GRAY,
  },
  time: {
    fontSize: 11,
    color: GRAY,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 60,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK,
  },
  emptySubtitle: {
    fontSize: 13,
    color: GRAY,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
});
