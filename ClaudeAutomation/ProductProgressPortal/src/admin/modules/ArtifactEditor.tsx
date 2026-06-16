import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { Artifact, ArtifactSection, DPIStage, SectionVisibility } from '../../types';

const EMPTY: Artifact = {
  title: '', type: 'PRD', owner: '', date: '', status: 'Draft',
  link: '', version: '', reviewedBy: '',
  section: 'DPI Adoption', stage: 'Discovery', thumbnailUrl: '',
};

const TYPES = ['Web Page', 'Deck', 'Git Link', 'Report', 'Pitch Deck', 'Prototype', 'PRD', 'Tech Design', 'Research', 'Meeting Notes', 'Decision Doc'];
const STATUSES = ['Draft', 'In Progress', 'Review', 'Complete'];
const SECTIONS: ArtifactSection[] = ['DPI Adoption', 'PLG Lifecycle', 'Ecosystem Building'];
const DPI_STAGES: DPIStage[] = ['Discovery', 'Design', 'Build', 'Adoption'];

const SECTION_VIS_KEY: Record<ArtifactSection, keyof SectionVisibility> = {
  'DPI Adoption':       'dpiAdoption',
  'PLG Lifecycle':      'plgLifecycle',
  'Ecosystem Building': 'ecosystemBuilding',
};

const SECTION_DESC: Record<ArtifactSection, string> = {
  'DPI Adoption':       'Discovery → Design → Build → Adoption',
  'PLG Lifecycle':      'Product-led growth lifecycle assets',
  'Ecosystem Building': 'Partner and ecosystem development assets',
};

const SECTION_BADGE: Record<ArtifactSection, string> = {
  'DPI Adoption':       'bg-blue-50 text-blue-700 border border-blue-200',
  'PLG Lifecycle':      'bg-purple-50 text-purple-700 border border-purple-200',
  'Ecosystem Building': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const SECTION_TOGGLE: Record<ArtifactSection, string> = {
  'DPI Adoption':       'bg-blue-600',
  'PLG Lifecycle':      'bg-purple-600',
  'Ecosystem Building': 'bg-emerald-600',
};

const SECTION_HEADER_BG: Record<ArtifactSection, string> = {
  'DPI Adoption':       'bg-blue-50',
  'PLG Lifecycle':      'bg-purple-50',
  'Ecosystem Building': 'bg-emerald-50',
};

const SECTION_HEADER_TEXT: Record<ArtifactSection, string> = {
  'DPI Adoption':       'text-blue-800',
  'PLG Lifecycle':      'text-purple-800',
  'Ecosystem Building': 'text-emerald-800',
};

export function ArtifactEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Artifact>(EMPTY);

  const rows = data.artifacts;
  const vis = data.sectionVisibility;

  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('artifacts', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('artifacts', n); }
    setModal({ open: false, idx: null });
  }

  const upd = <K extends keyof Artifact>(k: K, v: Artifact[K]) => setForm(f => ({ ...f, [k]: v }));

  function handleSectionChange(val: string) {
    const sec = val as ArtifactSection | '';
    setForm(f => ({
      ...f,
      section: sec || undefined,
      stage: sec === 'DPI Adoption' ? f.stage : undefined,
    }));
  }

  function toggleVis(key: keyof SectionVisibility) {
    set('sectionVisibility', { ...vis, [key]: !vis[key] });
  }

  const bySec = (sec: ArtifactSection) => rows.filter(r => r.section === sec);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Key Assets</h2>
          <p className="text-gray-500 text-sm">{rows.length} total assets</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Add Asset
        </button>
      </div>

      {/* Section Visibility Panel */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Section Visibility</h3>
        <div className="grid grid-cols-3 gap-4">
          {SECTIONS.map(sec => {
            const visKey = SECTION_VIS_KEY[sec];
            const on = vis[visKey];
            return (
              <div key={sec} className={`bg-white rounded-lg border border-gray-200 p-4 transition-opacity ${!on ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SECTION_BADGE[sec]}`}>{sec}</span>
                  <button
                    onClick={() => toggleVis(visKey)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${on ? SECTION_TOGGLE[sec] : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">{SECTION_DESC[sec]}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {bySec(sec).length} asset{bySec(sec).length !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset table grouped by section */}
      {rows.length === 0 ? <Empty label="key assets" onAdd={openAdd} /> : (
        <div className="space-y-6">
          {SECTIONS.map(sec => {
            const sRows = bySec(sec);
            if (sRows.length === 0) return null;
            const isDPI = sec === 'DPI Adoption';
            return (
              <div key={sec} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-200 flex items-center gap-3 ${SECTION_HEADER_BG[sec]}`}>
                  <span className={`font-semibold text-sm ${SECTION_HEADER_TEXT[sec]}`}>{sec}</span>
                  <span className="text-xs text-gray-400">{sRows.length} asset{sRows.length !== 1 ? 's' : ''}</span>
                  {isDPI && <span className="text-xs text-gray-400 ml-1">· Discovery · Design · Build · Adoption</span>}
                </div>
                {isDPI ? (
                  <>
                    {DPI_STAGES.map(stage => {
                      const stRows = sRows.filter(r => r.stage === stage);
                      if (stRows.length === 0) return null;
                      return (
                        <div key={stage}>
                          <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stage}</span>
                            <span className="text-xs text-gray-400">({stRows.length})</span>
                          </div>
                          <AssetTableBody rows={stRows} allRows={rows} onEdit={openEdit} onDelete={(idx) => set('artifacts', rows.filter((_, i) => i !== idx))} />
                        </div>
                      );
                    })}
                    {sRows.filter(r => !r.stage).length > 0 && (
                      <div>
                        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">No Stage</span>
                        </div>
                        <AssetTableBody rows={sRows.filter(r => !r.stage)} allRows={rows} onEdit={openEdit} onDelete={(idx) => set('artifacts', rows.filter((_, i) => i !== idx))} />
                      </div>
                    )}
                  </>
                ) : (
                  <AssetTableBody rows={sRows} allRows={rows} onEdit={openEdit} onDelete={(idx) => set('artifacts', rows.filter((_, i) => i !== idx))} />
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
              <AssetTableBody rows={rows.filter(r => !r.section)} allRows={rows} onEdit={openEdit} onDelete={(idx) => set('artifacts', rows.filter((_, i) => i !== idx))} />
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Asset' : 'Edit Asset'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Title"><Input value={form.title} onChange={e => upd('title', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Section">
              <Select value={form.section ?? ''} onChange={e => handleSectionChange(e.target.value)}>
                <option value="">— No Section —</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            {form.section === 'DPI Adoption' && (
              <Field label="Stage">
                <Select value={form.stage ?? ''} onChange={e => upd('stage', (e.target.value as DPIStage) || undefined)}>
                  <option value="">— No Stage —</option>
                  {DPI_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
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
    </div>
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
  );
}
