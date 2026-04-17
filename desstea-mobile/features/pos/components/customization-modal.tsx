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
  LocalAddonOption,
  ProductCustomization,
} from "../types";

const ORANGE = "#E8692A";
const ORANGE_LIGHT = "#FFF3ED";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";

type Props = {
  visible: boolean;
  product: LocalProduct | null;
  onConfirm: (product: LocalProduct, customization: ProductCustomization) => void;
  onCancel: () => void;
};

export function CustomizationModal({ visible, product, onConfirm, onCancel }: Props) {
  const [sizes, setSizes] = useState<LocalSize[]>([]);
  const [addonOptions, setAddonOptions] = useState<LocalAddonOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<LocalSize | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<LocalAddonOption[]>([]);

  useEffect(() => {
    if (!product) return;

    if (product.has_sizes) {
      const s = db.getAllSync<LocalSize>(
        `SELECT id, label, size_price, sort_order
         FROM product_sizes
         WHERE product_id = ?
         ORDER BY sort_order`,
        [product.id]
      );
      setSizes(s);
      setSelectedSize(s[0] ?? null);
    } else {
      setSizes([]);
      setSelectedSize(null);
    }

    if (product.addon_group_id) {
      const ao = db.getAllSync<LocalAddonOption>(
        `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
         FROM addon_options
         WHERE addon_group_id = ? AND is_available = 1
         ORDER BY sort_order`,
        [product.addon_group_id]
      );
      setAddonOptions(ao);
    } else {
      setAddonOptions([]);
    }

    setSelectedAddons([]);
  }, [product?.id]);

  if (!product) return null;

  const basePrice = selectedSize?.size_price ?? product.base_price;
  const addonsTotal = selectedAddons.reduce((sum, ao) => sum + ao.price_modifier, 0);
  const totalPrice = basePrice + addonsTotal;

  const toggleAddon = (option: LocalAddonOption) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === option.id)
        ? prev.filter((a) => a.id !== option.id)
        : [...prev, option]
    );
  };

  const handleConfirm = () => {
    onConfirm(product, { size: selectedSize, addonOptions: selectedAddons });
    setSelectedAddons([]);
  };

  const handleCancel = () => {
    setSelectedAddons([]);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.basePrice}>Base ₱{product.base_price.toFixed(2)}</Text>

            {sizes.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Size</Text>
                <View style={styles.pillRow}>
                  {sizes.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.pill, selectedSize?.id === s.id && styles.pillActive]}
                      onPress={() => setSelectedSize(s)}
                    >
                      <Text style={[styles.pillText, selectedSize?.id === s.id && styles.pillTextActive]}>
                        {s.label}
                      </Text>
                      <Text style={[styles.pillSub, selectedSize?.id === s.id && styles.pillSubActive]}>
                        ₱{s.size_price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {addonOptions.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Add-ons</Text>
                <View style={styles.pillRow}>
                  {addonOptions.map((ao) => {
                    const selected = !!selectedAddons.find((a) => a.id === ao.id);
                    return (
                      <TouchableOpacity
                        key={ao.id}
                        style={[styles.pill, selected && styles.pillActive]}
                        onPress={() => toggleAddon(ao)}
                      >
                        <Text style={[styles.pillText, selected && styles.pillTextActive]}>
                          {ao.name}
                        </Text>
                        {ao.price_modifier > 0 && (
                          <Text style={[styles.pillSub, selected && styles.pillSubActive]}>
                            +₱{ao.price_modifier.toFixed(2)}
                          </Text>
                        )}
                      </TouchableOpacity>
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
    backgroundColor: "#F5F5F7",
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
