import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Plus, Mail, MessageSquare, BellRing, Pencil, Trash2, Copy, Info, Search,
} from "lucide-react";
import {
  TRADE_NOTIFICATIONS, TRADE_STATE_NAMES, TRADE_STATE_TAG_COLORS,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_NOTIFICATIONS, RENEWAL_STATE_NAMES, RENEWAL_STATE_TAG_COLORS, isRenewalModule,
} from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";
import { useServiceRoles, isCitizenRole } from "@/lib/useServiceRoles";
import { emitNotificationsUpdated } from "@/lib/useServiceNotifications";
import NotificationPreview from "./preview/NotificationPreview";
import { toast } from "@/hooks/use-toast";

type Channel = "email" | "sms" | "push";

interface Notification {
  id: string;
  workflowState: string;
  channel: Channel;
  recipientRole: string;
  subject: string;
  message: string;
  tag: string;
  tagColor: string;
}

const VARIABLES = [
  "{applicationNumber}", "{applicantName}", "{businessName}", "{applicationStatus}",
];

const CHANNEL_META: Record<Channel, { label: string; icon: React.ElementType; subtitle: string }> = {
  email: { label: "Email", icon: Mail, subtitle: "Configure email notifications for applicants" },
  sms:   { label: "SMS",   icon: MessageSquare, subtitle: "Configure SMS notifications for applicants" },
  push:  { label: "Push",  icon: BellRing, subtitle: "In-app push to officers and applicants" },
};

const buildDefaultNotifications = (moduleName: string): Notification[] => {
  const renewal = isRenewalModule(moduleName);
  const src = renewal ? RENEWAL_NOTIFICATIONS : TRADE_NOTIFICATIONS;
  const colors = renewal ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;
  return src.map((n) => ({
    id: n.id,
    workflowState: n.workflowState,
    channel: n.channel,
    recipientRole: n.recipientRole,
    subject: n.subject,
    message: n.message,
    tag: n.tag,
    tagColor: colors[n.tag] ?? "bg-muted text-muted-foreground",
  }));
};

interface Props { moduleName: string; onBack: () => void; }

