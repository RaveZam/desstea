import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { products, Product, CoffeeCustomization } from "../data/products";
import { useOrder } from "../hooks/use-order";
import { usePrinter } from "../../printer/hooks/use-printer";
import { CategoryTabs } from "../components/category-tabs";
import { ProductCard } from "../components/product-card";
import { OrderPanel } from "../components/order-panel";
import { OrderSummary } from "../components/order-summary";
import { CustomizationModal } from "../components/customization-modal";

const GRAY_BG = "#F5F5F7";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";

export default function POSScreen() {
  const [selectedCategory, setSelectedCategory] = useState("coffee");
  const [searchQuery, setSearchQuery] = useState("");
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const { orderItems, addToOrder, updateQuantity, subtotal, tax, total, commitOrder } =
    useOrder();
  const { printTestMessage } = usePrinter();

  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductPress = (product: Product) => {
    if (product.categoryId === "coffee") {
      setCustomizingProduct(product);
    } else {
      addToOrder(product);
    }
  };

  const handleCustomizationConfirm = (product: Product, customization: CoffeeCustomization) => {
    addToOrder(product, customization);
    setCustomizingProduct(null);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mainRow}>
        {/* LEFT PANEL - Products */}
        <View style={styles.leftPanel}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require("../../../assets/images/logo.jpg")}
                style={styles.logoImage}
                resizeMode="cover"
              />
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                  Welcome, Micheal Aurelio Pogi
                </Text>
                <Text style={styles.subtitleText}>
                  Discover whatever you need easily
                </Text>
              </View>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={16}
                color={DARK_TEXT}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search product..."
                placeholderTextColor={GRAY_TEXT}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Category Tabs */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Product Grid */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={styles.productList}
            contentContainerStyle={styles.productGrid}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* RIGHT PANEL - Current Order */}
        <View style={styles.rightPanel}>
          <Text style={styles.orderTitle}>Current Order</Text>

          <OrderPanel
            orderItems={orderItems}
            onUpdateQuantity={updateQuantity}
          />


          <OrderSummary
            subtotal={subtotal}
            tax={tax}
            total={total}
            canPay={orderItems.length > 0}
            onPrintTest={printTestMessage}
            onContinueToPayment={() => {
              commitOrder();
              router.push("/payment");
            }}
          />
        </View>
      </View>

      <CustomizationModal
        visible={customizingProduct !== null}
        product={customizingProduct}
        onConfirm={handleCustomizationConfirm}
        onCancel={() => setCustomizingProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  welcomeContainer: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  subtitleText: {
    fontSize: 13,
    color: GRAY_TEXT,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK_TEXT,
    padding: 0,
  },
  productList: {
    flex: 1,
  },
  productGrid: {
    paddingBottom: 20,
  },
  productRow: {
    gap: 14,
    marginBottom: 14,
  },
  rightPanel: {
    width: 300,
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#ECECEC",
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 16,
  },
});
