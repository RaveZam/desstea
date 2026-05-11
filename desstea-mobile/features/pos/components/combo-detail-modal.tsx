import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/lib/database";
import {
  LocalCombo,
  ComboSlotSelection,
  LocalAddonOption,
  AddonWithQty,
} from "../types";

const BRAND = "#E8692A";
const BRAND_LIGHT = "#FFF3ED";
const DARK = "#1C1C1E";
const MID = "#48484A";
const GRAY = "#8E8E93";
const SOFT = "#F5F5F7";
const DIVIDER = "#EFEFEF";
const WHITE = "#FFFFFF";
const { height: SCREEN_H } = Dimensions.get("window");

type SlotOption = {
  productId: string;
  productName: string;
  quantity: number;
  upgradePrice: number;
  addonGroupId: string | null;
  originalSlotId: string;
};

type ComboSlot = {
  slotId: string;
  categoryName: string;
  options: SlotOption[];
  isSingleSelect: boolean;
  drinkGroup: string | null;
};

type SlotRow = {
  slot_id: string;
  category_name: string | null;
  product_id: string | null;
  product_name: string | null;
  quantity: number;
  upgrade_price: number;
  addon_group_id: string | null;
  requires_selection: number;
  selection_group: string | null;
};

type Props = {
  visible: boolean;
  combo: LocalCombo | null;
  onConfirm: (combo: LocalCombo, selections: ComboSlotSelection[]) => void;
  onCancel: () => void;
};

