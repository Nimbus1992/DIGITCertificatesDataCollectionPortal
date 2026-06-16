import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { Metric } from '../../types';

const THEMES = ['Adoption', 'Feature Completeness', 'Product Impact & Experience', 'Performance, Security & Cost'];

const EMPTY: Metric = { name: '', category: 'Delivery', theme: '', target: '', actual: '', trend: 'Stable', period: '' };

const TREND_ICON: Record<Metric['trend'], string> = { Up: '↑', Down: '↓', Stable: '→' };
const TREND_COLOR: Record<Metric['trend'], string> = { Up: 'text-green-600', Down: 'text-red-600', Stable: 'text-gray-500' };

export function MetricsEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Metric>(EMPTY);

  const rows = data.metrics;
  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('metrics', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('metrics', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof Metric>(k: K, v: Metric[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Metrics Editor</h2><p className="text-gray-500 text-sm">{rows.length} metrics</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Metric</button>
      </div>

      {rows.length === 0 ? <Empty label="metrics" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Metric', 'Theme', 'Category', 'Target', 'Actual', 'Trend', 'Period', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.theme ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.category}</td>
                  <td className="px-4 py-3 text-gray-600">{row.target}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.actual}</td>
                  <td className={`px-4 py-3 font-bold text-lg ${TREND_COLOR[row.trend]}`}>{TREND_ICON[row.trend]}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.period}</td>
                  <td className="px-4 py-3"><RowActions onEdit={() => openEdit(idx)} onDelete={() => set('metrics', rows.filter((_, i) => i !== idx))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Metric' : 'Edit Metric'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave}>
          <Field label="Metric Name"><Input value={form.name} onChange={e => upd('name', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Theme">
              <Select value={form.theme ?? ''} onChange={e => upd('theme', e.target.value)}>
                <option value="">— No theme —</option>
                {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={e => upd('category', e.target.value as Metric['category'])}>
                <option value="Delivery">Delivery</option>
                <option value="Outcome">Outcome</option>
              </Select>
            </Field>
            <Field label="Trend">
              <Select value={form.trend} onChange={e => upd('trend', e.target.value as Metric['trend'])}>
                <option value="Up">↑ Up</option>
                <option value="Down">↓ Down</option>
                <option value="Stable">→ Stable</option>
              </Select>
            </Field>
            <Field label="Target"><Input value={form.target} onChange={e => upd('target', e.target.value)} placeholder="e.g. 80%" /></Field>
            <Field label="Actual"><Input value={form.actual} onChange={e => upd('actual', e.target.value)} placeholder="e.g. 65%" /></Field>
            <Field label="Period"><Input value={form.period} onChange={e => upd('period', e.target.value)} placeholder="e.g. Q1 FY26" /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
