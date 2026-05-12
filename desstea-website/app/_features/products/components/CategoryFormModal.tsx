"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import type { Category } from "../../../_types";
import { createCategory, updateCategory, deleteCategory } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

interface RowState {
  editing: boolean;
  editName: string;
  editDescription: string;
  confirmDelete: boolean;
  error: string | null;
  loading: boolean;
}

export default function CategoryFormModal({ open, onClose, categories }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  function getRow(id: string): RowState {
    return rows[id] ?? { editing: false, editName: "", editDescription: "", confirmDelete: false, error: null, loading: false };
  }

  function setRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...getRow(id), ...patch } }));
  }

  function startEdit(cat: Category) {
    setRow(cat.id, { editing: true, editName: cat.name, editDescription: cat.description ?? "", confirmDelete: false, error: null });
  }

  function cancelEdit(id: string) {
    setRow(id, { editing: false, confirmDelete: false, error: null });
  }

  async function saveEdit(id: string) {
    const row = getRow(id);
    if (!row.editName.trim()) return;
    setRow(id, { loading: true, error: null });
    const { error } = await updateCategory(id, { name: row.editName.trim(), description: row.editDescription || undefined });
    if (error) {
      setRow(id, { loading: false, error });
    } else {
      setRow(id, { loading: false, editing: false });
      router.refresh();
    }
  }

  async function confirmDeleteCat(id: string) {
    const row = getRow(id);
    if (!row.confirmDelete) {
      setRow(id, { confirmDelete: true, error: null });
      return;
    }
    setRow(id, { loading: true, error: null });
    const { error } = await deleteCategory(id);
    if (error) {
      setRow(id, { loading: false, confirmDelete: false, error });
    } else {
      setRow(id, { loading: false, confirmDelete: false });
      router.refresh();
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    const { error } = await createCategory({ name: newName.trim(), description: newDescription || undefined });
    setAddLoading(false);
    if (error) {
      setAddError(error);
    } else {
      setNewName("");
      setNewDescription("");
      router.refresh();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage Categories" size="md">
      <div className="space-y-5">

        {/* Category count */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </p>

        {/* Category list */}
        <div className="space-y-1">
          {categories.length === 0 && (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#FFF3EC] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-[#E8692A]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No categories yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Add one below to start organizing products.</p>
            </div>
          )}

          {categories.map((cat) => {
            const row = getRow(cat.id);

            // Editing state — orange-tinted card
            if (row.editing) {
              return (
                <div key={cat.id} className="rounded-xl border border-[#E8692A]/30 bg-[#FFF3EC]/50 p-3 space-y-2">
                  <input
                    type="text"
                    value={row.editName}
                    onChange={(e) => setRow(cat.id, { editName: e.target.value })}
                    autoFocus
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#E8692A]/20 focus:border-[#E8692A]/60"
                    placeholder="Category name"
                  />
                  <input
                    type="text"
                    value={row.editDescription}
                    onChange={(e) => setRow(cat.id, { editDescription: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E8692A]/20 focus:border-[#E8692A]/60"
                    placeholder="Description (optional)"
                  />
                  {row.error && <p className="text-xs text-red-500">{row.error}</p>}
                  <div className="flex gap-2 pt-0.5">
                    <button
                      onClick={() => saveEdit(cat.id)}
                      disabled={row.loading || !row.editName.trim()}
                      className="px-4 py-1.5 bg-[#E8692A] text-white rounded-lg text-xs font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
                    >
                      {row.loading ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      onClick={() => cancelEdit(cat.id)}
                      className="px-4 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            // Delete confirm state — red warning card
            if (row.confirmDelete) {
              return (
                <div key={cat.id} className="rounded-xl border border-red-100 bg-red-50 p-3 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Delete "{cat.name}"?</p>
                      <p className="text-xs text-red-500 mt-0.5">Products in this category will become uncategorized.</p>
                    </div>
                  </div>
                  {row.error && <p className="text-xs text-red-500">{row.error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDeleteCat(cat.id)}
                      disabled={row.loading}
                      className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {row.loading ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setRow(cat.id, { confirmDelete: false })}
                      className="px-4 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              );
            }

            // Default row — hover-reveal actions
            return (
              <div
                key={cat.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[#E8692A]/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                  )}
                  {row.error && <p className="text-xs text-red-500 mt-0.5">{row.error}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(cat)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-gray-400 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteCat(cat.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new category */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Add category</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Category name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8692A]/20 focus:border-[#E8692A]/60 transition-shadow"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8692A]/20 focus:border-[#E8692A]/60 transition-shadow"
          />
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <button
            onClick={handleAdd}
            disabled={addLoading || !newName.trim()}
            className="w-full py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {addLoading ? "Adding…" : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Category
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}
