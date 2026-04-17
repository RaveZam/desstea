"use client";

import Badge from "../../../_components/ui/Badge";
import type { Product } from "../../../_types";
import type { AddonGroupRow } from "../services/productsService";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  addonGroupTemplates: AddonGroupRow[];
}

export default function ProductCard({ product, onClick, addonGroupTemplates }: ProductCardProps) {
  const addonGroup = addonGroupTemplates.find((g) => g.id === product.addon_group_id);
  const minPrice =
    product.has_sizes && product.sizes.length > 0
      ? Math.min(...product.sizes.map((s) => s.size_price))
      : product.base_price;
  const maxPrice =
    product.has_sizes && product.sizes.length > 0
      ? Math.max(...product.sizes.map((s) => s.size_price))
      : product.base_price;

  const isUnavailable = !product.is_available;

  return (
    <div
      onClick={() => onClick(product)}
      className={[
        "bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all border border-transparent",
        isUnavailable
          ? "opacity-40 grayscale hover:opacity-50 hover:shadow-sm"
          : "hover:shadow-md hover:border-[#EDE8E3]",
      ].join(" ")}
    >
      {/* Name + category */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isUnavailable && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
              Unavailable
            </span>
          )}
          <Badge variant="default">{product.category_name}</Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>

      {/* Price + availability */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-[#6B4F3A]">
            ₱{minPrice}
            {maxPrice > minPrice && <span className="text-xs font-normal text-gray-400"> – ₱{maxPrice}</span>}
          </p>
        </div>
        <span className="text-[11px] text-gray-400">
          {product.available_branch_ids.length} branch{product.available_branch_ids.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Size chips */}
      {product.has_sizes && product.sizes.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {product.sizes.map((sv, i) => (
            <span key={sv.id ?? i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {sv.label} ₱{sv.size_price}
            </span>
          ))}
        </div>
      )}

      {/* Addon options */}
      {addonGroup && addonGroup.options.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {addonGroup.options.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {o.name}
              {o.price_modifier > 0 && <span className="text-[#E8692A]">+₱{o.price_modifier}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
