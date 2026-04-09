"use client";

import { useState, useEffect } from "react";
import Modal from "../../../_components/ui/Modal";
import FormField from "../../../_components/ui/FormField";
import Toggle from "../../../_components/ui/Toggle";
import type { Product, ProductCategory, SizeVariant, AddOn } from "../../../_types";
import { allBranchOptions } from "../data/mock-data";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const categories: ProductCategory[] = ["Coffee", "Foods", "Combos"];

const defaultSizes: SizeVariant[] = [
  { size: "S", priceAdjustment: 0 },
  { size: "M", priceAdjustment: 15 },
  { size: "L", priceAdjustment: 30 },
];

const emptyForm = {
  name: "",
  description: "",
  basePrice: 0,
  category: "Coffee" as ProductCategory,
  sizes: defaultSizes,
  addOns: [] as AddOn[],
  availability: [] as string[],
};

export default function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [newAddOn, setNewAddOn] = useState({ name: "", price: "" });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        category: product.category,
        sizes: product.sizes.length > 0 ? product.sizes : defaultSizes,
        addOns: product.addOns,
        availability: product.availability,
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  function toggleSize(size: "S" | "M" | "L") {
    setForm((f) => {
      const has = f.sizes.some((s) => s.size === size);
      return {
        ...f,
        sizes: has
          ? f.sizes.filter((s) => s.size !== size)
          : [...f.sizes, { size, priceAdjustment: size === "S" ? 0 : size === "M" ? 15 : 30 }].sort(
              (a, b) => (a.size === "S" ? 0 : a.size === "M" ? 1 : 2) - (b.size === "S" ? 0 : b.size === "M" ? 1 : 2)
            ),
      };
    });
  }

  function updateSizePrice(size: "S" | "M" | "L", adj: number) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.map((s) => (s.size === size ? { ...s, priceAdjustment: adj } : s)),
    }));
  }

  function addAddOn() {
    if (!newAddOn.name || !newAddOn.price) return;
    setForm((f) => ({
      ...f,
      addOns: [...f.addOns, { name: newAddOn.name, price: Number(newAddOn.price) }],
    }));
    setNewAddOn({ name: "", price: "" });
  }

  function removeAddOn(idx: number) {
    setForm((f) => ({ ...f, addOns: f.addOns.filter((_, i) => i !== idx) }));
  }

  function toggleBranch(id: string) {
    setForm((f) => ({
      ...f,
      availability: f.availability.includes(id)
        ? f.availability.filter((b) => b !== id)
        : [...f.availability, id],
    }));
  }

  const isEdit = !!product;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add Product"}
      size="lg"
    >
      <div className="space-y-5">
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
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Base Price (₱)">
            <input
              type="number"
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
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

        {/* Sizes — only for beverages */}
        {form.category === "Coffee" && <FormField label="Sizes & Price Adjustments">
          <div className="flex gap-3">
            {(["S", "M", "L"] as const).map((size) => {
              const sv = form.sizes.find((s) => s.size === size);
              const active = !!sv;
              return (
                <div key={size} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      active
                        ? "bg-[#6B4F3A] text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                  {active && (
                    <input
                      type="number"
                      value={sv!.priceAdjustment}
                      onChange={(e) => updateSizePrice(size, Number(e.target.value))}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20"
                      placeholder="+₱"
                      min={0}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </FormField>}

        {/* Add-ons */}
        <FormField label="Add-ons">
          <div className="space-y-2">
            {form.addOns.map((ao, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-gray-700">{ao.name}</span>
                <span className="text-sm font-medium text-[#6B4F3A]">+₱{ao.price}</span>
                <button
                  type="button"
                  onClick={() => removeAddOn(idx)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAddOn.name}
                onChange={(e) => setNewAddOn((a) => ({ ...a, name: e.target.value }))}
                placeholder="Add-on name"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
              />
              <input
                type="number"
                value={newAddOn.price}
                onChange={(e) => setNewAddOn((a) => ({ ...a, price: e.target.value }))}
                placeholder="₱"
                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                min={0}
              />
              <button
                type="button"
                onClick={addAddOn}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </FormField>

        {/* Branch availability */}
        <FormField label="Branch Availability">
          <div className="grid grid-cols-2 gap-2">
            {allBranchOptions.map((b) => (
              <Toggle
                key={b.id}
                checked={form.availability.includes(b.id)}
                onChange={() => toggleBranch(b.id)}
                label={b.name}
              />
            ))}
          </div>
        </FormField>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors"
          >
            {isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
