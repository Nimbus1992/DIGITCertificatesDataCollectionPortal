import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import { VisibilityBanner } from '../VisibilityBanner';
import type { Decision, DecisionStatus } from '../../types';

const EMPTY: Decision = { decision: '', date: '', owner: '', context: '', tradeoff: '', outcome: '', status: 'Open' };
const STATUSES: DecisionStatus[] = ['Open', 'Pending', 'Closed'];

const STATUS_STYLE: Record<DecisionStatus, string> = {
  Open: 'bg-amber-100 text-amber-800', Pending: 'bg-gray-100 text-gray-700', Closed: 'bg-green-100 text-green-800',
};

export function DecisionEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Decision>(EMPTY);

  const rows = data.decisions;
  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('decisions', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('decisions', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof Decision>(k: K, v: Decision[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <VisibilityBanner visKey="decisions" label="Decision Log" />
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Decision Log</h2><p className="text-gray-500 text-sm">{rows.length} decisions recorded</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Decision</button>
      </div>

      {rows.length === 0 ? <Empty label="decisions" onAdd={openAdd} /> : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[row.status]}`}>{row.status}</span>
                    <span className="text-xs text-gray-400">{row.date}</span>
                    <span className="text-xs text-gray-400">{row.owner}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-2">{row.decision}</p>
                  {row.context && <p className="text-xs text-gray-500 truncate">{row.context}</p>}
                </div>
                <RowActions onEdit={() => openEdit(idx)} onDelete={() => set('decisions', rows.filter((_, i) => i !== idx))} />
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Decision' : 'Edit Decision'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Decision"><Textarea value={form.decision} onChange={e => upd('decision', e.target.value)} rows={2} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date"><Input type="date" value={form.date} onChange={e => upd('date', e.target.value)} /></Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => upd('status', e.target.value as DecisionStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Context"><Textarea value={form.context} onChange={e => upd('context', e.target.value)} /></Field>
          <Field label="Trade-off"><Textarea value={form.tradeoff} onChange={e => upd('tradeoff', e.target.value)} /></Field>
          <Field label="Outcome"><Textarea value={form.outcome} onChange={e => upd('outcome', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
    </>
  );
}