export function ComboDetailModal({
  visible,
  combo,
  onConfirm,
  onCancel,
}: Props) {
  const [slots, setSlots] = useState<ComboSlot[]>([]);
  const [selections, setSelections] = useState<
    Record<
      string,
      { productId: string; productName: string; addonGroupId: string | null }
    >
  >({});
  const [addonOptionsMap, setAddonOptionsMap] = useState<
    Record<string, LocalAddonOption[]>
  >({});
  const [slotAddonQtys, setSlotAddonQtys] = useState<
    Record<string, Record<string, number>>
  >({});
  const [activeDrinkSlotId, setActiveDrinkSlotId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!combo) return;
    const rows = db.getAllSync<SlotRow>(
      `SELECT cs.id AS slot_id,
              c.name AS category_name,
              csp.product_id,
              p.name AS product_name,
              COALESCE(csp.quantity, 1) AS quantity,
              COALESCE(csp.upgrade_price, 0) AS upgrade_price,
              p.addon_group_id,
              cs.requires_selection,
              cs.selection_group
       FROM combo_slots cs
       LEFT JOIN categories c ON c.id = cs.category_id
       LEFT JOIN combo_slot_products csp ON csp.combo_slot_id = cs.id
       LEFT JOIN products p ON p.id = csp.product_id
       WHERE cs.combo_id = ?
       ORDER BY cs.sort_order, csp.rowid`,
      [combo.id],
    );

    const slotMap = new Map<string, ComboSlot>();
    let slotIndex = 1;
    for (const row of rows) {
      const isSingleSelect = row.requires_selection === 1;
      const drinkGroup = row.selection_group ?? null;

      if (!slotMap.has(row.slot_id)) {
        slotMap.set(row.slot_id, {
          slotId: row.slot_id,
          categoryName: row.category_name ?? `Slot ${slotIndex}`,
          options: [],
          isSingleSelect,
          drinkGroup,
        });
        slotIndex++;
      }
      if (row.product_id && row.product_name) {
        const slot = slotMap.get(row.slot_id)!;
        if (!slot.options.some((o) => o.productId === row.product_id)) {
          slot.options.push({
            productId: row.product_id,
            productName: row.product_name,
            quantity: row.quantity,
            upgradePrice: row.upgrade_price ?? 0,
            addonGroupId: row.addon_group_id,
            originalSlotId: row.slot_id,
          });
        }
      }
    }

    const allSlots = Array.from(slotMap.values());
    const builtSlots = [
      ...allSlots.filter((s) => s.isSingleSelect),
      ...allSlots.filter((s) => !s.isSingleSelect),
    ];
    setSlots(builtSlots);

    const defaultSelections: Record<
      string,
      { productId: string; productName: string; addonGroupId: string | null }
    > = {};
    const groupsToFetch = new Set<string>();
    const defaultedGroups = new Set<string>();
    let firstDefaultedDrinkSlotId: string | null = null;

    for (const slot of builtSlots) {
      if (slot.isSingleSelect && slot.options.length > 0) {
        const alreadyDefaulted = slot.drinkGroup
          ? defaultedGroups.has(slot.drinkGroup)
          : false;
        if (!alreadyDefaulted) {
          const first = slot.options[0];
          defaultSelections[slot.slotId] = {
            productId: first.productId,
            productName: first.productName,
            addonGroupId: first.addonGroupId,
          };
          if (slot.drinkGroup) {
            defaultedGroups.add(slot.drinkGroup);
            if (!firstDefaultedDrinkSlotId)
              firstDefaultedDrinkSlotId = slot.slotId;
          }
        }
        for (const opt of slot.options) {
          if (opt.addonGroupId) groupsToFetch.add(opt.addonGroupId);
        }
      }
    }
    setSelections(defaultSelections);
    setSlotAddonQtys({});
    setActiveDrinkSlotId(firstDefaultedDrinkSlotId);

    if (groupsToFetch.size > 0) {
      const newMap: Record<string, LocalAddonOption[]> = {};
      for (const groupId of groupsToFetch) {
        newMap[groupId] = db.getAllSync<LocalAddonOption>(
          `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
           FROM addon_options
           WHERE addon_group_id = ? AND is_available = 1
           ORDER BY sort_order`,
          [groupId],
        );
      }
      setAddonOptionsMap(newMap);
    } else {
      setAddonOptionsMap({});
    }
  }, [combo?.id]);

  if (!combo) return null;

  const selectProduct = (slotId: string, option: SlotOption) => {
    const currentSlot = slots.find((s) => s.slotId === slotId);
    setSelections((prev) => {
      const next = { ...prev };
      if (currentSlot?.drinkGroup) {
        for (const s of slots) {
          if (s.drinkGroup === currentSlot.drinkGroup && s.slotId !== slotId) {
            delete next[s.slotId];
          }
        }
      }
      next[slotId] = {
        productId: option.productId,
        productName: option.productName,
        addonGroupId: option.addonGroupId,
      };
      return next;
    });
    setSlotAddonQtys((prev) => {
      const next = { ...prev, [slotId]: {} };
      if (currentSlot?.drinkGroup) {
        for (const s of slots) {
          if (s.drinkGroup === currentSlot.drinkGroup && s.slotId !== slotId) {
            delete next[s.slotId];
          }
        }
      }
      return next;
    });
    if (currentSlot?.drinkGroup) {
      setActiveDrinkSlotId(slotId);
    }

    if (option.addonGroupId && !addonOptionsMap[option.addonGroupId]) {
      const options = db.getAllSync<LocalAddonOption>(
        `SELECT id, addon_group_id, name, price_modifier, is_available, sort_order
         FROM addon_options
         WHERE addon_group_id = ? AND is_available = 1
         ORDER BY sort_order`,
        [option.addonGroupId],
      );
      setAddonOptionsMap((prev) => ({
        ...prev,
        [option.addonGroupId!]: options,
      }));
    }
  };

  const setAddonQty = (slotId: string, addonId: string, qty: number) => {
    setSlotAddonQtys((prev) => ({
      ...prev,
      [slotId]: { ...(prev[slotId] ?? {}), [addonId]: Math.max(0, qty) },
    }));
  };

  const upgradeTotal = slots.reduce((sum, slot) => {
    const sel = selections[slot.slotId];
    if (!sel) return sum;
    const selectedOption = slot.options.find(
      (o) => o.productId === sel.productId,
    );
    return sum + (selectedOption?.upgradePrice ?? 0);
  }, 0);

  const addonTotal = slots.reduce((sum, slot) => {
    const sel = selections[slot.slotId];
    if (!sel?.addonGroupId) return sum;
    const options = addonOptionsMap[sel.addonGroupId] ?? [];
    const qtys = slotAddonQtys[slot.slotId] ?? {};
    return (
      sum +
      options.reduce((s, ao) => s + ao.price_modifier * (qtys[ao.id] ?? 0), 0)
    );
  }, 0);

  const totalPrice = combo.price + upgradeTotal + addonTotal;

  const drinkGroups = new Map<string, boolean>();
  const standaloneSelected: boolean[] = [];
  for (const slot of slots) {
    if (slot.isSingleSelect) {
      if (slot.drinkGroup) {
        const current = drinkGroups.get(slot.drinkGroup) ?? false;
        drinkGroups.set(slot.drinkGroup, current || !!selections[slot.slotId]);
      } else {
        standaloneSelected.push(!!selections[slot.slotId]);
      }
    }
  }
  const allSelected =
    slots.length === 0 ||
    ([...drinkGroups.values()].every(Boolean) &&
      standaloneSelected.every(Boolean));

  const handleConfirm = () => {
    const comboSelections: ComboSlotSelection[] = [];
    for (const slot of slots) {
      if (slot.isSingleSelect) {
        const sel = selections[slot.slotId];
        if (!sel) continue;
        const selectedOption = slot.options.find(
          (o) => o.productId === sel.productId,
        );
        const addonGroupId = sel?.addonGroupId ?? null;
        const options = addonGroupId
          ? (addonOptionsMap[addonGroupId] ?? [])
          : [];
        const qtys = slotAddonQtys[slot.slotId] ?? {};
        const addons: AddonWithQty[] = options
          .filter((ao) => (qtys[ao.id] ?? 0) > 0)
          .map((ao) => ({ option: ao, qty: qtys[ao.id] }));
        comboSelections.push({
          slotId: selectedOption?.originalSlotId ?? slot.slotId,
          slotName: slot.categoryName,
          productId: sel.productId,
          productName: sel.productName,
          upgradePrice: selectedOption?.upgradePrice ?? 0,
          addonGroupId,
          addons,
        });
      } else {
        for (const option of slot.options) {
          comboSelections.push({
            slotId: slot.slotId,
            slotName: slot.categoryName,
            productId: option.productId,
            productName:
              option.quantity > 1
                ? `${option.productName} x${option.quantity}`
                : option.productName,
            upgradePrice: option.upgradePrice ?? 0,
            addonGroupId: null,
            addons: [],
          });
        }
      }
    }
    onConfirm(combo, comboSelections);
  };

  // Derived UI state
  const drinkSlots = slots.filter((s) => s.drinkGroup);
  const nonDrinkSlots = slots.filter((s) => !s.drinkGroup);
  const activeDrinkSlot =
    drinkSlots.find((s) => s.slotId === activeDrinkSlotId) ?? drinkSlots[0];

  const currentAddonSlotId = activeDrinkSlot?.slotId ?? null;
  const currentAddonGroupId = currentAddonSlotId
    ? (selections[currentAddonSlotId]?.addonGroupId ?? null)
    : null;
  const currentAddonOptions = currentAddonGroupId
    ? (addonOptionsMap[currentAddonGroupId] ?? [])
    : [];
  const currentAddonQtys = currentAddonSlotId
    ? (slotAddonQtys[currentAddonSlotId] ?? {})
    : {};

  const drinkSelected = drinkSlots.some((s) => !!selections[s.slotId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.comboBadge}>
                <Ionicons name="fast-food-outline" size={20} color={BRAND} />
              </View>
              <View style={styles.headerMeta}>
                <Text style={styles.comboName}>{combo.name}</Text>
                <Text style={styles.comboSub}>
                  {drinkSlots.length > 0
                    ? `Choose 1 drink · Base ₱${combo.price.toFixed(0)}`
                    : `₱${combo.price.toFixed(0)}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color={MID} />
            </TouchableOpacity>
          </View>

          {/* Scrollable body */}
          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
          >
            {/* ── DRINK SELECTION ── */}
            {drinkSlots.length > 0 && (
              <View style={styles.section}>
                {/* Section label + status badge */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>CHOOSE YOUR DRINK</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      drinkSelected && styles.statusBadgeDone,
                    ]}
                  >
                    <Ionicons
                      name={drinkSelected ? "checkmark" : "ellipse-outline"}
                      size={10}
                      color={drinkSelected ? WHITE : BRAND}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        drinkSelected && styles.statusBadgeTextDone,
                      ]}
                    >
                      {drinkSelected ? "Selected" : "Required"}
                    </Text>
                  </View>
                </View>

                {/* Type tabs — only shown when both milktea + frappe exist */}
                {drinkSlots.length > 1 && (
                  <View style={styles.drinkTabs}>
                    {drinkSlots.map((slot) => {
                      const isActive = slot.slotId === activeDrinkSlot?.slotId;
                      const hasSelection = !!selections[slot.slotId];
                      return (
                        <TouchableOpacity
                          key={slot.slotId}
                          style={[
                            styles.drinkTab,
                            isActive && styles.drinkTabActive,
                          ]}
                          onPress={() => setActiveDrinkSlotId(slot.slotId)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.drinkTabText,
                              isActive && styles.drinkTabTextActive,
                            ]}
                          >
                            {slot.categoryName}
                          </Text>
                          {hasSelection && <View style={styles.drinkTabDot} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Product list for the active drink tab */}
                {activeDrinkSlot && (
                  <View style={styles.productCard}>
                    {activeDrinkSlot.options.map((option, idx) => {
                      const isSelected =
                        selections[activeDrinkSlot.slotId]?.productId ===
                        option.productId;
                      const isLast = idx === activeDrinkSlot.options.length - 1;
                      return (
                        <TouchableOpacity
                          key={option.productId}
                          style={[
                            styles.productRow,
                            isSelected && styles.productRowSelected,
                            !isLast && styles.productRowDivider,
                          ]}
                          onPress={() =>
                            selectProduct(activeDrinkSlot.slotId, option)
                          }
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.radio,
                              isSelected && styles.radioSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                          <Text
                            style={[
                              styles.productName,
                              isSelected && styles.productNameSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {option.quantity > 1 ? `${option.quantity}× ` : ""}
                            {option.productName}
                          </Text>
                          {option.upgradePrice > 0 ? (
                            <View
                              style={[
                                styles.upgradePill,
                                isSelected && styles.upgradePillSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.upgradePrice,
                                  isSelected && styles.upgradePriceSelected,
                                ]}
                              >
                                +₱{option.upgradePrice}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.includedTag}>Included</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* ── ADD-ONS ── */}
            {currentAddonOptions.length > 0 && currentAddonSlotId && (
              <Pressable style={styles.section}>
                <Text style={styles.sectionLabel}>ADD-ONS</Text>
                <View style={styles.addonCard}>
                  {currentAddonOptions.map((ao, idx) => {
                    const qty = currentAddonQtys[ao.id] ?? 0;
                    const isLast = idx === currentAddonOptions.length - 1;
                    return (
                      <View
                        key={ao.id}
                        style={[
                          styles.addonRow,
                          !isLast && styles.addonRowDivider,
                        ]}
                      >
                        <View style={styles.addonInfo}>
                          <Text style={styles.addonName}>{ao.name}</Text>
                          {ao.price_modifier > 0 && (
                            <Text style={styles.addonPrice}>
                              +₱{ao.price_modifier.toFixed(2)} each
                            </Text>
                          )}
                        </View>
                        <View style={styles.addonStepper}>
                          <TouchableOpacity
                            style={[
                              styles.stepperBtn,
                              qty === 0 && styles.stepperBtnOff,
                            ]}
                            onPress={() =>
                              setAddonQty(currentAddonSlotId, ao.id, qty - 1)
                            }
                            disabled={qty === 0}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text
                              style={[
                                styles.stepperBtnText,
                                qty === 0 && styles.stepperBtnTextOff,
                              ]}
                            >
                              −
                            </Text>
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.stepperQty,
                              qty > 0 && styles.stepperQtyActive,
                            ]}
                          >
                            {qty}
                          </Text>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() =>
                              setAddonQty(currentAddonSlotId, ao.id, qty + 1)
                            }
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Text style={styles.stepperBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            )}

            {/* ── INCLUDED ITEMS ── */}
            {nonDrinkSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>WHAT'S INCLUDED</Text>
                <View style={styles.includedCard}>
                  {nonDrinkSlots.map((slot) =>
                    slot.options.map((option, idx) => {
                      const isLast =
                        idx === slot.options.length - 1 &&
                        nonDrinkSlots.indexOf(slot) ===
                          nonDrinkSlots.length - 1;
                      return (
                        <View
                          key={option.productId}
                          style={[
                            styles.includedRow,
                            !isLast && styles.includedRowDivider,
                          ]}
                        >
                          <View style={styles.includedCheck}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={BRAND}
                            />
                          </View>
                          <Text style={styles.includedName}>
                            {option.quantity > 1 ? `${option.quantity}× ` : ""}
                            {option.productName}
                          </Text>
                        </View>
                      );
                    }),
                  )}
                </View>
              </View>
            )}

            <View style={{ height: 4 }} />
          </ScrollView>

          {/* ── STICKY FOOTER ── */}
          <View style={styles.footer}>
            {/* Price summary */}
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerLabel}>Total</Text>
              <View style={styles.footerPriceRight}>
                <Text style={styles.footerTotal}>₱{totalPrice.toFixed(2)}</Text>
                {(upgradeTotal > 0 || addonTotal > 0) && (
                  <Text style={styles.footerBreakdown}>
                    ₱{combo.price.toFixed(0)} base
                    {upgradeTotal > 0 ? ` + ₱${upgradeTotal} upgrade` : ""}
                    {addonTotal > 0
                      ? ` + ₱${addonTotal.toFixed(2)} add-ons`
                      : ""}
                  </Text>
                )}
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.addBtn, !allSelected && styles.addBtnDisabled]}
              onPress={handleConfirm}
              disabled={!allSelected}
              activeOpacity={0.85}
            >
              <Ionicons name="bag-add-outline" size={18} color={WHITE} />
              <Text style={styles.addBtnText}>Add to Order</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: SCREEN_H * 0.88,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: DIVIDER,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  comboBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF3ED",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  comboName: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK,
    letterSpacing: -0.3,
  },
  comboSub: {
    fontSize: 12,
    color: GRAY,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Body ──
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingTop: 20,
    paddingBottom: 12,
    gap: 24,
  },
  section: {
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
  },

  // Status badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#FFF3ED",
    borderWidth: 1,
    borderColor: BRAND,
  },
  statusBadgeDone: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: BRAND,
    letterSpacing: 0.3,
  },
  statusBadgeTextDone: {
    color: WHITE,
  },

  // Drink type tabs (Milktea / Frappe switcher)
  drinkTabs: {
    flexDirection: "row",
    backgroundColor: SOFT,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  drinkTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 10,
    position: "relative",
  },
  drinkTabActive: {
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  drinkTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: GRAY,
  },
  drinkTabTextActive: {
    color: DARK,
    fontWeight: "700",
  },
  // Dot indicator when a selection exists in that tab
  drinkTabDot: {
    position: "absolute",
    top: 7,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND,
  },

  // Product list card
  productCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIVIDER,
    overflow: "hidden",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: WHITE,
  },
  productRowSelected: {
    backgroundColor: "#FFF3ED",
  },
  productRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DIVIDER,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: BRAND,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: BRAND,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: DARK,
  },
  productNameSelected: {
    fontWeight: "700",
    color: BRAND,
  },
  upgradePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FFF3ED",
    borderWidth: 1,
    borderColor: "#FDDFC4",
  },
  upgradePillSelected: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  upgradePrice: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
  },
  upgradePriceSelected: {
    color: WHITE,
  },
  includedTag: {
    fontSize: 12,
    color: GRAY,
  },

  // Add-on card
  addonCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIVIDER,
    overflow: "hidden",
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addonRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  addonInfo: {
    flex: 1,
    gap: 2,
    marginRight: 12,
  },
  addonName: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
  },
  addonPrice: {
    fontSize: 12,
    color: GRAY,
  },
  addonStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: DIVIDER,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnOff: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: DARK,
    lineHeight: 22,
    textAlign: "center",
    includeFontPadding: false,
  },
  stepperBtnTextOff: {
    color: GRAY,
  },
  stepperQty: {
    width: 30,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: GRAY,
  },
  stepperQtyActive: {
    color: BRAND,
    fontWeight: "800",
  },

  // Included items card
  includedCard: {
    backgroundColor: SOFT,
    borderRadius: 14,
    overflow: "hidden",
  },
  includedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  includedRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  includedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF3ED",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  includedName: {
    fontSize: 14,
    fontWeight: "500",
    color: MID,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    gap: 14,
    backgroundColor: WHITE,
  },
  footerPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: GRAY,
  },
  footerPriceRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  footerTotal: {
    fontSize: 26,
    fontWeight: "800",
    color: DARK,
    letterSpacing: -0.5,
  },
  footerBreakdown: {
    fontSize: 11,
    color: GRAY,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
  },
});
