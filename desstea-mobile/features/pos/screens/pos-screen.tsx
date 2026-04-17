import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { LocalProduct, ProductCustomization } from "../types";
import { useCatalog } from "../hooks/use-catalog";
import { useOrder } from "../hooks/use-order";
import { useIsSyncing } from "@/lib/sync-context";
import { useAuth } from "../../auth/hooks/use-auth";
import { useBranchName } from "../../auth/hooks/use-branch-name";
import { CategoryTabs } from "../components/category-tabs";
import { ProductCard } from "../components/product-card";
import { OrderPanel } from "../components/order-panel";
import { OrderSummary } from "../components/order-summary";
import { CustomizationModal } from "../components/customization-modal";
import { SettingsScreen } from "../../settings/screens/settings-screen";
import { ReportsScreen } from "../../reports/screens/reports-screen";

const GRAY_BG = "#F5F5F7";
const GRAY_TEXT = "#8E8E93";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";
const BRAND = "#6B4F3A";

const SIDEBAR_ITEMS = [
  { key: "pos", icon: "storefront-sharp" as const, label: "POS" },
  { key: "orders", icon: "receipt-sharp" as const, label: "Orders" },
];

function generateSessionId() {
  return "SES-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function POSScreen() {
  const { user } = useAuth();
  const { branchName } = useBranchName();
  const { categories, products } = useCatalog();
  const isSyncing = useIsSyncing();
  const [cardSize, setCardSize] = useState(130);
  const [activeSidebarItem, setActiveSidebarItem] = useState("pos");
  const [sessionId] = useState(generateSessionId);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customizingProduct, setCustomizingProduct] = useState<LocalProduct | null>(null);
  const {
    orderItems,
    addToOrder,
    updateQuantity,
    total,
    commitOrder,
  } = useOrder();

  // Default to first category once loaded
  const activeCategory = selectedCategory ?? categories[0]?.id ?? null;

  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.category_id === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (product: LocalProduct) => {
    const cat = categories.find((c) => c.id === product.category_id);
    return cat ? cat.name[0].toUpperCase() : undefined;
  };

  const handleProductPress = (product: LocalProduct) => {
    if (product.has_sizes || product.addon_group_id) {
      setCustomizingProduct(product);
    } else {
      addToOrder(product, undefined, getCategoryLabel(product));
    }
  };

  const handleCustomizationConfirm = (
    product: LocalProduct,
    customization: ProductCustomization,
  ) => {
    addToOrder(product, customization, getCategoryLabel(product));
    setCustomizingProduct(null);
  };

  const NUM_COLUMNS = 4;
  const CARD_GAP = 10;

  const onLeftPanelLayout = useCallback((e: any) => {
    const panelWidth = e.nativeEvent.layout.width;
    const size = Math.floor((panelWidth - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS * 0.75);
    setCardSize(size);
  }, []);

  const renderProductCard = ({ item }: { item: LocalProduct }) => (
    <ProductCard product={item} size={cardSize} onPress={handleProductPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.mainRow}>
        {/* SIDEBAR */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarTop}>
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeSidebarItem === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sidebarItem,
                    active && styles.sidebarItemActive,
                  ]}
                  onPress={() => setActiveSidebarItem(item.key)}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={active ? BRAND : GRAY_TEXT}
                  />
                  <Text
                    style={[
                      styles.sidebarLabel,
                      active && styles.sidebarLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[
              styles.sidebarItem,
              activeSidebarItem === "settings" && styles.sidebarItemActive,
            ]}
            onPress={() => setActiveSidebarItem("settings")}
          >
            <Ionicons
              name="settings-sharp"
              size={22}
              color={activeSidebarItem === "settings" ? BRAND : GRAY_TEXT}
            />
            <Text
              style={[
                styles.sidebarLabel,
                activeSidebarItem === "settings" && styles.sidebarLabelActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {activeSidebarItem === "settings" ? (
          <SettingsScreen sessionId={sessionId} user={user} />
        ) : activeSidebarItem === "orders" ? (
          <ReportsScreen />
        ) : (
          <>
            {/* LEFT PANEL - Products */}
            <View style={styles.leftPanel} onLayout={onLeftPanelLayout}>
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
                      Welcome, {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User"}
                    </Text>
                    <Text style={styles.subtitleText}>{branchName}</Text>
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
                categories={categories}
                selectedCategory={activeCategory ?? ""}
                onSelect={setSelectedCategory}
              />

              {/* Product Grid */}
              {isSyncing ? (
                <View style={styles.syncingContainer}>
                  <ActivityIndicator size="large" color={BRAND} />
                  <Text style={styles.syncingText}>Syncing catalog…</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProductCard}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  style={styles.productList}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            {/* RIGHT PANEL - Current Order */}
            <View style={styles.rightPanel}>
              <Text style={styles.orderTitle}>Current Order</Text>

              <OrderPanel
                orderItems={orderItems}
                onUpdateQuantity={updateQuantity}
              />

              <OrderSummary
                total={total}
                canPay={orderItems.length > 0}
                onContinueToPayment={() => {
                  commitOrder();
                  router.push("/payment");
                }}
              />
            </View>
          </>
        )}
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
  sidebar: {
    width: 72,
    backgroundColor: WHITE,
    borderRightWidth: 1,
    borderRightColor: "#ECECEC",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTop: {
    alignItems: "center",
    gap: 4,
  },
  sidebarItem: {
    width: 56,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
  },
  sidebarItemActive: {
    backgroundColor: "#F2EBE5",
  },
  sidebarLabel: {
    fontSize: 10,
    color: GRAY_TEXT,
    fontWeight: "500",
  },
  sidebarLabelActive: {
    color: BRAND,
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
  syncingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  syncingText: {
    fontSize: 14,
    color: GRAY_TEXT,
    fontWeight: "500",
  },
  productList: {
    flex: 1,
  },
  productGrid: {
    paddingBottom: 20,
  },
  productRow: {
    gap: 10,
    marginBottom: 10,
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
