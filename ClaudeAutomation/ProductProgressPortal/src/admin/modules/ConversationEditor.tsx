import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import type { Conversation, ConversationStage } from '../../types';

const EMPTY: Conversation = { organization: '', owner: '', objective: '', stage: 'Discovery', latestUpdate: '', nextStep: '' };
const STAGES: ConversationStage[] = ['Discovery', 'Evaluation', 'Proposal', 'Pilot', 'Blocked', 'Closed'];

const STAGE_STYLE: Record<ConversationStage, string> = {
  Discovery: 'bg-gray-100 text-gray-700', Evaluation: 'bg-blue-100 text-blue-800',
  Proposal: 'bg-purple-100 text-purple-800', Pilot: 'bg-green-100 text-green-800',
  Blocked: 'bg-red-100 text-red-800', Closed: 'bg-emerald-100 text-emerald-800',
};

export function ConversationEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Conversation>(EMPTY);

  const rows = data.conversations;
  function openAdd() { setForm(EMPTY); setModal({ open: true, idx: null }); }
  function openEdit(idx: number) { setForm({ ...rows[idx] }); setModal({ open: true, idx }); }
  function handleSave() {
    if (modal.idx === null) set('conversations', [...rows, form]);
    else { const n = [...rows]; n[modal.idx] = form; set('conversations', n); }
    setModal({ open: false, idx: null });
  }
  const upd = <K extends keyof Conversation>(k: K, v: Conversation[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900 mb-1">External Conversations</h2><p className="text-gray-500 text-sm">{rows.length} conversations tracked</p></div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Conversation</button>
      </div>

      {rows.length === 0 ? <Empty label="conversations" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Organisation', 'Owner', 'Objective', 'Stage', 'Latest Update', 'Next Step', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.organization}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.owner}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{row.objective}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_STYLE[row.stage]}`}>{row.stage}</span></td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{row.latestUpdate}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.nextStep}</td>
                  <td className="px-4 py-3"><RowActions onEdit={() => openEdit(idx)} onDelete={() => set('conversations', rows.filter((_, i) => i !== idx))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Conversation' : 'Edit Conversation'} onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Organisation"><Input value={form.organization} onChange={e => upd('organization', e.target.value)} /></Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="Stage">
              <Select value={form.stage} onChange={e => upd('stage', e.target.value as ConversationStage)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Objective"><Textarea value={form.objective} onChange={e => upd('objective', e.target.value)} /></Field>
          <Field label="Latest Update"><Textarea value={form.latestUpdate} onChange={e => upd('latestUpdate', e.target.value)} /></Field>
          <Field label="Next Step"><Input value={form.nextStep} onChange={e => upd('nextStep', e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  );
}
