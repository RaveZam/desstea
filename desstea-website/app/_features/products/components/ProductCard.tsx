"use client";

import { useState } from "react";
import Badge from "../../../_components/ui/Badge";
import type { Product } from "../../../_types";
import type { AddonGroupRow } from "../services/productsService";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  addonGroupTemplates: AddonGroupRow[];
  onDuplicate?: (product: Product) => Promise<void>;
}

export default function ProductCard({
  product,
  onClick,
  addonGroupTemplates,
  onDuplicate,
}: ProductCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const addonGroup = addonGroupTemplates.find(
    (g) => g.id === product.addon_group_id,
  );
  const minPrice =
    product.has_sizes && product.sizes.length > 0
      ? Math.min(...product.sizes.map((s) => s.size_price))
      : product.base_price;
  const maxPrice =
    product.has_sizes && product.sizes.length > 0
      ? Math.max(...product.sizes.map((s) => s.size_price))
      : product.base_price;

  const isUnavailable = !product.is_available;

  async function handleConfirmDuplicate(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDuplicate) return;
    setDuplicating(true);
    await onDuplicate(product);
    setDuplicating(false);
    setConfirming(false);
  }

  return (
    <div
      onClick={() => {
        if (!confirming) onClick(product);
      }}
      className={[
        "group bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all border border-transparent",
        isUnavailable
          ? "opacity-40 grayscale hover:opacity-50 hover:shadow-sm"
          : "hover:shadow-md hover:border-[#EDE8E3]",
      ].join(" ")}
    >
      {/* Name + category */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isUnavailable && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
              Unavailable
            </span>
          )}
          <Badge variant="default">{product.category_name}</Badge>
          {onDuplicate && !confirming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(true);
              }}
              title="Duplicate product"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 p-1 rounded-lg text-gray-400 hover:text-[#E8692A] hover:bg-orange-50"
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
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Duplicate confirm row */}
      {confirming && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-2 p-2 bg-orange-50 border border-orange-100 rounded-xl"
        >
          <span className="text-xs text-gray-600 flex-1">
            Duplicate this product?
          </span>
          <button
            onClick={handleConfirmDuplicate}
            disabled={duplicating}
            className="text-xs font-semibold text-white bg-[#E8692A] px-2.5 py-1 rounded-lg hover:bg-[#d45c20] disabled:opacity-50 transition-colors"
          >
            {duplicating ? "Copying…" : "Yes"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
            }}
            disabled={duplicating}
            className="text-xs font-semibold text-gray-500 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
        {product.description}
      </p>

      {/* Price + availability */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-[#6B4F3A]">
            ₱{minPrice}
            {maxPrice > minPrice && (
              <span className="text-xs font-normal text-gray-400">
                {" "}
                – ₱{maxPrice}
              </span>
            )}
          </p>
        </div>
        <span className="text-[11px] text-gray-400">
          {product.available_branch_ids.length} branch
          {product.available_branch_ids.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Size chips */}
      {product.has_sizes && product.sizes.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {product.sizes.map((sv, i) => (
            <span
              key={sv.id ?? i}
              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium"
            >
              {sv.label} ₱{sv.size_price}
            </span>
          ))}
        </div>
      )}

      {/* Addon options */}
      {addonGroup && addonGroup.options.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {addonGroup.options.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {o.name}
              {o.price_modifier > 0 && (
                <span className="text-[#E8692A]">+₱{o.price_modifier}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
