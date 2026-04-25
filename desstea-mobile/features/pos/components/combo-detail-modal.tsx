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
import { LocalCombo, ComboSlotSelection, LocalAddonOption, AddonWithQty } from "../types";

const BRAND = "#6B4F3A";
const BRAND_LIGHT = "#F2EBE5";
const DARK_TEXT = "#1C1C1E";
const GRAY_TEXT = "#8E8E93";
const GRAY_BG = "#F5F5F7";
const WHITE = "#FFFFFF";

type SlotOption = {
  productId: string;
  productName: string;
  quantity: number;
  addonGroupId: string | null;
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
  addon_group_id: string | null;
};

type Props = {
  visible: boolean;
  combo: LocalCombo | null;
  onConfirm: (combo: LocalCombo, selections: ComboSlotSelection[]) => void;
  onCancel: () => void;
};

export function ComboDetailModal({ visible, combo, onConfirm, onCancel }: Props) {
  const [slots, setSlots] = useState<ComboSlot[]>([]);
  const [selections, setSelections] = useState<Record<string, { productId: string; productName: string; addonGroupId: string | null }>>({});
  // cached addon options per addon_group_id
  const [addonOptionsMap, setAddonOptionsMap] = useState<Record<string, LocalAddonOption[]>>({});
  // per-slot addon quantities: slotId → { addonOptionId → qty }
  const [slotAddonQtys, setSlotAddonQtys] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (!combo) return;
    const rows = db.getAllSync<SlotRow>(
      `SELECT cs.id AS slot_id,
              c.name AS category_name,
              csp.product_id,
              p.name AS product_name,
              COALESCE(csp.quantity, 1) AS quantity,
              p.addon_group_id
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
          addonGroupId: row.addon_group_id,
        });
      }
    }
    const builtSlots = Array.from(slotMap.values());
    setSlots(builtSlots);

    // Auto-select the first option in each slot
    const defaultSelections: Record<string, { productId: string; productName: string; addonGroupId: string | null }> = {};
    const groupsToFetch = new Set<string>();
    for (const slot of builtSlots) {
      if (slot.options.length > 0) {
        const first = slot.options[0];
        defaultSelections[slot.slotId] = {
          productId: first.productId,
          productName: first.productName,
          addonGroupId: first.addonGroupId,
        };
        if (first.addonGroupId) groupsToFetch.add(first.addonGroupId);
      }
    }
    setSelections(defaultSelections);
    setSlotAddonQtys({});

    // Fetch addon options for all default-selected products
    if (groupsToFetch.size > 0) {
      const newMap: Record<string, LocalAddonOption[]> = {};
      for (const groupId of groupsToFetch) {
        newMap[groupId] = db.getAllSync<LocalAddonOption>(
          `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
           FROM addon_options
           WHERE addon_group_id = ? AND is_available = 1
           ORDER BY sort_order`,
          [groupId]
        );
      }
      setAddonOptionsMap(newMap);
    } else {
      setAddonOptionsMap({});
    }
  }, [combo?.id]);

  if (!combo) return null;

  const selectProduct = (slotId: string, option: SlotOption) => {
    setSelections((prev) => ({
      ...prev,
      [slotId]: { productId: option.productId, productName: option.productName, addonGroupId: option.addonGroupId },
    }));
    // Reset addons for this slot when switching product
    setSlotAddonQtys((prev) => ({ ...prev, [slotId]: {} }));

    // Fetch addon options if not cached
    if (option.addonGroupId && !addonOptionsMap[option.addonGroupId]) {
      const options = db.getAllSync<LocalAddonOption>(
        `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
         FROM addon_options
         WHERE addon_group_id = ? AND is_available = 1
         ORDER BY sort_order`,
        [option.addonGroupId]
      );
      setAddonOptionsMap((prev) => ({ ...prev, [option.addonGroupId!]: options }));
    }
  };

  const setAddonQty = (slotId: string, addonId: string, qty: number) => {
    setSlotAddonQtys((prev) => ({
      ...prev,
      [slotId]: { ...(prev[slotId] ?? {}), [addonId]: Math.max(0, qty) },
    }));
  };

  // Compute total price
  const addonTotal = slots.reduce((sum, slot) => {
    const sel = selections[slot.slotId];
    if (!sel?.addonGroupId) return sum;
    const options = addonOptionsMap[sel.addonGroupId] ?? [];
    const qtys = slotAddonQtys[slot.slotId] ?? {};
    return sum + options.reduce((s, ao) => s + ao.price_modifier * (qtys[ao.id] ?? 0), 0);
  }, 0);
  const totalPrice = combo.price + addonTotal;

  const allSelected = slots.length === 0 || slots.every((s) => !!selections[s.slotId]);

  const handleConfirm = () => {
    const comboSelections: ComboSlotSelection[] = slots.map((slot) => {
      const sel = selections[slot.slotId];
      const addonGroupId = sel?.addonGroupId ?? null;
      const options = addonGroupId ? (addonOptionsMap[addonGroupId] ?? []) : [];
      const qtys = slotAddonQtys[slot.slotId] ?? {};
      const addons: AddonWithQty[] = options
        .filter((ao) => (qtys[ao.id] ?? 0) > 0)
        .map((ao) => ({ option: ao, qty: qtys[ao.id] }));
      return {
        slotId: slot.slotId,
        slotName: slot.categoryName,
        productId: sel.productId,
        productName: sel.productName,
        addonGroupId,
        addons,
      };
    });
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

            <Text style={styles.price}>₱{totalPrice.toFixed(2)}</Text>

            {slots.length > 0 && (
              <>
                <Text style={styles.instruction}>Choose one from each category</Text>
                {slots.map((slot) => {
                  const sel = selections[slot.slotId];
                  const addonGroupId = sel?.addonGroupId ?? null;
                  const addonOptions = addonGroupId ? (addonOptionsMap[addonGroupId] ?? []) : [];
                  const qtys = slotAddonQtys[slot.slotId] ?? {};

                  return (
                    <View key={slot.slotId} style={styles.slotSection}>
                      <Text style={styles.slotLabel}>{slot.categoryName}</Text>
                      <View style={styles.optionsContainer}>
                        {slot.options.map((option) => {
                          const selected = sel?.productId === option.productId;
                          return (
                            <TouchableOpacity
                              key={option.productId}
                              style={[styles.optionRow, selected && styles.optionRowSelected]}
                              onPress={() => selectProduct(slot.slotId, option)}
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

                      {addonOptions.length > 0 && (
                        <View style={styles.addonSection}>
                          <Text style={styles.addonSectionLabel}>Add-ons</Text>
                          <View style={styles.addonPillRow}>
                            {addonOptions.map((ao) => {
                              const qty = qtys[ao.id] ?? 0;
                              const active = qty > 0;
                              return (
                                <View key={ao.id} style={styles.addonPillWrapper}>
                                  <TouchableOpacity
                                    style={[styles.addonPill, active && styles.addonPillActive]}
                                    onPress={() => setAddonQty(slot.slotId, ao.id, qty + 1)}
                                    activeOpacity={0.75}
                                  >
                                    <Text style={[styles.addonPillName, active && styles.addonPillNameActive]}>
                                      {ao.name}
                                    </Text>
                                    {ao.price_modifier > 0 && (
                                      <Text style={[styles.addonPillPrice, active && styles.addonPillPriceActive]}>
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
                                      onPress={() => setAddonQty(slot.slotId, ao.id, qty - 1)}
                                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    >
                                      <Text style={styles.addonMinusText}>−</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
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
    backgroundColor: BRAND_LIGHT,
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
  addonSection: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  addonSectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: GRAY_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  addonPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
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
    backgroundColor: BRAND,
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
