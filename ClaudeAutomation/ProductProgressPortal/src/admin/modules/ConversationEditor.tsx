import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import { Empty, RowActions } from './OKREditor';
import { VisibilityBanner } from '../VisibilityBanner';
import type { Conversation, ConversationStage, StageHistoryEntry } from '../../types';

const STAGES: ConversationStage[] = ['Discover', 'Sign Up', 'Implement', 'Use', 'Expand'];

const STAGE_PILL: Record<ConversationStage, string> = {
  'Discover':   'bg-violet-100 text-violet-700',
  'Sign Up':    'bg-blue-100 text-blue-700',
  'Implement':  'bg-amber-100 text-amber-700',
  'Use':        'bg-teal-100 text-teal-700',
  'Expand':     'bg-emerald-100 text-emerald-700',
};

const EMPTY: Conversation = {
  organization: '', owner: '', objective: '', stage: 'Discover',
  latestUpdate: '', nextStep: '', partner: '', lastUpdateDate: '', stageHistory: [],
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function ConversationEditor() {
  const { data, set } = useStore();
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<Conversation>(EMPTY);
  const [origStage, setOrigStage] = useState<ConversationStage>('Discover');

  const rows = data.conversations;

  function openAdd() {
    setForm({ ...EMPTY, lastUpdateDate: todayISO() });
    setOrigStage('Discover');
    setModal({ open: true, idx: null });
  }

  function openEdit(idx: number) {
    setForm({ ...rows[idx] });
    setOrigStage(rows[idx].stage);
    setModal({ open: true, idx });
  }

  function handleSave() {
    const saved = { ...form };
    const today = saved.lastUpdateDate || todayISO();

    if (modal.idx === null) {
      // New conversation: initialize history
      saved.stageHistory = [{ stage: saved.stage, date: today, comment: saved.latestUpdate || 'Conversation started' }];
      set('conversations', [...rows, saved]);
    } else {
      // Editing: append to history if stage changed
      const prev = rows[modal.idx];
      if (saved.stage !== origStage) {
        const newEntry: StageHistoryEntry = {
          stage: saved.stage,
          date: today,
          comment: saved.latestUpdate || `Moved to ${saved.stage}`,
        };
        saved.stageHistory = [...(prev.stageHistory ?? [{ stage: origStage, date: prev.lastUpdateDate || today, comment: prev.latestUpdate || 'Initial' }]), newEntry];
      }
      const n = [...rows];
      n[modal.idx] = saved;
      set('conversations', n);
    }
    setModal({ open: false, idx: null });
  }

  const upd = <K extends keyof Conversation>(k: K, v: Conversation[K]) => setForm(f => ({ ...f, [k]: v }));

  const stageChanged = modal.idx !== null && form.stage !== origStage;

  return (
    <>
      <VisibilityBanner visKey="conversations" label="Conversations" />
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">External Conversations</h2>
          <p className="text-gray-500 text-sm">{rows.length} conversations tracked</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Add Conversation
        </button>
      </div>

      {/* Stage summary */}
      {rows.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {STAGES.map(s => {
            const n = rows.filter(r => r.stage === s).length;
            return (
              <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${STAGE_PILL[s]} border-current/20`}>
                <span>{s}</span>
                <span className="font-bold">{n}</span>
              </div>
            );
          })}
        </div>
      )}

      {rows.length === 0 ? <Empty label="conversations" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{['Organisation', 'Partner', 'Owner', 'Stage', 'Last Updated', 'Objective', 'Next Step', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.organization}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.partner || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{row.owner}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_PILL[row.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                      {row.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.lastUpdateDate || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{row.objective}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px] truncate">{row.nextStep}</td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => openEdit(idx)} onDelete={() => set('conversations', rows.filter((_, i) => i !== idx))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Conversation' : 'Edit Conversation'}
          onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organisation"><Input value={form.organization} onChange={e => upd('organization', e.target.value)} /></Field>
            <Field label="Partner"><Input value={form.partner ?? ''} onChange={e => upd('partner', e.target.value)} placeholder="e.g. State Government, NGO" /></Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => upd('owner', e.target.value)} /></Field>
            <Field label="Last Update Date">
              <Input type="date" value={form.lastUpdateDate ?? ''} onChange={e => upd('lastUpdateDate', e.target.value)} />
            </Field>
            <Field label="Stage" hint={stageChanged ? `Stage changed from ${origStage} → ${form.stage}. A history entry will be logged on save.` : undefined}>
              <Select value={form.stage} onChange={e => upd('stage', e.target.value as ConversationStage)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Objective"><Textarea value={form.objective} onChange={e => upd('objective', e.target.value)} /></Field>
          <Field label="Latest Update" hint={stageChanged ? 'This will be used as the comment for the stage move.' : undefined}>
            <Textarea value={form.latestUpdate} onChange={e => upd('latestUpdate', e.target.value)} />
          </Field>
          <Field label="Next Step"><Input value={form.nextStep} onChange={e => upd('nextStep', e.target.value)} /></Field>

          {/* Stage history (edit mode) */}
          {modal.idx !== null && (form.stageHistory ?? []).length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stage History</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(form.stageHistory ?? []).map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full font-medium ${STAGE_PILL[h.stage] ?? 'bg-gray-100 text-gray-600'}`}>{h.stage}</span>
                    <span className="text-gray-400 shrink-0">{h.date}</span>
                    <span className="text-gray-600 truncate">{h.comment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
    </>
  );
}
