import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { OrderItem, getItemKey, getItemPrice } from "../../pos/types";

const GRAY_BG = "#F5F5F7";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const ORANGE = "#E8692A";

type Props = {
  orderItems: OrderItem[];
  total: number;
};

export function OrderSummaryPanel({ orderItems, total }: Props) {
  return (
    <View style={styles.leftPanel}>
      <View style={styles.leftHeader}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={DARK_TEXT} />
        </TouchableOpacity>
        <Text style={styles.leftTitle}>Order Summary</Text>
      </View>

      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {orderItems.map((item) => {
          const key = getItemKey(item);
          const price = getItemPrice(item);
          return (
            <View key={key} style={styles.summaryItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                {item.customization && (
                  <>
                    {item.customization.size && (
                      <Text style={styles.customizationLabel}>
                        {item.customization.size.label}
                      </Text>
                    )}
                    {item.customization.addonOptions.length > 0 && (
                      <Text style={styles.customizationLabel}>
                        +{item.customization.addonOptions
                          .map((aq) => aq.qty > 1 ? `${aq.option.name} ×${aq.qty}` : aq.option.name)
                          .join(", ")}
                      </Text>
                    )}
                  </>
                )}
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                ₱{(price * item.quantity).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.summaryFooter}>
        <View style={styles.footerDivider} />
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>₱{total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftPanel: {
    flex: 1,
    backgroundColor: WHITE,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderRightWidth: 1,
    borderRightColor: "#ECECEC",
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GRAY_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  leftTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  itemsList: {
    flex: 1,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  customizationLabel: {
    fontSize: 11,
    color: ORANGE,
  },
  itemQty: {
    fontSize: 12,
    color: GRAY_TEXT,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  summaryFooter: {
    paddingTop: 4,
    paddingBottom: 8,
    gap: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  grandTotalValue: {
    fontSize: 34,
    fontWeight: "800",
    color: DARK_TEXT,
    letterSpacing: -0.5,
  },
});