const NotificationsManager: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const renewal = isRenewalModule(moduleName);
  const WORKFLOW_STATES = renewal ? RENEWAL_STATE_NAMES : TRADE_STATE_NAMES;
  const tagColors: Record<string, string> = renewal ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;

  const [notifications, setNotifications] = useModuleState<Notification[]>(
    "notifications", serviceId, moduleName, () => buildDefaultNotifications(moduleName),
  );
  const [roles] = useServiceRoles(serviceId, moduleName);

  const [activeChannel, setActiveChannel] = useState<Channel>("email");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Notification | null>(null);

  const counts = useMemo(() => ({
    email: notifications.filter(n => n.channel === "email").length,
    sms:   notifications.filter(n => n.channel === "sms").length,
    push:  notifications.filter(n => n.channel === "push").length,
  }), [notifications]);

  const visible = notifications.filter(n =>
    n.channel === activeChannel &&
    (!search.trim() || (n.subject + " " + n.message + " " + n.workflowState).toLowerCase().includes(search.toLowerCase()))
  );

  const roleName = (id: string) => roles.find(r => r.id === id)?.name ?? id;

  const startCreate = (channel: Channel) => {
    setActiveChannel(channel);
    setEditing({
      id: crypto.randomUUID(),
      workflowState: WORKFLOW_STATES[0] ?? "",
      channel,
      recipientRole: roles[0]?.id ?? "citizen",
      subject: "",
      message: "",
      tag: WORKFLOW_STATES[0] ?? "",
      tagColor: tagColors[WORKFLOW_STATES[0] ?? ""] ?? "bg-muted text-muted-foreground",
    });
  };

  const duplicate = (n: Notification) => {
    setEditing({ ...n, id: crypto.randomUUID(), subject: n.subject + " (copy)" });
  };

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    emitNotificationsUpdated(serviceId);
  };

  const save = (n: Notification) => {
    setNotifications(prev => prev.some(x => x.id === n.id)
      ? prev.map(x => x.id === n.id ? n : x)
      : [...prev, n]);
    setActiveChannel(n.channel);
    setSearch("");
    setEditing(null);
    emitNotificationsUpdated(serviceId);
    toast({ title: "Notification saved", description: `${CHANNEL_META[n.channel].label} · ${n.workflowState}` });
  };


  return (
    <div className="h-full flex flex-col bg-background">
      <header className="border-b bg-card shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{moduleName} — Notifications</h1>
            <p className="text-xs text-muted-foreground">Each notification targets one channel and one role</p>
          </div>
          <Button onClick={() => startCreate(activeChannel)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Notification
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            One notification = one channel + one recipient role. Changes here flow into the Workflow and the Service Preview.
          </p>
        </div>

        {/* Channel summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(Object.keys(CHANNEL_META) as Channel[]).map((c) => {
            const meta = CHANNEL_META[c];
            const Icon = meta.icon;
            return (
              <Card key={c} className="hover:border-accent/40 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{meta.label}</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{counts[c]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-accent hover:text-accent" onClick={() => startCreate(c)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs + list card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
                {(Object.keys(CHANNEL_META) as Channel[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveChannel(c)}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeChannel === c ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {CHANNEL_META[c].label} ({counts[c]})
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Notifications"
                  className="pl-9 h-9 w-72"
                />
              </div>
            </div>

            <div className="space-y-2">
              {visible.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No {CHANNEL_META[activeChannel].label.toLowerCase()} notifications yet.
                </div>
              ) : visible.map((n) => (
                <div key={n.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {n.channel === "email" ? n.subject || "(no subject)" : n.message.slice(0, 60) + (n.message.length > 60 ? "…" : "")}
                      </h3>
                      {n.channel === "email" && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{n.message}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${n.tagColor}`}>
                          {n.tag}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          To: {roleName(n.recipientRole)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-accent border-accent/40 hover:bg-accent/10 hover:text-accent" onClick={() => setEditing(n)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-accent border-accent/40 hover:bg-accent/10 hover:text-accent" onClick={() => duplicate(n)}>
                        <Copy className="h-3 w-3" /> Duplicate
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(n.id)}>
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </main>


      {editing && (
        <NotificationDialog
          value={editing}
          workflowStates={WORKFLOW_STATES}
          tagColors={tagColors}
          roles={roles}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
};

const NotificationDialog: React.FC<{
  value: Notification;
  workflowStates: string[];
  tagColors: Record<string, string>;
  roles: { id: string; name: string; permissions: string[] }[];
  onClose: () => void;
  onSave: (n: Notification) => void;
}> = ({ value, workflowStates, tagColors, roles, onClose, onSave }) => {
  const [draft, setDraft] = useState<Notification>(value);
  const insertVar = (v: string) => setDraft(d => ({ ...d, message: d.message + v }));
  const Icon = CHANNEL_META[draft.channel].icon;
  const valid = draft.workflowState && draft.recipientRole && draft.message.trim() &&
    (draft.channel !== "email" || draft.subject.trim());

  const isSms = draft.channel === "sms";
  const charCount = draft.message.length;

  // Audience drives emulator frame: citizen -> mobile, employee -> desktop.
  const recipient = roles.find(r => r.id === draft.recipientRole);
  const previewDevice: "mobile" | "desktop" =
    recipient && isCitizenRole(recipient) ? "mobile" : "desktop";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-accent" />
            {value.subject || draft.message ? "Edit Notification" : "New Notification"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-5">
          {/* Channel segmented */}
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <div className="flex gap-2">
              {(Object.keys(CHANNEL_META) as Channel[]).map((c) => {
                const M = CHANNEL_META[c];
                const I = M.icon;
                const active = draft.channel === c;
                return (
                  <button key={c} type="button"
                    onClick={() => setDraft(d => ({ ...d, channel: c }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${active ? "bg-accent text-accent-foreground border-accent" : "bg-background hover:bg-muted"}`}>
                    <I className="h-4 w-4" /> {M.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isSms && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900">
                Some countries require SMS templates to be approved by telecom providers before sending. Verify requirements for your country and register the template with your SMS provider if needed.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Workflow State *</Label>
              <Select
                value={draft.workflowState}
                onValueChange={(v) => setDraft(d => ({ ...d, workflowState: v, tag: v, tagColor: tagColors[v] ?? d.tagColor }))}
              >
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {workflowStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Recipient Role *</Label>
              <Select value={draft.recipientRole} onValueChange={(v) => setDraft(d => ({ ...d, recipientRole: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.channel === "email" && (
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input value={draft.subject} onChange={(e) => setDraft(d => ({ ...d, subject: e.target.value }))} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Message Body *</Label>
            <Textarea
              rows={4}
              value={draft.message}
              onChange={(e) => setDraft(d => ({ ...d, message: e.target.value }))}
              maxLength={isSms ? 160 : undefined}
            />
            {isSms && (
              <p className="text-[11px] text-muted-foreground text-right">{charCount}/160</p>
            )}
            {draft.channel === "push" && (
              <p className="text-[11px] text-muted-foreground">Delivered to the recipient's in-app inbox.</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs text-muted-foreground">Personalization:</span>
              {VARIABLES.map(v => (
                <button key={v} type="button" onClick={() => insertVar(v)}
                  className="text-[10px] px-2 py-0.5 rounded-full border bg-muted hover:bg-accent/10 text-foreground transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
          </div>

          {/* Live emulator preview */}
          <div className="border-l lg:pl-6 lg:sticky lg:top-0 lg:self-start">
            <NotificationPreview
              device={previewDevice}
              channel={draft.channel}
              subject={draft.subject}
              message={draft.message}
              recipientLabel={recipient?.name}
            />

          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={!valid} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsManager;
