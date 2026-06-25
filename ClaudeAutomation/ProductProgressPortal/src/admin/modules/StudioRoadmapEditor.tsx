import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Textarea } from '../../components/Field';
import type {
  CmsRoadmapData, CmsRelease, CmsGoalItem, CmsFeatureItem,
  CmsModuleGroup, CmsUpdateLogEntry, CmsItemColor, CmsTheme,
} from '../../types';
import { VisibilityBanner } from '../VisibilityBanner';

const COLORS: CmsItemColor[] = ['teal', 'sky', 'green', 'purple', 'orange', 'navy', 'maroon'];

const COLOR_BG: Record<CmsItemColor, string> = {
  teal: 'bg-teal-500', sky: 'bg-sky-400', green: 'bg-emerald-600',
  purple: 'bg-purple-600', orange: 'bg-orange-500', navy: 'bg-slate-800', maroon: 'bg-red-800',
};
const COLOR_PILL: Record<CmsItemColor, string> = {
  teal: 'bg-teal-500 text-white', sky: 'bg-sky-400 text-white', green: 'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white', orange: 'bg-orange-500 text-white',
  navy: 'bg-slate-800 text-white', maroon: 'bg-red-800 text-white',
};

type Tab = 'releases' | 'goals' | 'modules' | 'masters' | 'themes' | 'log';

const TABS: { id: Tab; label: string }[] = [
  { id: 'releases', label: 'Releases & Bundles' },
  { id: 'goals',    label: 'Goals' },
  { id: 'modules',  label: 'Feature Modules' },
  { id: 'masters',  label: 'Modules & Actors' },
  { id: 'themes',   label: 'Themes / Legend' },
  { id: 'log',      label: 'Update Log' },
];

function nanoid() { return Math.random().toString(36).slice(2, 10); }

// ── Shared ─────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white';
const textareaCls = `${inputCls} font-mono resize-none`;

