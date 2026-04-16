"use client";

import { useState, useMemo } from "react";
import { SearchInput, Tabs } from "../../../_components/ui";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import CategoryFormModal from "./CategoryFormModal";
import AddonGroupFormModal from "./AddonGroupFormModal";
import type { Product, Category, Branch } from "../../../_types";
import type { AddonGroupRow } from "../services/productsService";

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
  initialBranches: Branch[];
  initialAddonGroupTemplates: AddonGroupRow[];
}

export default function ProductsPageContent({ initialProducts, initialCategories, initialBranches, initialAddonGroupTemplates }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [addonGroupModalOpen, setAddonGroupModalOpen] = useState(false);

  const categoryTabs = useMemo(() => [
    { label: "All", value: "all" },
    ...initialCategories.map((c) => ({ label: c.name, value: c.id })),
  ], [initialCategories]);

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedTab === "all" || p.category_id === selectedTab;
      return matchSearch && matchCat;
    });
  }, [search, selectedTab, initialProducts]);

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
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Manage Categories
            </button>
            <button
              onClick={() => setAddonGroupModalOpen(true)}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Manage Addon Groups
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 fade-up fade-up-2">
          <Tabs
            tabs={categoryTabs}
            active={selectedTab}
            onChange={(v) => setSelectedTab(v)}
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
            <ProductCard key={product.id} product={product} onClick={openEdit} addonGroupTemplates={initialAddonGroupTemplates} />
          ))}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        categories={initialCategories}
        branches={initialBranches}
        addonGroupTemplates={initialAddonGroupTemplates}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={initialCategories}
      />

      <AddonGroupFormModal
        open={addonGroupModalOpen}
        onClose={() => setAddonGroupModalOpen(false)}
        categories={initialCategories}
        addonGroups={initialAddonGroupTemplates}
      />
    </>
  );
}
