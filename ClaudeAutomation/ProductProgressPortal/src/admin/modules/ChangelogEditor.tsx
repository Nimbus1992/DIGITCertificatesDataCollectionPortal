import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { ChangelogEntry } from '../../types';

const EMPTY: ChangelogEntry = { date: '', changeType: 'Milestone', description: '', section: '', author: '' };
const CHANGE_TYPES = ['Milestone', 'Budget', 'Risk', 'Roadmap', 'Artifact', 'Conversation', 'Decision', 'Metric', 'Other'];

const TYPE_COLOR: Record<string, string> = {
  Milestone: 'bg-blue-100 text-blue-800', Budget: 'bg-amber-100 text-amber-800',
  Risk: 'bg-red-100 text-red-800', Roadmap: 'bg-purple-100 text-purple-800',
  Artifact: 'bg-green-100 text-green-800', Conversation: 'bg-teal-100 text-teal-800',
};

export function ChangelogEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<ChangelogEntry>(EMPTY);

  const rows = data.changelog;
  function openAdd() {
    setForm({ ...EMPTY, date: new Date().toISOString().substring(0, 10) });
    setModal({ open: true, idx: null });
  }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('changelog', [form, ...rows]);
    else { const n = [...rows]; n[modal.idx] = form; set('changelog', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof ChangelogEntry>(k: K, v: ChangelogEntry[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900 mb-1">Changelog</h2><p className="text-gray-500 text-sm">{rows.length} entries</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Log Change</button>
      </div>

      {rows.length === 0 ? <Empty label="changelog entries" onAdd={openAdd} /> : (
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start gap-4">
              <span className="text-xs text-gray-400 shrink-0 w-24">{row.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLOR[row.changeType] ?? 'bg-gray-100 text-gray-700'}`}>{row.changeType}</span>
              <p className="flex-1 text-sm text-gray-800">{row.description}</p>
              <span className="text-xs text-gray-400 shrink-0">{row.author}</span>
              <RowActions onEdit={() => openEdit(idx)} onDelete={() => set('changelog', rows.filter((_, i) => i !== idx))} />
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Log Change' : 'Edit Entry'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><Input type="date" value={form.date} onChange={e => upd('date', e.target.value)} /></Field>
            <Field label="Change Type">
              <Select value={form.changeType} onChange={e => upd('changeType', e.target.value)}>
                {CHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Section affected"><Input value={form.section} onChange={e => upd('section', e.target.value)} placeholder="e.g. OKRs" /></Field>
            <Field label="Author"><Input value={form.author} onChange={e => upd('author', e.target.value)} /></Field>
          </div>
          <Field label="Description"><Textarea value={form.description} onChange={e => upd('description', e.target.value)} rows={3} /></Field>
        </Modal>
      )}
    </div>
  );
}
