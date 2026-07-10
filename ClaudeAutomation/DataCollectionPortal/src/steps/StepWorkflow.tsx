import { useState } from "react";
import type { ImplementationConfig, WorkflowConfig, WorkflowStage, WorkflowAction, WorkflowNotification, WorkflowChecklistItem } from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  Plus, Trash2, Edit2, Lock, Mail, MessageSquare, Bell,
  ChevronDown, ChevronUp, CheckSquare, ArrowRight, RotateCcw,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

const DEFAULT_STAGES: WorkflowStage[] = [
  {
    id: "submitted",
    name: "Application Submitted",
    actor: "Citizen",
    actions: [],
    slaHours: 0,
    notifications: [],
    checklistEnabled: false,
    isStart: true,
  },
  {
    id: "pending_doc_verification",
    name: "Pending Document Verification",
    actor: "Document Verifier",
    actions: [
      { id: uid(), label: "Verify Documents", nextStateId: "pending_inspection", color: "success" },
      { id: uid(), label: "Send Back", nextStateId: "pending_resubmission", color: "danger" },
    ],
    slaHours: 48,
    notifications: [],
    checklistEnabled: false,
  },
  {
    id: "pending_inspection",
    name: "Pending Inspection",
    actor: "Field Inspector",
    actions: [
      { id: uid(), label: "Complete Inspection", nextStateId: "pending_approval", color: "success" },
      { id: uid(), label: "Send Back", nextStateId: "pending_resubmission", color: "danger" },
    ],
    slaHours: 72,
    notifications: [],
    checklistEnabled: true,
  },
  {
    id: "pending_resubmission",
    name: "Pending Resubmission",
    actor: "Citizen",
    actions: [
      { id: uid(), label: "Resubmit", nextStateId: "pending_doc_verification", color: "default" },
    ],
    slaHours: 0,
    notifications: [],
    checklistEnabled: false,
  },
  {
    id: "pending_approval",
    name: "Pending Approval",
    actor: "Approver",
    actions: [
      { id: uid(), label: "Issue License", nextStateId: "pending_payment", color: "success" },
      { id: uid(), label: "Reject", nextStateId: "rejected", color: "danger" },
    ],
    slaHours: 24,
    notifications: [],
    checklistEnabled: false,
  },
  {
    id: "rejected",
    name: "Rejected",
    actor: "—",
    actions: [],
    slaHours: 0,
    notifications: [],
    checklistEnabled: false,
    isEnd: true,
  },
  {
    id: "pending_payment",
    name: "Pending Payment",
    actor: "Citizen",
    actions: [
      { id: uid(), label: "Pay License Fee", nextStateId: "pending_issuance", color: "success" },
    ],
    slaHours: 0,
    notifications: [],
    checklistEnabled: false,
  },
  {
    id: "pending_issuance",
    name: "Pending Issuance",
    actor: "System",
    actions: [
      { id: uid(), label: "Issue License", nextStateId: "license_issued", color: "success" },
    ],
    slaHours: 4,
    notifications: [],
    checklistEnabled: false,
  },
  {
    id: "license_issued",
    name: "License Issued",
    actor: "—",
    actions: [],
    slaHours: 0,
    notifications: [],
    checklistEnabled: false,
    isEnd: true,
  },
];

// ── Sub-component: Toggle ─────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-4" : "left-0.5"}`} />
      </div>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

// ── Sub-component: ActionColorPill ────────────────────────────────────────────

function ActionPill({ action, stageName }: { action: WorkflowAction; stageName: string }) {
  const cls =
    action.color === "success" ? "bg-green-100 text-green-800 border border-green-200" :
    action.color === "danger" ? "bg-red-100 text-red-800 border border-red-200" :
    "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {action.label}
      <ArrowRight size={10} />
      {stageName}
    </span>
  );
}

// ── Actor color helpers ───────────────────────────────────────────────────────

function actorColor(actor: string, isEnd?: boolean): string {
  if (isEnd) return "bg-slate-100 border-slate-300 text-slate-600";
  const a = actor.toLowerCase();
  if (a.includes("citizen")) return "bg-blue-50 border-blue-300 text-blue-800";
  if (a.includes("document")) return "bg-purple-50 border-purple-300 text-purple-800";
  if (a.includes("inspector")) return "bg-orange-50 border-orange-300 text-orange-800";
  if (a.includes("approv")) return "bg-green-50 border-green-300 text-green-800";
  if (a.includes("system")) return "bg-slate-50 border-slate-300 text-slate-700";
  return "bg-white border-slate-300 text-slate-700";
}

