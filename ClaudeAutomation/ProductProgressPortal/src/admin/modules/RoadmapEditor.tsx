import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { RoadmapItem, Status } from '../../types';

const EMPTY: RoadmapItem = { item: '', description: '', status: 'Upcoming', confidence: 'Green', dependencies: '', deliveryWindow: '', quarter: '', phase: '' };

const STATUSES: RoadmapItem['status'][] = ['Upcoming', 'In Progress', 'Completed', 'Delayed'];
const CONFIDENCE: Status[] = ['Green', 'Amber', 'Red'];

const STATUS_STYLE: Record<RoadmapItem['status'], string> = {
  Completed: 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Upcoming: 'bg-gray-100 text-gray-700',
  Delayed: 'bg-red-100 text-red-800',
};

export function RoadmapEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<RoadmapItem>(EMPTY);

  const rows = data.roadmap;
  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('roadmap', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('roadmap', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof RoadmapItem>(k: K, v: RoadmapItem[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Roadmap Editor</h2><p className="text-gray-500 text-sm">{rows.length} items</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Item</button>
      </div>

      {rows.length === 0 ? <Empty label="roadmap items" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Item', 'Quarter', 'Phase', 'Delivery Window', 'Status', 'Confidence', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.item}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.quarter}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.phase}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.deliveryWindow}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[row.status]}`}>{row.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{row.confidence}</td>
                  <td className="px-4 py-3"><RowActions onEdit={() => openEdit(idx)} onDelete={() => set('roadmap', rows.filter((_, i) => i !== idx))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Roadmap Item' : 'Edit Roadmap Item'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Item Name"><Input value={form.item} onChange={e => upd('item', e.target.value)} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={e => upd('description', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quarter (e.g. Q1 FY26)"><Input value={form.quarter} onChange={e => upd('quarter', e.target.value)} /></Field>
            <Field label="Phase"><Input value={form.phase} onChange={e => upd('phase', e.target.value)} /></Field>
            <Field label="Delivery Window"><Input value={form.deliveryWindow} onChange={e => upd('deliveryWindow', e.target.value)} placeholder="e.g. Apr–Jun 2025" /></Field>
            <Field label="Dependencies"><Input value={form.dependencies} onChange={e => upd('dependencies', e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => upd('status', e.target.value as RoadmapItem['status'])}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Confidence">
              <Select value={form.confidence} onChange={e => upd('confidence', e.target.value as Status)}>
                {CONFIDENCE.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
