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
        "bg-white rounded-2xl shadow-sm p-4 border border-transparent transition-all cursor-pointer",
        isUnavailable
          ? "opacity-40 grayscale hover:opacity-50"
          : "hover:shadow-md hover:border-[#EDE8E3]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{combo.name}</h3>
          <p className="text-base font-bold text-[#6B4F3A] mt-0.5">₱{Number(combo.price).toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isUnavailable && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
              Unavailable
            </span>
          )}
          <span className="text-[10px] font-semibold bg-[#FFF3EC] text-[#E8692A] border border-[#F5C5A3] px-2 py-0.5 rounded-full">
            Combo
          </span>
        </div>
      </div>

      {/* Slots */}
      {combo.slots.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {combo.slots.map((slot) => (
            <div key={slot.id} className="text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8692A] shrink-0" />
                <span className="font-medium text-gray-600">{slot.category_name}</span>
              </div>
              {slot.products.length > 0 && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {slot.products.map((p) => (
                    <div key={p.product_id} className="flex items-center justify-between gap-2 text-gray-500">
                      <span className="truncate">
                        {p.quantity > 1 && <span className="font-semibold text-gray-700 mr-1">{p.quantity}×</span>}
                        {p.product_name}
                      </span>
                      <span className="text-gray-400 shrink-0">₱{p.base_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-300 mb-3">No slots configured</p>
      )}

      {/* Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-auto"
      >
        <span className="text-[11px] text-gray-400">
          {combo.slots.length} slot{combo.slots.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-500">Delete?</span>
              <button
                onClick={() => onConfirmDelete(combo.id)}
                disabled={deleting}
                className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => onCancelDelete(combo.id)}
                className="px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onEdit(combo)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                title="Edit"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(combo.id)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
