import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  subtotal: number;
  total: number;
  discountAmount: number;
  discountReason: string;
  onDiscountAmountChange: (val: number) => void;
  onDiscountReasonChange: (val: string) => void;
};

export function OrderSummaryPanel({
  orderItems,
  subtotal,
  total,
  discountAmount,
  discountReason,
  onDiscountAmountChange,
  onDiscountReasonChange,
}: Props) {
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
                {item.itemType === "combo" && item.comboSelections && item.comboSelections.length > 0 && (
                  <>
                    {item.comboSelections.map((s, i) => (
                      <Text key={`${s.slotId}_${i}`} style={styles.customizationLabel}>
                        • {s.productName}
                        {s.addons.length > 0
                          ? ` (+${s.addons.map((aq) => aq.qty > 1 ? `${aq.option.name} ×${aq.qty}` : aq.option.name).join(", ")})`
                          : ""}
                      </Text>
                    ))}
                  </>
                )}
                {item.customization && (
                  <>
                    {item.customization.size && (
                      <Text style={styles.customizationLabel}>
                        {item.customization.size.label}
                      </Text>
                    )}
                    {item.customization.sugarLevel && (
                      <Text style={styles.customizationLabel}>
                        Sugar: {item.customization.sugarLevel.label}
                      </Text>
                    )}
                    {item.customization.temperature && (
                      <Text style={styles.customizationLabel}>
                        {item.customization.temperature}
                      </Text>
                    )}
                    {item.customization.shot && (
                      <Text style={styles.customizationLabel}>
                        {item.customization.shot === "1S" ? "Single Shot" : "Double Shot"}
                      </Text>
                    )}
                    {item.customization.matchaLevel && (
                      <Text style={styles.customizationLabel}>
                        {item.customization.matchaLevel}
                      </Text>
                    )}
                    {item.customization.flavor && (
                      <Text style={styles.customizationLabel}>
                        Flavor: {item.customization.flavor.label}
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

      <View style={styles.discountArea}>
        <View style={styles.discountRow}>
          <Text style={styles.discountLabel}>Discount</Text>
          <View style={styles.discountInputWrap}>
            <Text style={styles.discountPrefix}>₱</Text>
            <TextInput
              style={styles.discountInput}
              keyboardType="numeric"
              value={discountAmount > 0 ? String(discountAmount) : ""}
              onChangeText={(t) => onDiscountAmountChange(parseFloat(t) || 0)}
              placeholder="0"
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>
        <View style={styles.discountRow}>
          <Text style={styles.discountLabel}>Reason</Text>
          <TextInput
            style={[
              styles.reasonInput,
              discountAmount > 0 && !discountReason.trim() && styles.reasonInputRequired,
            ]}
            value={discountReason}
            onChangeText={onDiscountReasonChange}
            placeholder={discountAmount > 0 ? "Required" : "Optional"}
            placeholderTextColor={discountAmount > 0 ? "#E8692A" : "#C7C7CC"}
          />
        </View>
      </View>

      <View style={styles.summaryFooter}>
        <View style={styles.footerDivider} />
        {discountAmount > 0 && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: ORANGE }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: ORANGE }]}>-₱{discountAmount.toFixed(2)}</Text>
            </View>
          </>
        )}
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
  discountArea: {
    paddingVertical: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountLabel: {
    fontSize: 13,
    color: GRAY_TEXT,
    width: 56,
  },
  discountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDDDE3",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountPrefix: {
    fontSize: 13,
    color: DARK_TEXT,
    marginRight: 2,
  },
  discountInput: {
    flex: 1,
    fontSize: 13,
    color: DARK_TEXT,
    padding: 0,
  },
  reasonInput: {
    flex: 1,
    fontSize: 13,
    color: DARK_TEXT,
    borderWidth: 1,
    borderColor: "#DDDDE3",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reasonInputRequired: {
    borderColor: ORANGE,
  },
});
