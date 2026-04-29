import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { db } from "@/lib/database";
import {
  LocalProduct,
  LocalSize,
  LocalSugarLevel,
  LocalAddonOption,
  AddonWithQty,
  ProductCustomization,
} from "../types";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const GRAY_BG = "#F5F5F7";
const WHITE = "#FFFFFF";
const ORANGE_LIGHT = "#FFF3ED";

type Props = {
  visible: boolean;
  product: LocalProduct | null;
  onConfirm: (
    product: LocalProduct,
    customization: ProductCustomization,
  ) => void;
  onCancel: () => void;
};

export function CustomizationModal({
  visible,
  product,
  onConfirm,
  onCancel,
}: Props) {
  const [sizes, setSizes] = useState<LocalSize[]>([]);
  const [sugarLevels, setSugarLevels] = useState<LocalSugarLevel[]>([]);
  const [addonOptions, setAddonOptions] = useState<LocalAddonOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<LocalSize | null>(null);
  const [selectedSugarLevel, setSelectedSugarLevel] = useState<LocalSugarLevel | null>(null);
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!product) return;
    console.log("[CustomizationModal] product:", product.id, product.name, "has_sugar_level:", product.has_sugar_level);

    if (product.has_sizes) {
      const s = db.getAllSync<LocalSize>(
        `SELECT id, label, size_price, sort_order
         FROM product_sizes
         WHERE product_id = ?
         ORDER BY sort_order`,
        [product.id],
      );
      setSizes(s);
      setSelectedSize(s[0] ?? null);
    } else {
      setSizes([]);
      setSelectedSize(null);
    }

    if (product.has_sugar_level) {
      const sl = db.getAllSync<LocalSugarLevel>(
        `SELECT id, label, sort_order
         FROM sugar_levels
         ORDER BY sort_order`,
      );
      console.log("[CustomizationModal] sugar_levels from SQLite:", sl.length, JSON.stringify(sl));
      setSugarLevels(sl);
      setSelectedSugarLevel(sl.find((s) => s.label === "100%") ?? sl[0] ?? null);
    } else {
      console.log("[CustomizationModal] product does NOT have sugar level");
      setSugarLevels([]);
      setSelectedSugarLevel(null);
    }

    if (product.addon_group_id) {
      const ao = db.getAllSync<LocalAddonOption>(
        `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
         FROM addon_options
         WHERE addon_group_id = ? AND is_available = 1
         ORDER BY sort_order`,
        [product.addon_group_id],
      );
      setAddonOptions(ao);
    } else {
      setAddonOptions([]);
    }

    setAddonQtys({});
  }, [product?.id]);

  if (!product) return null;

  const setAddonQty = (id: string, qty: number) => {
    setAddonQtys((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const basePrice = selectedSize?.size_price ?? product.base_price;
  const addonsTotal = addonOptions.reduce((sum, ao) => {
    return sum + ao.price_modifier * (addonQtys[ao.id] ?? 0);
  }, 0);
  const totalPrice = basePrice + addonsTotal;

  const handleConfirm = () => {
    const activeAddons: AddonWithQty[] = addonOptions
      .filter((ao) => (addonQtys[ao.id] ?? 0) > 0)
      .map((ao) => ({ option: ao, qty: addonQtys[ao.id] }));
    onConfirm(product, { size: selectedSize, sugarLevel: selectedSugarLevel, addonOptions: activeAddons });
    setAddonQtys({});
  };

  const handleCancel = () => {
    setAddonQtys({});
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.basePrice}>
              Base ₱{product.base_price.toFixed(2)}
            </Text>

            {sizes.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Size</Text>
                <View style={styles.pillRow}>
                  {sizes.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.pill,
                        selectedSize?.id === s.id && styles.pillActive,
                      ]}
                      onPress={() => setSelectedSize(s)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedSize?.id === s.id && styles.pillTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                      <Text
                        style={[
                          styles.pillSub,
                          selectedSize?.id === s.id && styles.pillSubActive,
                        ]}
                      >
                        ₱{s.size_price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {sugarLevels.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Sugar Level</Text>
                <View style={styles.pillRow}>
                  {sugarLevels.map((sl) => (
                    <TouchableOpacity
                      key={sl.id}
                      style={[
                        styles.pill,
                        selectedSugarLevel?.id === sl.id && styles.pillActive,
                      ]}
                      onPress={() => setSelectedSugarLevel(sl)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedSugarLevel?.id === sl.id && styles.pillTextActive,
                        ]}
                      >
                        {sl.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {addonOptions.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Add-ons</Text>
                <View style={styles.addonPillRow}>
                  {addonOptions.map((ao) => {
                    const qty = addonQtys[ao.id] ?? 0;
                    const active = qty > 0;
                    return (
                      <View key={ao.id} style={styles.addonPillWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.addonPill,
                            active && styles.addonPillActive,
                          ]}
                          onPress={() => setAddonQty(ao.id, qty + 1)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.addonPillName,
                              active && styles.addonPillNameActive,
                            ]}
                          >
                            {ao.name}
                          </Text>
                          {ao.price_modifier > 0 && (
                            <Text
                              style={[
                                styles.addonPillPrice,
                                active && styles.addonPillPriceActive,
                              ]}
                            >
                              +₱{ao.price_modifier.toFixed(2)}
                            </Text>
                          )}
                          {active && (
                            <Text style={styles.addonPillQty}>×{qty}</Text>
                          )}
                        </TouchableOpacity>
                        {active && (
                          <TouchableOpacity
                            style={styles.addonMinusBadge}
                            onPress={() => setAddonQty(ao.id, qty - 1)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={styles.addonMinusText}>−</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.adjustedPrice}>₱{totalPrice.toFixed(2)}</Text>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Add to Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 4,
    textAlign: "center",
  },
  basePrice: {
    fontSize: 13,
    color: GRAY_TEXT,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: GRAY_TEXT,
    alignSelf: "flex-start",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
    alignItems: "center",
    minWidth: 52,
  },
  pillActive: {
    backgroundColor: ORANGE,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  pillTextActive: {
    color: WHITE,
  },
  pillSub: {
    fontSize: 10,
    color: GRAY_TEXT,
    marginTop: 1,
  },
  pillSubActive: {
    color: ORANGE_LIGHT,
  },
  addonPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
    paddingTop: 8,
    paddingLeft: 6,
  },
  addonPillWrapper: {
    position: "relative",
  },
  addonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: GRAY_BG,
  },
  addonPillActive: {
    backgroundColor: ORANGE,
  },
  addonPillName: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  addonPillNameActive: {
    color: WHITE,
  },
  addonPillPrice: {
    fontSize: 11,
    color: GRAY_TEXT,
  },
  addonPillPriceActive: {
    color: "rgba(255,255,255,0.7)",
  },
  addonPillQty: {
    fontSize: 13,
    fontWeight: "800",
    color: WHITE,
    marginLeft: 2,
  },
  addonMinusBadge: {
    position: "absolute",
    top: -10,
    left: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DARK_TEXT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  addonMinusText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
    textAlign: "center",
  },
  adjustedPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 20,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  confirmBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
  },
  cancelBtn: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
});
