import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/DataStore';
import { Modal } from '../../components/Modal';
import { Field, Input, Select, Textarea } from '../../components/Field';
import type { OKRMilestone, OKRTask, MilestoneStatus } from '../../types';
import { VisibilityBanner } from '../VisibilityBanner';

const STATUSES: MilestoneStatus[] = ['Not Started', 'In Progress', 'Complete', 'Delayed', 'At Risk'];

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Complete':    'bg-green-100 text-green-700',
  'Delayed':     'bg-red-100 text-red-700',
  'At Risk':     'bg-amber-100 text-amber-700',
};

const EMPTY_M: OKRMilestone = {
  id: '', title: '', keyResult: 'License and Permit Build', owner: '',
  committedDate: '', revisedDate: '', status: 'Not Started', comments: '', tasks: [],
  quarter: '', rowType: 'milestone',
};
const EMPTY_LAUNCH: OKRMilestone = {
  id: '', title: '', keyResult: '', owner: '',
  committedDate: '', revisedDate: '', status: 'Not Started', comments: '', tasks: [],
  quarter: '', rowType: 'launch',
};
const EMPTY_T: OKRTask = {
  id: '', title: '', owner: '', committedDate: '', revisedDate: '', status: 'Not Started', comments: '',
};

function fmt(d: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function delayDays(c: string, r: string) {
  if (!c || !r) return null;
  const days = Math.round((new Date(r).getTime() - new Date(c).getTime()) / 86400000);
  return isNaN(days) ? null : days;
}

function DelayBadge({ c, r }: { c: string; r: string }) {
  const d = delayDays(c, r);
  if (d === null) return <span className="text-gray-300">—</span>;
  if (d === 0) return <span className="text-gray-400">0d</span>;
  return <span className={d > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{d > 0 ? `+${d}d` : `${d}d`}</span>;
}

// ── Subtask inline editor row (used inside the edit modal) ────────────────

function SubtaskFormRow({
  subtask, onUpdate, onRemove, onPromote,
}: { subtask: OKRTask; onUpdate: (st: OKRTask) => void; onRemove: () => void; onPromote: () => void }) {
  const upd = <K extends keyof OKRTask>(k: K, v: OKRTask[K]) => onUpdate({ ...subtask, [k]: v });
  return (
    <div className="grid grid-cols-[60px_1fr_100px_130px_130px_130px_auto] gap-2 items-center py-1.5 border-b border-indigo-100/60 last:border-0">
      <input value={subtask.id} onChange={e => upd('id', e.target.value)} placeholder="ID"
        className="font-mono text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <input value={subtask.title} onChange={e => upd('title', e.target.value)} placeholder="Subtask title"
        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <input value={subtask.owner} onChange={e => upd('owner', e.target.value)} placeholder="Owner"
        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <input type="date" value={subtask.committedDate} onChange={e => upd('committedDate', e.target.value)}
        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <input type="date" value={subtask.revisedDate} onChange={e => upd('revisedDate', e.target.value)}
        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <select value={subtask.status} onChange={e => upd('status', e.target.value as MilestoneStatus)}
        className="text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="flex items-center gap-1">
        <button onClick={onPromote} title="Promote to top-level task" className="text-xs text-gray-400 hover:text-blue-500 px-1">↑</button>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function OKREditor() {
  const { data, set } = useStore();
  const allRows = data.milestones ?? [];
  const milestones = allRows.filter(m => m.rowType !== 'launch');
  const launchRows = allRows.filter(m => m.rowType === 'launch');

  // ── Launch modal state ─────────────────────────────────────────────────
  const [launchModal, setLaunchModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [launchForm, setLaunchForm] = useState<OKRMilestone>(EMPTY_LAUNCH);
  const updL = <K extends keyof OKRMilestone>(k: K, v: OKRMilestone[K]) => setLaunchForm(f => ({ ...f, [k]: v }));

  function openAddLaunch() { setLaunchForm({ ...EMPTY_LAUNCH }); setLaunchModal({ open: true, idx: null }); }
  function openEditLaunch(rawIdx: number) { setLaunchForm({ ...launchRows[rawIdx] }); setLaunchModal({ open: true, idx: rawIdx }); }
  function handleDeleteLaunch(rawIdx: number) { set('milestones', allRows.filter(m => m !== launchRows[rawIdx])); }
  function handleSaveLaunch() {
    const toSave = { ...launchForm, rowType: 'launch' as const };
    if (launchModal.idx === null) {
      set('milestones', [...allRows, toSave]);
    } else {
      const updated = allRows.map(m => m === launchRows[launchModal.idx!] ? toSave : m);
      set('milestones', updated);
    }
    setLaunchModal({ open: false, idx: null });
  }

  function delayDaysLaunch(m: OKRMilestone): number | null {
    return delayDays(m.committedDate, m.revisedDate);
  }

  // ── Main table expand state ────────────────────────────────────────────
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set()); // key: "mIdx-tIdx"

  function toggleMilestone(idx: number) {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }
  function toggleTask(mIdx: number, tIdx: number) {
    const key = `${mIdx}-${tIdx}`;
    setExpandedTasks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Modal / form state ─────────────────────────────────────────────────
  const [modal, setModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
  const [form, setForm] = useState<OKRMilestone>(EMPTY_M);
  const [taskForm, setTaskForm] = useState<OKRTask>(EMPTY_T);
  const [taskEditIdx, setTaskEditIdx] = useState<number | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [expandedTaskIdx, setExpandedTaskIdx] = useState<number | null>(null);
  const [parentTaskId, setParentTaskId] = useState('');

  function openAdd() {
    setForm({ ...EMPTY_M });
    setShowTaskForm(false); setExpandedTaskIdx(null);
    setModal({ open: true, idx: null });
  }
  function openEdit(idx: number) {
    setForm({ ...milestones[idx], tasks: milestones[idx].tasks.map(t => ({ ...t, subtasks: t.subtasks ? [...t.subtasks] : [] })) });
    setShowTaskForm(false); setExpandedTaskIdx(null);
    setModal({ open: true, idx });
  }
  function handleDelete(idx: number) {
    set('milestones', allRows.filter(m => m !== milestones[idx]));
    setExpandedMilestones(prev => { const next = new Set(prev); next.delete(idx); return next; });
  }

  function handleSave() {
    const toSave = { ...form, rowType: 'milestone' as const };
    if (modal.idx === null) {
      set('milestones', [...allRows, toSave]);
    } else {
      const updated = allRows.map(m => m === milestones[modal.idx!] ? toSave : m);
      set('milestones', updated);
    }
    setModal({ open: false, idx: null });
  }

  function openAddTask() {
    setTaskForm(EMPTY_T); setTaskEditIdx(null); setParentTaskId(''); setShowTaskForm(true);
  }
  function openEditTask(ti: number) {
    setTaskForm({ ...form.tasks[ti] }); setTaskEditIdx(ti); setParentTaskId(''); setShowTaskForm(true);
  }

  function commitTask() {
    if (!taskForm.title) return;
    if (parentTaskId === '') {
      const tasks = [...form.tasks];
      if (taskEditIdx !== null) tasks[taskEditIdx] = { ...taskForm };
      else tasks.push({ ...taskForm });
      setForm(f => ({ ...f, tasks }));
    } else {
      let tasks = [...form.tasks];
      if (taskEditIdx !== null) tasks = tasks.filter((_, i) => i !== taskEditIdx);
      tasks = tasks.map(t => {
        if (t.id !== parentTaskId) return t;
        return { ...t, subtasks: [...(t.subtasks ?? []), { ...taskForm, subtasks: undefined }] };
      });
      setForm(f => ({ ...f, tasks }));
      setExpandedTaskIdx(tasks.findIndex(t => t.id === parentTaskId));
    }
    setTaskForm(EMPTY_T); setTaskEditIdx(null); setParentTaskId(''); setShowTaskForm(false);
  }

  function addSubtask(taskIdx: number) {
    setForm(f => ({
      ...f,
      tasks: f.tasks.map((t, i) => i !== taskIdx ? t : { ...t, subtasks: [...(t.subtasks ?? []), { ...EMPTY_T }] }),
    }));
  }

  function updateSubtask(taskIdx: number, stIdx: number, st: OKRTask) {
    setForm(f => ({
      ...f,
      tasks: f.tasks.map((t, i) => i !== taskIdx ? t : {
        ...t, subtasks: (t.subtasks ?? []).map((s, si) => si === stIdx ? st : s),
      }),
    }));
  }

  function removeSubtask(taskIdx: number, stIdx: number) {
    setForm(f => ({
      ...f,
      tasks: f.tasks.map((t, i) => i !== taskIdx ? t : {
        ...t, subtasks: (t.subtasks ?? []).filter((_, si) => si !== stIdx),
      }),
    }));
  }

  function promoteSubtask(taskIdx: number, stIdx: number) {
    const subtask = form.tasks[taskIdx].subtasks?.[stIdx];
    if (!subtask) return;
    const tasks = form.tasks.map((t, i) => i !== taskIdx ? t : {
      ...t, subtasks: (t.subtasks ?? []).filter((_, si) => si !== stIdx),
    });
    setForm(f => ({ ...f, tasks: [...tasks, { ...subtask }] }));
  }

  const updM = <K extends keyof OKRMilestone>(k: K, v: OKRMilestone[K]) => setForm(f => ({ ...f, [k]: v }));
  const updT = <K extends keyof OKRTask>(k: K, v: OKRTask[K]) => setTaskForm(f => ({ ...f, [k]: v }));
  const keyResults = Array.from(new Set(milestones.map(m => m.keyResult)));

  // ── Column widths for consistent alignment across rows ─────────────────
  const COL = 'px-3 py-2 text-xs';

  return (
    <>
      <VisibilityBanner visKey="okrs" label="OKRs" />
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Milestone Tracker</h2>
          <p className="text-gray-500 text-sm">{milestones.length} milestones · click a row to expand tasks and subtasks</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Add Milestone
        </button>
      </div>

      {milestones.length === 0 ? <Empty label="milestones" onAdd={openAdd} /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-2 py-2.5" />
                {['#', 'Key Result / ID', 'Title', 'Owner', 'Status', 'Committed', 'Revised', 'Delay', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, mIdx) => {
                const mExpanded = expandedMilestones.has(mIdx);
                const hasTasks = m.tasks.length > 0;
                return (
                  <>
                    {/* ── Milestone row ── */}
                    <tr
                      key={`m-${mIdx}`}
                      className={`border-b border-gray-100 transition-colors ${hasTasks ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-gray-50/50'}`}
                      onClick={() => hasTasks && toggleMilestone(mIdx)}
                    >
                      <td className="px-2 py-3 text-center text-blue-500">
                        {hasTasks
                          ? (mExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />)
                          : <span className="inline-block w-3" />}
                      </td>
                      <td className={`${COL} font-bold text-blue-600 whitespace-nowrap`}>#{m.id}</td>
                      <td className={`${COL} text-indigo-600 font-medium max-w-[130px] truncate`}>{m.keyResult}</td>
                      <td className={`${COL} font-semibold text-gray-900 max-w-[220px] leading-snug`}>{m.title}</td>
                      <td className={`${COL} text-gray-600`}>{m.owner}</td>
                      <td className={COL}>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[m.status]}`}>{m.status}</span>
                      </td>
                      <td className={`${COL} text-gray-500 whitespace-nowrap`}>{fmt(m.committedDate)}</td>
                      <td className={`${COL} text-gray-500 whitespace-nowrap`}>{fmt(m.revisedDate)}</td>
                      <td className={`${COL} whitespace-nowrap`}><DelayBadge c={m.committedDate} r={m.revisedDate} /></td>
                      <td className={`${COL} whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                        <RowActions onEdit={() => openEdit(mIdx)} onDelete={() => handleDelete(mIdx)} />
                      </td>
                    </tr>

                    {/* ── Task rows (shown when milestone expanded) ── */}
                    {mExpanded && m.tasks.map((t, tIdx) => {
                      const tKey = `${mIdx}-${tIdx}`;
                      const tExpanded = expandedTasks.has(tKey);
                      const hasSubtasks = (t.subtasks?.length ?? 0) > 0;
                      return (
                        <>
                          <tr
                            key={`t-${tKey}`}
                            className={`border-b border-gray-50 bg-blue-50/20 transition-colors ${hasSubtasks ? 'cursor-pointer hover:bg-blue-50/60' : 'hover:bg-blue-50/30'}`}
                            onClick={() => hasSubtasks && toggleTask(mIdx, tIdx)}
                          >
                            <td className="px-2 py-2 text-center text-blue-400 pl-6">
                              {hasSubtasks
                                ? (tExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />)
                                : <span className="inline-block w-3" />}
                            </td>
                            <td className={`${COL} font-mono text-blue-500 whitespace-nowrap`}>{t.id}</td>
                            <td className={`${COL} text-gray-400`}>task</td>
                            <td className={`${COL} text-gray-800 max-w-[220px] leading-snug`}>
                              {t.title}
                              {hasSubtasks && (
                                <span className="ml-1.5 text-indigo-400">({t.subtasks!.length})</span>
                              )}
                            </td>
                            <td className={`${COL} text-gray-500`}>{t.owner}</td>
                            <td className={COL}>
                              <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                            </td>
                            <td className={`${COL} text-gray-400 whitespace-nowrap`}>{fmt(t.committedDate)}</td>
                            <td className={`${COL} text-gray-400 whitespace-nowrap`}>{fmt(t.revisedDate)}</td>
                            <td className={`${COL} whitespace-nowrap`}><DelayBadge c={t.committedDate} r={t.revisedDate} /></td>
                            <td className={`${COL} whitespace-nowrap`} onClick={e => e.stopPropagation()}>
                              <button onClick={() => openEdit(mIdx)} className="text-blue-600 hover:underline">Edit</button>
                            </td>
                          </tr>

                          {/* ── Subtask rows (shown when task expanded) ── */}
                          {tExpanded && t.subtasks?.map((st, stIdx) => (
                            <tr
                              key={`st-${tKey}-${stIdx}`}
                              className="border-b border-gray-50 bg-indigo-50/20 hover:bg-indigo-50/40"
                            >
                              <td className="px-2 py-1.5 pl-10">
                                <span className="text-indigo-300 text-xs">└</span>
                              </td>
                              <td className={`${COL} font-mono text-indigo-400 whitespace-nowrap`}>{st.id}</td>
                              <td className={`${COL} text-gray-300`}>subtask</td>
                              <td className={`${COL} text-gray-600 max-w-[220px] leading-snug`}>{st.title}</td>
                              <td className={`${COL} text-gray-400`}>{st.owner}</td>
                              <td className={COL}>
                                <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[st.status]}`}>{st.status}</span>
                              </td>
                              <td className={`${COL} text-gray-400 whitespace-nowrap`}>{fmt(st.committedDate)}</td>
                              <td className={`${COL} text-gray-400 whitespace-nowrap`}>{fmt(st.revisedDate)}</td>
                              <td className={`${COL} whitespace-nowrap`}><DelayBadge c={st.committedDate} r={st.revisedDate} /></td>
                              <td className={`${COL} whitespace-nowrap`}>
                                <button onClick={() => openEdit(mIdx)} className="text-indigo-500 hover:underline">Edit</button>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Launch Dates section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">Launch Dates</h3>
            <p className="text-xs text-gray-500 mt-0.5">Used to compute "Days to Launch" on the Executive Summary. Not shown in the OKR view.</p>
          </div>
          <button onClick={openAddLaunch} className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">
            + Add Launch Date
          </button>
        </div>

        {launchRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-400 text-sm">No launch dates set</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-violet-50 border-b border-violet-100">
                <tr>
                  {['Version / Title', 'Target Date', 'Revised Date', 'Days Away', 'Delay', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-violet-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {launchRows.map((lr, i) => {
                  const daysRaw = (() => {
                    const ds = lr.revisedDate || lr.committedDate;
                    if (!ds) return null;
                    const d = new Date(ds);
                    const today = new Date(); today.setHours(0,0,0,0); d.setHours(0,0,0,0);
                    return Math.round((d.getTime() - today.getTime()) / 86400000);
                  })();
                  const dd = delayDaysLaunch(lr);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-violet-50/30">
                      <td className="px-4 py-3 font-semibold text-gray-900">{lr.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lr.committedDate)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lr.revisedDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {daysRaw === null ? '—' : daysRaw < 0
                          ? <span className="text-violet-600 font-semibold">{Math.abs(daysRaw)}d ago</span>
                          : daysRaw <= 14
                          ? <span className="text-red-600 font-semibold">{daysRaw}d</span>
                          : <span className="text-gray-700">{daysRaw}d</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dd === null ? <span className="text-gray-300">—</span>
                          : dd === 0 ? <span className="text-gray-400">On time</span>
                          : <DelayBadge c={lr.committedDate} r={lr.revisedDate} />}
                      </td>
                      <td className="px-4 py-3">
                        <RowActions onEdit={() => openEditLaunch(i)} onDelete={() => handleDeleteLaunch(i)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit / Add Milestone Modal ── */}
      {modal.open && (
        <Modal title={modal.idx === null ? 'Add Milestone' : 'Edit Milestone'}
               onClose={() => setModal({ open: false, idx: null })} onSave={handleSave} wide>
          <Field label="Title"><Input value={form.title} onChange={e => updM('title', e.target.value)} /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ID">
              <Input value={form.id} onChange={e => updM('id', e.target.value)} placeholder="1, 2, 3…" />
            </Field>
            <Field label="Quarter">
              <Input value={form.quarter ?? ''} onChange={e => updM('quarter', e.target.value)} placeholder="Q1 FY27" list="quarterOptions" />
              <datalist id="quarterOptions">
                {['Q1 FY27','Q2 FY27','Q3 FY27','Q4 FY27','Q1 FY26','Q2 FY26','Q3 FY26','Q4 FY26'].map(q => <option key={q} value={q} />)}
              </datalist>
            </Field>
            <Field label="Key Result">
              <Input value={form.keyResult} onChange={e => updM('keyResult', e.target.value)} list="keyResults" />
              <datalist id="keyResults">{keyResults.map(s => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Owner"><Input value={form.owner} onChange={e => updM('owner', e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => updM('status', e.target.value as MilestoneStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Committed Date"><Input type="date" value={form.committedDate} onChange={e => updM('committedDate', e.target.value)} /></Field>
            <Field label="Revised Date"><Input type="date" value={form.revisedDate} onChange={e => updM('revisedDate', e.target.value)} /></Field>
          </div>
          <Field label="Comments"><Textarea value={form.comments} onChange={e => updM('comments', e.target.value)} rows={2} /></Field>

          {/* Tasks section inside modal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Tasks ({form.tasks.length})</h4>
              <button type="button" onClick={openAddTask} className="text-xs text-blue-600 hover:underline font-medium">
                + Add Task / Subtask
              </button>
            </div>

            {form.tasks.length > 0 && (
              <div className="border rounded-lg overflow-x-auto mb-3">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-6 px-2 py-2" />
                      {['ID', 'Title', 'Owner', 'Revised', 'Status', ''].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.tasks.map((t, ti) => {
                      const isExpanded = expandedTaskIdx === ti;
                      const subtaskCount = t.subtasks?.length ?? 0;
                      return (
                        <>
                          <tr
                            key={`mt-${ti}`}
                            className="hover:bg-blue-50/40 border-b border-gray-50 cursor-pointer"
                            onClick={() => setExpandedTaskIdx(isExpanded ? null : ti)}
                          >
                            <td className="px-2 py-2 text-blue-500 w-6">
                              {subtaskCount > 0
                                ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
                                : <span className="inline-block w-3" />}
                            </td>
                            <td className="px-3 py-2 font-mono text-gray-400">{t.id}</td>
                            <td className="px-3 py-2 text-gray-700 max-w-[160px] truncate">
                              {t.title}
                              {subtaskCount > 0 && <span className="ml-1.5 text-indigo-500">({subtaskCount})</span>}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{t.owner}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{fmt(t.revisedDate)}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                            </td>
                            <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                              <div className="flex gap-2">
                                <button onClick={() => openEditTask(ti)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => setForm(f => ({ ...f, tasks: f.tasks.filter((_, i) => i !== ti) }))} className="text-red-500 hover:underline">Del</button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`mts-${ti}`}>
                              <td colSpan={7} className="px-0 py-0 bg-indigo-50/40">
                                <div className="px-5 py-2 border-b border-indigo-100">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-xs font-semibold text-indigo-700">Subtasks of {t.id}</p>
                                    <button type="button" onClick={() => addSubtask(ti)}
                                            className="text-xs text-indigo-600 hover:underline font-medium">+ Add Subtask</button>
                                  </div>
                                  {subtaskCount === 0 && (
                                    <p className="text-xs text-gray-400 italic py-1">No subtasks yet</p>
                                  )}
                                  {subtaskCount > 0 && (
                                    <div className="grid grid-cols-[60px_1fr_100px_130px_130px_130px_auto] gap-2 mb-1">
                                      {['ID', 'Title', 'Owner', 'Committed', 'Revised', 'Status', ''].map(h => (
                                        <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
                                      ))}
                                    </div>
                                  )}
                                  {t.subtasks?.map((st, si) => (
                                    <SubtaskFormRow
                                      key={si}
                                      subtask={st}
                                      onUpdate={updated => updateSubtask(ti, si, updated)}
                                      onRemove={() => removeSubtask(ti, si)}
                                      onPromote={() => promoteSubtask(ti, si)}
                                    />
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {showTaskForm && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
                <p className="text-xs font-semibold text-blue-700">{taskEditIdx !== null ? 'Edit Task' : 'New Task / Subtask'}</p>

                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Level</p>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => setParentTaskId('')}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        parentTaskId === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                      Top-level task
                    </button>
                    {form.tasks.filter((_, i) => i !== taskEditIdx).length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button type="button"
                          onClick={() => setParentTaskId(parentTaskId || form.tasks.filter((_, i) => i !== taskEditIdx)[0]?.id || '')}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                            parentTaskId !== '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                          }`}>
                          Subtask of…
                        </button>
                        {parentTaskId !== '' && (
                          <select value={parentTaskId} onChange={e => setParentTaskId(e.target.value)}
                            className="text-xs border border-indigo-300 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            {form.tasks.filter((_, i) => i !== taskEditIdx).map(t => (
                              <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Task ID"><Input value={taskForm.id} onChange={e => updT('id', e.target.value)} placeholder="1.1, 2.3…" /></Field>
                  <Field label="Owner"><Input value={taskForm.owner} onChange={e => updT('owner', e.target.value)} /></Field>
                </div>
                <Field label="Title"><Input value={taskForm.title} onChange={e => updT('title', e.target.value)} /></Field>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Committed"><Input type="date" value={taskForm.committedDate} onChange={e => updT('committedDate', e.target.value)} /></Field>
                  <Field label="Revised"><Input type="date" value={taskForm.revisedDate} onChange={e => updT('revisedDate', e.target.value)} /></Field>
                  <Field label="Status">
                    <Select value={taskForm.status} onChange={e => updT('status', e.target.value as MilestoneStatus)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setShowTaskForm(false); setTaskEditIdx(null); setParentTaskId(''); }}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancel</button>
                  <button type="button" onClick={commitTask} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                    {taskEditIdx !== null ? 'Update' : (parentTaskId ? 'Add as Subtask' : 'Add Task')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Launch Modal ── */}
      {launchModal.open && (
        <Modal
          title={launchModal.idx === null ? 'Add Launch Date' : 'Edit Launch Date'}
          onClose={() => setLaunchModal({ open: false, idx: null })}
          onSave={handleSaveLaunch}
        >
          <Field label="Version / Title">
            <Input value={launchForm.title} onChange={e => updL('title', e.target.value)} placeholder="e.g. v1.0 MVP, Phase 1 Launch" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Date (Committed)">
              <Input type="date" value={launchForm.committedDate} onChange={e => updL('committedDate', e.target.value)} />
            </Field>
            <Field label="Revised Date (if changed)">
              <Input type="date" value={launchForm.revisedDate} onChange={e => updL('revisedDate', e.target.value)} />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <Textarea value={launchForm.comments} onChange={e => updL('comments', e.target.value)} rows={2} />
          </Field>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            This launch date will appear as "Days to Launch" on the Executive Summary. Not shown in the OKR / Milestone Tracker view.
          </p>
        </Modal>
      )}
    </div>
    </>
  );
}

export function Empty({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-gray-400 text-sm mb-3">No {label} yet</p>
      <button onClick={onAdd} className="text-sm text-blue-600 hover:underline font-medium">+ Add first entry</button>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3">
      <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Edit</button>
      <button onClick={onDelete} className="text-xs text-red-500 hover:underline">Delete</button>
    </div>
  );
}
