import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/lib/database";
import { LocalCombo, ComboSlotSelection } from "../types";

const BRAND = "#6B4F3A";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const GRAY_BG = "#F5F5F7";
const WHITE = "#FFFFFF";

type SlotOption = {
  productId: string;
  productName: string;
  quantity: number;
};

type ComboSlot = {
  slotId: string;
  categoryName: string;
  options: SlotOption[];
};

type SlotRow = {
  slot_id: string;
  category_name: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
};

type Props = {
  visible: boolean;
  combo: LocalCombo | null;
  onConfirm: (combo: LocalCombo, selections: ComboSlotSelection[]) => void;
  onCancel: () => void;
};

export function ComboDetailModal({ visible, combo, onConfirm, onCancel }: Props) {
  const [slots, setSlots] = useState<ComboSlot[]>([]);
  const [selections, setSelections] = useState<Record<string, { productId: string; productName: string }>>({});

  useEffect(() => {
    if (!combo) return;
    const rows = db.getAllSync<SlotRow>(
      `SELECT cs.id AS slot_id,
              c.name AS category_name,
              csp.product_id,
              p.name AS product_name,
              COALESCE(csp.quantity, 1) AS quantity
       FROM combo_slots cs
       LEFT JOIN categories c ON c.id = cs.category_id
       LEFT JOIN combo_slot_products csp ON csp.combo_slot_id = cs.id
       LEFT JOIN products p ON p.id = csp.product_id
       WHERE cs.combo_id = ?
       ORDER BY cs.sort_order, csp.rowid`,
      [combo.id]
    );

    // Group rows into slots
    const slotMap = new Map<string, ComboSlot>();
    let slotIndex = 1;
    for (const row of rows) {
      if (!slotMap.has(row.slot_id)) {
        slotMap.set(row.slot_id, {
          slotId: row.slot_id,
          categoryName: row.category_name ?? `Slot ${slotIndex}`,
          options: [],
        });
        slotIndex++;
      }
      if (row.product_id && row.product_name) {
        slotMap.get(row.slot_id)!.options.push({
          productId: row.product_id,
          productName: row.product_name,
          quantity: row.quantity,
        });
      }
    }
    const builtSlots = Array.from(slotMap.values());
    setSlots(builtSlots);

    // Auto-select the first option in each slot
    const defaultSelections: Record<string, { productId: string; productName: string }> = {};
    for (const slot of builtSlots) {
      if (slot.options.length > 0) {
        defaultSelections[slot.slotId] = {
          productId: slot.options[0].productId,
          productName: slot.options[0].productName,
        };
      }
    }
    setSelections(defaultSelections);
  }, [combo?.id]);

  if (!combo) return null;

  const allSelected = slots.length === 0 || slots.every((s) => !!selections[s.slotId]);

  const handleConfirm = () => {
    const comboSelections: ComboSlotSelection[] = slots.map((slot) => ({
      slotId: slot.slotId,
      slotName: slot.categoryName,
      productId: selections[slot.slotId].productId,
      productName: selections[slot.slotId].productName,
    }));
    onConfirm(combo, comboSelections);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{combo.name}</Text>

            {combo.description ? (
              <Text style={styles.description}>{combo.description}</Text>
            ) : null}

            <Text style={styles.price}>₱{combo.price.toFixed(2)}</Text>

            {slots.length > 0 && (
              <>
                <Text style={styles.instruction}>Choose one from each category</Text>
                {slots.map((slot) => (
                  <View key={slot.slotId} style={styles.slotSection}>
                    <Text style={styles.slotLabel}>{slot.categoryName}</Text>
                    <View style={styles.optionsContainer}>
                      {slot.options.map((option) => {
                        const selected = selections[slot.slotId]?.productId === option.productId;
                        return (
                          <TouchableOpacity
                            key={option.productId}
                            style={[styles.optionRow, selected && styles.optionRowSelected]}
                            onPress={() =>
                              setSelections((prev) => ({
                                ...prev,
                                [slot.slotId]: { productId: option.productId, productName: option.productName },
                              }))
                            }
                          >
                            <Ionicons
                              name={selected ? "radio-button-on" : "radio-button-off"}
                              size={18}
                              color={selected ? BRAND : GRAY_TEXT}
                            />
                            <Text style={[styles.optionName, selected && styles.optionNameSelected]}>
                              {option.quantity > 1 ? `${option.quantity}× ` : ""}{option.productName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              style={[styles.addBtn, !allSelected && styles.addBtnDisabled]}
              onPress={handleConfirm}
              disabled={!allSelected}
            >
              <Text style={styles.addBtnText}>Add to Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
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
    width: 340,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK_TEXT,
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK_TEXT,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 12,
    color: GRAY_TEXT,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  slotSection: {
    marginBottom: 16,
  },
  slotLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  optionsContainer: {
    backgroundColor: GRAY_BG,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  optionRowSelected: {
    backgroundColor: "#F2EBE5",
  },
  optionName: {
    fontSize: 14,
    fontWeight: "500",
    color: DARK_TEXT,
    flex: 1,
  },
  optionNameSelected: {
    fontWeight: "700",
    color: BRAND,
  },
  addBtn: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
});