function ColorPicker({ value, onChange, themes }: {
  value: CmsItemColor;
  onChange: (c: CmsItemColor) => void;
  themes: CmsTheme[];
}) {
  const label = themes.find(t => t.color === value)?.label ?? value;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5 flex-wrap">
        {COLORS.map(c => {
          const lbl = themes.find(t => t.color === c)?.label ?? c;
          return (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={`w-5 h-5 rounded-full border-2 ${COLOR_BG[c]} ${value === c ? 'border-gray-800 scale-125' : 'border-transparent'} transition-transform`}
              title={lbl}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span className={`inline-block w-2.5 h-2.5 rounded-sm ${COLOR_BG[value]}`} />
        {label}
      </p>
    </div>
  );
}

function FormCard({ title, onCancel, onSave, children }: {
  title: string; onCancel: () => void; onSave: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
      <p className="text-sm font-semibold text-blue-700">{title}</p>
      {children}
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="text-xs text-gray-500 px-3 py-1.5">Cancel</button>
        <button onClick={onSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Save</button>
      </div>
    </div>
  );
}

// ── Main editor ─────────────────────────────────────────────────────────────

export function StudioRoadmapEditor() {
  const { data, set } = useStore();
  const rm: CmsRoadmapData = data.studioRoadmap;
  const [tab, setTab] = useState<Tab>('releases');

  function upd(patch: Partial<CmsRoadmapData>) {
    set('studioRoadmap', { ...rm, ...patch });
  }

  return (
    <>
      <VisibilityBanner visKey="roadmap" label="Roadmap" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">DIGIT Studio Roadmap Editor</h2>
          <p className="text-gray-500 text-sm">DIGIT Studio — edit all roadmap sections</p>
        </div>

        {/* Roadmap Comment / Context */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roadmap Comment / Context</h3>
            <p className="text-xs text-gray-400 mt-0.5">Optional note shown above the roadmap in the executive view</p>
          </div>
          <div className="p-5">
            <Field label="Comment">
              <Textarea
                value={data.roadmapComment ?? ''}
                onChange={e => set('roadmapComment', e.target.value)}
                rows={4}
                placeholder="Add any context or notes for the executive view…"
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'releases' && (
          <ReleasesTab rm={rm} onUpd={upd} />
        )}
        {tab === 'goals' && (
          <GoalsTab goals={rm.goals} releases={rm.releases} themes={rm.themes}
            onSave={(g, i) => { const a = [...rm.goals]; i === null ? a.push(g) : (a[i] = g); upd({ goals: a }); }}
            onDelete={i => upd({ goals: rm.goals.filter((_, ii) => ii !== i) })} />
        )}
        {tab === 'modules' && (
          <ModulesTab moduleGroups={rm.moduleGroups} releases={rm.releases} themes={rm.themes}
            masterModules={rm.masterModules} masterActors={rm.masterActors}
            onSaveMg={(mg, i) => { const a = [...rm.moduleGroups]; i === null ? a.push(mg) : (a[i] = mg); upd({ moduleGroups: a }); }}
            onDeleteMg={i => upd({ moduleGroups: rm.moduleGroups.filter((_, ii) => ii !== i) })}
            onSaveItem={(mgIdx, item, itemIdx) => {
              const mgs = rm.moduleGroups.map((mg, i) => {
                if (i !== mgIdx) return mg;
                const items = [...mg.items];
                itemIdx === null ? items.push(item) : (items[itemIdx] = item);
                return { ...mg, items };
              });
              upd({ moduleGroups: mgs });
            }}
            onDeleteItem={(mgIdx, itemIdx) => {
              const mgs = rm.moduleGroups.map((mg, i) =>
                i !== mgIdx ? mg : { ...mg, items: mg.items.filter((_, ii) => ii !== itemIdx) }
              );
              upd({ moduleGroups: mgs });
            }}
          />
        )}
        {tab === 'masters' && (
          <MastersTab
            masterModules={rm.masterModules} masterActors={rm.masterActors}
            onUpdateModules={m => upd({ masterModules: m })}
            onUpdateActors={a => upd({ masterActors: a })}
          />
        )}
        {tab === 'themes' && (
          <ThemesTab themes={rm.themes}
            onSave={(t, i) => { const a = [...rm.themes]; i === null ? a.push(t) : (a[i] = t); upd({ themes: a }); }}
            onDelete={i => upd({ themes: rm.themes.filter((_, ii) => ii !== i) })} />
        )}
        {tab === 'log' && (
          <LogTab entries={rm.updateLog}
            onSave={(e, i) => { const a = [...rm.updateLog]; i === null ? a.push(e) : (a[i] = e); upd({ updateLog: a }); }}
            onDelete={i => upd({ updateLog: rm.updateLog.filter((_, ii) => ii !== i) })} />
        )}
      </div>
    </>
  );
}

// ── Releases + Value Bundles & Metrics Tab ───────────────────────────────────

function ReleasesTab({ rm, onUpd }: { rm: CmsRoadmapData; onUpd: (p: Partial<CmsRoadmapData>) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const EMPTY: CmsRelease = { id: '', name: '', timeframe: '', isCurrent: false, hasStar: false };
  const [form, setForm] = useState<CmsRelease>(EMPTY);

  function bundleFor(field: 'valueBundles' | 'successMetrics', releaseId: string) {
    return rm[field].find(b => b.releaseId === releaseId)?.items ?? [];
  }
  function updateBundle(releaseId: string, val: string, field: 'valueBundles' | 'successMetrics') {
    const arr = rm[field].filter(b => b.releaseId !== releaseId);
    arr.push({ releaseId, items: val.split('\n').filter(l => l.trim()) });
    onUpd({ [field]: arr });
  }
  function patchRelease(idx: number, patch: Partial<CmsRelease>) {
    const releases = rm.releases.map((r, i) => i === idx ? { ...r, ...patch } : r);
    onUpd({ releases });
  }
  function addRelease() {
    if (!form.name) return;
    const r = form.id ? form : { ...form, id: nanoid() };
    onUpd({ releases: [...rm.releases, r] });
    setForm(EMPTY); setAdding(false);
  }
  function deleteRelease(idx: number) {
    const id = rm.releases[idx].id;
    onUpd({
      releases: rm.releases.filter((_, i) => i !== idx),
      valueBundles: rm.valueBundles.filter(b => b.releaseId !== id),
      successMetrics: rm.successMetrics.filter(b => b.releaseId !== id),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{rm.releases.length} releases</p>
        <button onClick={() => { setAdding(true); setExpanded(null); }}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
          + Add Release
        </button>
      </div>

      {adding && (
        <FormCard title="New Release" onCancel={() => setAdding(false)} onSave={addRelease}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="ID (e.g. r212)">
              <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} className={inputCls} placeholder="leave blank to auto-generate" />
            </Field>
            <Field label="Name">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Timeframe">
              <input value={form.timeframe} onChange={e => setForm(f => ({ ...f, timeframe: e.target.value }))} className={inputCls} placeholder="e.g. Jan–Mar 2026" />
            </Field>
            <Field label="Flags">
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.isCurrent ?? false} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked }))} />
                  Current release
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.hasStar ?? false} onChange={e => setForm(f => ({ ...f, hasStar: e.target.checked }))} />
                  Show star ★
                </label>
              </div>
            </Field>
          </div>
        </FormCard>
      )}

      {rm.releases.map((r, idx) => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpanded(expanded === idx ? null : idx)}>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
              {r.isCurrent && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Current</span>}
              {r.hasStar && <span className="text-yellow-500">★</span>}
              <span className="text-xs text-gray-400">{r.timeframe}</span>
            </div>
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <span className="text-xs text-gray-400">
                {bundleFor('valueBundles', r.id).length} bundles · {bundleFor('successMetrics', r.id).length} metrics
              </span>
              <button onClick={() => deleteRelease(idx)} className="text-xs text-red-500 hover:underline">Del</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setExpanded(expanded === idx ? null : idx)} className="text-xs text-blue-600 hover:underline">
                {expanded === idx ? 'Collapse' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Expanded inline editor */}
          {expanded === idx && (
            <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/40">
              {/* Release fields */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Release Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Name">
                    <input value={r.name} onChange={e => patchRelease(idx, { name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Timeframe">
                    <input value={r.timeframe} onChange={e => patchRelease(idx, { timeframe: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="Flags">
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={r.isCurrent ?? false}
                          onChange={e => patchRelease(idx, { isCurrent: e.target.checked })} />
                        Current release
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={r.hasStar ?? false}
                          onChange={e => patchRelease(idx, { hasStar: e.target.checked })} />
                        Show star ★
                      </label>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Value Bundles */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Value Bundles</p>
                <p className="text-xs text-gray-400 mb-1.5">One item per line</p>
                <textarea
                  value={bundleFor('valueBundles', r.id).join('\n')}
                  onChange={e => updateBundle(r.id, e.target.value, 'valueBundles')}
                  rows={5} className={`w-full ${textareaCls}`}
                  placeholder="Each line becomes a bullet point…"
                />
                <p className="text-xs text-gray-400 mt-0.5">{bundleFor('valueBundles', r.id).length} items</p>
              </div>

              {/* Success Metrics */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Success Metrics</p>
                <p className="text-xs text-gray-400 mb-1.5">One item per line</p>
                <textarea
                  value={bundleFor('successMetrics', r.id).join('\n')}
                  onChange={e => updateBundle(r.id, e.target.value, 'successMetrics')}
                  rows={5} className={`w-full ${textareaCls}`}
                  placeholder="Each line becomes a bullet point…"
                />
                <p className="text-xs text-gray-400 mt-0.5">{bundleFor('successMetrics', r.id).length} items</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Goals Tab ────────────────────────────────────────────────────────────────

function GoalsTab({ goals, releases, themes, onSave, onDelete }: {
  goals: CmsGoalItem[];
  releases: CmsRelease[];
  themes: CmsTheme[];
  onSave: (g: CmsGoalItem, idx: number | null) => void;
  onDelete: (idx: number) => void;
}) {
  const EMPTY: CmsGoalItem = { id: '', text: '', releaseId: releases[0]?.id ?? '', color: 'teal' };
  const [editing, setEditing] = useState<{ g: CmsGoalItem; idx: number | null } | null>(null);

  function save() {
    if (!editing || !editing.g.text) return;
    onSave(editing.idx === null ? { ...editing.g, id: nanoid() } : editing.g, editing.idx);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{goals.length} goals</p>
        <button onClick={() => setEditing({ g: { ...EMPTY }, idx: null })}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">+ Add Goal</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b">
            <tr>{['Release', 'Goal text', 'Theme / Label', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {goals.map((g, idx) => {
              const rel = releases.find(r => r.id === g.releaseId);
              const themeLbl = themes.find(t => t.color === g.color)?.label ?? g.color;
              return (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{rel?.name ?? g.releaseId}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${COLOR_PILL[g.color]}`}>{g.text}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block w-3 h-3 rounded-sm shrink-0 ${COLOR_BG[g.color]}`} />
                      <span className="text-gray-600">{themeLbl}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing({ g: { ...g }, idx })} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => onDelete(idx)} className="text-red-500 hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <FormCard title={editing.idx === null ? 'New Goal' : 'Edit Goal'} onCancel={() => setEditing(null)} onSave={save}>
          <Field label="Goal text">
            <input value={editing.g.text} onChange={e => setEditing(ed => ed && { ...ed, g: { ...ed.g, text: e.target.value } })} className={inputCls} />
          </Field>
          <Field label="Release">
            <select value={editing.g.releaseId}
              onChange={e => setEditing(ed => ed && { ...ed, g: { ...ed.g, releaseId: e.target.value } })}
              className={inputCls}>
              {releases.map(r => <option key={r.id} value={r.id}>{r.name} — {r.timeframe}</option>)}
            </select>
          </Field>
          <Field label="Theme / Label">
            <ColorPicker value={editing.g.color} onChange={c => setEditing(ed => ed && { ...ed, g: { ...ed.g, color: c } })} themes={themes} />
          </Field>
        </FormCard>
      )}
    </div>
  );
}

// ── Feature Modules Tab ──────────────────────────────────────────────────────

function ModulesTab({ moduleGroups, releases, themes, masterModules, masterActors,
  onSaveMg, onDeleteMg, onSaveItem, onDeleteItem }: {
  moduleGroups: CmsModuleGroup[];
  releases: CmsRelease[];
  themes: CmsTheme[];
  masterModules: string[];
  masterActors: string[];
  onSaveMg: (mg: CmsModuleGroup, idx: number | null) => void;
  onDeleteMg: (idx: number) => void;
  onSaveItem: (mgIdx: number, item: CmsFeatureItem, itemIdx: number | null) => void;
  onDeleteItem: (mgIdx: number, itemIdx: number) => void;
}) {
  const [expandedMg, setExpandedMg] = useState<number | null>(null);
  const [editingMg, setEditingMg] = useState<{ mg: CmsModuleGroup; idx: number | null } | null>(null);
  const [editingItem, setEditingItem] = useState<{ item: CmsFeatureItem; mgIdx: number; itemIdx: number | null } | null>(null);

  const EMPTY_MG: CmsModuleGroup = { id: '', modules: [], actors: [], items: [] };
  const EMPTY_ITEM: CmsFeatureItem = { id: '', text: '', releaseId: releases[0]?.id ?? '', color: 'teal' };

  function saveMg() {
    if (!editingMg) return;
    onSaveMg(editingMg.idx === null ? { ...editingMg.mg, id: nanoid(), items: [] } : editingMg.mg, editingMg.idx);
    setEditingMg(null);
  }

  function saveItem() {
    if (!editingItem || !editingItem.item.text) return;
    onSaveItem(editingItem.mgIdx, editingItem.itemIdx === null ? { ...editingItem.item, id: nanoid() } : editingItem.item, editingItem.itemIdx);
    setEditingItem(null);
  }

  function toggleModule(mg: CmsModuleGroup, mod: string) {
    const modules = mg.modules.includes(mod) ? mg.modules.filter(m => m !== mod) : [...mg.modules, mod];
    setEditingMg(ed => ed && { ...ed, mg: { ...ed.mg, modules } });
  }
  function toggleActor(mg: CmsModuleGroup, actor: string) {
    const actors = mg.actors.includes(actor) ? mg.actors.filter(a => a !== actor) : [...mg.actors, actor];
    setEditingMg(ed => ed && { ...ed, mg: { ...ed.mg, actors } });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{moduleGroups.length} module groups</p>
        <button onClick={() => setEditingMg({ mg: { ...EMPTY_MG }, idx: null })}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
          + Add Module Group
        </button>
      </div>

      {moduleGroups.map((mg, mgIdx) => (
        <div key={mg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpandedMg(expandedMg === mgIdx ? null : mgIdx)}>
            <div>
              <p className="text-sm font-semibold text-gray-900">{mg.modules.join(' / ') || '(no modules)'}</p>
              <p className="text-xs text-gray-500">
                {mg.actors.join(', ') || 'no actors'} · {mg.items.length} features
              </p>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditingMg({ mg: { ...mg, modules: [...mg.modules], actors: [...mg.actors] }, idx: mgIdx })}
                className="text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => onDeleteMg(mgIdx)} className="text-xs text-red-500 hover:underline">Del</button>
              <button onClick={() => { setEditingItem({ item: { ...EMPTY_ITEM }, mgIdx, itemIdx: null }); setExpandedMg(mgIdx); }}
                className="text-xs text-indigo-600 hover:underline ml-2">+ Feature</button>
            </div>
          </div>

          {expandedMg === mgIdx && mg.items.length > 0 && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Release', 'Feature', 'Theme / Label', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mg.items.map((item, itemIdx) => {
                    const rel = releases.find(r => r.id === item.releaseId);
                    const themeLbl = themes.find(t => t.color === item.color)?.label ?? item.color;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{rel?.name ?? item.releaseId}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded font-medium ${COLOR_PILL[item.color]}`}>{item.text}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-3 h-3 rounded-sm shrink-0 ${COLOR_BG[item.color]}`} />
                            <span className="text-gray-600">{themeLbl}</span>
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingItem({ item: { ...item }, mgIdx, itemIdx })}
                              className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => onDeleteItem(mgIdx, itemIdx)}
                              className="text-red-500 hover:underline">Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Edit module group */}
      {editingMg && (
        <FormCard title={editingMg.idx === null ? 'New Module Group' : 'Edit Module Group'} onCancel={() => setEditingMg(null)} onSave={saveMg}>
          <Field label="Modules (select from master list)">
            <div className="flex flex-wrap gap-1.5">
              {masterModules.map(m => (
                <button key={m} type="button" onClick={() => toggleModule(editingMg.mg, m)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${editingMg.mg.modules.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                  {m}
                </button>
              ))}
              {masterModules.length === 0 && <p className="text-xs text-gray-400 italic">Add modules in the Modules &amp; Actors tab first</p>}
            </div>
          </Field>
          <Field label="Actors (select from master list)">
            <div className="flex flex-wrap gap-1.5">
              {masterActors.map(a => (
                <button key={a} type="button" onClick={() => toggleActor(editingMg.mg, a)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${editingMg.mg.actors.includes(a) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                  {a}
                </button>
              ))}
              {masterActors.length === 0 && <p className="text-xs text-gray-400 italic">Add actors in the Modules &amp; Actors tab first</p>}
            </div>
          </Field>
        </FormCard>
      )}

      {/* Edit feature item */}
      {editingItem && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-indigo-700">
            {editingItem.itemIdx === null ? 'New Feature' : 'Edit Feature'} — {moduleGroups[editingItem.mgIdx]?.modules.join(' / ') || 'module group'}
          </p>
          <Field label="Feature text">
            <input value={editingItem.item.text}
              onChange={e => setEditingItem(ed => ed && { ...ed, item: { ...ed.item, text: e.target.value } })}
              className={inputCls} />
          </Field>
          <Field label="Release">
            <select value={editingItem.item.releaseId}
              onChange={e => setEditingItem(ed => ed && { ...ed, item: { ...ed.item, releaseId: e.target.value } })}
              className={inputCls}>
              {releases.map(r => <option key={r.id} value={r.id}>{r.name} — {r.timeframe}</option>)}
            </select>
          </Field>
          <Field label="Theme / Label">
            <ColorPicker value={editingItem.item.color}
              onChange={c => setEditingItem(ed => ed && { ...ed, item: { ...ed.item, color: c } })}
              themes={themes} />
          </Field>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setEditingItem(null)} className="text-xs text-gray-500 px-3 py-1.5">Cancel</button>
            <button onClick={saveItem} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Master Modules & Actors Tab ──────────────────────────────────────────────

function MastersTab({ masterModules, masterActors, onUpdateModules, onUpdateActors }: {
  masterModules: string[];
  masterActors: string[];
  onUpdateModules: (m: string[]) => void;
  onUpdateActors: (a: string[]) => void;
}) {
  const [newModule, setNewModule] = useState('');
  const [newActor, setNewActor] = useState('');

  function addModule() {
    const v = newModule.trim();
    if (v && !masterModules.includes(v)) { onUpdateModules([...masterModules, v]); }
    setNewModule('');
  }
  function addActor() {
    const v = newActor.trim();
    if (v && !masterActors.includes(v)) { onUpdateActors([...masterActors, v]); }
    setNewActor('');
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Modules */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 text-sm">Modules</p>
          <span className="text-xs text-gray-400">{masterModules.length} items</span>
        </div>
        <div className="flex gap-2">
          <input value={newModule} onChange={e => setNewModule(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addModule()}
            placeholder="Add module name…" className={`flex-1 ${inputCls}`} />
          <button onClick={addModule} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Add</button>
        </div>
        <ul className="space-y-1.5">
          {masterModules.map((m, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg group">
              <span className="text-xs text-gray-800">{m}</span>
              <button onClick={() => onUpdateModules(masterModules.filter((_, ii) => ii !== i))}
                className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </li>
          ))}
          {masterModules.length === 0 && <p className="text-xs text-gray-400 italic">No modules yet</p>}
        </ul>
      </div>

      {/* Actors */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 text-sm">Actors</p>
          <span className="text-xs text-gray-400">{masterActors.length} items</span>
        </div>
        <div className="flex gap-2">
          <input value={newActor} onChange={e => setNewActor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addActor()}
            placeholder="Add actor name…" className={`flex-1 ${inputCls}`} />
          <button onClick={addActor} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Add</button>
        </div>
        <ul className="space-y-1.5">
          {masterActors.map((a, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg group">
              <span className="text-xs text-gray-800">{a}</span>
              <button onClick={() => onUpdateActors(masterActors.filter((_, ii) => ii !== i))}
                className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </li>
          ))}
          {masterActors.length === 0 && <p className="text-xs text-gray-400 italic">No actors yet</p>}
        </ul>
      </div>
    </div>
  );
}

// ── Themes / Legend Tab ──────────────────────────────────────────────────────

function ThemesTab({ themes, onSave, onDelete }: {
  themes: CmsTheme[];
  onSave: (t: CmsTheme, idx: number | null) => void;
  onDelete: (idx: number) => void;
}) {
  const [editing, setEditing] = useState<{ t: CmsTheme; idx: number | null } | null>(null);
  const EMPTY: CmsTheme = { color: 'teal', label: '' };

  function save() {
    if (!editing || !editing.t.label) return;
    onSave(editing.t, editing.idx);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">{themes.length} themes — these appear in the legend on the executive roadmap view</p>
        </div>
        <button onClick={() => setEditing({ t: { ...EMPTY }, idx: null })}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">
          + Add Theme
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b">
            <tr>{['Colour', 'Theme label', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {themes.map((t, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded ${COLOR_BG[t.color]}`} />
                    <span className="text-gray-500 capitalize">{t.color}</span>
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${COLOR_PILL[t.color]}`}>{t.label}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing({ t: { ...t }, idx })} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => onDelete(idx)} className="text-red-500 hover:underline">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <FormCard title={editing.idx === null ? 'New Theme' : 'Edit Theme'} onCancel={() => setEditing(null)} onSave={save}>
          <Field label="Colour">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setEditing(ed => ed && { ...ed, t: { ...ed.t, color: c } })}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-colors ${editing.t.color === c ? 'border-gray-700 bg-gray-100 font-semibold' : 'border-gray-200 hover:border-gray-400'}`}>
                  <span className={`w-3 h-3 rounded-sm ${COLOR_BG[c]}`} />
                  <span className="capitalize">{c}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Theme label">
            <input value={editing.t.label}
              onChange={e => setEditing(ed => ed && { ...ed, t: { ...ed.t, label: e.target.value } })}
              className={inputCls} placeholder="e.g. International Readiness / DPI" />
          </Field>
          {editing.t.label && (
            <p className="text-xs text-gray-500">Preview: <span className={`inline-block px-2 py-0.5 rounded font-medium ${COLOR_PILL[editing.t.color]}`}>{editing.t.label}</span></p>
          )}
        </FormCard>
      )}
    </div>
  );
}

// ── Update Log Tab ───────────────────────────────────────────────────────────

function LogTab({ entries, onSave, onDelete }: {
  entries: CmsUpdateLogEntry[];
  onSave: (e: CmsUpdateLogEntry, idx: number | null) => void;
  onDelete: (idx: number) => void;
}) {
  const EMPTY: CmsUpdateLogEntry = { id: '', date: '', changes: [] };
  const [editing, setEditing] = useState<{ e: CmsUpdateLogEntry; idx: number | null } | null>(null);

  function save() {
    if (!editing || !editing.e.date) return;
    onSave(editing.idx === null ? { ...editing.e, id: nanoid() } : editing.e, editing.idx);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{entries.length} entries</p>
        <button onClick={() => setEditing({ e: { ...EMPTY }, idx: null })}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700">+ Add Entry</button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 mb-1.5">Changes affected on {entry.date}</p>
                <ul className="space-y-0.5">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="shrink-0">•</span><span>{c}</span></li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => setEditing({ e: { ...entry, changes: [...entry.changes] }, idx })}
                  className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(idx)} className="text-xs text-red-500 hover:underline">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <FormCard title={editing.idx === null ? 'New Log Entry' : 'Edit Log Entry'} onCancel={() => setEditing(null)} onSave={save}>
          <Field label="Date (e.g. 14th January 2026)">
            <input value={editing.e.date} onChange={e => setEditing(ed => ed && { ...ed, e: { ...ed.e, date: e.target.value } })} className={inputCls} />
          </Field>
          <Field label="Changes (one per line)">
            <textarea rows={5} value={editing.e.changes.join('\n')}
              onChange={e => setEditing(ed => ed && { ...ed, e: { ...ed.e, changes: e.target.value.split('\n').filter(l => l.trim()) } })}
              className={`w-full ${textareaCls}`} placeholder="Each line becomes a bullet point…" />
          </Field>
        </FormCard>
      )}
    </div>
  );
}
