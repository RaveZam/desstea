"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchInput, Tabs } from "../../../_components/ui";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import CategoryFormModal from "./CategoryFormModal";
import AddonGroupFormModal from "./AddonGroupFormModal";
import ComboFormModal from "./ComboFormModal";
import ComboDetailModal from "./ComboDetailModal";
import ComboCard from "./ComboCard";
import type { Product, Category, Branch } from "../../../_types";
import type { AddonGroupRow, ComboRow } from "../services/productsService";
import { deleteCombo } from "../actions";

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
  const [selectedTab, setSelectedTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [addonGroupModalOpen, setAddonGroupModalOpen] = useState(false);

  // Combos state
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboRow | null>(null);
  const [detailCombo, setDetailCombo] = useState<ComboRow | null>(null);
  const [comboDeleteState, setComboDeleteState] = useState<Record<string, { confirm: boolean; loading: boolean }>>({});

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
            {view === "products" ? (
              <>
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
                  onClick={openAddProduct}
                  className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Product
                </button>
              </>
            ) : (
              <button
                onClick={openAddCombo}
                className="flex items-center gap-2 bg-[#E8692A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d45c20] transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Combo
              </button>
            )}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 fade-up fade-up-2 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setView("products")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              view === "products" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setView("combos")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              view === "combos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Combos
            {initialCombos.length > 0 && (
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                view === "combos" ? "bg-[#FFF3EC] text-[#E8692A]" : "bg-gray-200 text-gray-500"
              }`}>
                {initialCombos.length}
              </span>
            )}
          </button>
        </div>

        {view === "products" ? (
          <>
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

            {/* Products grid */}
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 fade-up fade-up-3">
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-gray-400 py-10">No products found.</p>
              )}
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onClick={openEditProduct} addonGroupTemplates={initialAddonGroupTemplates} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Count */}
            <p className="text-xs text-gray-400">
              {initialCombos.length} combo{initialCombos.length !== 1 ? "s" : ""}
            </p>

            {/* Combos grid */}
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 fade-up fade-up-3">
              {initialCombos.length === 0 && (
                <p className="col-span-full text-center text-gray-400 py-10">No combos yet. Create one to get started.</p>
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
          </>
        )}
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
