import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LocalProduct } from "../types";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const LIGHT_GRAY = "#F5F5F7";
const WHITE = "#FFFFFF";
const WARM_BG = "#FEF8F5";

type Props = {
  product: LocalProduct;
  size: number;
  onPress: (product: LocalProduct) => void;
};

export function ProductCard({ product, size, onPress }: Props) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        {
          width: size,
          height: size,
          opacity: isPressed ? 0.85 : 1,
        },
      ]}
      onPress={() => onPress(product)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.75}
    >
      {/* Top accent bar */}
      <View style={styles.accentBar} />

      {/* Main content */}
      <View style={styles.container}>
        {/* Product name with elegant styling */}
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price display */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceCurrency}>₱</Text>
          <Text style={styles.productPrice}>
            {product.base_price.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Subtle border highlight on interaction */}
      <View
        style={[
          styles.borderOverlay,
          {
            borderColor: isPressed ? ORANGE : "transparent",
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: WARM_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D5C4",
    overflow: "hidden",
    shadowColor: "#8B6F47",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  accentBar: {
    height: 3,
    backgroundColor: ORANGE,
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK_TEXT,
    lineHeight: 16,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 2,
  },
  priceCurrency: {
    fontSize: 11,
    fontWeight: "700",
    color: ORANGE,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: ORANGE,
    letterSpacing: -0.3,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1.5,
    pointerEvents: "none",
  },
});
