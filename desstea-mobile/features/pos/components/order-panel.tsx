import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { OrderItem, getItemKey, getItemPrice } from "../types";

const ORANGE = "#E8692A";
const ORANGE_LIGHT = "#FFF3ED";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";

type Props = {
  orderItems: OrderItem[];
  onUpdateQuantity: (itemKey: string, delta: number) => void;
};

export function OrderPanel({ orderItems, onUpdateQuantity }: Props) {
  return (
    <ScrollView style={styles.orderList} showsVerticalScrollIndicator={false}>
      {orderItems.map((item) => {
        const key = getItemKey(item);
        const price = getItemPrice(item);
        return (
          <View key={key} style={styles.orderItem}>
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName} numberOfLines={2}>
                {item.categoryLabel ? `(${item.categoryLabel}) ${item.product.name}` : item.product.name}
              </Text>
              {item.itemType === "combo" && item.comboSelections && item.comboSelections.length > 0 && (
                <>
                  <Text style={styles.customizationLabel}>
                    {item.comboSelections.map((s) => s.productName).join(", ")}
                  </Text>
                  {(() => {
                    const allAddons = item.comboSelections.flatMap((s) => s.addons);
                    if (allAddons.length === 0) return null;
                    return (
                      <Text style={styles.customizationLabel}>
                        +{allAddons
                          .map((aq) => aq.qty > 1 ? `${aq.option.name} ×${aq.qty}` : aq.option.name)
                          .join(", ")}
                      </Text>
                    );
                  })()}
                </>
              )}
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
              <Text style={styles.orderItemPrice}>
                ₱{(price * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => onUpdateQuantity(key, -1)}
              >
                <Text style={styles.quantityBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => onUpdateQuantity(key, 1)}
              >
                <Text style={styles.quantityBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  orderList: {
    flex: 1,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  orderItemInfo: {
    flex: 1,
    gap: 2,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK_TEXT,
    lineHeight: 17,
  },
  customizationLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: ORANGE,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: ORANGE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: ORANGE,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    minWidth: 16,
    textAlign: "center",
  },
});
