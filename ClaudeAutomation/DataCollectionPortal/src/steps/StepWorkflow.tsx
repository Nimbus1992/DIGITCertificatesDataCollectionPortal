import { useState } from "react";
import type {
  ImplementationConfig,
  WorkflowConfig,
  WorkflowStage,
  WorkflowAction,
  WorkflowNotification,
  WorkflowChecklistItem,
} from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Bell, Mail, MessageSquare,
  CheckSquare, RotateCcw,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Trade License pre-fill (8 rows, each = 1 stage with 1 action) ─────────────

function makeDefaultRows(): WorkflowStage[] {
  return [
    {
      id: uid(),
      name: "Start",
      actor: "Citizen",
      actions: [{ id: uid(), label: "Apply", nextStateId: "Pending Document Verification", color: "default" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
      isStart: true,
    },
    {
      id: uid(),
      name: "Start",
      actor: "Counter Employee",
      actions: [{ id: uid(), label: "Assisted Apply", nextStateId: "Pending Document Verification", color: "default" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
      isStart: true,
    },
    {
      id: uid(),
      name: "Pending Document Verification",
      actor: "Document Verifier",
      actions: [{ id: uid(), label: "Approve Documents", nextStateId: "Pending Field Inspection", color: "success" }],
      slaHours: 48,
      notifications: [],
      checklistEnabled: false,
    },
    {
      id: uid(),
      name: "Pending Document Verification",
      actor: "Document Verifier",
      actions: [{ id: uid(), label: "Send Back", nextStateId: "Start", color: "danger" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
    },
    {
      id: uid(),
      name: "Pending Field Inspection",
      actor: "Field Inspector",
      actions: [{ id: uid(), label: "Inspection Passed", nextStateId: "Pending Approval", color: "success" }],
      slaHours: 72,
      notifications: [],
      checklistEnabled: true,
    },
    {
      id: uid(),
      name: "Pending Field Inspection",
      actor: "Field Inspector",
      actions: [{ id: uid(), label: "Inspection Failed", nextStateId: "Start", color: "danger" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
    },
    {
      id: uid(),
      name: "Pending Approval",
      actor: "Approver",
      actions: [{ id: uid(), label: "Approve", nextStateId: "License Issued", color: "success" }],
      slaHours: 24,
      notifications: [],
      checklistEnabled: false,
    },
    {
      id: uid(),
      name: "Pending Approval",
      actor: "Approver",
      actions: [{ id: uid(), label: "Reject", nextStateId: "Start", color: "danger" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
    },
    {
      id: uid(),
      name: "License Issued",
      actor: "System",
      actions: [],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
      isEnd: true,
    },
  ];
}

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

// ── Panel State types ─────────────────────────────────────────────────────────

type PanelTarget = { rowId: string; kind: "notifications" | "checklist" } | null;

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StepWorkflow({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const wf = config.workflow;
  // Each table row is one WorkflowStage with exactly one action (or isEnd stage with zero)
  const rows: WorkflowStage[] = wf.stages.length > 0 ? wf.stages : makeDefaultRows();

  function updateWf<K extends keyof WorkflowConfig>(key: K, value: WorkflowConfig[K]) {
    updateConfig("workflow", { ...wf, [key]: value });
  }
  function setRows(s: WorkflowStage[]) { updateWf("stages", s); }
  function setChecklistItems(c: WorkflowChecklistItem[]) { updateWf("checklistItems", c); }

  // Populate roles from config
  const roleNames = config.roles.map(r => r.name);

  // ── Panel open/close state ─────────────────────────────────────────────────
  const [openPanel, setOpenPanel] = useState<PanelTarget>(null);

  // ── Advanced settings ─────────────────────────────────────────────────────
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // ── Clear confirm ─────────────────────────────────────────────────────────
  const [clearConfirm, setClearConfirm] = useState(false);

  // Shared styles
  const inputCls = "px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const selectCls = inputCls;

  // ── Row mutation helpers ───────────────────────────────────────────────────

  function updateRow(id: string, patch: Partial<WorkflowStage>) {
    setRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function updateRowAction(rowId: string, actionPatch: Partial<WorkflowAction>) {
    const row = rows.find(r => r.id === rowId);
    if (!row || row.actions.length === 0) return;
    const updatedAction = { ...row.actions[0], ...actionPatch };
    updateRow(rowId, { actions: [updatedAction] });
  }

  function deleteRow(id: string) {
    setRows(rows.filter(r => r.id !== id));
    if (openPanel?.rowId === id) setOpenPanel(null);
  }

  function addRow() {
    const newRow: WorkflowStage = {
      id: uid(),
      name: "",
      actor: roleNames[0] ?? "",
      actions: [{ id: uid(), label: "", nextStateId: "", color: "default" }],
      slaHours: 0,
      notifications: [],
      checklistEnabled: false,
    };
    setRows([...rows, newRow]);
  }

  // ── Notification helpers ───────────────────────────────────────────────────

  function addNotification(rowId: string) {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    const newNotif: WorkflowNotification = { channel: "email", recipient: "applicant", subject: "" };
    updateRow(rowId, { notifications: [...row.notifications, newNotif] });
  }

  function updateNotification(rowId: string, idx: number, patch: Partial<WorkflowNotification>) {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    const updated = row.notifications.map((n, i) => i === idx ? { ...n, ...patch } : n);
    updateRow(rowId, { notifications: updated });
  }

  function removeNotification(rowId: string, idx: number) {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    updateRow(rowId, { notifications: row.notifications.filter((_, i) => i !== idx) });
  }

  // ── Checklist helpers ──────────────────────────────────────────────────────

  function addChecklistItem(rowId: string) {
    const newItem: WorkflowChecklistItem = {
      id: uid(),
      stageId: rowId,
      label: "",
      fieldType: "checkbox",
      required: true,
    };
    setChecklistItems([...wf.checklistItems, newItem]);
  }

  function updateChecklistItem(itemId: string, patch: Partial<WorkflowChecklistItem>) {
    setChecklistItems(wf.checklistItems.map(c => c.id === itemId ? { ...c, ...patch } : c));
  }

  function removeChecklistItem(itemId: string) {
    setChecklistItems(wf.checklistItems.filter(c => c.id !== itemId));
  }

  function checklistItemsForRow(rowId: string) {
    return wf.checklistItems.filter(c => c.stageId === rowId);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <StepWrapper
      step={9}
      title="Workflow"
      subtitle="Define the state-based approval workflow. Each row is one transition: a role takes an action that moves the application from one state to the next."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-8">

        {/* ── Header toolbar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">State Transition Table</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each row = one state → action → next state transition.
            </p>
          </div>
          <button
            onClick={() => setClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
          >
            <RotateCcw size={12} />
            Reset to example
          </button>
        </div>

        {/* ── Clear confirm banner ───────────────────────────────────────── */}
        {clearConfirm && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700 flex-1">
              Reset to the Trade License example? This will replace all current rows.
            </p>
            <button
              onClick={() => {
                setRows(makeDefaultRows());
                setChecklistItems([]);
                setOpenPanel(null);
                setClearConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Transition table ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">From State</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">To State</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Notifications</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Checklist</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const action = row.actions[0];
                  const notifCount = row.notifications.length;
                  const checkCount = checklistItemsForRow(row.id).length;
                  const isNotifOpen = openPanel?.rowId === row.id && openPanel.kind === "notifications";
                  const isCheckOpen = openPanel?.rowId === row.id && openPanel.kind === "checklist";
                  const isEndRow = !!row.isEnd;

                  return (
                    <>
                      {/* ── Main row ─────────────────────────────────────── */}
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 transition-colors ${
                          isNotifOpen || isCheckOpen
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* From State */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={row.name}
                              onChange={e => updateRow(row.id, { name: e.target.value })}
                              placeholder="e.g. Start"
                              className="w-full min-w-[130px] text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                            />
                            {row.isStart && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600">start</span>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-2.5">
                          {roleNames.length > 0 ? (
                            <select
                              value={row.actor}
                              onChange={e => updateRow(row.id, { actor: e.target.value })}
                              className={`${selectCls} w-full min-w-[140px]`}
                            >
                              {roleNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                              <option value={row.actor}>{row.actor}</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={row.actor}
                              onChange={e => updateRow(row.id, { actor: e.target.value })}
                              placeholder="e.g. Approver"
                              className="w-full min-w-[130px] text-sm text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                            />
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-2.5">
                          {isEndRow ? (
                            <span className="text-xs text-slate-400 italic">—</span>
                          ) : (
                            <input
                              type="text"
                              value={action?.label ?? ""}
                              onChange={e => updateRowAction(row.id, { label: e.target.value })}
                              placeholder="e.g. Approve"
                              className="w-full min-w-[120px] text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                            />
                          )}
                        </td>

                        {/* To State */}
                        <td className="px-4 py-2.5">
                          {isEndRow ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                              (End)
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={action?.nextStateId ?? ""}
                                onChange={e => updateRowAction(row.id, { nextStateId: e.target.value })}
                                placeholder="e.g. Pending Approval"
                                className="w-full min-w-[130px] text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                              />
                              {action?.nextStateId === "End" && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500 border border-slate-200">(End)</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Notifications badge + button */}
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setOpenPanel(isNotifOpen ? null : { rowId: row.id, kind: "notifications" })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              isNotifOpen
                                ? "bg-blue-600 text-white border-blue-600"
                                : notifCount > 0
                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            <Bell size={11} />
                            {notifCount > 0 ? (
                              <span className={`px-1 py-0 rounded-full text-[10px] font-bold ${isNotifOpen ? "bg-white text-blue-700" : "bg-blue-600 text-white"}`}>
                                {notifCount}
                              </span>
                            ) : null}
                            {notifCount === 0 ? "Add" : "Edit"}
                          </button>
                        </td>

                        {/* Checklist badge + button */}
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => setOpenPanel(isCheckOpen ? null : { rowId: row.id, kind: "checklist" })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              isCheckOpen
                                ? "bg-orange-600 text-white border-orange-600"
                                : checkCount > 0
                                ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                : "bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600"
                            }`}
                          >
                            <CheckSquare size={11} />
                            {checkCount > 0 ? (
                              <span className={`px-1 py-0 rounded-full text-[10px] font-bold ${isCheckOpen ? "bg-white text-orange-700" : "bg-orange-600 text-white"}`}>
                                {checkCount}
                              </span>
                            ) : null}
                            {checkCount === 0 ? "Add" : "Edit"}
                          </button>
                        </td>

                        {/* Delete */}
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>

                      {/* ── Notifications panel ───────────────────────────── */}
                      {isNotifOpen && (
                        <tr key={`notif-${row.id}`} className="bg-blue-50 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                  <Bell size={14} className="text-blue-500" />
                                  Notifications — {row.name || "this state"} / {action?.label || "this action"}
                                </h4>
                                <button
                                  onClick={() => addNotification(row.id)}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  <Plus size={12} /> Add notification
                                </button>
                              </div>

                              {row.notifications.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No notifications yet. Click "Add notification" to create one.</p>
                              ) : (
                                <div className="space-y-2">
                                  {row.notifications.map((notif, nIdx) => (
                                    <div key={nIdx} className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                      {/* Channel multi-checkboxes */}
                                      <div className="flex items-center gap-3 shrink-0">
                                        {(["email", "sms", "push"] as const).map(ch => (
                                          <label key={ch} className="flex items-center gap-1 cursor-pointer text-xs text-slate-600">
                                            <input
                                              type="checkbox"
                                              checked={notif.channel === ch}
                                              onChange={() => updateNotification(row.id, nIdx, { channel: ch })}
                                              className="rounded"
                                            />
                                            {ch === "email" && <Mail size={11} className="text-blue-500" />}
                                            {ch === "sms" && <MessageSquare size={11} className="text-purple-500" />}
                                            {ch === "push" && <Bell size={11} className="text-orange-500" />}
                                            <span className="capitalize">{ch}</span>
                                          </label>
                                        ))}
                                      </div>

                                      {/* Recipient radio */}
                                      <div className="flex items-center gap-3 shrink-0">
                                        {(["applicant", "staff", "both"] as const).map(rec => (
                                          <label key={rec} className="flex items-center gap-1 cursor-pointer text-xs text-slate-600">
                                            <input
                                              type="radio"
                                              name={`recipient-${row.id}-${nIdx}`}
                                              checked={notif.recipient === rec}
                                              onChange={() => updateNotification(row.id, nIdx, { recipient: rec })}
                                            />
                                            <span className="capitalize">{rec}</span>
                                          </label>
                                        ))}
                                      </div>

                                      {/* Subject */}
                                      <input
                                        type="text"
                                        value={notif.subject}
                                        onChange={e => updateNotification(row.id, nIdx, { subject: e.target.value })}
                                        placeholder="Subject / message template"
                                        className={`flex-1 min-w-0 ${inputCls}`}
                                      />

                                      {/* Remove */}
                                      <button
                                        onClick={() => removeNotification(row.id, nIdx)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Existing notification chips */}
                              {row.notifications.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {row.notifications.map((n, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200"
                                    >
                                      {n.channel === "email" && <Mail size={10} />}
                                      {n.channel === "sms" && <MessageSquare size={10} />}
                                      {n.channel === "push" && <Bell size={10} />}
                                      {n.channel} → {n.recipient}
                                      {n.subject ? `: ${n.subject.slice(0, 20)}${n.subject.length > 20 ? "…" : ""}` : ""}
                                      <button
                                        onClick={() => removeNotification(row.id, i)}
                                        className="ml-0.5 hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => setOpenPanel(null)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* ── Checklist panel ───────────────────────────────── */}
                      {isCheckOpen && (
                        <tr key={`check-${row.id}`} className="bg-orange-50 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                  <CheckSquare size={14} className="text-orange-500" />
                                  Checklist — {row.name || "this state"} / {action?.label || "this action"}
                                </h4>
                                <button
                                  onClick={() => addChecklistItem(row.id)}
                                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                                >
                                  <Plus size={12} /> Add item
                                </button>
                              </div>

                              {checklistItemsForRow(row.id).length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No checklist items yet. Click "Add item" to create one.</p>
                              ) : (
                                <div className="space-y-2">
                                  {checklistItemsForRow(row.id).map(item => (
                                    <div key={item.id} className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                      {/* Label */}
                                      <input
                                        type="text"
                                        value={item.label}
                                        onChange={e => updateChecklistItem(item.id, { label: e.target.value })}
                                        placeholder="e.g. Verify fire exits"
                                        className={`flex-1 min-w-0 ${inputCls}`}
                                      />

                                      {/* Field type */}
                                      <select
                                        value={item.fieldType}
                                        onChange={e => updateChecklistItem(item.id, { fieldType: e.target.value as WorkflowChecklistItem["fieldType"] })}
                                        className={`${selectCls} w-28 shrink-0`}
                                      >
                                        <option value="checkbox">Checkbox</option>
                                        <option value="text">Text</option>
                                        <option value="file">File</option>
                                      </select>

                                      {/* Required toggle */}
                                      <Toggle
                                        checked={item.required}
                                        onChange={v => updateChecklistItem(item.id, { required: v })}
                                        label="Required"
                                      />

                                      {/* Remove */}
                                      <button
                                        onClick={() => removeChecklistItem(item.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Existing items as chips */}
                              {checklistItemsForRow(row.id).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {checklistItemsForRow(row.id).map(item => (
                                    <span
                                      key={item.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200"
                                    >
                                      <CheckSquare size={10} />
                                      {item.label || "(empty)"}
                                      <span className="opacity-60 capitalize">[{item.fieldType}]</span>
                                      {item.required && <span className="text-red-500 font-bold">*</span>}
                                      <button
                                        onClick={() => removeChecklistItem(item.id)}
                                        className="ml-0.5 hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => setOpenPanel(null)}
                                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
                                >
                                  Done
                                </button>
                              </div>
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

          {/* ── Add row button ──────────────────────────────────────────── */}
          <div className="border-t border-slate-200 px-4 py-3">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all w-full justify-center"
            >
              <Plus size={14} />
              Add Transition
            </button>
          </div>
        </div>

        {/* ── Advanced Settings (collapsible) ─────────────────────────────── */}
        <section>
          <button
            onClick={() => setAdvancedOpen(o => !o)}
            className="flex items-center gap-2 w-full text-left"
          >
            <h3 className="text-base font-semibold text-slate-800 flex-1">Advanced Settings</h3>
            {advancedOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </button>

          {advancedOpen && (
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
