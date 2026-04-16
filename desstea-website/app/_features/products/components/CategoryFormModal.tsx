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
      <div className="space-y-4">
        {/* Existing categories */}
        <div className="space-y-1.5">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No categories yet.</p>
          )}
          {categories.map((cat) => {
            const row = getRow(cat.id);
            return (
              <div key={cat.id} className="border border-gray-100 rounded-xl p-3">
                {row.editing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={row.editName}
                      onChange={(e) => setRow(cat.id, { editName: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                      placeholder="Category name"
                    />
                    <input
                      type="text"
                      value={row.editDescription}
                      onChange={(e) => setRow(cat.id, { editDescription: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
                      placeholder="Description (optional)"
                    />
                    {row.error && <p className="text-xs text-red-500">{row.error}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(cat.id)}
                        disabled={row.loading}
                        className="px-3 py-1.5 bg-[#E8692A] text-white rounded-lg text-xs font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(cat.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {row.confirmDelete ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-500">Delete?</span>
                            <button
                              onClick={() => confirmDeleteCat(cat.id)}
                              disabled={row.loading}
                              className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRow(cat.id, { confirmDelete: false })}
                              className="px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmDeleteCat(cat.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                    {row.error && <p className="text-xs text-red-500 mt-1">{row.error}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new category */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add New Category</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <button
            onClick={handleAdd}
            disabled={addLoading || !newName.trim()}
            className="w-full px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {addLoading ? "Adding…" : "Add Category"}
          </button>
        </div>

        <div className="pt-1 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
