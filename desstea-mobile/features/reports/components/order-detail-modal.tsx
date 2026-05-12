import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompletedOrder } from "../types";
import { usePrinter } from "@/features/printer/hooks/use-printer";
import { PinVerifyModal } from "./pin-verify-modal";
import { CancelOrderModal } from "./cancel-order-modal";

const BRAND = "#E8692A";
const BRAND_LIGHT = "#FFF3ED";
const DARK = "#1C1C1E";
const MID = "#48484A";
const GRAY = "#8E8E93";
const SOFT = "#F5F5F7";
const GCASH_COLOR = "#0070E0";
const CASH_COLOR = "#2D7D46";
const DIVIDER = "#EFEFEF";
const SYNCED_COLOR = "#2D7D46";
const PENDING_COLOR = "#D4700A";
const WHITE = "#FFFFFF";
const RED = "#D9362B";
const RED_LIGHT = "#FFF0EF";
const FLAG_COLOR = "#D63B2F";

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
  onCancel: (orderId: string, reason: string) => void;
  onToggleFlag: (orderId: string) => void;
};

export function OrderDetailModal({ order, visible, onClose, onCancel, onToggleFlag }: Props) {
  const [pinVisible, setPinVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const { printReprintFromDb } = usePrinter();

  if (!order) return null;

  const { datePart, timePart } = formatDateTime(order.completedAt);
  const isGcash = order.paymentMethod === "GCash";
  const paymentColor = isGcash ? GCASH_COLOR : CASH_COLOR;
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const isSynced = order.syncStatus === "synced";
  const syncColor = isSynced ? SYNCED_COLOR : PENDING_COLOR;
  const isCancelled = order.status === "cancelled";

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
          {/* ── HEADER BAND ── */}
          <View style={styles.headerBand}>
            {/* Top row: handle (centered) + status badge + close */}
            <View style={styles.headerTopRow}>
              <View style={styles.handle} />
              <View style={styles.headerTopRight}>
                {isCancelled ? (
                  <View style={styles.cancelledStatusBadge}>
                    <Ionicons name="close-circle" size={11} color={WHITE} />
                    <Text style={styles.statusBadgeText}>Cancelled</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.syncStatusBadge,
                      {
                        backgroundColor: isSynced
                          ? "rgba(45,125,70,0.28)"
                          : "rgba(212,112,10,0.28)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        isSynced
                          ? "cloud-done-outline"
                          : "cloud-upload-outline"
                      }
                      size={11}
                      color={isSynced ? "#7DECAB" : "#FFCF7A"}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isSynced ? "#7DECAB" : "#FFCF7A" },
                      ]}
                    >
                      {isSynced ? "Synced" : "Pending"}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={16}
                    color="#7A2800"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Order ID pill */}
            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdText}>
                #{order.id.slice(0, 6).toUpperCase()}
              </Text>
            </View>

            {/* Customer name */}
            <Text style={styles.customerName}>{order.customerName}</Text>

            {/* Meta: items · time · date */}
            <Text style={styles.headerMeta}>
              {totalItems} {totalItems === 1 ? "item" : "items"}
              {"  ·  "}
              {timePart}
              {"  ·  "}
              {datePart}
            </Text>

            <PinVerifyModal
              visible={pinVisible}
              onClose={() => setPinVisible(false)}
              onVerified={async () => {
                setPinVisible(false);
                const success = await printReprintFromDb(order);
                if (success && order.receiptError) {
                  onToggleFlag(order.id);
                }
              }}
            />

            <CancelOrderModal
              visible={cancelVisible}
              onClose={() => setCancelVisible(false)}
              onConfirm={(reason) => {
                setCancelVisible(false);
                onCancel(order.id, reason);
                onClose();
              }}
            />
          </View>

          {/* ── ACTIONS BAR ── */}
          {!isCancelled && (
            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  order.receiptError && styles.actionBtnFlagActive,
                ]}
                onPress={() => onToggleFlag(order.id)}
              >
                <Ionicons
                  name={order.receiptError ? "flag" : "flag-outline"}
                  size={15}
                  color={order.receiptError ? WHITE : FLAG_COLOR}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: order.receiptError ? WHITE : FLAG_COLOR },
                  ]}
                >
                  Flag
                </Text>
              </TouchableOpacity>

              <View style={styles.actionSeparator} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setPinVisible(true)}
              >
                <Ionicons name="print-outline" size={15} color={BRAND} />
                <Text style={[styles.actionBtnText, { color: BRAND }]}>
                  Print Receipt
                </Text>
              </TouchableOpacity>

              <View style={styles.actionSeparator} />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setCancelVisible(true)}
              >
                <Ionicons name="close-circle-outline" size={15} color={RED} />
                <Text style={[styles.actionBtnText, { color: RED }]}>
                  Refund
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />

          {/* ── ITEMS ── */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Pressable>
              {isCancelled && (
                <View style={styles.cancelledBanner}>
                  <Ionicons name="close-circle" size={16} color={RED} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cancelledBannerTitle}>Order Cancelled</Text>
                    {order.cancellationReason && (
                      <Text style={styles.cancelledBannerReason}>{order.cancellationReason}</Text>
                    )}
                  </View>
                </View>
              )}

              <Text style={styles.sectionLabel}>ORDER ITEMS</Text>

              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemQtyBubble}>
                    <Text style={styles.itemQtyText}>{item.quantity}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.product_name_snapshot}
                    </Text>
                    {item.size_label_snapshot && (
                      <Text style={styles.itemCustom}>
                        {item.size_label_snapshot}
                      </Text>
                    )}
                    {item.sugar_level_snapshot && (
                      <Text style={styles.itemCustom}>
                        {item.sugar_level_snapshot} sugar
                      </Text>
                    )}
                    {item.temp_snapshot && (
                      <Text style={styles.itemCustom}>
                        {item.temp_snapshot}
                      </Text>
                    )}
                    {item.flavor_snapshot && (
                      <Text style={styles.itemCustom}>
                        {item.flavor_snapshot} flavor
                      </Text>
                    )}
                    {item.comboSelections.map((selection) => (
                      <Text key={selection.id} style={styles.itemCustom}>
                        {selection.slot_name_snapshot}:{" "}
                        {selection.product_name_snapshot}
                        {selection.upgrade_price > 0 ? ` +₱${selection.upgrade_price}` : ""}
                      </Text>
                    ))}
                    {item.addons.map((a) => (
                      <Text key={a.id} style={styles.itemCustom}>
                        + {a.addon_name_snapshot}
                        {a.quantity > 1 ? ` ×${a.quantity}` : ""}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.itemPriceCol}>
                    <Text style={styles.itemLineTotal}>
                      ₱{item.total_price.toFixed(2)}
                    </Text>
                    {item.quantity > 1 && (
                      <Text style={styles.itemUnitPrice}>
                        ₱{item.unit_price_snapshot.toFixed(2)} ea.
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              {/* ── TOTALS ── */}
              <View style={styles.totalsCard}>
                {order.discountAmount > 0 && (
                  <>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal</Text>
                      <Text style={styles.totalValue}>
                        ₱{(order.total + order.discountAmount).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text style={[styles.totalLabel, { color: RED }]}>Discount</Text>
                        {!!order.discountReason && (
                          <Text style={styles.discountReason}>{order.discountReason}</Text>
                        )}
                      </View>
                      <Text style={[styles.totalValue, { color: RED }]}>
                        -₱{order.discountAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.totalDivider} />
                  </>
                )}
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

                {order.paymentMethod === "Cash" &&
                  order.cashTendered != null && (
                    <>
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailLabel}>
                          Cash Tendered
                        </Text>
                        <Text style={styles.paymentDetailValue}>
                          ₱{order.cashTendered.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.paymentDetailRow}>
                        <Text style={styles.paymentDetailLabel}>Change</Text>
                        <Text
                          style={[
                            styles.paymentDetailValue,
                            styles.changeValue,
                          ]}
                        >
                          ₱{(order.cashChange ?? 0).toFixed(2)}
                        </Text>
                      </View>
                    </>
                  )}
              </View>
            </Pressable>
          </ScrollView>
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
  headerBand: {
    backgroundColor: BRAND,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
    alignSelf: "center",
  },
  headerTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelledStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(217,54,43,0.75)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: WHITE,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(90,25,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  orderIdPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.2,
  },
  customerName: {
    fontSize: 26,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  actionsBar: {
    flexDirection: "row",
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
  },
  actionBtnFlagActive: {
    backgroundColor: FLAG_COLOR,
  },
  actionSeparator: {
    width: 1,
    backgroundColor: DIVIDER,
    marginVertical: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: RED_LIGHT,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: RED + "30",
  },
  cancelledBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: RED,
  },
  cancelledBannerReason: {
    fontSize: 12,
    color: RED,
    marginTop: 2,
    opacity: 0.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
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
  discountReason: {
    fontSize: 11,
    color: RED,
    opacity: 0.7,
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
});
