import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import type { OKR, OKRStatus } from '../../types';

const EMPTY: OKR = {
  objective: '', keyResult: '', target: '', actual: '', progress: 0,
  status: 'On Track', targetDate: '', owner: '', delayed: false,
  reason: '', impact: '', mitigation: '', recoveryPlan: '',
};

const STATUS_OPTIONS: OKRStatus[] = ['On Track', 'At Risk', 'Delayed', 'Completed'];

const STATUS_STYLE: Record<OKRStatus, string> = {
  'On Track': 'bg-green-100 text-green-800',
  'At Risk': 'bg-amber-100 text-amber-800',
  'Delayed': 'bg-red-100 text-red-800',
  'Completed': 'bg-blue-100 text-blue-800',
};

export function OKREditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<OKR>(EMPTY);

  const okrs = data.okrs;

  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...okrs[idx] }); setModal({ open: true, idx }); }

  function handleSave() {
    const cleaned = { ...form, progress: Number(form.progress) };
    if (modal.idx === null) {
      set('okrs', [...okrs, cleaned]);
    } else {
      const next = [...okrs];
      next[modal.idx] = cleaned;
      set('okrs', next);
    }
    setModal({ open: false, idx: null });
  }

  function handleDelete(idx: number) {
    set('okrs', okrs.filter((_, i) => i !== idx));
  }

  const upd = <K extends keyof OKR>(k: K, v: OKR[K]) => setForm(f => ({ ...f, [k]: v }));

  const objectives = [...new Set(okrs.map(o => o.objective))];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">OKR Manager</h2>
          <p className="text-gray-500 text-sm">{okrs.length} key results across {objectives.length} objectives</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Key Result
        </button>
      </div>

      {okrs.length === 0 ? (
        <Empty label="OKRs" onAdd={openAdd} />
      ) : (
        <div className="space-y-6">
          {objectives.map(obj => (
            <div key={obj} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <p className="font-semibold text-gray-900 text-sm">{obj}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Key Result', 'Target', 'Actual', '%', 'Status', 'Owner', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {okrs.map((okr, idx) => okr.objective !== obj ? null : (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 max-w-xs">{okr.keyResult}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{okr.target}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{okr.actual}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">{okr.progress}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[okr.status]}`}>{okr.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{okr.owner}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{okr.targetDate}</td>
                      <td className="px-4 py-3">
                        <RowActions onEdit={() => openEdit(idx)} onDelete={() => handleDelete(idx)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Key Result' : 'Edit Key Result'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Objective"><Input value={form.objective} onChange={e => upd('objective', e.target.value)} placeholder="Objective text" /></Field>
          <Field label="Key Result"><Textarea value={form.keyResult} onChange={e => upd('keyResult', e.target.value)} rows={2} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Target"><Input value={form.target} onChange={e => upd('target', e.target.value)} /></Field>
            <Field label="Actual"><Input value={form.actual} onChange={e => upd('actual', e.target.value)} /></Field>
            <Field label="Progress (%)"><Input type="number" min={0} max={100} value={form.progress} onChange={e => upd('progress', Number(e.target.value))} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => upd('status', e.target.value as OKRStatus)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="Target Date"><Input type="date" value={form.targetDate} onChange={e => upd('targetDate', e.target.value)} /></Field>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="delayed" checked={form.delayed} onChange={e => upd('delayed', e.target.checked)} className="rounded" />
            <label htmlFor="delayed" className="text-sm text-gray-700">Mark as delayed</label>
          </div>
          {form.delayed && (
            <>
              <Field label="Reason for Delay"><Textarea value={form.reason} onChange={e => upd('reason', e.target.value)} /></Field>
              <Field label="Impact"><Textarea value={form.impact} onChange={e => upd('impact', e.target.value)} /></Field>
              <Field label="Mitigation"><Textarea value={form.mitigation} onChange={e => upd('mitigation', e.target.value)} /></Field>
              <Field label="Recovery Plan"><Textarea value={form.recoveryPlan} onChange={e => upd('recoveryPlan', e.target.value)} /></Field>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

function Empty({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-gray-400 text-sm mb-3">No {label} yet</p>
      <button onClick={onAdd} className="text-sm text-blue-600 hover:underline font-medium">+ Add first entry</button>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3">
      <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Edit</button>
      <button onClick={onDelete} className="text-xs text-red-500 hover:underline">Delete</button>
    </div>
  );
}

export { Empty, RowActions };
