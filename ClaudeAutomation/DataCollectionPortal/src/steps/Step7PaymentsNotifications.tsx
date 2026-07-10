import { useState, useRef } from "react";
import type { ImplementationConfig, PaymentsNotificationsConfig, NotificationTemplate } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { DEFAULT_CONFIG } from "../defaults";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

const CHANNEL_LABELS: Record<string, string> = { email: "Email", sms: "SMS", ussd: "USSD" };
const RECIPIENT_LABELS: Record<string, string> = { applicant: "Applicant", staff: "Staff", admin: "Admin" };

const EVENTS = [
  "Application Submitted",
  "Pending Document Verification",
  "Inspection Scheduled",
  "Pending Resubmission",
  "Pending Approval",
  "Pending Payment",
  "License Issued",
  "Rejection",
  "Renewal Reminder",
  "Custom",
];

interface Variable { token: string; label: string; }
interface VarGroup  { label: string; vars: Variable[]; }

const SYSTEM_VAR_GROUPS: VarGroup[] = [
  {
    label: "System",
    vars: [
      { token: "{APP_ID}",           label: "Application ID" },
      { token: "{SUBMITTED_DATE}",   label: "Submitted Date" },
      { token: "{LAST_UPDATED_DATE}",label: "Last Updated Date" },
      { token: "{STATUS}",           label: "Status" },
      { token: "{PORTAL_URL}",       label: "Portal URL" },
      { token: "{ORG_NAME}",         label: "Organisation Name" },
    ],
  },
  {
    label: "Applicant",
    vars: [
      { token: "{APPLICANT_NAME}",   label: "Full Name" },
      { token: "{APPLICANT_MOBILE}", label: "Mobile Number" },
      { token: "{APPLICANT_EMAIL}",  label: "Email Address" },
      { token: "{ID_TYPE}",          label: "ID Type" },
      { token: "{ID_NUMBER}",        label: "ID Number" },
    ],
  },
  {
    label: "Business",
    vars: [
      { token: "{BUSINESS_NAME}",    label: "Business / Trade Name" },
      { token: "{TRADE_CATEGORY}",   label: "Trade Category" },
      { token: "{SUB_CATEGORY}",     label: "Sub-category" },
      { token: "{BUS_REG_NO}",       label: "Business Registration No." },
      { token: "{TAX_ID}",           label: "Tax Identification No." },
      { token: "{YEAR_OF_EST}",      label: "Year of Establishment" },
      { token: "{BUSINESS_AREA}",    label: "Business Area" },
      { token: "{NUM_EMPLOYEES}",    label: "No. of Employees" },
    ],
  },
];

interface AddRowState {
  event: string;
  customEvent: string;
  channel: "email" | "sms" | "ussd";
  recipient: "applicant" | "staff" | "admin";
  subject: string;
}

