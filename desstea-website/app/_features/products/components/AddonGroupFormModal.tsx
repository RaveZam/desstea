"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../../../_components/ui/Modal";
import Toggle from "../../../_components/ui/Toggle";
import type { Category } from "../../../_types";
import type { AddonGroupRow } from "../services/productsService";
import { createAddonGroup, updateAddonGroup, deleteAddonGroup } from "../actions";

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  addonGroups: AddonGroupRow[];
}

interface OptionDraft {
  name: string;
  price_modifier: number;
  is_available: boolean;
}

interface RowState {
  editing: boolean;
  editName: string;
  editCategoryId: string;
  editOptions: OptionDraft[];
  confirmDelete: boolean;
  error: string | null;
  loading: boolean;
}

const emptyOption = (): OptionDraft => ({ name: "", price_modifier: 0, is_available: true });

export default function AddonGroupFormModal({ open, onClose, categories, addonGroups }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newOptions, setNewOptions] = useState<OptionDraft[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  function getRow(id: string, group?: AddonGroupRow): RowState {
    return rows[id] ?? {
      editing: false,
      editName: group?.name ?? "",
      editCategoryId: group?.category_id ?? "",
      editOptions: group?.options.map((o) => ({ name: o.name, price_modifier: o.price_modifier, is_available: o.is_available })) ?? [],
      confirmDelete: false,
      error: null,
      loading: false,
    };
  }

  function setRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...getRow(id), ...patch } }));
  }

  function startEdit(group: AddonGroupRow) {
    setRows((prev) => ({
      ...prev,
      [group.id]: {
        editing: true,
        editName: group.name,
        editCategoryId: group.category_id ?? "",
        editOptions: group.options.map((o) => ({ name: o.name, price_modifier: o.price_modifier, is_available: o.is_available })),
        confirmDelete: false,
        error: null,
        loading: false,
      },
    }));
  }

  function cancelEdit(id: string) {
    setRow(id, { editing: false, confirmDelete: false, error: null });
  }

  // ── Edit row option helpers ──────────────────────────────────────────────
  function addEditOption(id: string) {
    const row = getRow(id);
    setRow(id, { editOptions: [...row.editOptions, emptyOption()] });
  }

  function updateEditOption(id: string, oIdx: number, patch: Partial<OptionDraft>) {
    const row = getRow(id);
    setRow(id, { editOptions: row.editOptions.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)) });
  }

  function removeEditOption(id: string, oIdx: number) {
    const row = getRow(id);
    setRow(id, { editOptions: row.editOptions.filter((_, j) => j !== oIdx) });
  }

  async function saveEdit(id: string) {
    const row = getRow(id);
    if (!row.editName.trim()) return;
    setRow(id, { loading: true, error: null });
    const { error } = await updateAddonGroup(id, {
      name: row.editName.trim(),
      category_id: row.editCategoryId || null,
      options: row.editOptions
        .filter((o) => o.name.trim())
        .map((o, i) => ({ ...o, name: o.name.trim(), sort_order: i })),
    });
    if (error) {
      setRow(id, { loading: false, error });
    } else {
      setRow(id, { loading: false, editing: false });
      router.refresh();
    }
  }

  async function confirmDeleteGroup(id: string) {
    const row = getRow(id);
    if (!row.confirmDelete) {
      setRow(id, { confirmDelete: true, error: null });
      return;
    }
    setRow(id, { loading: true, error: null });
    const { error } = await deleteAddonGroup(id);
    if (error) {
      setRow(id, { loading: false, confirmDelete: false, error });
    } else {
      setRow(id, { loading: false, confirmDelete: false });
      router.refresh();
    }
  }

  // ── New group option helpers ─────────────────────────────────────────────
  function addNewOption() {
    setNewOptions((prev) => [...prev, emptyOption()]);
  }

  function updateNewOption(oIdx: number, patch: Partial<OptionDraft>) {
    setNewOptions((prev) => prev.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)));
  }

  function removeNewOption(oIdx: number) {
    setNewOptions((prev) => prev.filter((_, j) => j !== oIdx));
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    const { error } = await createAddonGroup({
      name: newName.trim(),
      category_id: newCategoryId || null,
      options: newOptions
        .filter((o) => o.name.trim())
        .map((o, i) => ({ ...o, name: o.name.trim(), sort_order: i })),
    });
    setAddLoading(false);
    if (error) {
      setAddError(error);
    } else {
      setNewName("");
      setNewCategoryId("");
      setNewOptions([]);
      router.refresh();
    }
  }

  const inputCls = "border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]";

  return (
    <Modal open={open} onClose={onClose} title="Manage Addon Groups" size="md">
      <div className="space-y-4">
        {/* Existing addon groups */}
        <div className="space-y-1.5">
          {addonGroups.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No addon groups yet.</p>
          )}
          {addonGroups.map((group) => {
            const row = getRow(group.id, group);
            const catName = categories.find((c) => c.id === group.category_id)?.name;
            return (
              <div key={group.id} className="border border-gray-100 rounded-xl p-3">
                {row.editing ? (
                  <div className="space-y-2">
                    {/* Group name */}
                    <input
                      type="text"
                      value={row.editName}
                      onChange={(e) => setRow(group.id, { editName: e.target.value })}
                      placeholder="Group name (e.g. Milktea Addons)"
                      className={`w-full ${inputCls} font-medium`}
                    />
                    {/* Category */}
                    <select
                      value={row.editCategoryId}
                      onChange={(e) => setRow(group.id, { editCategoryId: e.target.value })}
                      className={`w-full ${inputCls} bg-white`}
                    >
                      <option value="">No category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {/* Options */}
                    {row.editOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="ml-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateEditOption(group.id, oIdx, { name: e.target.value })}
                          placeholder="Option name"
                          className={`flex-1 ${inputCls} text-xs`}
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">+₱</span>
                          <input
                            type="number"
                            value={opt.price_modifier || ""}
                            onChange={(e) => updateEditOption(group.id, oIdx, { price_modifier: e.target.value === "" ? 0 : Number(e.target.value) })}
                            className={`w-16 ${inputCls} text-xs`}
                            min={0}
                          />
                        </div>
                        <Toggle
                          checked={opt.is_available}
                          onChange={(v) => updateEditOption(group.id, oIdx, { is_available: v })}
                          label=""
                        />
                        <button
                          type="button"
                          onClick={() => removeEditOption(group.id, oIdx)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addEditOption(group.id)}
                      className="ml-3 text-xs text-[#6B4F3A] font-medium hover:underline"
                    >
                      + Add Option
                    </button>

                    {row.error && <p className="text-xs text-red-500">{row.error}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(group.id)}
                        disabled={row.loading}
                        className="px-3 py-1.5 bg-[#E8692A] text-white rounded-lg text-xs font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(group.id)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{group.name}</span>
                          {catName && (
                            <span className="text-xs bg-[#FFF3EC] text-[#E8692A] border border-[#F5C5A3] px-1.5 py-0.5 rounded-full font-medium">
                              {catName}
                            </span>
                          )}
                        </div>
                        {group.options.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {group.options.map((o) => o.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(group)}
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
                              onClick={() => confirmDeleteGroup(group.id)}
                              disabled={row.loading}
                              className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRow(group.id, { confirmDelete: false })}
                              className="px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => confirmDeleteGroup(group.id)}
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
                    {row.error && <p className="text-xs text-red-500 mt-1">{row.error}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add new addon group */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add New Addon Group</p>

          {/* Group name */}
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Group name (e.g. Milktea Addons)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A]"
          />

          {/* Category */}
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/20 focus:border-[#6B4F3A] bg-white"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Options */}
          <div className="space-y-1.5">
            {newOptions.map((opt, oIdx) => (
              <div key={oIdx} className="ml-3 flex items-center gap-2">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateNewOption(oIdx, { name: e.target.value })}
                  placeholder="Option name"
                  className={`flex-1 ${inputCls} text-xs`}
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">+₱</span>
                  <input
                    type="number"
                    value={opt.price_modifier || ""}
                    onChange={(e) => updateNewOption(oIdx, { price_modifier: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className={`w-16 ${inputCls} text-xs`}
                    min={0}
                  />
                </div>
                <Toggle
                  checked={opt.is_available}
                  onChange={(v) => updateNewOption(oIdx, { is_available: v })}
                  label=""
                />
                <button
                  type="button"
                  onClick={() => removeNewOption(oIdx)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewOption}
              className="ml-3 text-xs text-[#6B4F3A] font-medium hover:underline"
            >
              + Add Option
            </button>
          </div>

          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <button
            onClick={handleAdd}
            disabled={addLoading || !newName.trim()}
            className="w-full px-4 py-2.5 rounded-xl bg-[#E8692A] text-white text-sm font-semibold hover:bg-[#d45c20] transition-colors disabled:opacity-50"
          >
            {addLoading ? "Adding…" : "Add Addon Group"}
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
