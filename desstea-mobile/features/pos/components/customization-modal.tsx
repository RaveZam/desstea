import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  Product,
  CoffeeSize,
  SugarLevel,
  CoffeeCustomization,
  SIZE_PRICE_ADJUSTMENT,
} from "../data/products";

const ORANGE = "#E8692A";
const ORANGE_LIGHT = "#FFF3ED";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const WHITE = "#FFFFFF";

const SIZES: CoffeeSize[] = ["Small", "Medium", "Large"];
const SUGAR_LEVELS: SugarLevel[] = [0, 25, 50, 75, 100];

type Props = {
  visible: boolean;
  product: Product | null;
  onConfirm: (product: Product, customization: CoffeeCustomization) => void;
  onCancel: () => void;
};

export function CustomizationModal({ visible, product, onConfirm, onCancel }: Props) {
  const [size, setSize] = useState<CoffeeSize>("Medium");
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>(50);

  if (!product) return null;

  const adjustedPrice = product.price + SIZE_PRICE_ADJUSTMENT[size];

  const handleConfirm = () => {
    onConfirm(product, { size, sugarLevel });
    setSize("Medium");
    setSugarLevel(50);
  };

  const handleCancel = () => {
    setSize("Medium");
    setSugarLevel(50);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.basePrice}>Base ₱{product.price}</Text>

          <Text style={styles.sectionLabel}>Size</Text>
          <View style={styles.pillRow}>
            {SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pill, size === s && styles.pillActive]}
                onPress={() => setSize(s)}
              >
                <Text style={[styles.pillText, size === s && styles.pillTextActive]}>
                  {s === "Small" ? "S" : s === "Medium" ? "M" : "L"}
                </Text>
                {SIZE_PRICE_ADJUSTMENT[s] > 0 && (
                  <Text style={[styles.pillSub, size === s && styles.pillSubActive]}>
                    +₱{SIZE_PRICE_ADJUSTMENT[s]}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Sugar Level</Text>
          <View style={styles.pillRow}>
            {SUGAR_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.pill, sugarLevel === level && styles.pillActive]}
                onPress={() => setSugarLevel(level)}
              >
                <Text style={[styles.pillText, sugarLevel === level && styles.pillTextActive]}>
                  {level}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.adjustedPrice}>₱{adjustedPrice.toFixed(2)}</Text>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Add to Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
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
    alignItems: "center",
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
