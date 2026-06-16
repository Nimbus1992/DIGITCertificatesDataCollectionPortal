import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { Risk, RiskCategory } from '../../types';

const EMPTY: Risk = { description: '', severity: 'Medium', category: undefined, probability: 3, impact: 3, owner: '', mitigation: '', eta: '', status: 'Open' };
const SEVERITIES: Risk['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
const CATEGORIES: RiskCategory[] = ['Adoption', 'Timeline', 'Technical', 'Security & Compliance', 'Financial', 'Other'];

const SEV_STYLE: Record<Risk['severity'], string> = {
  Critical: 'bg-red-100 text-red-900', High: 'bg-orange-100 text-orange-900',
  Medium: 'bg-amber-100 text-amber-900', Low: 'bg-green-100 text-green-900',
};

const CAT_STYLE: Record<RiskCategory, string> = {
  'Adoption': 'bg-blue-100 text-blue-800',
  'Timeline': 'bg-purple-100 text-purple-800',
  'Technical': 'bg-gray-100 text-gray-800',
  'Security & Compliance': 'bg-orange-100 text-orange-800',
  'Financial': 'bg-green-100 text-green-800',
  'Other': 'bg-slate-100 text-slate-700',
};

export function RiskEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Risk>(EMPTY);

  const rows = data.risks;
  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    const n = { ...form, probability: Number(form.probability), impact: Number(form.impact) };
    if (modal.idx === null) set('risks', [...rows, n]);
    else { const next = [...rows]; next[modal.idx] = n; set('risks', next); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof Risk>(k: K, v: Risk[K]) => setForm(f => ({ ...f, [k]: v }));

  const grouped = CATEGORIES.reduce<Record<string, Risk[]>>((acc, cat) => {
    const items = rows.filter(r => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const uncategorised = rows.filter(r => !r.category);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Risk Registry</h2>
          <p className="text-gray-500 text-sm">{rows.length} risks logged</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Risk</button>
      </div>

      {rows.length === 0 ? <Empty label="risks" onAdd={openAdd} /> : (
        <div className="space-y-6">
          {[...Object.entries(grouped), ...(uncategorised.length ? [['Uncategorised', uncategorised] as [string, Risk[]]] : [])].map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CAT_STYLE[cat as RiskCategory] ?? 'bg-slate-100 text-slate-700'}`}>{cat}</span>
                <span className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'risk' : 'risks'}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>{['Description', 'Severity', 'P', 'I', 'Mitigation Strategy', 'Owner', 'Status', 'ETA', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((row, i) => {
                    const idx = rows.indexOf(row);
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 text-xs max-w-[200px]">{row.description}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEV_STYLE[row.severity]}`}>{row.severity}</span></td>
                        <td className="px-4 py-3 text-gray-600 text-xs text-center">{row.probability}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs text-center">{row.impact}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[220px]">{row.mitigation || <span className="text-gray-300 italic">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{row.owner}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{row.status}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{row.eta}</td>
                        <td className="px-4 py-3"><RowActions onEdit={() => openEdit(idx)} onDelete={() => set('risks', rows.filter((_, j) => j !== idx))} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Risk' : 'Edit Risk'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Description"><Textarea value={form.description} onChange={e => upd('description', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category ?? ''} onChange={e => upd('category', (e.target.value || undefined) as RiskCategory | undefined)}>
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={form.severity} onChange={e => upd('severity', e.target.value as Risk['severity'])}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Probability (1–5)" hint="5 = most likely"><Input type="number" min={1} max={5} value={form.probability} onChange={e => upd('probability', Number(e.target.value))} /></Field>
            <Field label="Impact (1–5)" hint="5 = highest impact"><Input type="number" min={1} max={5} value={form.impact} onChange={e => upd('impact', Number(e.target.value))} /></Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="ETA"><Input type="date" value={form.eta} onChange={e => upd('eta', e.target.value)} /></Field>
            <Field label="Status"><Input value={form.status} onChange={e => upd('status', e.target.value)} placeholder="Open / Mitigated / Closed" /></Field>
          </div>
          <Field label="Mitigation Strategy"><Textarea value={form.mitigation} onChange={e => upd('mitigation', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  );
}
