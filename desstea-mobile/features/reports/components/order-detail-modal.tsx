import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompletedOrder } from "../types";
import { getItemPrice } from "../../pos/data/products";

const BRAND = "#6B4F3A";
const BRAND_LIGHT = "#F2EBE5";
const DARK = "#1C1C1E";
const MID = "#48484A";
const GRAY = "#8E8E93";
const SOFT = "#F5F5F7";
const WHITE = "#FFFFFF";
const GCASH_COLOR = "#0070E0";
const CASH_COLOR = "#2D7D46";
const DIVIDER = "#EFEFEF";

function formatDateTime(date: Date) {
  const datePart = date.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return { datePart, timePart };
}

type Props = {
  order: CompletedOrder | null;
  visible: boolean;
  onClose: () => void;
  onReprint: (order: CompletedOrder) => void;
};

export function OrderDetailModal({
  order,
  visible,
  onClose,
  onReprint,
}: Props) {
  if (!order) return null;

  const { datePart, timePart } = formatDateTime(order.completedAt);
  const isGcash = order.paymentMethod === "GCash";
  const paymentColor = isGcash ? GCASH_COLOR : CASH_COLOR;
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* ── TOP HANDLE ── */}
          <View style={styles.handle} />

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>
                  #{String(order.orderNumber).padStart(3, "0")}
                </Text>
              </View>
              <View style={styles.headerMeta}>
                <Text style={styles.headerTitle}>{order.customerName}</Text>
                <Text style={styles.headerSub}>
                  {totalItems} {totalItems === 1 ? "item" : "items"} ·{" "}
                  {timePart}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={MID} />
            </TouchableOpacity>
          </View>

          {/* ── DATE ROW ── */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={GRAY} />
            <Text style={styles.dateText}>{datePart}</Text>
          </View>

          <View style={styles.divider} />

          {/* ── ITEMS ── */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Pressable>
              <Text style={styles.sectionLabel}>ORDER ITEMS</Text>

              {order.items.map((item, idx) => {
                const unitPrice = getItemPrice(item);
                const lineTotal = unitPrice * item.quantity;
                const hasCustom = !!item.customization;
                return (
                  <View
                    key={`${item.product.id}-${idx}`}
                    style={styles.itemRow}
                  >
                    <View style={styles.itemQtyBubble}>
                      <Text style={styles.itemQtyText}>{item.quantity}</Text>
                    </View>
                    <Text>Test</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.product.name}</Text>
                      {hasCustom && (
                        <Text style={styles.itemCustom}>
                          {item.customization!.size} ·{" "}
                          {item.customization!.sugarLevel}% sugar
                        </Text>
                      )}
                    </View>
                    <View style={styles.itemPriceCol}>
                      <Text style={styles.itemLineTotal}>
                        ₱{lineTotal.toFixed(2)}
                      </Text>
                      {item.quantity > 1 && (
                        <Text style={styles.itemUnitPrice}>
                          ₱{unitPrice.toFixed(2)} ea.
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* ── TOTALS ── */}

              <View style={styles.totalsCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>
                    ₱{order.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>VAT (12%)</Text>
                  <Text style={styles.totalValue}>₱{order.tax.toFixed(2)}</Text>
                </View>
                <View style={styles.totalDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>
                    ₱{order.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* ── PAYMENT ── */}

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                PAYMENT
              </Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentMethodRow}>
                  <View
                    style={[
                      styles.paymentBadge,
                      { backgroundColor: paymentColor + "18" },
                    ]}
                  >
                    <Ionicons
                      name={isGcash ? "phone-portrait-outline" : "cash-outline"}
                      size={15}
                      color={paymentColor}
                    />
                    <Text
                      style={[styles.paymentBadgeText, { color: paymentColor }]}
                    >
                      {order.paymentMethod}
                    </Text>
                  </View>
                  <Text style={styles.paymentStatus}>Paid</Text>
                </View>

                {order.paymentMethod === "Cash" && order.cashAmount != null && (
                  <>
                    <View style={styles.paymentDetailRow}>
                      <Text style={styles.paymentDetailLabel}>
                        Cash Tendered
                      </Text>
                      <Text style={styles.paymentDetailValue}>
                        ₱{order.cashAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.paymentDetailRow}>
                      <Text style={styles.paymentDetailLabel}>Change</Text>
                      <Text
                        style={[styles.paymentDetailValue, styles.changeValue]}
                      >
                        ₱{(order.change ?? 0).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Pressable>
          </ScrollView>

          {/* ── REPRINT BUTTON ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.reprintBtn}
              onPress={() => {
                onReprint(order);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="print-outline" size={18} color={WHITE} />
              <Text style={styles.reprintText}>Reprint Receipt</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    height: "75%",
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: DIVIDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: 0.5,
  },
  headerMeta: {
    gap: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: GRAY,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  dateText: {
    fontSize: 12,
    color: GRAY,
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 20,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  itemQtyBubble: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: "700",
    color: MID,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
  },
  itemCustom: {
    fontSize: 12,
    color: GRAY,
  },
  itemPriceCol: {
    alignItems: "flex-end",
    gap: 1,
  },
  itemLineTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
  },
  itemUnitPrice: {
    fontSize: 11,
    color: GRAY,
  },
  totalsCard: {
    backgroundColor: SOFT,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: GRAY,
  },
  totalValue: {
    fontSize: 13,
    color: MID,
    fontWeight: "500",
  },
  totalDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginVertical: 2,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: BRAND,
  },
  paymentCard: {
    backgroundColor: SOFT,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: CASH_COLOR,
  },
  paymentDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDetailLabel: {
    fontSize: 13,
    color: GRAY,
  },
  paymentDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: MID,
  },
  changeValue: {
    color: CASH_COLOR,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
  },
  reprintBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
  },
  reprintText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
  },
});
