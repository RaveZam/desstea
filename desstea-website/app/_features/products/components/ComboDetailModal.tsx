"use client";

import Modal from "../../../_components/ui/Modal";
import type { ComboRow } from "../services/productsService";

interface Props {
  open: boolean;
  onClose: () => void;
  combo: ComboRow | null;
  onEdit: (combo: ComboRow) => void;
}

export default function ComboDetailModal({ open, onClose, combo, onEdit }: Props) {
  if (!combo) return null;

  const itemsTotal = combo.slots
    .flatMap((s) => s.products)
    .reduce((sum, p) => sum + p.base_price * p.quantity, 0);

  const savings = itemsTotal - Number(combo.price);

  return (
    <Modal open={open} onClose={onClose} title={combo.name} size="sm">
      <div className="space-y-4">
        {/* Price + status row */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-[#6B4F3A]">₱{Number(combo.price).toFixed(2)}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              combo.is_available
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>
              {combo.is_available ? "Available" : "Unavailable"}
            </span>
            <span className="text-xs font-semibold bg-[#FFF3EC] text-[#E8692A] border border-[#F5C5A3] px-2.5 py-1 rounded-full">
              Combo
            </span>
          </div>
        </div>

        {/* Slots */}
        {combo.slots.length > 0 ? (
          <div className="space-y-3">
            {combo.slots.map((slot) => (
              <div key={slot.id}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {slot.category_name}
                </p>
                <div className="space-y-1">
                  {slot.products.map((p) => (
                    <div key={p.product_id} className="flex items-center justify-between gap-3 py-1.5 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        {p.quantity > 1 && (
                          <span className="shrink-0 text-[11px] font-bold bg-[#FFF3EC] text-[#E8692A] border border-[#F5C5A3] px-1.5 py-0.5 rounded-full">
                            {p.quantity}×
                          </span>
                        )}
                        <span className="text-sm text-gray-800 font-medium truncate">{p.product_name}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          ₱{(p.base_price * p.quantity).toFixed(2)}
                        </p>
                        {p.quantity > 1 && (
                          <p className="text-[10px] text-gray-400">₱{p.base_price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No slots configured.</p>
        )}

        {/* Price summary */}
        {combo.slots.some((s) => s.products.length > 0) && (
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Items total</span>
              <span>₱{itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>Combo price</span>
              <span className="text-[#E8692A]">₱{Number(combo.price).toFixed(2)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-xs font-medium text-green-600">
                <span>Customer saves</span>
                <span>₱{savings.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { onClose(); onEdit(combo); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Combo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
