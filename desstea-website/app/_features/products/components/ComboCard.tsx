"use client";

import type { ComboRow } from "../services/productsService";

interface Props {
  combo: ComboRow;
  onClick: (combo: ComboRow) => void;
  onEdit: (combo: ComboRow) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  confirmDelete: boolean;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: (id: string) => void;
}

export default function ComboCard({ combo, onClick, onEdit, onDelete, deleting, confirmDelete, onConfirmDelete, onCancelDelete }: Props) {
  const isUnavailable = !combo.is_available;

  return (
    <div
      onClick={() => onClick(combo)}
      className={[
        "group bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col",
        isUnavailable
          ? "opacity-40 grayscale border-gray-100 hover:opacity-50"
          : "border-gray-100 hover:border-[#E8692A]/20 hover:shadow-md",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-[#FFF3EC] text-[#E8692A] border border-[#F5C5A3] px-2 py-0.5 rounded-full shrink-0">
              Combo
            </span>
            {isUnavailable && (
              <span className="text-[10px] font-medium bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                Unavailable
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug truncate">{combo.name}</h3>
        </div>
        <p className="text-lg font-bold text-[#6B4F3A] shrink-0 leading-none mt-5">
          &#8369;{Number(combo.price).toFixed(2)}
        </p>
      </div>

      {/* Slots */}
      {combo.slots.length > 0 ? (
        <div className="space-y-2 mb-3 flex-1">
          {combo.slots.map((slot) => (
            <div key={slot.id} className="bg-gray-50 rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8692A] shrink-0" />
                <span className="text-xs font-semibold text-gray-700">{slot.category_name}</span>
                {slot.requires_selection && (
                  <span className="text-[9px] font-bold text-[#E8692A] bg-[#FFF3EC] px-1.5 py-0.5 rounded-full ml-auto">
                    Pick 1
                  </span>
                )}
              </div>
              {slot.products.length > 0 && (
                <div className="ml-3 space-y-0.5">
                  {slot.products.slice(0, 2).map((p) => (
                    <div key={p.product_id} className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="truncate">
                        {p.quantity > 1 && <span className="font-semibold text-gray-700 mr-0.5">{p.quantity}x</span>}
                        {p.product_name}
                        {p.upgrade_price > 0 && (
                          <span className="ml-1 text-[10px] font-semibold text-[#E8692A]">+&#8369;{p.upgrade_price}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {slot.products.length > 2 && (
                    <p className="text-[10px] text-gray-400">+{slot.products.length - 2} more</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-300 mb-3 flex-1">No slots configured</p>
      )}

      {/* Footer actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto"
      >
        <span className="text-[10px] text-gray-400 font-medium">
          {combo.slots.length} slot{combo.slots.length !== 1 ? "s" : ""}
        </span>

        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-red-500 font-medium">Delete?</span>
            <button
              onClick={() => onConfirmDelete(combo.id)}
              disabled={deleting}
              className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[11px] font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deleting ? "..." : "Yes"}
            </button>
            <button
              onClick={() => onCancelDelete(combo.id)}
              className="px-2.5 py-1 border border-gray-200 rounded-lg text-[11px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(combo)}
              className="p-1.5 text-gray-400 hover:text-[#E8692A] hover:bg-orange-50 transition-colors rounded-lg"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(combo.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors rounded-lg"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
