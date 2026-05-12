"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "../../../_components/ui";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import CategoryFormModal from "./CategoryFormModal";
import AddonGroupFormModal from "./AddonGroupFormModal";
import ComboFormModal from "./ComboFormModal";
import ComboDetailModal from "./ComboDetailModal";
import ComboCard from "./ComboCard";
import type { Product, Category, Branch } from "../../../_types";
import type { AddonGroupRow, ComboRow } from "../services/productsService";
import { deleteCombo, duplicateProduct } from "../actions";

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
  initialBranches: Branch[];
  initialAddonGroupTemplates: AddonGroupRow[];
  initialCombos: ComboRow[];
}

export default function ProductsPageContent({ initialProducts, initialCategories, initialBranches, initialAddonGroupTemplates, initialCombos }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"products" | "combos">("products");

  // Products state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [addonGroupModalOpen, setAddonGroupModalOpen] = useState(false);

  // Combos state
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboRow | null>(null);
  const [detailCombo, setDetailCombo] = useState<ComboRow | null>(null);
  const [comboDeleteState, setComboDeleteState] = useState<Record<string, { confirm: boolean; loading: boolean }>>({});

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialProducts) {
      counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
    }
    return initialCategories.map((c) => ({ ...c, count: counts[c.id] ?? 0 }));
  }, [initialCategories, initialProducts]);

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory, initialProducts]);

  async function handleDuplicateProduct(product: Product) {
    await duplicateProduct(product);
    router.refresh();
  }

  function openAddProduct() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function openAddCombo() {
    setEditingCombo(null);
    setComboModalOpen(true);
  }

  function openDetailCombo(combo: ComboRow) {
    setDetailCombo(combo);
  }

  function openEditCombo(combo: ComboRow) {
    setDetailCombo(null);
    setEditingCombo(combo);
    setComboModalOpen(true);
  }

  function handleDeleteCombo(id: string) {
    setComboDeleteState((prev) => ({ ...prev, [id]: { confirm: true, loading: false } }));
  }

  function handleCancelDeleteCombo(id: string) {
    setComboDeleteState((prev) => ({ ...prev, [id]: { confirm: false, loading: false } }));
  }

  async function handleConfirmDeleteCombo(id: string) {
    setComboDeleteState((prev) => ({ ...prev, [id]: { confirm: true, loading: true } }));
    const { error } = await deleteCombo(id);
    if (error) {
      setComboDeleteState((prev) => ({ ...prev, [id]: { confirm: false, loading: false } }));
    } else {
      setComboDeleteState((prev) => ({ ...prev, [id]: { confirm: false, loading: false } }));
      router.refresh();
    }
  }

  return (
    <>
      <div className="px-5 py-4 space-y-5">
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
              onClick={view === "products" ? openAddProduct : openAddCombo}
              className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {view === "products" ? "Add Product" : "New Combo"}
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div className="fade-up fade-up-2">
          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              onClick={() => setView("products")}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                view === "products"
                  ? "text-[#E8692A]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Products
              <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                view === "products" ? "bg-[#FFF3EC] text-[#E8692A]" : "bg-gray-100 text-gray-400"
              }`}>
                {initialProducts.length}
              </span>
              {view === "products" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8692A] rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setView("combos")}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                view === "combos"
                  ? "text-[#E8692A]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Combos
              <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                view === "combos" ? "bg-[#FFF3EC] text-[#E8692A]" : "bg-gray-100 text-gray-400"
              }`}>
                {initialCombos.length}
              </span>
              {view === "combos" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8692A] rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {view === "products" ? (
          <div className="flex gap-5 fade-up fade-up-3">
            {/* Category sidebar */}
            <div className="w-52 shrink-0">
              <div className="sticky top-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Categories
                </p>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[#FFF3EC] text-[#E8692A] font-semibold"
                      : "text-gray-600 hover:bg-gray-100 font-medium"
                  }`}
                >
                  <span>All Products</span>
                  <span className={`text-xs tabular-nums ${
                    selectedCategory === "all" ? "text-[#E8692A]/60" : "text-gray-400"
                  }`}>
                    {initialProducts.length}
                  </span>
                </button>
                {categoriesWithCounts.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-[#FFF3EC] text-[#E8692A] font-semibold"
                        : "text-gray-600 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-xs tabular-nums shrink-0 ml-2 ${
                      selectedCategory === cat.id ? "text-[#E8692A]/60" : "text-gray-400"
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products main area */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Search + count */}
              <div className="flex items-center justify-between gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search products..."
                  className="w-64"
                />
                <p className="text-xs text-gray-400 shrink-0">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
                {filtered.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No products found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter.</p>
                  </div>
                )}
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={openEditProduct}
                    addonGroupTemplates={initialAddonGroupTemplates}
                    onDuplicate={handleDuplicateProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 fade-up fade-up-3">
            {/* Count */}
            <p className="text-xs text-gray-400">
              {initialCombos.length} combo{initialCombos.length !== 1 ? "s" : ""}
            </p>

            {/* Combos grid */}
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {initialCombos.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF3EC] flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#E8692A]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">No combos yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create one to bundle products together.</p>
                </div>
              )}
              {initialCombos.map((combo) => {
                const ds = comboDeleteState[combo.id];
                return (
                  <ComboCard
                    key={combo.id}
                    combo={combo}
                    onClick={openDetailCombo}
                    onEdit={openEditCombo}
                    onDelete={handleDeleteCombo}
                    deleting={ds?.loading ?? false}
                    confirmDelete={ds?.confirm ?? false}
                    onConfirmDelete={handleConfirmDeleteCombo}
                    onCancelDelete={handleCancelDeleteCombo}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        categories={initialCategories}
        branches={initialBranches}
        addonGroupTemplates={initialAddonGroupTemplates}
        defaultCategoryId={selectedCategory !== "all" ? selectedCategory : undefined}
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

      <ComboDetailModal
        open={detailCombo !== null}
        onClose={() => setDetailCombo(null)}
        combo={detailCombo}
        onEdit={openEditCombo}
      />

      <ComboFormModal
        open={comboModalOpen}
        onClose={() => setComboModalOpen(false)}
        combo={editingCombo}
        categories={initialCategories}
        products={initialProducts}
        branches={initialBranches}
      />
    </>
  );
}
