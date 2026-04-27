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
}

interface SlotDraft {
  category_id: string;
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

const emptyProduct = (): ProductDraft => ({ product_id: "", quantity: 1 });
const emptySlot = (): SlotDraft => ({ category_id: "", products: [emptyProduct()] });

export default function ComboFormModal({ open, onClose, combo, categories, products, branches }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [availableBranchIds, setAvailableBranchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(combo?.name ?? "");
      setPrice(combo?.price ?? "");
      setIsAvailable(combo?.is_available ?? true);
      setAvailableBranchIds(combo?.available_branch_ids ?? []);
      setSlots(
        combo?.slots.map((s) => ({
          category_id: s.category_id,
          products: s.products.length > 0
            ? s.products.map((p) => ({ product_id: p.product_id, quantity: p.quantity }))
            : [emptyProduct()],
        })) ?? []
      );
      setError(null);
    }
  }, [open, combo]);

  function toggleBranch(id: string) {
    setAvailableBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function addSlot() {
    setSlots((prev) => [...prev, emptySlot()]);
  }

  function removeSlot(slotIdx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== slotIdx));
  }

  function setSlotCategory(slotIdx: number, category_id: string) {
    setSlots((prev) =>
      prev.map((s, i) => (i === slotIdx ? { category_id, products: [emptyProduct()] } : s))
    );
  }

  function addProductRow(slotIdx: number) {
    setSlots((prev) =>
      prev.map((s, i) => (i === slotIdx ? { ...s, products: [...s.products, emptyProduct()] } : s))
    );
  }

  function removeProductRow(slotIdx: number, pidIdx: number) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx ? { ...s, products: s.products.filter((_, j) => j !== pidIdx) } : s
      )
    );
  }

  function updateProductRow(slotIdx: number, pidIdx: number, patch: Partial<ProductDraft>) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIdx
          ? { ...s, products: s.products.map((p, j) => (j === pidIdx ? { ...p, ...patch } : p)) }
          : s
      )
    );
  }

  function getProductsForCategory(categoryId: string): Product[] {
    return products.filter((p) => p.category_id === categoryId);
  }

  async function handleSave() {
    if (!name.trim() || price === "") return;
    setLoading(true);
    setError(null);

    const slotData = slots
      .filter((s) => s.category_id)
      .map((s) => ({
        category_id: s.category_id,
        products: s.products
          .filter((p) => p.product_id)
          .map((p) => ({ product_id: p.product_id, quantity: Math.max(1, p.quantity) })),
      }));

    const cleanPrice = Math.round(Number(price) * 100) / 100;

    const { error: err } = combo
      ? await updateCombo(combo.id, { name: name.trim(), price: cleanPrice, is_available: isAvailable, slots: slotData, available_branch_ids: availableBranchIds })
      : await createCombo({ name: name.trim(), price: cleanPrice, is_available: isAvailable, slots: slotData, available_branch_ids: availableBranchIds });

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
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((s, v) => s + v, 0) / prices.length * 100) / 100 : 0;
      return { cat, avgPrice, count: prices.length };
    })
    .filter((s) => s.count > 0);
  const slotPricesSum = Math.round(slotBreakdowns.reduce((sum, s) => sum + s.avgPrice, 0) * 100) / 100;

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] bg-white";

  return (
    <Modal open={open} onClose={onClose} title={combo ? "Edit Combo" : "New Combo"} size="md">
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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

        {/* Price + Availability */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Combo Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">₱</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0.00"
                className={`w-full ${inputCls} pl-7`}
                min={0}
                step={0.01}
              />
            </div>
          </div>
          <div className="pb-2">
            <Toggle checked={isAvailable} onChange={setIsAvailable} label="Available" />
          </div>
        </div>

        {/* Slots */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Combo Slots
            </label>
            <button
              type="button"
              onClick={addSlot}
              className="flex items-center gap-1 text-xs font-semibold text-[#E8692A] hover:text-[#d45c20] transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Slot
            </button>
          </div>

          {slots.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-400">No slots yet.</p>
              <p className="text-xs text-gray-300 mt-0.5">Add a slot to pick products for this combo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map((slot, slotIdx) => {
                const catProducts = getProductsForCategory(slot.category_id);
                return (
                  <div key={slotIdx} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2">
                    {/* Category row */}
                    <div className="flex items-center gap-2">
                      <select
                        value={slot.category_id}
                        onChange={(e) => setSlotCategory(slotIdx, e.target.value)}
                        className={`flex-1 ${inputCls} text-xs font-medium`}
                      >
                        <option value="">Select category…</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSlot(slotIdx)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        title="Remove slot"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {/* Product rows */}
                    {slot.category_id && (
                      <div className="ml-3 space-y-1.5">
                        {slot.products.map((pd, pidIdx) => {
                          const selectedProduct = products.find((p) => p.id === pd.product_id);
                          return (
                            <div key={pidIdx} className="flex items-center gap-2">
                              {/* Quantity stepper */}
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateProductRow(slotIdx, pidIdx, { quantity: Math.max(1, pd.quantity - 1) })}
                                  className="w-6 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-gray-700 select-none">
                                  {pd.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateProductRow(slotIdx, pidIdx, { quantity: pd.quantity + 1 })}
                                  className="w-6 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold"
                                >
                                  +
                                </button>
                              </div>

                              {/* Product dropdown */}
                              <select
                                value={pd.product_id}
                                onChange={(e) => updateProductRow(slotIdx, pidIdx, { product_id: e.target.value })}
                                className={`flex-1 ${inputCls} text-xs`}
                              >
                                <option value="">Select product…</option>
                                {catProducts.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>

                              {selectedProduct && (
                                <span className="text-xs font-medium text-[#6B4F3A] shrink-0 whitespace-nowrap">
                                  ₱{(Math.round(selectedProduct.base_price * pd.quantity * 100) / 100).toFixed(2)}
                                </span>
                              )}

                              {slot.products.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeProductRow(slotIdx, pidIdx)}
                                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
                          className="text-xs text-[#6B4F3A] font-medium hover:underline"
                        >
                          + Add another product
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Branch Availability */}
        {branches.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
          <div className="bg-[#FFF8F4] border border-[#F5C5A3] rounded-xl p-3.5 space-y-1.5">
            <p className="text-xs font-semibold text-[#6B4F3A] uppercase tracking-wide mb-2">Price Breakdown</p>
            {slotBreakdowns.map(({ cat, avgPrice }, idx) => (
              <div key={idx} className="flex justify-between text-xs text-gray-600">
                <span className="font-medium text-gray-700">{cat?.name ?? "Unknown"}</span>
                <span className="font-medium">₱{avgPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-gray-400 border-t border-[#F5C5A3] pt-1.5 mt-1.5">
              <span>Items total</span>
              <span>₱{slotPricesSum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Combo price</span>
              <span className="text-[#E8692A]">₱{price !== "" ? Number(price).toFixed(2) : "—"}</span>
            </div>
            {price !== "" && slotPricesSum > Number(price) && (
              <div className="flex justify-between text-xs text-green-600 font-medium">
                <span>Customer saves</span>
                <span>₱{(Math.round((slotPricesSum - Number(price)) * 100) / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={loading || !name.trim() || price === ""}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : combo ? "Save Changes" : "Create Combo"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
