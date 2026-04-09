"use client";

import { useState, useMemo } from "react";
import { SearchInput, Tabs } from "../../../_components/ui";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import { mockProducts } from "../data/mock-data";
import type { Product, ProductCategory } from "../../../_types";

type CategoryFilter = "All" | ProductCategory;

const categoryTabs = [
  { label: "All", value: "All" },
  { label: "Coffee", value: "Coffee" },
  { label: "Foods", value: "Foods" },
  { label: "Combos", value: "Combos" },
];

export default function ProductsPageContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  function openAdd() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  return (
    <>
      <div className="px-5 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between fade-up fade-up-1">
          <div>
            <h1 className="font-display text-[38px] font-semibold text-gray-900 tracking-tight leading-tight">
              Products
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your menu catalog across all branches.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm mt-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 fade-up fade-up-2">
          <Tabs
            tabs={categoryTabs}
            active={category}
            onChange={(v) => setCategory(v as CategoryFilter)}
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products…"
            className="w-52"
          />
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 -mt-2">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 fade-up fade-up-3">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">No products found.</p>
          )}
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onClick={openEdit} />
          ))}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
      />
    </>
  );
}