function actorDot(actor: string, isEnd?: boolean): string {
  if (isEnd) return "bg-slate-400";
  const a = actor.toLowerCase();
  if (a.includes("citizen")) return "bg-blue-400";
  if (a.includes("document")) return "bg-purple-400";
  if (a.includes("inspector")) return "bg-orange-400";
  if (a.includes("approv")) return "bg-green-400";
  if (a.includes("system")) return "bg-slate-400";
  return "bg-slate-300";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StepWorkflow({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const wf = config.workflow;
  const stages = wf.stages.length > 0 ? wf.stages : DEFAULT_STAGES;

  function updateWf<K extends keyof WorkflowConfig>(key: K, value: WorkflowConfig[K]) {
    updateConfig("workflow", { ...wf, [key]: value });
  }

  function setStages(s: WorkflowStage[]) { updateWf("stages", s); }
  function setChecklist(c: WorkflowChecklistItem[]) { updateWf("checklistItems", c); }

  // ── Edit / Add Stage State ──────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingStage, setAddingStage] = useState(false);
  const [newStage, setNewStage] = useState({ name: "", actor: "", slaHours: 0 });
  const [clearConfirm, setClearConfirm] = useState(false);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);

  // ── Add Checklist State ─────────────────────────────────────────────────────
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newChecklist, setNewChecklist] = useState<{
    stageId: string; label: string;
    fieldType: WorkflowChecklistItem["fieldType"]; required: boolean;
  }>({ stageId: "", label: "", fieldType: "checkbox", required: true });

  // ── Stage lookup helpers ────────────────────────────────────────────────────
  function stageById(id: string) { return stages.find(s => s.id === id); }
  function stageNameById(id: string) { return stageById(id)?.name ?? id; }
  const checklistEnabledStages = stages.filter(s => s.checklistEnabled);

  // ── Stage mutation helpers ──────────────────────────────────────────────────
  function updateStage(id: string, patch: Partial<WorkflowStage>) {
    setStages(stages.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function deleteStage(id: string) {
    setStages(stages.filter(s => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function addStage() {
    if (!newStage.name.trim()) return;
    const id = newStage.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + uid();
    const stage: WorkflowStage = {
      id,
      name: newStage.name.trim(),
      actor: newStage.actor.trim() || "Staff",
      actions: [],
      slaHours: newStage.slaHours,
      notifications: [],
      checklistEnabled: false,
    };
    setStages([...stages, stage]);
    setNewStage({ name: "", actor: "", slaHours: 0 });
    setAddingStage(false);
  }

  // ── Inline Edit for a Stage ─────────────────────────────────────────────────
  const editingStage = editingId ? stages.find(s => s.id === editingId) : null;

  function updateEditingAction(actionId: string, patch: Partial<WorkflowAction>) {
    if (!editingStage) return;
    updateStage(editingStage.id, {
      actions: editingStage.actions.map(a => a.id === actionId ? { ...a, ...patch } : a),
    });
  }
  function addAction() {
    if (!editingStage) return;
    const newAction: WorkflowAction = { id: uid(), label: "New Action", nextStateId: stages[0]?.id ?? "", color: "default" };
    updateStage(editingStage.id, { actions: [...editingStage.actions, newAction] });
  }
  function deleteAction(actionId: string) {
    if (!editingStage) return;
    updateStage(editingStage.id, { actions: editingStage.actions.filter(a => a.id !== actionId) });
  }

  function updateEditingNotification(idx: number, patch: Partial<WorkflowNotification>) {
    if (!editingStage) return;
    const notifs = editingStage.notifications.map((n, i) => i === idx ? { ...n, ...patch } : n);
    updateStage(editingStage.id, { notifications: notifs });
  }
  function addNotification() {
    if (!editingStage) return;
    const newNotif: WorkflowNotification = { channel: "email", recipient: "applicant", subject: "" };
    updateStage(editingStage.id, { notifications: [...editingStage.notifications, newNotif] });
  }
  function deleteNotification(idx: number) {
    if (!editingStage) return;
    updateStage(editingStage.id, { notifications: editingStage.notifications.filter((_, i) => i !== idx) });
  }

  // ── Checklist helpers ───────────────────────────────────────────────────────
  function deleteChecklistItem(id: string) {
    setChecklist(wf.checklistItems.filter(c => c.id !== id));
  }
  function addChecklistItem() {
    if (!newChecklist.label.trim() || !newChecklist.stageId) return;
    const item: WorkflowChecklistItem = { id: uid(), ...newChecklist, label: newChecklist.label.trim() };
    setChecklist([...wf.checklistItems, item]);
    setNewChecklist({ stageId: "", label: "", fieldType: "checkbox", required: true });
    setAddingChecklist(false);
  }

  // ── Flow diagram: main path (exclude rejected, pending_resubmission) ────────
  const SIDE_STAGES = new Set(["rejected", "pending_resubmission"]);
  const mainPathStages = stages.filter(s => !SIDE_STAGES.has(s.id));
  const sendBackStages = stages.filter(s => {
    return s.actions.some(a => a.nextStateId === "pending_resubmission");
  });

  // ── Shared input classes ────────────────────────────────────────────────────
  const inputCls = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const selectCls = inputCls;

  return (
    <StepWrapper
      step={9}
      title="Workflow"
      subtitle="Configure how license applications move through approval stages."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-10">

        {/* ── PART 1: Stages table ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Workflow Stages</h3>
              <p className="text-xs text-slate-500 mt-0.5">Each stage represents a step in the application lifecycle.</p>
            </div>
            <button
              onClick={() => { setClearConfirm(false); setClearConfirm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
            >
              <RotateCcw size={12} />
              Clear all
            </button>
          </div>

          {clearConfirm && (
            <div className="mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700 flex-1">Remove all stages and start from scratch?</p>
              <button
                onClick={() => { setStages([]); setChecklist([]); setClearConfirm(false); setEditingId(null); }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Performed By</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions → Next Stage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">SLA (hrs)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Notifications</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Checklist</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage, idx) => (
                    <>
                      <tr
                        key={stage.id}
                        className={`border-b border-slate-100 transition-colors ${editingId === stage.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>

                        {/* Stage Name — inline editable */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={stage.name}
                            onChange={e => updateStage(stage.id, { name: e.target.value })}
                            className="w-full text-sm text-slate-800 font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                          />
                          {(stage.isStart || stage.isEnd) && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${stage.isStart ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                              {stage.isStart ? "start" : "end"}
                            </span>
                          )}
                        </td>

                        {/* Actor — inline editable */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={stage.actor}
                            onChange={e => updateStage(stage.id, { actor: e.target.value })}
                            className="w-full text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                          />
                        </td>

                        {/* Actions → Next Stage */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {stage.actions.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">—</span>
                            ) : (
                              stage.actions.map(action => (
                                <ActionPill key={action.id} action={action} stageName={stageNameById(action.nextStateId)} />
                              ))
                            )}
                          </div>
                        </td>

                        {/* SLA */}
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={stage.slaHours}
                            onChange={e => updateStage(stage.id, { slaHours: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-16 px-2 py-1 rounded border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Notifications */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {stage.notifications.some(n => n.channel === "email") && (
                              <span title="Email" className="text-blue-500"><Mail size={13} /></span>
                            )}
                            {stage.notifications.some(n => n.channel === "sms") && (
                              <span title="SMS" className="text-purple-500"><MessageSquare size={13} /></span>
                            )}
                            {stage.notifications.some(n => n.channel === "push") && (
                              <span title="Push" className="text-orange-500"><Bell size={13} /></span>
                            )}
                            {stage.notifications.length > 0 && (
                              <span className="text-xs text-slate-400">×{stage.notifications.length}</span>
                            )}
                            {stage.notifications.length === 0 && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
                        </td>

                        {/* Checklist toggle */}
                        <td className="px-4 py-3">
                          <Toggle
                            checked={stage.checklistEnabled}
                            onChange={v => updateStage(stage.id, { checklistEnabled: v })}
                          />
                        </td>

                        {/* Edit / Delete */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingId(editingId === stage.id ? null : stage.id)}
                              className={`p-1.5 rounded-lg transition-colors ${editingId === stage.id ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                              title="Edit stage"
                            >
                              {editingId === stage.id ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                            </button>
                            {stage.isStart || stage.isEnd ? (
                              <span title="Cannot delete start/end stages" className="p-1.5 text-slate-300">
                                <Lock size={14} />
                              </span>
                            ) : (
                              <button
                                onClick={() => deleteStage(stage.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete stage"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* ── PART 3: Inline Edit Panel ──────────────────────── */}
                      {editingId === stage.id && editingStage && (
                        <tr key={`edit-${stage.id}`} className="bg-blue-50 border-b border-slate-200">
                          <td colSpan={8} className="px-4 py-5">
                            <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-5">
                              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <Edit2 size={14} className="text-blue-500" />
                                Edit: {editingStage.name}
                              </h4>

                              {/* Basic fields */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Stage Name</label>
                                  <input
                                    type="text"
                                    value={editingStage.name}
                                    onChange={e => updateStage(editingStage.id, { name: e.target.value })}
                                    className={`w-full ${inputCls}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Performed By (Actor)</label>
                                  <input
                                    type="text"
                                    value={editingStage.actor}
                                    onChange={e => updateStage(editingStage.id, { actor: e.target.value })}
                                    className={`w-full ${inputCls}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1.5">SLA (hours, 0 = none)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={editingStage.slaHours}
                                    onChange={e => updateStage(editingStage.id, { slaHours: Math.max(0, parseInt(e.target.value) || 0) })}
                                    className={`w-full ${inputCls}`}
                                  />
                                </div>
                              </div>

                              <div>
                                <Toggle
                                  checked={editingStage.checklistEnabled}
                                  onChange={v => updateStage(editingStage.id, { checklistEnabled: v })}
                                  label="Checklist enabled for this stage"
                                />
                              </div>

                              {/* Actions */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Actions</label>
                                  <button onClick={addAction} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                                    <Plus size={12} /> Add Action
                                  </button>
                                </div>
                                {editingStage.actions.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No actions — add one below.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {editingStage.actions.map(action => (
                                      <div key={action.id} className="flex items-center gap-2 flex-wrap">
                                        <input
                                          type="text"
                                          value={action.label}
                                          onChange={e => updateEditingAction(action.id, { label: e.target.value })}
                                          placeholder="Action label"
                                          className={`flex-1 min-w-0 ${inputCls}`}
                                        />
                                        <select
                                          value={action.nextStateId}
                                          onChange={e => updateEditingAction(action.id, { nextStateId: e.target.value })}
                                          className={selectCls}
                                        >
                                          {stages.filter(s => s.id !== editingStage.id).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                          ))}
                                        </select>
                                        <select
                                          value={action.color}
                                          onChange={e => updateEditingAction(action.id, { color: e.target.value as WorkflowAction["color"] })}
                                          className={selectCls}
                                        >
                                          <option value="default">Grey</option>
                                          <option value="success">Green</option>
                                          <option value="danger">Red</option>
                                        </select>
                                        <button onClick={() => deleteAction(action.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Notifications */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Notifications</label>
                                  <button onClick={addNotification} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                                    <Plus size={12} /> Add Notification
                                  </button>
                                </div>
                                {editingStage.notifications.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No notifications configured.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {editingStage.notifications.map((notif, nIdx) => (
                                      <div key={nIdx} className="flex items-center gap-2 flex-wrap">
                                        <select
                                          value={notif.channel}
                                          onChange={e => updateEditingNotification(nIdx, { channel: e.target.value as WorkflowNotification["channel"] })}
                                          className={selectCls}
                                        >
                                          <option value="email">Email</option>
                                          <option value="sms">SMS</option>
                                          <option value="push">Push</option>
                                        </select>
                                        <select
                                          value={notif.recipient}
                                          onChange={e => updateEditingNotification(nIdx, { recipient: e.target.value as WorkflowNotification["recipient"] })}
                                          className={selectCls}
                                        >
                                          <option value="applicant">Applicant</option>
                                          <option value="staff">Staff</option>
                                          <option value="both">Both</option>
                                        </select>
                                        <input
                                          type="text"
                                          value={notif.subject}
                                          onChange={e => updateEditingNotification(nIdx, { subject: e.target.value })}
                                          placeholder="Subject / message template"
                                          className={`flex-1 min-w-0 ${inputCls}`}
                                        />
                                        <button onClick={() => deleteNotification(nIdx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Save / Cancel */}
                              <div className="flex gap-3 pt-1">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── PART 4: Add Stage ─────────────────────────────────────────── */}
            {addingStage ? (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">New Stage</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Stage Name *</label>
                    <input
                      type="text"
                      value={newStage.name}
                      onChange={e => setNewStage(s => ({ ...s, name: e.target.value }))}
                      placeholder="e.g. Pending Site Inspection"
                      className={`${inputCls} w-52`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Actor / Role</label>
                    <input
                      type="text"
                      value={newStage.actor}
                      onChange={e => setNewStage(s => ({ ...s, actor: e.target.value }))}
                      placeholder="e.g. Field Inspector"
                      className={`${inputCls} w-44`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">SLA (hours)</label>
                    <input
                      type="number"
                      min={0}
                      value={newStage.slaHours}
                      onChange={e => setNewStage(s => ({ ...s, slaHours: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className={`${inputCls} w-24`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addStage}
                      disabled={!newStage.name.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingStage(false); setNewStage({ name: "", actor: "", slaHours: 0 }); }}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-200 px-4 py-3">
                <button
                  onClick={() => setAddingStage(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all w-full justify-center"
                >
                  <Plus size={14} />
                  Add Stage
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── PART 2: Visual Flow Diagram ──────────────────────────────────── */}
        {stages.length > 0 && (
          <section>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Flow Diagram</h3>
            <p className="text-xs text-slate-500 mb-4">Main application path (branch states shown separately).</p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { label: "Citizen", cls: "bg-blue-50 border-blue-300 text-blue-700" },
                { label: "Document Verifier", cls: "bg-purple-50 border-purple-300 text-purple-700" },
                { label: "Field Inspector", cls: "bg-orange-50 border-orange-300 text-orange-700" },
                { label: "Approver", cls: "bg-green-50 border-green-300 text-green-700" },
                { label: "System", cls: "bg-slate-50 border-slate-300 text-slate-600" },
                { label: "End State", cls: "bg-slate-100 border-slate-300 text-slate-500" },
              ].map(({ label, cls }) => (
                <span key={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cls}`}>
                  <span className={`w-2 h-2 rounded-full ${actorDot(label, label === "End State")}`} />
                  {label}
                </span>
              ))}
            </div>

            {/* Main path */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-start gap-0 min-w-max">
                {mainPathStages.map((stage, idx) => (
                  <div key={stage.id} className="flex items-center">
                    {/* Stage box */}
                    <div className={`relative flex flex-col items-center`}>
                      <div className={`
                        w-32 rounded-xl border-2 px-3 py-3 text-center transition-shadow
                        ${stage.isEnd && stage.id === "license_issued" ? "border-green-400 bg-green-50" : ""}
                        ${stage.isEnd && stage.id === "rejected" ? "border-red-400 bg-red-50" : ""}
                        ${!stage.isEnd ? actorColor(stage.actor) : ""}
                      `}>
                        <p className="text-xs font-semibold leading-snug text-slate-800 line-clamp-2">{stage.name}</p>
                        <p className="text-[10px] mt-1 opacity-70 text-slate-600">{stage.actor}</p>
                        {stage.isEnd && (
                          <span className={`text-[10px] font-semibold mt-1 block ${stage.id === "license_issued" ? "text-green-600" : "text-red-500"}`}>
                            {stage.id === "license_issued" ? "✓ Issued" : "✗ End"}
                          </span>
                        )}
                        {stage.slaHours > 0 && (
                          <span className="text-[10px] text-slate-400 mt-1 block">{stage.slaHours}h SLA</span>
                        )}
                        {stage.checklistEnabled && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-600 mt-1">
                            <CheckSquare size={9} /> Checklist
                          </span>
                        )}
                      </div>
                      {/* Send Back indicator */}
                      {sendBackStages.some(s => s.id === stage.id) && (
                        <div className="mt-1.5 text-[10px] text-red-400 italic flex items-center gap-0.5">
                          <RotateCcw size={9} /> Send Back
                        </div>
                      )}
                    </div>
                    {/* Arrow (not after last) */}
                    {idx < mainPathStages.length - 1 && (
                      <div className="flex items-center px-1 text-slate-300 shrink-0">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Side branches */}
            {(stages.some(s => s.id === "rejected") || stages.some(s => s.id === "pending_resubmission")) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {stages.filter(s => SIDE_STAGES.has(s.id)).map(stage => (
                  <div key={stage.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs ${stage.id === "rejected" ? "border-red-300 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    <RotateCcw size={11} />
                    <span className="font-medium">{stage.name}</span>
                    <span className="opacity-60">({stage.actor})</span>
                  </div>
                ))}
                <p className="text-xs text-slate-400 self-center">← Branch states (not on main path)</p>
              </div>
            )}
          </section>
        )}

        {/* ── PART 5: Checklist Items ──────────────────────────────────────── */}
        {checklistEnabledStages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CheckSquare size={16} className="text-orange-500" />
                  Inspection Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Items that field staff must complete during checklist-enabled stages.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {wf.checklistItems.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Field Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Required</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {wf.checklistItems.map(item => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs text-slate-600">{stageNameById(item.stageId)}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{item.label}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{item.fieldType}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.required ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                            {item.required ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteChecklistItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-4 py-6 text-center text-slate-400 text-sm">No checklist items yet.</div>
              )}

              {/* Add checklist item */}
              {addingChecklist ? (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold text-slate-600 mb-3">New Checklist Item</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Stage *</label>
                      <select
                        value={newChecklist.stageId}
                        onChange={e => setNewChecklist(c => ({ ...c, stageId: e.target.value }))}
                        className={`${selectCls} w-48`}
                      >
                        <option value="">Select stage…</option>
                        {checklistEnabledStages.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Item Label *</label>
                      <input
                        type="text"
                        value={newChecklist.label}
                        onChange={e => setNewChecklist(c => ({ ...c, label: e.target.value }))}
                        placeholder="e.g. Verify fire exits"
                        className={`${inputCls} w-52`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Field Type</label>
                      <select
                        value={newChecklist.fieldType}
                        onChange={e => setNewChecklist(c => ({ ...c, fieldType: e.target.value as WorkflowChecklistItem["fieldType"] }))}
                        className={`${selectCls} w-32`}
                      >
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="text">Text</option>
                        <option value="file">File</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-0.5">
                      <Toggle
                        checked={newChecklist.required}
                        onChange={v => setNewChecklist(c => ({ ...c, required: v }))}
                        label="Required"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addChecklistItem}
                        disabled={!newChecklist.label.trim() || !newChecklist.stageId}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingChecklist(false); setNewChecklist({ stageId: "", label: "", fieldType: "checkbox", required: true }); }}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 px-4 py-3">
                  <button
                    onClick={() => setAddingChecklist(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all w-full justify-center"
                  >
                    <Plus size={14} />
                    Add Checklist Item
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── PART 6: Global Workflow Settings (collapsible) ───────────────── */}
        <section>
          <button
            onClick={() => setGlobalSettingsOpen(o => !o)}
            className="flex items-center gap-2 w-full text-left"
          >
            <h3 className="text-base font-semibold text-slate-800 flex-1">Global Workflow Settings</h3>
            {globalSettingsOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </button>

          {globalSettingsOpen && (
            <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-5">
              {/* Processing SLA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Processing SLA (days)</p>
                  <p className="text-xs text-slate-400">Target days to complete an application end-to-end.</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={wf.processingSlaDays}
                  onChange={e => updateWf("processingSlaDays", Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${inputCls} w-20 text-center`}
                />
              </div>

              {/* Auto-escalate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Auto-escalate stalled applications</p>
                    <p className="text-xs text-slate-400">Flag to the next approver if inactive for too long.</p>
                  </div>
                  <Toggle checked={wf.autoEscalate} onChange={v => updateWf("autoEscalate", v)} />
                </div>
                {wf.autoEscalate && (
                  <div className="flex items-center justify-between pl-4 border-l-2 border-blue-200">
                    <p className="text-sm text-slate-600">Escalate after (days of inactivity)</p>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={wf.escalationAfterDays}
                      onChange={e => updateWf("escalationAfterDays", Math.max(1, parseInt(e.target.value) || 1))}
                      className={`${inputCls} w-20 text-center`}
                    />
                  </div>
                )}
              </div>

              {/* Renewal reminder */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Renewal reminder (days before expiry)</p>
                  <p className="text-xs text-slate-400">Citizens notified this many days before their licence expires.</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={wf.renewalReminderDays}
                  onChange={e => updateWf("renewalReminderDays", Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${inputCls} w-20 text-center`}
                />
              </div>

              {/* Allow citizen withdrawal */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Allow citizen withdrawal</p>
                  <p className="text-xs text-slate-400">Citizens can withdraw a submitted application.</p>
                </div>
                <Toggle checked={wf.allowCitizenWithdrawal} onChange={v => updateWf("allowCitizenWithdrawal", v)} />
              </div>
            </div>
          )}
        </section>

      </div>
    </StepWrapper>
  );
}
