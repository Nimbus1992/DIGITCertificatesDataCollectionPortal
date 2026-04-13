import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Bell, Mail, MessageSquare, Pencil, Trash2, Info } from "lucide-react";

interface Notification {
  id: string;
  workflowState: string;
  subject: string;
  message: string;
  channels: ("email" | "sms")[];
  tag: string;
  tagColor: string;
}

const WORKFLOW_STATES = [
  "Application Submitted",
  "Scrutiny Pending",
  "Query Raised",
  "Inspection Pending",
  "Approval Pending",
  "Approved",
  "Rejected",
];

const VARIABLES = [
  "{applicationNumber}",
  "{applicantName}",
  "{businessName}",
  "{applicationStatus}",
];

const tagColors: Record<string, string> = {
  Submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Action Required": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Inspection Pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const defaultNotifications: Notification[] = [
  {
    id: "1",
    workflowState: "Application Submitted",
    subject: "Application Submitted Successfully",
    message: "Your Trade License application {applicationNumber} has been submitted successfully.",
    channels: ["email", "sms"],
    tag: "Submitted",
    tagColor: tagColors["Submitted"],
  },
  {
    id: "2",
    workflowState: "Query Raised",
    subject: "Query Raised on Your Application",
    message: "A query has been raised for your application {applicationNumber}. Please respond at the earliest.",
    channels: ["email", "sms"],
    tag: "Action Required",
    tagColor: tagColors["Action Required"],
  },
  {
    id: "3",
    workflowState: "Inspection Pending",
    subject: "Inspection Scheduled",
    message: "Inspection scheduled for your Trade License application {applicationNumber}.",
    channels: ["email"],
    tag: "Inspection Pending",
    tagColor: tagColors["Inspection Pending"],
  },
  {
    id: "4",
    workflowState: "Approved",
    subject: "Application Approved",
    message: "Your Trade License application {applicationNumber} has been approved. You can download the certificate.",
    channels: ["email", "sms"],
    tag: "Approved",
    tagColor: tagColors["Approved"],
  },
  {
    id: "5",
    workflowState: "Rejected",
    subject: "Application Rejected",
    message: "Your Trade License application {applicationNumber} has been rejected.",
    channels: ["email", "sms"],
    tag: "Rejected",
    tagColor: tagColors["Rejected"],
  },
];

interface Props {
  moduleName: string;
  onBack: () => void;
}

const NotificationsManager: React.FC<Props> = ({ moduleName, onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ workflowState: "", subject: "", message: "" });

  const handleSave = () => {
    if (!form.workflowState || !form.subject.trim()) return;
    const tag = form.workflowState;
    setNotifications((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        workflowState: form.workflowState,
        subject: form.subject,
        message: form.message,
        channels: ["email"],
        tag,
        tagColor: tagColors[tag] || "bg-muted text-muted-foreground",
      },
    ]);
    setForm({ workflowState: "", subject: "", message: "" });
    setShowDialog(false);
  };

  const insertVariable = (v: string) => {
    setForm((prev) => ({ ...prev, message: prev.message + v }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{moduleName} — Notifications</h1>
            <p className="text-xs text-muted-foreground">Manage notification templates</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Notification
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Notifications inform applicants and officers at different workflow stages. Keep applicants and officers informed automatically.
          </p>
        </div>

        {/* Channel cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Email</h3>
                <p className="text-xs text-muted-foreground">{notifications.filter((n) => n.channels.includes("email")).length} notifications configured</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">SMS</h3>
                <p className="text-xs text-muted-foreground">{notifications.filter((n) => n.channels.includes("sms")).length} notifications configured</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification cards */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    <h3 className="font-semibold text-foreground text-sm">{notif.subject}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${notif.tagColor}`}>
                      {notif.tag}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">State:</span> {notif.workflowState}
                </p>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2 font-mono text-xs">
                  {notif.message}
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  {notif.channels.includes("email") && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                      <Mail className="h-2.5 w-2.5" /> Email
                    </Badge>
                  )}
                  {notif.channels.includes("sms") && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                      <MessageSquare className="h-2.5 w-2.5" /> SMS
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Workflow State</Label>
              <Select value={form.workflowState} onValueChange={(v) => setForm((p) => ({ ...p, workflowState: v }))}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {WORKFLOW_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Notification subject" />
            </div>
            <div>
              <Label>Message Body</Label>
              <Textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Enter message template..." rows={3} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground">Variables:</span>
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-[10px] px-2 py-0.5 rounded-full border bg-muted hover:bg-accent/10 text-foreground transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.workflowState || !form.subject.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsManager;