export default function Step7PaymentsNotifications({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const p: PaymentsNotificationsConfig = {
    ...config.paymentsNotifications,
    notificationChannels: {
      ...config.paymentsNotifications.notificationChannels,
      ussd: config.paymentsNotifications.notificationChannels.ussd ?? false,
    },
    notificationTemplates: config.paymentsNotifications.notificationTemplates ?? DEFAULT_CONFIG.paymentsNotifications.notificationTemplates,
  };

  const set = (patch: Partial<PaymentsNotificationsConfig>) =>
    updateConfig("paymentsNotifications", { ...p, ...patch });

  const [showAdd, setShowAdd] = useState(false);
  const [addRow, setAddRow] = useState<AddRowState>({
    event: EVENTS[0], customEvent: "", channel: "email", recipient: "applicant", subject: "",
  });

  const subjectRef = useRef<HTMLInputElement>(null);

  const insertVar = (token: string) => {
    const el = subjectRef.current;
    if (!el) { setAddRow((r) => ({ ...r, subject: r.subject + token })); return; }
    const start = el.selectionStart ?? addRow.subject.length;
    const end = el.selectionEnd ?? addRow.subject.length;
    const next = addRow.subject.slice(0, start) + token + addRow.subject.slice(end);
    setAddRow((r) => ({ ...r, subject: next }));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); }, 0);
  };

  const toggleChannel = (ch: "email" | "sms" | "ussd") => {
    set({ notificationChannels: { ...p.notificationChannels, [ch]: !p.notificationChannels[ch] } });
  };

  const deleteTemplate = (id: string) => {
    set({ notificationTemplates: p.notificationTemplates.filter((t) => t.id !== id) });
  };

  const addTemplate = () => {
    const event = addRow.event === "Custom" ? addRow.customEvent.trim() : addRow.event;
    if (!event || !addRow.subject.trim()) return;
    const tpl: NotificationTemplate = {
      id: uid(), event, channel: addRow.channel,
      recipient: addRow.recipient, subject: addRow.subject.trim(),
    };
    set({ notificationTemplates: [...p.notificationTemplates, tpl] });
    setAddRow({ event: EVENTS[0], customEvent: "", channel: "email", recipient: "applicant", subject: "" });
    setShowAdd(false);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white";

  const channelBadge = (ch: string) => {
    const colors: Record<string, string> = {
      email: "bg-blue-50 text-blue-700",
      sms:   "bg-amber-50 text-amber-700",
      ussd:  "bg-violet-50 text-violet-700",
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[ch] ?? "bg-slate-100 text-slate-600"}`}>
        {CHANNEL_LABELS[ch] ?? ch}
      </span>
    );
  };

  return (
    <StepWrapper
      step={10}
      title="Notifications"
      subtitle="Configure how citizens and staff are notified at each stage of the application."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-6">

        {/* SMS cost warning */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>SMS is charged per message</strong> and costs can add up quickly at scale.
            Keep SMS to critical events only (e.g. payment due, licence issued).
            <strong> Email and USSD are significantly cheaper</strong> — use them for all other status updates.
          </p>
        </div>

        {/* Notification Channels */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800">Active Channels</p>
            <p className="text-xs text-slate-400 mt-0.5">Enable the channels your department supports.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {([
              { key: "email", label: "Email",  desc: "Via Amazon SES — cheapest option, supports rich content", icon: "📧" },
              { key: "sms",   label: "SMS",    desc: "Via Amazon SNS — use sparingly for critical alerts only",  icon: "💬" },
              { key: "ussd",  label: "USSD",   desc: "Via Africa's Talking — cost-effective for feature phones", icon: "📟" },
            ] as const).map((ch) => (
              <div key={ch.key} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-base">{ch.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{ch.label}</p>
                    <p className="text-xs text-slate-400">{ch.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel(ch.key)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 ${p.notificationChannels[ch.key] ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${p.notificationChannels[ch.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification messages table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Notification Messages</p>
              <p className="text-xs text-slate-400 mt-0.5">Messages sent to recipients at each application event.</p>
            </div>
            <span className="text-xs text-slate-400">{p.notificationTemplates.length} configured</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Channel</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Recipient</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Message / Subject</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {p.notificationTemplates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-slate-700 font-medium">{tpl.event}</td>
                    <td className="px-4 py-2.5">{channelBadge(tpl.channel)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{RECIPIENT_LABELS[tpl.recipient] ?? tpl.recipient}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 leading-relaxed">{tpl.subject}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => deleteTemplate(tpl.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {p.notificationTemplates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                      No notification messages configured — add one below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          <div className="px-5 py-3 border-t border-slate-100">
            {showAdd ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Add Notification</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Event</label>
                    <select
                      value={addRow.event}
                      onChange={(e) => setAddRow({ ...addRow, event: e.target.value })}
                      className={inputCls}
                    >
                      {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                  </div>
                  {addRow.event === "Custom" && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Custom Event Name</label>
                      <input
                        type="text"
                        value={addRow.customEvent}
                        onChange={(e) => setAddRow({ ...addRow, customEvent: e.target.value })}
                        placeholder="e.g. Renewal Approved"
                        className={inputCls}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Channel</label>
                    <select
                      value={addRow.channel}
                      onChange={(e) => setAddRow({ ...addRow, channel: e.target.value as AddRowState["channel"] })}
                      className={inputCls}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="ussd">USSD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Recipient</label>
                    <select
                      value={addRow.recipient}
                      onChange={(e) => setAddRow({ ...addRow, recipient: e.target.value as AddRowState["recipient"] })}
                      className={inputCls}
                    >
                      <option value="applicant">Applicant</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Message / Subject</label>
                    <input
                      ref={subjectRef}
                      type="text"
                      value={addRow.subject}
                      onChange={(e) => setAddRow({ ...addRow, subject: e.target.value })}
                      placeholder="e.g. Your application has been submitted. Ref: {APP_ID}"
                      className={inputCls}
                    />
                    {/* Variable picker */}
                    {(() => {
                      const customGroup: VarGroup | null = config.formConfig.customFields?.length
                        ? {
                            label: "Custom Fields",
                            vars: config.formConfig.customFields.map((f: { label?: string; name?: string; id?: string }) => ({
                              token: `{${(f.label ?? f.name ?? f.id ?? "FIELD").toUpperCase().replace(/\s+/g, "_")}}`,
                              label: f.label ?? f.name ?? String(f.id ?? ""),
                            })),
                          }
                        : null;
                      const allGroups = customGroup ? [...SYSTEM_VAR_GROUPS, customGroup] : SYSTEM_VAR_GROUPS;
                      return (
                        <div className="mt-2 space-y-1.5">
                          {allGroups.map((grp) => (
                            <div key={grp.label}>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{grp.label}</p>
                              <div className="flex flex-wrap gap-1">
                                {grp.vars.map((v) => (
                                  <button
                                    key={v.token}
                                    type="button"
                                    onClick={() => insertVar(v.token)}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-xs text-slate-600 transition-colors font-mono"
                                    title={v.token}
                                  >
                                    {v.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addTemplate}
                    disabled={!addRow.subject.trim() || (addRow.event === "Custom" && !addRow.customEvent.trim())}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} />
                Add Notification
              </button>
            )}
          </div>
        </div>

      </div>
    </StepWrapper>
  );
}
