import { useState, useRef } from "react";
import type {
  ImplementationConfig,
  WorkflowConfig,
  WorkflowStage,
  WorkflowAction,
  WorkflowNotification,
  WorkflowChecklist,
  WorkflowChecklistQuestion,
} from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Bell, Mail, MessageSquare,
  CheckSquare, RotateCcw,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

// ── Trade License pre-fill (example rows) ─────────────────────────────────────

const EXAMPLE_STAGES: WorkflowStage[] = [
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

// ── Workflow Table Sub-component ───────────────────────────────────────────────

interface WorkflowTableProps {
  rows: WorkflowStage[];
  checklists: WorkflowChecklist[];
  roleNames: string[];
  config: ImplementationConfig;
  onSetRows: (s: WorkflowStage[]) => void;
  onSetChecklists: (c: WorkflowChecklist[]) => void;
}

// Variable tag groups for notification form
const NOTIF_VAR_GROUPS = [
  {
    label: "SYSTEM",
    vars: ["Application ID", "Submitted Date", "Last Updated Date", "Status", "Portal URL", "Organisation Name"],
  },
  {
    label: "APPLICANT",
    vars: ["Full Name", "Mobile Number", "Email Address", "ID Type", "ID Number"],
  },
  {
    label: "BUSINESS",
    vars: [
      "Business / Trade Name", "Trade Category", "Sub-category", "Business Registration No.",
      "Tax Identification No.", "Year of Establishment", "Business Area", "No. of Employees",
    ],
  },
];

function WorkflowTable({ rows, checklists, roleNames, config, onSetRows, onSetChecklists }: WorkflowTableProps) {
  const [openPanel, setOpenPanel] = useState<PanelTarget>(null);

  // ── Notification "Add" form state ────────────────────────────────────────────
  const [showAddNotif, setShowAddNotif] = useState(false);
  const [notifForm, setNotifForm] = useState<{
    event: string; channel: "email" | "sms" | "push"; recipient: "applicant" | "staff" | "both"; subject: string;
  }>({ event: "", channel: "email", recipient: "applicant", subject: "" });
  const subjectRef = useRef<HTMLInputElement>(null);

  // ── Checklist "Add" form state ───────────────────────────────────────────────
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [newChecklistQuestions, setNewChecklistQuestions] = useState<WorkflowChecklistQuestion[]>([]);
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  const inputCls = "px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const selectCls = inputCls;

  // ── Row mutation helpers ─────────────────────────────────────────────────────

  function updateRow(id: string, patch: Partial<WorkflowStage>) {
    onSetRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function updateRowAction(rowId: string, actionPatch: Partial<WorkflowAction>) {
    const row = rows.find(r => r.id === rowId);
    if (!row || row.actions.length === 0) return;
    const updatedAction = { ...row.actions[0], ...actionPatch };
    updateRow(rowId, { actions: [updatedAction] });
  }

  function deleteRow(id: string) {
    onSetRows(rows.filter(r => r.id !== id));
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
    onSetRows([...rows, newRow]);
  }

  // ── Notification helpers ─────────────────────────────────────────────────────

  function openNotifPanel(rowId: string) {
    const panelRow = rows.find(r => r.id === rowId);
    const defaultEvent = panelRow?.actions[0]?.label || "";
    setNotifForm({ event: defaultEvent, channel: "email", recipient: "applicant", subject: "" });
    setShowAddNotif(false);
    setOpenPanel({ rowId, kind: "notifications" });
  }

  function commitAddNotification(rowId: string) {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    const newNotif: WorkflowNotification = {
      event: notifForm.event,
      channel: notifForm.channel,
      recipient: notifForm.recipient,
      subject: notifForm.subject,
    };
    updateRow(rowId, { notifications: [...row.notifications, newNotif] });
    setShowAddNotif(false);
    setNotifForm({ event: "", channel: "email", recipient: "applicant", subject: "" });
  }

  function removeNotification(rowId: string, idx: number) {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    updateRow(rowId, { notifications: row.notifications.filter((_, i) => i !== idx) });
  }

  function insertVarTag(varName: string) {
    const el = subjectRef.current;
    if (!el) {
      setNotifForm(f => ({ ...f, subject: f.subject + `{${varName}}` }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const tag = `{${varName}}`;
    const newVal = el.value.slice(0, start) + tag + el.value.slice(end);
    setNotifForm(f => ({ ...f, subject: newVal }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    });
  }

  // ── Checklist helpers ────────────────────────────────────────────────────────

  function checklistsForRow(rowId: string) {
    return checklists.filter(cl => cl.stageId === rowId);
  }

  function openChecklistPanel(rowId: string) {
    setShowAddChecklist(false);
    setNewChecklistName("");
    setNewChecklistQuestions([]);
    setExpandedChecklistId(null);
    setOpenPanel({ rowId, kind: "checklist" });
  }

  function commitAddChecklist(rowId: string) {
    if (!newChecklistName.trim()) return;
    const newCl: WorkflowChecklist = {
      id: uid(),
      stageId: rowId,
      name: newChecklistName.trim(),
      questions: newChecklistQuestions,
    };
    onSetChecklists([...checklists, newCl]);
    setShowAddChecklist(false);
    setNewChecklistName("");
    setNewChecklistQuestions([]);
  }

  function deleteChecklist(clId: string) {
    onSetChecklists(checklists.filter(cl => cl.id !== clId));
  }

  function addQuestionToNewChecklist() {
    const q: WorkflowChecklistQuestion = { id: uid(), label: "", fieldType: "checkbox", required: true };
    setNewChecklistQuestions(qs => [...qs, q]);
  }

  function updateNewQuestion(qId: string, patch: Partial<WorkflowChecklistQuestion>) {
    setNewChecklistQuestions(qs => qs.map(q => q.id === qId ? { ...q, ...patch } : q));
  }

  function removeNewQuestion(qId: string) {
    setNewChecklistQuestions(qs => qs.filter(q => q.id !== qId));
  }

  function addQuestionToExistingChecklist(clId: string) {
    const q: WorkflowChecklistQuestion = { id: uid(), label: "", fieldType: "checkbox", required: true };
    onSetChecklists(checklists.map(cl => cl.id === clId ? { ...cl, questions: [...cl.questions, q] } : cl));
  }

  function updateExistingQuestion(clId: string, qId: string, patch: Partial<WorkflowChecklistQuestion>) {
    onSetChecklists(checklists.map(cl =>
      cl.id === clId
        ? { ...cl, questions: cl.questions.map(q => q.id === qId ? { ...q, ...patch } : q) }
        : cl
    ));
  }

  function removeExistingQuestion(clId: string, qId: string) {
    onSetChecklists(checklists.map(cl =>
      cl.id === clId ? { ...cl, questions: cl.questions.filter(q => q.id !== qId) } : cl
    ));
  }

  // ── Custom field variable tags ───────────────────────────────────────────────
  const customFieldVars = (config.formConfig.customFields ?? []).map((cf: { label?: string; name?: string }) => cf.label || cf.name || "").filter(Boolean);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-hidden">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "3%" }} />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">From State</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">To State</th>
              <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notifs</th>
              <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Checklist</th>
              <th className="px-1 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const action = row.actions[0];
              const notifCount = row.notifications.length;
              const checkCount = checklistsForRow(row.id).length;
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
                    <td className="px-4 py-2.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => updateRow(row.id, { name: e.target.value })}
                          placeholder="e.g. Start"
                          className="w-full min-w-0 text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                        />
                        {row.isStart && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-600">start</span>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-2.5 min-w-0">
                      {roleNames.length > 0 ? (
                        <select
                          value={row.actor}
                          onChange={e => updateRow(row.id, { actor: e.target.value })}
                          className="w-full min-w-0 text-sm text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors appearance-none"
                        >
                          {roleNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          {!roleNames.includes(row.actor) && <option value={row.actor}>{row.actor}</option>}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.actor}
                          onChange={e => updateRow(row.id, { actor: e.target.value })}
                          placeholder="e.g. Approver"
                          className="w-full min-w-0 text-sm text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                        />
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-2.5 min-w-0">
                      {isEndRow ? (
                        <span className="text-xs text-slate-400 italic">—</span>
                      ) : (
                        <input
                          type="text"
                          value={action?.label ?? ""}
                          onChange={e => updateRowAction(row.id, { label: e.target.value })}
                          placeholder="e.g. Approve"
                          className="w-full min-w-0 text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                        />
                      )}
                    </td>

                    {/* To State */}
                    <td className="px-4 py-2.5 min-w-0">
                      {isEndRow ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
                          (End)
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={action?.nextStateId ?? ""}
                          onChange={e => updateRowAction(row.id, { nextStateId: e.target.value })}
                          placeholder="e.g. Pending Approval"
                          className="w-full min-w-0 text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none py-0.5 transition-colors"
                        />
                      )}
                    </td>

                    {/* Notifications badge + button */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        onClick={() => isNotifOpen ? setOpenPanel(null) : openNotifPanel(row.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
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
                    <td className="px-2 py-2.5 text-center">
                      <button
                        onClick={() => isCheckOpen ? setOpenPanel(null) : openChecklistPanel(row.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
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
                    <td className="px-1 py-2.5 text-center">
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
                              Notifications — {row.name || "this state"}
                            </h4>
                            {!showAddNotif && (
                              <button
                                onClick={() => {
                                  setNotifForm({ event: action?.label || "", channel: "email", recipient: "applicant", subject: "" });
                                  setShowAddNotif(true);
                                }}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <Plus size={12} /> Add Notification
                              </button>
                            )}
                          </div>

                          {/* ── Existing notifications list ── */}
                          {row.notifications.length === 0 && !showAddNotif && (
                            <p className="text-xs text-slate-400 italic">No notifications yet. Click "Add Notification" to create one.</p>
                          )}
                          {row.notifications.length > 0 && (
                            <div className="space-y-1.5">
                              {row.notifications.map((n, nIdx) => (
                                <div key={nIdx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 text-xs">
                                  {n.event && <span className="text-slate-600 font-medium shrink-0">{n.event}</span>}
                                  {n.event && <span className="text-slate-300">·</span>}
                                  <span className={`shrink-0 px-1.5 py-0.5 rounded font-medium capitalize ${
                                    n.channel === "email" ? "bg-blue-100 text-blue-700" :
                                    n.channel === "sms" ? "bg-purple-100 text-purple-700" :
                                    "bg-orange-100 text-orange-700"
                                  }`}>
                                    {n.channel === "email" && <Mail size={9} className="inline mr-0.5" />}
                                    {n.channel === "sms" && <MessageSquare size={9} className="inline mr-0.5" />}
                                    {n.channel === "push" && <Bell size={9} className="inline mr-0.5" />}
                                    {n.channel}
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-600 capitalize shrink-0">{n.recipient}</span>
                                  <span className="text-slate-400 truncate flex-1">{n.subject ? `— ${n.subject}` : ""}</span>
                                  <button
                                    onClick={() => removeNotification(row.id, nIdx)}
                                    className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors shrink-0"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* ── Add Notification inline form ── */}
                          {showAddNotif && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Add Notification</p>
                              <div className="w-full h-px bg-blue-200" />

                              {/* Row 1: Event + Channel */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-500 font-medium">Event</label>
                                  <input
                                    type="text"
                                    value={notifForm.event}
                                    onChange={e => setNotifForm(f => ({ ...f, event: e.target.value }))}
                                    placeholder={action?.label || "e.g. Submit Application"}
                                    className={inputCls + " w-full"}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-500 font-medium">Channel</label>
                                  <select
                                    value={notifForm.channel}
                                    onChange={e => setNotifForm(f => ({ ...f, channel: e.target.value as "email" | "sms" | "push" }))}
                                    className={selectCls + " w-full"}
                                  >
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="push">Push</option>
                                  </select>
                                </div>
                              </div>

                              {/* Row 2: Recipient */}
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 font-medium">Recipient</label>
                                <select
                                  value={notifForm.recipient}
                                  onChange={e => setNotifForm(f => ({ ...f, recipient: e.target.value as "applicant" | "staff" | "both" }))}
                                  className={selectCls + " w-full"}
                                >
                                  <option value="applicant">Applicant</option>
                                  <option value="staff">Staff</option>
                                  <option value="both">Both</option>
                                </select>
                              </div>

                              {/* Row 3: Subject */}
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 font-medium">Message / Subject</label>
                                <input
                                  ref={subjectRef}
                                  type="text"
                                  value={notifForm.subject}
                                  onChange={e => setNotifForm(f => ({ ...f, subject: e.target.value }))}
                                  placeholder="e.g. Your application has been submitted. Ref: {APP_ID}"
                                  className={inputCls + " w-full"}
                                />
                              </div>

                              {/* Variable tags */}
                              <div className="space-y-2">
                                {NOTIF_VAR_GROUPS.map(group => (
                                  <div key={group.label}>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{group.label}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {group.vars.map(v => (
                                        <button
                                          key={v}
                                          type="button"
                                          onClick={() => insertVarTag(v)}
                                          className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                          {v}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                {customFieldVars.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CUSTOM FIELDS</p>
                                    <div className="flex flex-wrap gap-1">
                                      {customFieldVars.map((v: string) => (
                                        <button
                                          key={v}
                                          type="button"
                                          onClick={() => insertVarTag(v)}
                                          className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                          {v}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Add / Cancel */}
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setShowAddNotif(false)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => commitAddNotification(row.id)}
                                  disabled={!notifForm.channel || !notifForm.recipient || !notifForm.subject.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => { setShowAddNotif(false); setOpenPanel(null); }}
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
                              Checklists — {row.name || "this state"}
                            </h4>
                            {!showAddChecklist && (
                              <button
                                onClick={() => { setShowAddChecklist(true); setNewChecklistName(""); setNewChecklistQuestions([]); }}
                                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                              >
                                <Plus size={12} /> Add Checklist
                              </button>
                            )}
                          </div>

                          {/* ── Existing checklists ── */}
                          {checklistsForRow(row.id).length === 0 && !showAddChecklist && (
                            <p className="text-xs text-slate-400 italic">No checklists yet. Click "Add Checklist" to create one.</p>
                          )}
                          {checklistsForRow(row.id).map(cl => {
                            const isExpanded = expandedChecklistId === cl.id;
                            return (
                              <div key={cl.id} className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2">
                                  <button
                                    onClick={() => setExpandedChecklistId(isExpanded ? null : cl.id)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-orange-700 flex-1 text-left"
                                  >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {cl.name}
                                    <span className="text-xs text-slate-400 font-normal">({cl.questions.length} question{cl.questions.length !== 1 ? "s" : ""})</span>
                                  </button>
                                  <button
                                    onClick={() => deleteChecklist(cl.id)}
                                    className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="border-t border-slate-200 px-3 py-3 space-y-2 bg-white">
                                    {cl.questions.length === 0 && (
                                      <p className="text-xs text-slate-400 italic">No questions yet.</p>
                                    )}
                                    {cl.questions.map(q => (
                                      <div key={q.id} className="flex items-center gap-2 flex-wrap bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        <input
                                          type="text"
                                          value={q.label}
                                          onChange={e => updateExistingQuestion(cl.id, q.id, { label: e.target.value })}
                                          placeholder="Question label"
                                          className={inputCls + " flex-1 min-w-0"}
                                        />
                                        <select
                                          value={q.fieldType}
                                          onChange={e => updateExistingQuestion(cl.id, q.id, { fieldType: e.target.value as WorkflowChecklistQuestion["fieldType"] })}
                                          className={selectCls + " w-28 shrink-0"}
                                        >
                                          <option value="checkbox">Checkbox</option>
                                          <option value="text">Text</option>
                                          <option value="file">File</option>
                                        </select>
                                        <Toggle
                                          checked={q.required}
                                          onChange={v => updateExistingQuestion(cl.id, q.id, { required: v })}
                                          label="Required"
                                        />
                                        <button
                                          onClick={() => removeExistingQuestion(cl.id, q.id)}
                                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => addQuestionToExistingChecklist(cl.id)}
                                      className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium mt-1"
                                    >
                                      <Plus size={11} /> Add Question
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* ── Add Checklist inline form ── */}
                          {showAddChecklist && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
                              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">New Checklist</p>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-500 font-medium">Checklist Name</label>
                                <input
                                  type="text"
                                  value={newChecklistName}
                                  onChange={e => setNewChecklistName(e.target.value)}
                                  placeholder="e.g. Field Inspection Checklist"
                                  className={inputCls + " w-full"}
                                />
                              </div>

                              {newChecklistQuestions.length > 0 && (
                                <div className="space-y-2">
                                  {newChecklistQuestions.map(q => (
                                    <div key={q.id} className="flex items-center gap-2 flex-wrap bg-white rounded-lg px-3 py-2 border border-slate-100">
                                      <input
                                        type="text"
                                        value={q.label}
                                        onChange={e => updateNewQuestion(q.id, { label: e.target.value })}
                                        placeholder="Question label"
                                        className={inputCls + " flex-1 min-w-0"}
                                      />
                                      <select
                                        value={q.fieldType}
                                        onChange={e => updateNewQuestion(q.id, { fieldType: e.target.value as WorkflowChecklistQuestion["fieldType"] })}
                                        className={selectCls + " w-28 shrink-0"}
                                      >
                                        <option value="checkbox">Checkbox</option>
                                        <option value="text">Text</option>
                                        <option value="file">File</option>
                                      </select>
                                      <Toggle
                                        checked={q.required}
                                        onChange={v => updateNewQuestion(q.id, { required: v })}
                                        label="Required"
                                      />
                                      <button
                                        onClick={() => removeNewQuestion(q.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button
                                onClick={addQuestionToNewChecklist}
                                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                              >
                                <Plus size={11} /> Add Question
                              </button>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setShowAddChecklist(false)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => commitAddChecklist(row.id)}
                                  disabled={!newChecklistName.trim()}
                                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Save Checklist
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => { setShowAddChecklist(false); setOpenPanel(null); }}
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
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StepWorkflow({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const wf = config.workflow;

  function updateWf<K extends keyof WorkflowConfig>(key: K, value: WorkflowConfig[K]) {
    updateConfig("workflow", { ...wf, [key]: value });
  }

  // Populate roles from config
  const roleNames = config.roles.map(r => r.name);

  // ── Tab state (Application vs Renewal) ────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"application" | "renewal">("application");

  // ── Advanced settings ─────────────────────────────────────────────────────
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // ── Clear confirm ─────────────────────────────────────────────────────────
  const [clearConfirm, setClearConfirm] = useState(false);

  // ── Start-state validation error ──────────────────────────────────────────
  const [startStateError, setStartStateError] = useState<string | null>(null);

  // ── Determine active stages/checklists based on tab ──────────────────────
  const isRenewalTab = activeTab === "renewal";
  const activeRows: WorkflowStage[] = isRenewalTab
    ? (wf.renewalStages ?? [])
    : (wf.stages.length > 0 ? wf.stages : EXAMPLE_STAGES);
  const activeChecklists = isRenewalTab
    ? (wf.renewalChecklists ?? [])
    : (wf.checklists ?? []);

  function setActiveRows(s: WorkflowStage[]) {
    if (isRenewalTab) {
      updateWf("renewalStages", s);
    } else {
      updateWf("stages", s);
    }
  }

  function setActiveChecklists(c: WorkflowChecklist[]) {
    if (isRenewalTab) {
      updateWf("renewalChecklists", c);
    } else {
      updateWf("checklists", c);
    }
  }

  // ── Reset to example ──────────────────────────────────────────────────────
  function handleReset() {
    // Build fresh example stages with new UIDs each time
    const freshStages: WorkflowStage[] = EXAMPLE_STAGES.map(s => ({
      ...s,
      id: uid(),
      actions: s.actions.map(a => ({ ...a, id: uid() })),
    }));
    if (isRenewalTab) {
      updateConfig("workflow", {
        ...wf,
        renewalStages: freshStages,
        renewalChecklistItems: [],
        renewalChecklists: [],
      });
    } else {
      updateConfig("workflow", {
        ...wf,
        stages: freshStages,
        checklistItems: [],
        checklists: [],
      });
    }
    setClearConfirm(false);
  }

  // ── Save & Continue with start-state validation (Fix #3) ──────────────────
  function handleNext() {
    const currentStages = isRenewalTab ? (wf.renewalStages ?? []) : wf.stages;
    const hasStart = currentStages.some(
      s => s.name.trim().toLowerCase() === "start"
    );
    if (!hasStart) {
      setStartStateError("Workflow must have at least one transition from a Start state.");
      return;
    }
    setStartStateError(null);
    onNext();
  }

  const renewalEnabled = config.overall.renewalEnabled;
  const renewalApprovalMode = config.overall.renewalApprovalMode;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <StepWrapper
      step={9}
      title="Workflow"
      subtitle="Define the state-based approval workflow. Each row is one transition: a role takes an action that moves the application from one state to the next."
      onNext={handleNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-8">

        {/* ── Fix #6: Tab switcher ────────────────────────────────────────── */}
        <div className="flex gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("application")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "application"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Application Workflow
          </button>
          {renewalEnabled ? (
            <button
              onClick={() => setActiveTab("renewal")}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "renewal"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Renewal Workflow
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-transparent text-slate-300 cursor-default"
              title="Renewal not enabled"
            >
              Renewal Workflow
            </button>
          )}
        </div>

        {/* ── Renewal-disabled notice ─────────────────────────────────────── */}
        {activeTab === "renewal" && !renewalEnabled && (
          <div className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-500">
            Renewal workflow is not enabled. Enable it in Overall Configuration.
          </div>
        )}

        {/* ── Renewal auto-approve banner ─────────────────────────────────── */}
        {activeTab === "renewal" && renewalEnabled && renewalApprovalMode === "auto_if_unchanged" && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            Renewal is set to auto-approve if the application is unchanged. The workflow below only applies when changes are detected.
          </div>
        )}

        {/* ── Main table area (only show when tab is valid) ───────────────── */}
        {(activeTab === "application" || (activeTab === "renewal" && renewalEnabled)) && (
          <>
            {/* ── Header toolbar ─────────────────────────────────────────── */}
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

            {/* ── Clear confirm banner ───────────────────────────────────── */}
            {clearConfirm && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700 flex-1">
                  Reset to the Trade License example? This will replace all current rows.
                </p>
                <button
                  onClick={handleReset}
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

            {/* ── Start-state validation error (Fix #3) ─────────────────── */}
            {startStateError && (
              <div className="rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">
                {startStateError}
              </div>
            )}

            {/* ── Transition table ───────────────────────────────────────── */}
            <WorkflowTable
              rows={activeRows}
              checklists={activeChecklists}
              roleNames={roleNames}
              config={config}
              onSetRows={setActiveRows}
              onSetChecklists={setActiveChecklists}
            />
          </>
        )}

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
                  className={`px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-20 text-center`}
                />
              </div>

              {/* Fix #4: Auto-escalate removed from UI (autoEscalate remains false in save path) */}

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
                  className={`px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-20 text-center`}
                />
              </div>

              {/* Fix #5: Allow citizen withdrawal removed from UI */}

            </div>
          )}
        </section>

      </div>
    </StepWrapper>
  );
}
