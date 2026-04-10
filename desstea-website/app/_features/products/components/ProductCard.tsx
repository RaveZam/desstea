"use client";

import Badge from "../../../_components/ui/Badge";
import type { Product, ProductCategory } from "../../../_types";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const minPrice = product.basePrice;
  const maxPrice =
    product.sizes.length > 0
      ? product.basePrice + Math.max(...product.sizes.map((s) => s.priceAdjustment))
      : product.basePrice;

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-[#EDE8E3]"
    >
      {/* Name + category */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
        <Badge variant={product.category as ProductCategory} className="flex-shrink-0">
          {product.category}
        </Badge>
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
          {product.availability.length} branch{product.availability.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Size chips */}
      {product.sizes.length > 0 && (
        <div className="flex gap-1 mt-2">
          {product.sizes.map((sv) => (
            <span key={sv.size} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {sv.size}
              {sv.priceAdjustment > 0 && ` +₱${sv.priceAdjustment}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
