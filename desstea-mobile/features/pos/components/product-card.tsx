import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LocalProduct } from "../types";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";

type Props = {
  product: LocalProduct;
  size: number;
  onPress: (product: LocalProduct) => void;
};

export function ProductCard({ product, size, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.productCard, { width: size, height: size }]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.productDesc} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.productPriceRow}>
          <Text style={styles.priceCurrency}>₱</Text>
          <Text style={styles.productPrice}>{product.base_price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C4501E",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 16,
    gap: 4,
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    lineHeight: 18,
    textAlign: "center",
  },
  productDesc: {
    fontSize: 11,
    color: GRAY_TEXT,
    lineHeight: 15,
    textAlign: "center",
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
    gap: 1,
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: "700",
    color: ORANGE,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: ORANGE,
  },
});
