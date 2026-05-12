"use client";

import { useState } from "react";
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

  // Feature flags for quick visual scan
  const flags: string[] = [];
  if (product.has_sizes) flags.push("Sizes");
  if (product.has_sugar_level) flags.push("Sugar");
  if (product.is_hot_cold) flags.push("Hot/Cold");
  if (product.has_flavors) flags.push("Flavors");

  return (
    <div
      onClick={() => {
        if (!confirming) onClick(product);
      }}
      className={[
        "group relative bg-white rounded-2xl p-4 cursor-pointer transition-all border",
        isUnavailable
          ? "opacity-40 grayscale border-gray-100 hover:opacity-50"
          : "border-gray-100 hover:border-[#E8692A]/20 hover:shadow-md",
      ].join(" ")}
    >
      {/* Top row: category badge + actions */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-semibold text-[#6B4F3A] bg-[#F2EBE5] px-2 py-0.5 rounded-full">
          {product.category_name}
        </span>
        <div className="flex items-center gap-1">
          {isUnavailable && (
            <span className="text-[10px] font-medium bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          )}
          {onDuplicate && !confirming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(true);
              }}
              title="Duplicate product"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-gray-400 hover:text-[#E8692A] hover:bg-orange-50"
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

      {/* Name + description */}
      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-1">
        {product.name}
      </h3>
      {product.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>
      )}
      {!product.description && <div className="mb-3" />}

      {/* Duplicate confirm */}
      {confirming && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-3 p-2.5 bg-orange-50 border border-orange-100 rounded-xl"
        >
          <span className="text-xs text-gray-600 flex-1">
            Duplicate this product?
          </span>
          <button
            onClick={handleConfirmDuplicate}
            disabled={duplicating}
            className="text-xs font-semibold text-white bg-[#E8692A] px-2.5 py-1 rounded-lg hover:bg-[#d45c20] disabled:opacity-50 transition-colors"
          >
            {duplicating ? "Copying..." : "Yes"}
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

      {/* Size chips */}
      {product.has_sizes && product.sizes.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {product.sizes.map((sv, i) => (
            <span
              key={sv.id ?? i}
              className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium"
            >
              {sv.label} <span className="text-gray-400">&#8729;</span> &#8369;{sv.size_price}
            </span>
          ))}
        </div>
      )}

      {/* Addon options */}
      {addonGroup && addonGroup.options.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {addonGroup.options.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 text-[10px] bg-violet-50 border border-violet-100 text-violet-600 px-2 py-0.5 rounded-lg"
            >
              {o.name}
              {o.price_modifier > 0 && (
                <span className="text-violet-400">+&#8369;{o.price_modifier}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Footer: price + meta */}
      <div className="flex items-end justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-lg font-bold text-[#6B4F3A] leading-none">
            &#8369;{minPrice}
            {maxPrice > minPrice && (
              <span className="text-xs font-normal text-gray-400 ml-0.5">
                &ndash; &#8369;{maxPrice}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Feature flags */}
          {flags.length > 0 && (
            <div className="flex gap-1">
              {flags.map((f) => (
                <span key={f} className="text-[9px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {f}
                </span>
              ))}
            </div>
          )}
          <span className="text-[10px] text-gray-400 tabular-nums">
            {product.available_branch_ids.length} branch{product.available_branch_ids.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
