"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import Toggle from "../../../_components/ui/Toggle";
import type { Product, ProductFormData, Category, Branch } from "../../../_types";
import type { AddonGroupRow } from "../services/productsService";
import { createProduct, updateProduct, deleteProduct } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  branches: Branch[];
  addonGroupTemplates: AddonGroupRow[];
}

function emptyForm(categories: Category[]): ProductFormData {
  return {
    name: "",
    description: "",
    base_price: 0,
    category_id: categories[0]?.id ?? "",
    has_sizes: false,
    has_sugar_level: false,
    is_available: true,
    sizes: [],
    addon_group_id: null,
    available_branch_ids: [],
  };
}

export default function ProductFormModal({ open, onClose, product, categories, branches, addonGroupTemplates }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(() => emptyForm(categories));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setConfirmDelete(false);
      if (product) {
        setForm({
          name: product.name,
          description: product.description ?? "",
          base_price: product.base_price,
          category_id: product.category_id,
          has_sizes: product.has_sizes,
          has_sugar_level: product.has_sugar_level,
          is_available: product.is_available,
          sizes: product.sizes.map((s) => ({ label: s.label, size_price: s.size_price, sort_order: s.sort_order })),
          addon_group_id: product.addon_group_id,
          available_branch_ids: product.available_branch_ids,
        });
      } else {
        setForm(emptyForm(categories));
      }
    }
  }, [product, open, categories]);

  // ── Sizes ──────────────────────────────────────────────────────────────
  function addSize() {
    setForm((f) => ({
      ...f,
      sizes: [...f.sizes, { label: "", size_price: f.base_price, sort_order: f.sizes.length }],
    }));
  }

  function updateSize(idx: number, patch: Partial<{ label: string; size_price: number }>) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  }

  function removeSize(idx: number) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }));
  }

  // ── Branch availability ─────────────────────────────────────────────────
  function toggleBranch(id: string) {
    setForm((f) => ({
      ...f,
      available_branch_ids: f.available_branch_ids.includes(id)
        ? f.available_branch_ids.filter((b) => b !== id)
        : [...f.available_branch_ids, id],
    }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const result = product
      ? await updateProduct(product.id, form)
      : await createProduct(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!product) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await deleteProduct(product.id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setConfirmDelete(false);
    } else {
      router.refresh();
      onClose();
    }
  }

  const isEdit = !!product;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"} size="lg">
      <div className="space-y-5">
        {/* Name + Category + Base Price */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Product Name" className="col-span-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              placeholder="e.g. Classic Milk Tea"
            />
          </FormField>

          <FormField label="Category">
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            >
              {categories.length === 0 && <option value="">No categories</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Base Price (₱)">
            <input
              type="number"
              value={form.base_price || ""}
              onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value === "" ? 0 : Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              min={0}
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] resize-none"
            placeholder="Brief product description"
          />
        </FormField>

        {/* Toggles */}
        <div className="flex gap-4">
          <Toggle
            checked={form.has_sizes}
            onChange={(v) => setForm((f) => ({ ...f, has_sizes: v }))}
            label="Has Sizes"
          />
          <Toggle
            checked={form.has_sugar_level}
            onChange={(v) => setForm((f) => ({ ...f, has_sugar_level: v }))}
            label="Has Sugar Level"
          />
          <Toggle
            checked={form.is_available}
            onChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
            label="Available"
          />
        </div>

        {/* Sizes */}
        {form.has_sizes && (
          <FormField label="Sizes">
            <div className="space-y-2">
              {form.sizes.map((sv, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sv.label}
                    onChange={(e) => updateSize(idx, { label: e.target.value })}
                    placeholder="Label (e.g. Small)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">₱</span>
                    <input
                      type="number"
                      value={sv.size_price || ""}
                      onChange={(e) => updateSize(idx, { size_price: e.target.value === "" ? 0 : Number(e.target.value) })}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20"
                      min={0}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSize(idx)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="text-xs text-[#6B4F3A] font-medium hover:underline"
              >
                + Add Size
              </button>
            </div>
          </FormField>
        )}

        {/* Addon Group */}
        <FormField label="Addon Group">
          <select
            value={form.addon_group_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, addon_group_id: e.target.value || null }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          >
            <option value="">None</option>
            {addonGroupTemplates.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {(() => {
            const selected = addonGroupTemplates.find((g) => g.id === form.addon_group_id);
            if (!selected || selected.options.length === 0) return null;
            return (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.options.map((o) => (
                  <span key={o.id} className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {o.name}
                    {o.price_modifier > 0 && (
                      <span className="text-[#E8692A]">+₱{o.price_modifier}</span>
                    )}
                  </span>
                ))}
              </div>
            );
          })()}
        </FormField>

        {/* Branch Availability */}
        <FormField label="Branch Availability">
          <div className="grid grid-cols-2 gap-2">
            {branches.map((b) => (
              <Toggle
                key={b.id}
                checked={form.available_branch_ids.includes(b.id)}
                onChange={() => toggleBranch(b.id)}
                label={b.name}
              />
            ))}
          </div>
        </FormField>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                confirmDelete
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border border-red-200 text-red-500 hover:bg-red-50"
              }`}
            >
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          )}
          <div className="flex flex-1 gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
