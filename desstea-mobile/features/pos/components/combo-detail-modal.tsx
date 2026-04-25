import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/lib/database";
import { LocalCombo, ComboSlotSelection, LocalAddonOption, AddonWithQty } from "../types";

const BRAND = "#E8692A";
const BRAND_LIGHT = "#FFF3ED";
const DARK = "#1C1C1E";
const MID = "#48484A";
const GRAY = "#8E8E93";
const SOFT = "#F5F5F7";
const DIVIDER = "#EFEFEF";
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
  const [addonOptionsMap, setAddonOptionsMap] = useState<Record<string, LocalAddonOption[]>>({});
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
    setSlotAddonQtys((prev) => ({ ...prev, [slotId]: {} }));

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

  const initials = combo.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* ── HANDLE ── */}
          <View style={styles.handle} />

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.comboBadge}>
                <Text style={styles.comboBadgeText}>{initials}</Text>
              </View>
              <View style={styles.headerMeta}>
                <Text style={styles.headerTitle}>{combo.name}</Text>
                {combo.description ? (
                  <Text style={styles.headerSub} numberOfLines={1}>{combo.description}</Text>
                ) : (
                  <Text style={styles.headerSub}>
                    {slots.length} {slots.length === 1 ? "slot" : "slots"} to customize
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
              <Ionicons name="close" size={18} color={MID} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ── SCROLLABLE BODY ── */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Pressable>
              {/* ── PRICE CARD ── */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Total</Text>
                  <Text style={styles.priceValue}>₱{totalPrice.toFixed(2)}</Text>
                </View>
                {addonTotal > 0 && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Base</Text>
                    <Text style={styles.priceBreakdownValue}>₱{combo.price.toFixed(2)}</Text>
                  </View>
                )}
                {addonTotal > 0 && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Add-ons</Text>
                    <Text style={styles.priceBreakdownValue}>+₱{addonTotal.toFixed(2)}</Text>
                  </View>
                )}
              </View>

              {/* ── SLOTS ── */}
              {slots.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CUSTOMIZE</Text>

                  {slots.map((slot, idx) => {
                    const sel = selections[slot.slotId];
                    const addonGroupId = sel?.addonGroupId ?? null;
                    const addonOptions = addonGroupId ? (addonOptionsMap[addonGroupId] ?? []) : [];
                    const qtys = slotAddonQtys[slot.slotId] ?? {};

                    return (
                      <View key={slot.slotId} style={[styles.slotCard, idx > 0 && { marginTop: 10 }]}>
                        {/* Slot header */}
                        <View style={styles.slotHeader}>
                          <View style={styles.slotIndexBubble}>
                            <Text style={styles.slotIndexText}>{idx + 1}</Text>
                          </View>
                          <Text style={styles.slotLabel}>{slot.categoryName}</Text>
                        </View>

                        {/* Options */}
                        <View style={styles.optionsContainer}>
                          {slot.options.map((option, optIdx) => {
                            const selected = sel?.productId === option.productId;
                            return (
                              <TouchableOpacity
                                key={option.productId}
                                style={[
                                  styles.optionRow,
                                  selected && styles.optionRowSelected,
                                  optIdx === slot.options.length - 1 && styles.optionRowLast,
                                ]}
                                onPress={() => selectProduct(slot.slotId, option)}
                                activeOpacity={0.7}
                              >
                                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                                  {selected && <View style={styles.radioInner} />}
                                </View>
                                <Text style={[styles.optionName, selected && styles.optionNameSelected]}>
                                  {option.quantity > 1 ? `${option.quantity}× ` : ""}{option.productName}
                                </Text>
                                {selected && (
                                  <Ionicons name="checkmark" size={15} color={BRAND} />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Add-ons */}
                        {addonOptions.length > 0 && (
                          <View style={styles.addonSection}>
                            <Text style={styles.addonSectionLabel}>ADD-ONS</Text>
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

              {/* ── ACTIONS ── */}
              <TouchableOpacity
                style={[styles.addBtn, !allSelected && styles.addBtnDisabled]}
                onPress={handleConfirm}
                disabled={!allSelected}
                activeOpacity={0.85}
              >
                <Ionicons name="bag-add-outline" size={18} color={WHITE} style={{ marginRight: 8 }} />
                <Text style={styles.addBtnText}>Add to Order</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    height: "75%",
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: DIVIDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  comboBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  comboBadgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: 0.5,
  },
  headerMeta: {
    gap: 3,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: GRAY,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginHorizontal: 20,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  // Price card
  priceCard: {
    backgroundColor: SOFT,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: -0.5,
  },
  priceBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceBreakdownLabel: {
    fontSize: 12,
    color: GRAY,
  },
  priceBreakdownValue: {
    fontSize: 12,
    color: MID,
    fontWeight: "500",
  },
  // Slot cards
  slotCard: {
    backgroundColor: SOFT,
    borderRadius: 14,
    overflow: "hidden",
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  slotIndexBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  slotIndexText: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND,
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    backgroundColor: WHITE,
  },
  optionRowSelected: {
    backgroundColor: BRAND_LIGHT,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: DIVIDER,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: BRAND,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "500",
    color: DARK,
    flex: 1,
  },
  optionNameSelected: {
    fontWeight: "700",
    color: BRAND,
  },
  // Add-ons
  addonSection: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
  },
  addonSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  addonPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addonPillWrapper: {
    position: "relative",
  },
  addonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  addonPillActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  addonPillName: {
    fontSize: 13,
    fontWeight: "600",
    color: DARK,
  },
  addonPillNameActive: {
    color: WHITE,
  },
  addonPillPrice: {
    fontSize: 11,
    color: GRAY,
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
    backgroundColor: DARK,
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
  // Actions
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
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
    marginBottom: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    color: GRAY,
  },
});
