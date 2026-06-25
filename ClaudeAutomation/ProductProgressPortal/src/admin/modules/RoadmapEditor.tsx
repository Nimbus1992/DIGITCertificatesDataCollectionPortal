import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store/DataStore';
import { VisibilityBanner } from '../VisibilityBanner';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea, ListEditor } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import { ComplaintsRoadmapEditor } from './ComplaintsRoadmapEditor';
import { StudioRoadmapEditor } from './StudioRoadmapEditor';
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
  const { productSlug } = useParams<{ productSlug: string }>();
  if (productSlug === 'cms') return <ComplaintsRoadmapEditor />;
  if (productSlug === 'studio') return <StudioRoadmapEditor />;

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
    <>
      <VisibilityBanner visKey="roadmap" label="Roadmap" />
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Roadmap Editor</h2><p className="text-gray-500 text-sm">{rows.length} items</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Item</button>
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

      {/* Scope Overview — edits productOverview.inScope / outOfScope */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scope Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">Shown at the top of the Roadmap in the executive view.</p>
        </div>
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 p-5 gap-5 md:gap-0">
          <div className="md:pr-5">
            <Field label="In Scope">
              <ListEditor
                values={data.productOverview?.inScope ?? []}
                onChange={v => set('productOverview', { ...data.productOverview, inScope: v })}
                placeholder="Add in-scope item"
              />
            </Field>
          </div>
          <div className="md:pl-5">
            <Field label="Out of Scope">
              <ListEditor
                values={data.productOverview?.outOfScope ?? []}
                onChange={v => set('productOverview', { ...data.productOverview, outOfScope: v })}
                placeholder="Add out-of-scope item"
              />
            </Field>
          </div>
        </div>
      </div>

      {rows.length === 0 ? <Empty label="roadmap items" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </>
  );
}
