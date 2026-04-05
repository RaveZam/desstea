import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../data/products";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";

type Props = {
  product: Product;
  onPress: (product: Product) => void;
};

export function ProductCard({ product, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <Image
        source={product.image}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.priceCurrency}>₱</Text>
          <Text style={styles.productPrice}>{product.price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    lineHeight: 18,
  },
  productDesc: {
    fontSize: 11,
    color: GRAY_TEXT,
    lineHeight: 15,
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
