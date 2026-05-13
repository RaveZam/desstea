"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import Toggle from "../../../_components/ui/Toggle";
import type { Branch, Category, Product } from "../../../_types";
import type { ComboRow } from "../services/productsService";
import { createCombo, updateCombo } from "../actions";

interface ProductDraft {
  product_id: string;
  quantity: number;
  upgrade_price: number;
}

interface SlotDraft {
  category_id: string;
  requires_selection: boolean;
  selection_group: string | null;
  products: ProductDraft[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  combo: ComboRow | null;
  categories: Category[];
  products: Product[];
  branches: Branch[];
}

const emptyProduct = (): ProductDraft => ({
  product_id: "",
  quantity: 1,
  upgrade_price: 0,
});
const emptySlot = (): SlotDraft => ({
  category_id: "",
  requires_selection: false,
  selection_group: null,
  products: [emptyProduct()],
});

export default function ComboFormModal({
  open,
  onClose,
  combo,
  categories,
  products,
  branches,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [allProductsFlags, setAllProductsFlags] = useState<boolean[]>([]);
  const [availableBranchIds, setAvailableBranchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotApplyPrices, setSlotApplyPrices] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(combo?.name ?? "");
      setPrice(combo ? combo.price.toFixed(2) : "");
      setIsAvailable(combo?.is_available ?? true);
      setAvailableBranchIds(combo?.available_branch_ids ?? []);
      const initialSlots =
        combo?.slots.map((s) => ({
          category_id: s.category_id,
          requires_selection: s.requires_selection,
          selection_group: s.selection_group,
          products:
            s.products.length > 0
              ? s.products.map((p) => ({
                  product_id: p.product_id,
                  quantity: p.quantity,
                  upgrade_price: p.upgrade_price ?? 0,
                }))
              : [emptyProduct()],
        })) ?? [];
      setSlots(initialSlots);
      setAllProductsFlags(initialSlots.map(() => false));
      setSlotApplyPrices(initialSlots.map(() => ""));
      setError(null);
    }
  }, [open, combo]);

  function toggleBranch(id: string) {
    setAvailableBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  function addSlot() {
    setSlots((prev) => [...prev, emptySlot()]);
    setAllProductsFlags((prev) => [...prev, false]);
    setSlotApplyPrices((prev) => [...prev, ""]);
  }

  function removeSlot(slotIdx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== slotIdx));
    setAllProductsFlags((prev) => prev.filter((_, i) => i !== slotIdx));
    setSlotApplyPrices((prev) => prev.filter((_, i) => i !== slotIdx));
  }

  function setSlotCategory(slotIdx: number, category_id: string) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx ? { ...s, category_id, products: [emptyProduct()] } : s,
      ),
    );
    setAllProductsFlags((prev) =>
      prev.map((f, i) => (i === slotIdx ? false : f)),
    );
    setSlotApplyPrices((prev) => prev.map((v, i) => (i === slotIdx ? "" : v)));
  }

  function applyUpgradePriceToAll(slotIdx: number) {
    const raw = slotApplyPrices[slotIdx] ?? "";
    const val = Math.max(0, parseFloat(raw) || 0);
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx
          ? {
              ...s,
              products: s.products.map((p) => ({ ...p, upgrade_price: val })),
            }
          : s,
      ),
    );
  }

  function toggleAllProducts(slotIdx: number, checked: boolean) {
    const slot = slots[slotIdx];
    if (!slot.category_id) return;
    if (checked) {
      const catProducts = getProductsForCategory(slot.category_id);
      const allDrafts = catProducts.map((p) => ({
        product_id: p.id,
        quantity: 1,
        upgrade_price: 0,
      }));
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIdx
            ? {
                ...s,
                products: allDrafts.length > 0 ? allDrafts : [emptyProduct()],
              }
            : s,
        ),
      );
    } else {
      setSlots((prev) =>
        prev.map((s, i) =>
          i === slotIdx ? { ...s, products: [emptyProduct()] } : s,
        ),
      );
    }
    setAllProductsFlags((prev) =>
      prev.map((f, i) => (i === slotIdx ? checked : f)),
    );
  }

  function addProductRow(slotIdx: number) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx ? { ...s, products: [...s.products, emptyProduct()] } : s,
      ),
    );
  }

  function removeProductRow(slotIdx: number, pidIdx: number) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx
          ? { ...s, products: s.products.filter((_, j) => j !== pidIdx) }
          : s,
      ),
    );
  }

  function updateProductRow(
    slotIdx: number,
    pidIdx: number,
    patch: Partial<ProductDraft>,
  ) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx
          ? {
              ...s,
              products: s.products.map((p, j) =>
                j === pidIdx ? { ...p, ...patch } : p,
              ),
            }
          : s,
      ),
    );
  }

  function getProductsForCategory(categoryId: string): Product[] {
    return products.filter((p) => p.category_id === categoryId);
  }

  async function handleSave() {
    if (!name.trim() || price === "" || isNaN(parseFloat(price))) return;
    setLoading(true);
    setError(null);

    const slotData = slots
      .filter((s) => s.category_id)
      .map((s) => ({
        category_id: s.category_id,
        requires_selection: s.requires_selection,
        selection_group: s.requires_selection
          ? s.selection_group || null
          : null,
        products: s.products
          .filter((p) => p.product_id)
          .map((p) => ({
            product_id: p.product_id,
            quantity: Math.max(1, p.quantity),
            upgrade_price: p.upgrade_price ?? 0,
          })),
      }));

    const { error: err } = combo
      ? await updateCombo(combo.id, {
          name: name.trim(),
          price: parseFloat(price),
          is_available: isAvailable,
          slots: slotData,
          available_branch_ids: availableBranchIds,
        })
      : await createCombo({
          name: name.trim(),
          price: parseFloat(price),
          is_available: isAvailable,
          slots: slotData,
          available_branch_ids: availableBranchIds,
        });

    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.refresh();
      onClose();
    }
  }

  // Build price breakdown: one row per slot, averaged across all selected products
  const slotBreakdowns = slots
    .filter((s) => s.category_id)
    .map((slot) => {
      const cat = categories.find((c) => c.id === slot.category_id);
      const prices = slot.products
        .filter((p) => p.product_id)
        .map((p) => {
          const product = products.find((prod) => prod.id === p.product_id);
          return product ? product.base_price * p.quantity : null;
        })
        .filter((v): v is number => v !== null);
      const avgPrice =
        prices.length > 0
          ? Math.round(
              (prices.reduce((s, v) => s + v, 0) / prices.length) * 100,
            ) / 100
          : 0;
      return { cat, avgPrice, count: prices.length };
    })
    .filter((s) => s.count > 0);
  const slotPricesSum =
    Math.round(slotBreakdowns.reduce((sum, s) => sum + s.avgPrice, 0) * 100) /
    100;

  // Detect duplicate products within each slot
  const hasDuplicateProducts = slots.some((slot) => {
    const ids = slot.products.map((p) => p.product_id).filter(Boolean);
    return ids.length !== new Set(ids).size;
  });

  function isProductDuplicate(slotIdx: number, pidIdx: number): boolean {
    const slot = slots[slotIdx];
    const pid = slot.products[pidIdx].product_id;
    if (!pid) return false;
    return slot.products.some((p, j) => j !== pidIdx && p.product_id === pid);
  }

  const inputCls =
    "border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] bg-white";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={combo ? "Edit Combo" : "New Combo"}
      size="xl"
    >
      <div className="space-y-5">
        {/* Name + Price + Availability */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Combo Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milktea + Snack Combo"
              className={`w-full ${inputCls}`}
            />
          </div>
          <div className="col-span-2 sm:col-span-1 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Combo Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  ₱
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full ${inputCls} pl-7`}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="pb-2">
              <Toggle
                checked={isAvailable}
                onChange={setIsAvailable}
                label="Available"
              />
            </div>
          </div>
        </div>

        {/* Slots */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Combo Slots
              </label>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Each slot is a category of products included in this combo.
              </p>
            </div>
            <button
              type="button"
              onClick={addSlot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8692A] text-white text-xs font-semibold hover:bg-[#d45c20] transition-colors"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Slot
            </button>
          </div>

          {slots.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-gray-500">No slots yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Add a slot to pick product categories for this combo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot, slotIdx) => {
                const catProducts = getProductsForCategory(slot.category_id);
                const isAllProducts = allProductsFlags[slotIdx] ?? false;
                return (
                  <div
                    key={slotIdx}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Slot header row */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-400 shrink-0 w-5 text-center">
                        {slotIdx + 1}
                      </span>
                      <select
                        value={slot.category_id}
                        onChange={(e) =>
                          setSlotCategory(slotIdx, e.target.value)
                        }
                        className={`flex-1 ${inputCls} text-xs font-medium py-1.5`}
                      >
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {slot.category_id && (
                        <label
                          className="flex items-center gap-1.5 shrink-0 cursor-pointer select-none"
                          title="Add all products in this category"
                        >
                          <input
                            type="checkbox"
                            checked={isAllProducts}
                            onChange={(e) =>
                              toggleAllProducts(slotIdx, e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded accent-[#E8692A] cursor-pointer"
                          />
                          <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                            Add all
                          </span>
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSlot(slotIdx)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        title="Remove slot"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="px-3 py-3 space-y-3">
                      {/* Customer picks one toggle + Selection Group */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                          <input
                            type="checkbox"
                            checked={slot.requires_selection}
                            onChange={(e) =>
                              setSlots((prev) =>
                                prev.map((s, i) =>
                                  i === slotIdx
                                    ? {
                                        ...s,
                                        requires_selection: e.target.checked,
                                        selection_group: e.target.checked
                                          ? s.selection_group
                                          : null,
                                      }
                                    : s,
                                ),
                              )
                            }
                            className="w-3.5 h-3.5 rounded accent-[#E8692A] cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-gray-700">
                            Customer picks one from this slot
                          </span>
                        </label>

                        {slot.requires_selection && (
                          <div className="ml-5 p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-1.5">
                            <div>
                              <label className="block text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-1">
                                Selection Group
                              </label>
                              <select
                                value={slot.selection_group ?? ""}
                                onChange={(e) =>
                                  setSlots((prev) =>
                                    prev.map((s, i) =>
                                      i === slotIdx
                                        ? {
                                            ...s,
                                            selection_group:
                                              e.target.value || null,
                                          }
                                        : s,
                                    ),
                                  )
                                }
                                className="w-full border border-sky-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 bg-white"
                              >
                                <option value="">— Select group —</option>
                                <option value="drink">Drink</option>
                                <option value="meal">Meal</option>
                              </select>
                            </div>
                            <p className="text-[10px] text-sky-500 leading-relaxed">
                              Slots sharing the same group name are linked — the
                              customer picks <strong>one product total</strong>{" "}
                              across all slots in that group.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Product rows */}
                      {slot.category_id && (
                        <div className="space-y-2">
                          {/* Apply upgrade price to all */}
                          {slot.products.some((p) => p.product_id) && (
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                Apply +₱ to all
                              </span>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <span className="pl-2 text-xs text-gray-400 pointer-events-none select-none">
                                  ₱
                                </span>
                                <input
                                  type="number"
                                  value={slotApplyPrices[slotIdx] ?? ""}
                                  onChange={(e) =>
                                    setSlotApplyPrices((prev) =>
                                      prev.map((v, i) =>
                                        i === slotIdx ? e.target.value : v,
                                      ),
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    applyUpgradePriceToAll(slotIdx)
                                  }
                                  placeholder="0"
                                  className="w-16 px-1.5 py-1 text-xs focus:outline-none bg-white"
                                  min={0}
                                  step={1}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => applyUpgradePriceToAll(slotIdx)}
                                className="px-2.5 py-1 rounded-lg bg-[#E8692A] text-white text-[10px] font-bold hover:bg-[#d45c20] transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          )}

                          {/* Individual product rows */}
                          {slot.products.map((pd, pidIdx) => {
                            const isDuplicate = isProductDuplicate(
                              slotIdx,
                              pidIdx,
                            );
                            return (
                              <div
                                key={pidIdx}
                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                              >
                                {/* Quantity stepper */}
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProductRow(slotIdx, pidIdx, {
                                        quantity: Math.max(1, pd.quantity - 1),
                                      })
                                    }
                                    className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm font-bold"
                                  >
                                    −
                                  </button>
                                  <span className="w-7 text-center text-xs font-bold text-gray-700 select-none">
                                    {pd.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProductRow(slotIdx, pidIdx, {
                                        quantity: pd.quantity + 1,
                                      })
                                    }
                                    className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Product dropdown */}
                                <div className="relative flex-1">
                                  <select
                                    value={pd.product_id}
                                    onChange={(e) =>
                                      updateProductRow(slotIdx, pidIdx, {
                                        product_id: e.target.value,
                                      })
                                    }
                                    className={`w-full ${inputCls} text-xs py-1.5 ${isDuplicate ? "!border-red-400 !ring-red-200 !bg-red-50" : ""}`}
                                    title={
                                      isDuplicate
                                        ? "Duplicate Product"
                                        : undefined
                                    }
                                  >
                                    <option value="">Select product…</option>
                                    {catProducts.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                  {isDuplicate && (
                                    <span className="text-[10px] text-red-500 font-medium mt-0.5 block">
                                      Duplicate product
                                    </span>
                                  )}
                                </div>

                                {/* Upgrade price */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-xs text-gray-400 font-medium">
                                    +₱
                                  </span>
                                  <input
                                    type="number"
                                    value={pd.upgrade_price}
                                    onChange={(e) =>
                                      updateProductRow(slotIdx, pidIdx, {
                                        upgrade_price: Math.max(
                                          0,
                                          parseFloat(e.target.value) || 0,
                                        ),
                                      })
                                    }
                                    placeholder="0"
                                    className="w-16 border border-gray-300 rounded-lg px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] bg-white"
                                    min={0}
                                    step={1}
                                    title="Extra cost for choosing this product"
                                  />
                                </div>

                                {slot.products.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeProductRow(slotIdx, pidIdx)
                                    }
                                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => addProductRow(slotIdx)}
                            className="text-xs text-[#6B4F3A] font-semibold hover:underline"
                          >
                            + Add another product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Branch Availability */}
        {branches.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Branch Availability
            </label>
            <div className="grid grid-cols-2 gap-2">
              {branches.map((b) => (
                <Toggle
                  key={b.id}
                  checked={availableBranchIds.includes(b.id)}
                  onChange={() => toggleBranch(b.id)}
                  label={b.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price breakdown */}
        {slotBreakdowns.length > 0 && (
          <div className="bg-[#FFF8F4] border border-[#F5C5A3] rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold text-[#6B4F3A] uppercase tracking-widest mb-2.5">
              Price Breakdown
            </p>
            {slotBreakdowns.map(({ cat, avgPrice }, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs text-gray-600"
              >
                <span className="font-medium text-gray-700">
                  {cat?.name ?? "Unknown"}
                </span>
                <span className="font-medium">₱{avgPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-gray-400 border-t border-[#F5C5A3] pt-2 mt-2">
              <span>Items total</span>
              <span>₱{slotPricesSum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Combo price</span>
              <span className="text-[#E8692A]">
                ₱
                {price !== "" && !isNaN(parseFloat(price))
                  ? parseFloat(price).toFixed(2)
                  : "—"}
              </span>
            </div>
            {price !== "" &&
              !isNaN(parseFloat(price)) &&
              slotPricesSum > parseFloat(price) && (
                <div className="flex justify-between text-xs text-green-600 font-medium">
                  <span>Customer saves</span>
                  <span>
                    ₱
                    {(
                      Math.round((slotPricesSum - parseFloat(price)) * 100) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={
              loading ||
              !name.trim() ||
              price === "" ||
              isNaN(parseFloat(price)) ||
              hasDuplicateProducts
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : combo ? "Save Changes" : "Create Combo"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
