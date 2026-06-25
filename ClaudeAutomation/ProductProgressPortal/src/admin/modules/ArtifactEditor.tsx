import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import { VisibilityBanner } from '../VisibilityBanner';
import type { Artifact, ArtifactCategory } from '../../types';

const EMPTY_ARTIFACT: Artifact = {
  title: '', type: 'PRD', owner: '', date: '', status: 'Draft',
  link: '', version: '', reviewedBy: '', section: '', stage: '', thumbnailUrl: '',
  heading: '', description: '',
};

const EMPTY_CATEGORY: { name: string; subcats: string } = { name: '', subcats: '' };

const TYPES = ['Web Page', 'Deck', 'Git Link', 'Report', 'Pitch Deck', 'Prototype', 'PRD', 'Tech Design', 'Research', 'Meeting Notes', 'Decision Doc'];
const STATUSES = ['Draft', 'In Progress', 'Review', 'Complete'];

const CATEGORY_COLORS = [
  { badge: 'bg-blue-50 text-blue-700 border border-blue-200',   toggle: 'bg-blue-600',   headerBg: 'bg-blue-50',   headerText: 'text-blue-800' },
  { badge: 'bg-purple-50 text-purple-700 border border-purple-200', toggle: 'bg-purple-600', headerBg: 'bg-purple-50', headerText: 'text-purple-800' },
  { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', toggle: 'bg-emerald-600', headerBg: 'bg-emerald-50', headerText: 'text-emerald-800' },
  { badge: 'bg-amber-50 text-amber-700 border border-amber-200',  toggle: 'bg-amber-600',  headerBg: 'bg-amber-50',  headerText: 'text-amber-800' },
  { badge: 'bg-rose-50 text-rose-700 border border-rose-200',    toggle: 'bg-rose-600',   headerBg: 'bg-rose-50',   headerText: 'text-rose-800' },
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function getCatColor(idx: number) {
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
}

export function ArtifactEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Artifact>(EMPTY_ARTIFACT);

  // Category management
  const [catModal, setCatModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [catForm, setCatForm] = useState<{ name: string; subcats: string }>(EMPTY_CATEGORY);

  const rows = data.artifacts;
  const categories: ArtifactCategory[] = data.artifactCategories ?? [];

  function openAdd() { setForm(EMPTY_ARTIFACT); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('artifacts', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('artifacts', n); }
    setModal({ open: false, idx: null });
  }

  const upd = <K extends keyof Artifact>(k: K, v: Artifact[K]) => setForm(f => ({ ...f, [k]: v }));

  function handleSectionChange(val: string) {
    setForm(f => ({ ...f, section: val || undefined, stage: undefined }));
  }

  // Category management handlers
  function openAddCategory() { setCatForm(EMPTY_CATEGORY); setCatModal({ open: true, idx: null }); }
  function openEditCategory(idx: number) {
    const cat = categories[idx];
    setCatForm({ name: cat.name, subcats: cat.subcategories.join(', ') });
    setCatModal({ open: true, idx });
  }
  function handleSaveCategory() {
    const name = catForm.name.trim();
    if (!name) return;
    const subcategories = catForm.subcats.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const next = [...categories];
    if (catModal.idx === null) {
      next.push({ id: genId(), name, subcategories, visible: true });
    } else {
      next[catModal.idx] = { ...next[catModal.idx], name, subcategories };
    }
    set('artifactCategories', next);
    setCatModal({ open: false, idx: null });
  }
  function deleteCategory(idx: number) {
    if (!confirm(`Delete category "${categories[idx].name}"? Artifacts assigned to it will become unassigned.`)) return;
    set('artifactCategories', categories.filter((_, i) => i !== idx));
  }
  function toggleCategoryVisible(idx: number) {
    const next = [...categories];
    next[idx] = { ...next[idx], visible: !next[idx].visible };
    set('artifactCategories', next);
  }

  const byCategory = (name: string) => rows.filter(r => r.section === name);
  const selectedCategory = categories.find(c => c.name === form.section);

  return (
    <>
      <VisibilityBanner visKey="deliverables" label="Key Assets" />
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Key Assets</h2>
          <p className="text-gray-500 text-sm">{rows.length} total assets</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Add Asset
        </button>
      </div>

      {/* Category Management Panel */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
            <p className="text-xs text-gray-400 mt-0.5">Manage asset categories and their subcategories. Toggle visibility.</p>
          </div>
          <button
            onClick={openAddCategory}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            + Add Category
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400">No categories yet. Add one to organize assets.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => {
              const col = getCatColor(idx);
              const count = byCategory(cat.name).length;
              return (
                <div key={cat.id} className={`bg-white rounded-lg border border-gray-200 p-4 transition-opacity ${!cat.visible ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.badge}`}>{cat.name}</span>
                    <button
                      onClick={() => toggleCategoryVisible(idx)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${cat.visible ? col.toggle : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${cat.visible ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {cat.subcategories.length > 0 ? cat.subcategories.join(' · ') : 'No subcategories'}
                  </p>
                  <p className="text-xs font-medium text-gray-600">{count} asset{count !== 1 ? 's' : ''}</p>
                  <div className="flex gap-3 mt-3 pt-2 border-t border-gray-100">
                    <button onClick={() => openEditCategory(idx)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => deleteCategory(idx)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset table grouped by category */}
      {rows.length === 0 ? <Empty label="key assets" onAdd={openAdd} /> : (
        <div className="space-y-6">
          {categories.map((cat, idx) => {
            const sRows = byCategory(cat.name);
            if (sRows.length === 0) return null;
            const col = getCatColor(idx);
            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-200 flex items-center gap-3 ${col.headerBg}`}>
                  <span className={`font-semibold text-sm ${col.headerText}`}>{cat.name}</span>
                  <span className="text-xs text-gray-400">{sRows.length} asset{sRows.length !== 1 ? 's' : ''}</span>
                  {cat.subcategories.length > 0 && (
                    <span className="text-xs text-gray-400 ml-1">· {cat.subcategories.join(' · ')}</span>
                  )}
                </div>
                {cat.subcategories.length > 0 ? (
                  <>
                    {cat.subcategories.map(sub => {
                      const subRows = sRows.filter(r => r.stage === sub);
                      if (subRows.length === 0) return null;
                      return (
                        <div key={sub}>
                          <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{sub}</span>
                            <span className="text-xs text-gray-400">({subRows.length})</span>
                          </div>
                          <AssetTableBody rows={subRows} allRows={rows} onEdit={openEdit} onDelete={(i) => set('artifacts', rows.filter((_, j) => j !== i))} />
                        </div>
                      );
                    })}
                    {sRows.filter(r => !r.stage).length > 0 && (
                      <div>
                        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">No Subcategory</span>
                        </div>
                        <AssetTableBody rows={sRows.filter(r => !r.stage)} allRows={rows} onEdit={openEdit} onDelete={(i) => set('artifacts', rows.filter((_, j) => j !== i))} />
                      </div>
                    )}
                  </>
                ) : (
                  <AssetTableBody rows={sRows} allRows={rows} onEdit={openEdit} onDelete={(i) => set('artifacts', rows.filter((_, j) => j !== i))} />
                )}
              </div>
            );
          })}

          {rows.filter(r => !r.section).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                <span className="font-semibold text-sm text-gray-600">Unassigned</span>
                <span className="text-xs text-gray-400">{rows.filter(r => !r.section).length} asset{rows.filter(r => !r.section).length !== 1 ? 's' : ''}</span>
              </div>
              <AssetTableBody rows={rows.filter(r => !r.section)} allRows={rows} onEdit={openEdit} onDelete={(i) => set('artifacts', rows.filter((_, j) => j !== i))} />
            </div>
          )}
        </div>
      )}

      {/* Artifact modal */}
      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Asset' : 'Edit Asset'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Title"><Input value={form.title} onChange={e => upd('title', e.target.value)} /></Field>
          <Field label="Heading" hint="A short tagline or positioning headline for this asset.">
            <Input value={form.heading ?? ''} onChange={e => upd('heading', e.target.value)} placeholder="e.g. Foundational research underpinning the LnP design" />
          </Field>
          <Field label="Description" hint="Brief description of what this asset covers (shown on the card in the executive view).">
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              value={form.description ?? ''}
              onChange={e => upd('description', e.target.value)}
              placeholder="Summarise what this document contains and why it matters…"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Section">
              <Select value={form.section ?? ''} onChange={e => handleSectionChange(e.target.value)}>
                <option value="">— No Section —</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </Select>
            </Field>
            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <Field label="Subcategory">
                <Select value={form.stage ?? ''} onChange={e => upd('stage', e.target.value || undefined)}>
                  <option value="">— None —</option>
                  {selectedCategory.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Type">
              <Select value={form.type} onChange={e => upd('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => upd('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="Last Updated"><Input type="date" value={form.date} onChange={e => upd('date', e.target.value)} /></Field>
            <Field label="Version"><Input value={form.version ?? ''} onChange={e => upd('version', e.target.value)} placeholder="v1.0" /></Field>
            <Field label="Reviewed By"><Input value={form.reviewedBy ?? ''} onChange={e => upd('reviewedBy', e.target.value)} placeholder="Tahera B., Ravi K." /></Field>
          </div>
          <Field label="Link (URL)"><Input type="url" value={form.link} onChange={e => upd('link', e.target.value)} placeholder="https://…" /></Field>
          <Field label="Custom Thumbnail URL" hint="Leave blank to auto-generate a preview from the link.">
            <Input type="url" value={form.thumbnailUrl ?? ''} onChange={e => upd('thumbnailUrl', e.target.value)} placeholder="https://…" />
          </Field>
        </Modal>
      )}

      {/* Category modal */}
      {catModal.open && (
        <Modal
          title={catModal.idx === null ? 'Add Category' : 'Edit Category'}
          onClose={() => setCatModal({ open: false, idx: null })}
          onSave={handleSaveCategory}
        >
          <Field label="Category Name">
            <Input
              value={catForm.name}
              onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. DPI Adoption"
            />
          </Field>
          <Field label="Subcategories" hint="Comma-separated. Leave blank if none.">
            <Input
              value={catForm.subcats}
              onChange={e => setCatForm(f => ({ ...f, subcats: e.target.value }))}
              placeholder="e.g. Discovery, Design, Build, Adoption"
            />
          </Field>
        </Modal>
      )}
    </div>
    </>
  );
}

function AssetTableBody({
  rows, allRows, onEdit, onDelete,
}: {
  rows: Artifact[];
  allRows: Artifact[];
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100">
          <tr>
            {['Title', 'Type', 'Owner', 'Date', 'Status', 'Version', 'Reviewed By', 'Link', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => {
            const idx = allRows.indexOf(row);
            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{row.title}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.type}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.owner}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.date}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.status}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.version ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{row.reviewedBy ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {row.link
                    ? <a href={/^https?:\/\//i.test(row.link) ? row.link : `https://${row.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open ↗</a>
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <RowActions onEdit={() => onEdit(idx)} onDelete={() => onDelete(idx)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
