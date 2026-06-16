import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  MoreHorizontal,
  XCircle,
  CalendarClock,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useSession,
  useStore,
  startDocVerification,
  setDocumentStatus,
  verifyApplication,
  scheduleInspection,
  completeInspection,
  issueLicense,
  STAGE_LABELS,
  STAGE_TONE,
} from "@/lib/store";
import { StageDot, StageAccentBar } from "@/components/op/StageDot";
import { SlaBadge } from "@/components/op/SlaBadge";
import type { Application, StageId } from "@/lib/types";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/inbox/$appId")({
  component: ReviewPage,
});

function ReviewPage() {
  const { appId } = Route.useParams();
  const navigate = useNavigate();
  const app = useStore((s) => s.applications.find((a) => a.id === appId));
  const session = useSession()!;

  if (!app) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate({ to: "/inbox" })} className="text-sm text-primary inline-flex items-center gap-1.5">
          <ArrowLeft className="size-3.5" /> Back to Inbox
        </button>
        <Card className="p-10 text-center text-sm text-muted-foreground">Application not found.</Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-32">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/inbox" })}
          className="text-sm text-primary inline-flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Back to Inbox
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              const { downloadLicensePdf } = await import("@/lib/licensePdf");
              await downloadLicensePdf(app);
              toast.success("License downloaded");
            } catch (e) {
              console.error(e);
              toast.error("Could not generate license PDF");
            }
          }}
        >
          <Download className="size-4 mr-2" /> Download
        </Button>
      </div>

      {/* Header card */}
      <Card className="overflow-hidden p-0">
        <StageAccentBar stage={app.currentStageId} />
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase bg-info-soft text-info px-2 py-0.5 rounded mb-2">
              <FileText className="size-3" /> Business License
            </div>
            <h1 className="text-2xl font-bold">{app.applicantName}</h1>
            <div className="font-mono text-xs text-muted-foreground mt-1">{app.id}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StageDot stage={app.currentStageId} />
            <SlaBadge app={app} />
          </div>
        </div>
        <div className="px-5 pb-5">
          <PipelineStrip app={app} />
        </div>
      </Card>


      {/* Fee card */}
      <FeeCard app={app} />

      {/* Tabs */}
      <DetailsTabs app={app} />

      {/* Sticky action dock */}
      <ActionDock app={app} byName={session.name} byRole={session.roleId} />
    </div>
  );
}

function FeeCard({ app }: { app: Application }) {
  // Show issuance fee once inspection is done; otherwise verification fee
  const showIssuance = ["payment_pending", "paid", "issued"].includes(app.currentStageId);
  const fee = showIssuance ? app.fees.issuance : app.fees.verification;
  const total = fee.fee + fee.tax;
  const paid = fee.status === "Paid";
  return (
    <Card
      className={cn(
        "p-0 overflow-hidden border",
        paid ? "border-success/30" : "border-warning/30",
      )}
    >
      <div className={cn("p-4 flex items-center gap-4", paid ? "bg-success-soft/40" : "bg-warning-soft/40")}>
        <div
          className={cn(
            "size-11 rounded-lg grid place-items-center text-white",
            paid ? "bg-success" : "bg-warning",
          )}
        >
          <Banknote className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold">R {total.toLocaleString("en-ZA")}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Fee R {fee.fee.toLocaleString("en-ZA")} + Tax R {fee.tax.toLocaleString("en-ZA")}
            {paid && fee.paidAt
              ? ` · Paid on ${new Date(fee.paidAt).toLocaleDateString("en-GB")} (${fee.txnId})`
              : ` · ${fee.dueLabel ?? "Awaiting payment"}`}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            paid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground",
          )}
        >
          {paid ? <CheckCircle2 className="size-3.5" /> : <CalendarClock className="size-3.5" />}
          {paid ? "Paid" : "Awaiting Payment"}
        </span>
      </div>
    </Card>
  );
}

function DetailsTabs({ app }: { app: Application }) {
  const [tab, setTab] = useState("applicant");
  return (
    <Card className="p-0 overflow-hidden">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-transparent h-12 px-3 border-b w-full justify-start rounded-none overflow-x-auto">
          <TabsTrigger value="applicant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">Applicant</TabsTrigger>
          <TabsTrigger value="business" className="rounded-full px-4">Business</TabsTrigger>
          <TabsTrigger value="location" className="rounded-full px-4">Location</TabsTrigger>
          <TabsTrigger value="operations" className="rounded-full px-4">Operations</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-full px-4">Documents ({app.documents.length})</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-full px-4">Checklist</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-full px-4">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="applicant" className="p-0 m-0">
          <DefList rows={[
            ["Full Name", app.applicantName],
            ["Mobile Number", app.phone],
            ["Email", app.email ?? "—"],
            ["ID Type", app.idType],
            ["ID Number", app.idNumber],
          ]} />
        </TabsContent>

        <TabsContent value="business" className="p-0 m-0">
          <DefList rows={[
            ["Business Name", app.business?.name ?? "—"],
            ["Business Category", app.business?.category ?? app.business?.type ?? "—"],
            ["Sub Category", app.business?.subCategory ?? "—"],
            ["Ownership Type", app.business?.ownership ?? "—"],
            ["Number of Employees", String(app.business?.employees ?? "—")],
            ["Annual Turnover (R)", app.business?.annualTurnover != null
              ? `R ${app.business.annualTurnover.toLocaleString("en-ZA")}`
              : "—"],
          ]} />
        </TabsContent>

        <TabsContent value="location" className="p-0 m-0">
          <DefList rows={[
            ["Address Line 1", app.location?.line1 ?? "—"],
            ["Address Line 2", app.location?.line2 ?? "—"],
            ["City", app.location?.city ?? "Cape Town"],
            ["Zone / Ward", app.location?.zone ?? "—"],
            ["Postal Code", app.location?.postalCode ?? "—"],
          ]} />
        </TabsContent>

        <TabsContent value="operations" className="p-0 m-0">
          <DefList rows={[
            ["Business Start Date", app.operations?.startDate
              ? new Date(app.operations.startDate).toLocaleDateString("en-GB")
              : "—"],
            ["Shop Area (sq ft)", app.operations?.shopAreaSqft != null
              ? `${app.operations.shopAreaSqft} sq ft`
              : "—"],
            ["Hazardous Activity", app.operations?.hazardous ? "Yes" : "No"],
          ]} />
        </TabsContent>

        <TabsContent value="documents" className="p-5 m-0 space-y-4">
          <DocumentsTab app={app} />
        </TabsContent>

        <TabsContent value="checklist" className="p-5 m-0">
          <ChecklistTab app={app} />
        </TabsContent>

        <TabsContent value="timeline" className="p-0 m-0">
          <TimelineTab app={app} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function PipelineStrip({ app }: { app: Application }) {
  const stages: { key: string; label: string; matches: StageId[] }[] = [
    { key: "doc", label: "Document Verifier", matches: ["submitted", "under_doc_verification"] },
    { key: "insp", label: "Field Inspector", matches: ["inspection_pending", "inspection_scheduled"] },
    { key: "appr", label: "Approver", matches: ["payment_pending", "paid", "issued"] },
  ];
  const order: StageId[] = ["submitted", "under_doc_verification", "inspection_pending", "inspection_scheduled", "payment_pending", "paid", "issued"];
  const currentIdx = order.indexOf(app.currentStageId);
  const stageOf = (s: { matches: StageId[] }) => Math.max(...s.matches.map((m) => order.indexOf(m)));

  return (
    <div className="flex items-center gap-2">
      {stages.map((s, i) => {
        const done = app.currentStageId === "rejected"
          ? false
          : currentIdx > stageOf(s);
        const active = s.matches.includes(app.currentStageId);
        const rejected = app.currentStageId === "rejected" && i === 1;
        return (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border flex-1",
                done && "bg-success-soft text-success border-success/30",
                active && "bg-primary/10 text-primary border-primary/30",
                rejected && "bg-danger-soft text-danger border-danger/30",
                !done && !active && !rejected && "bg-muted text-muted-foreground border-border",
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full grid place-items-center text-[10px] font-bold",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  rejected && "bg-danger text-danger-foreground",
                  !done && !active && !rejected && "bg-muted-foreground/20",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={cn("h-px flex-1 min-w-3", done ? "bg-success/40" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}


function DefList({ rows }: { rows: [string, string][] }) {
  return (
    <div>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className={cn(
            "grid grid-cols-2 gap-4 px-5 py-4 text-sm",
            i !== rows.length - 1 && "border-b",
          )}
        >
          <div className="text-muted-foreground">{k}</div>
          <div className="font-medium">{v}</div>
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ app }: { app: Application }) {
  const session = useSession()!;
  const canEdit =
    session.roleId === "document_verifier" && app.currentStageId === "under_doc_verification";
  const allVerified = app.documents.every((d) => d.status === "Verified");

  const gradients = [
    "from-info to-info/40",
    "from-info via-primary to-warning",
    "from-primary to-success",
  ];

  return (
    <div className="space-y-4">
      {allVerified && (
        <div className="flex items-center gap-2 bg-success-soft text-foreground border border-success/30 rounded-lg px-4 py-2.5 text-sm">
          <ShieldCheck className="size-4 text-success" />
          All documents verified
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {app.documents.map((d, i) => (
          <Card key={d.fieldId} className="overflow-hidden p-0">
            <div className={cn("h-1 bg-gradient-to-r", gradients[i % gradients.length])} />
            <div className="p-4">
              <div className="flex items-start gap-2">
                <FileText className="size-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.fileName}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <DocStatusPill status={d.status} />
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={d.status === "Verified" ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setDocumentStatus(app.id, d.fieldId, "Verified", undefined, session.name)}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        const reason = prompt("Rejection reason?");
                        if (reason) setDocumentStatus(app.id, d.fieldId, "Rejected", reason, session.name);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DocStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-muted text-muted-foreground",
    Verified: "bg-success-soft text-success",
    Rejected: "bg-danger-soft text-danger",
  };
  return (
    <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", map[status])}>
      {status}
    </span>
  );
}

function ChecklistTab({ app }: { app: Application }) {
  const items = [
    { id: "docs", label: "All mandatory documents verified", done: app.documents.every((d) => d.status === "Verified") },
    { id: "insp", label: "Field inspection completed", done: !!app.inspection?.report },
    { id: "pay", label: "Issuance fee paid", done: app.fees.issuance.status === "Paid" },
    { id: "lic", label: "License issued", done: !!app.licenseNumber },
  ];
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li
          key={i.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-md border",
            i.done ? "bg-success-soft/50 border-success/30" : "bg-surface border-border",
          )}
        >
          <div
            className={cn(
              "size-5 rounded-full grid place-items-center",
              i.done ? "bg-success text-success-foreground" : "bg-muted",
            )}
          >
            {i.done && <CheckCircle2 className="size-3.5" />}
          </div>
          <span className={cn("text-sm", i.done && "line-through text-muted-foreground")}>{i.label}</span>
        </li>
      ))}
    </ul>
  );
}

function TimelineTab({ app }: { app: Application }) {
  return (
    <div className="p-5 space-y-3">
      {app.history
        .slice()
        .reverse()
        .map((h, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="size-2.5 rounded-full bg-primary" />
              {i !== app.history.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <div className="pb-4 -mt-0.5">
              <div className="text-sm font-medium">{STAGE_LABELS[h.stageId]}</div>
              {h.note && <div className="text-sm text-muted-foreground mt-0.5">{h.note}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(h.at).toLocaleString()} · {h.by}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function ActionDock({
  app,
  byName,
  byRole,
}: {
  app: Application;
  byName: string;
  byRole: string;
}) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const action = pickAction(app, byRole);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-20">
        <Card className="p-0 overflow-hidden shadow-lg flex items-stretch min-w-[360px]">
          <div className="h-full w-1 bg-primary" />
          <div className="px-4 py-3 flex items-center gap-3 flex-1">
            <StageDot stage={app.currentStageId} />
            {action ? (
              <>
                <div className="ml-auto" />
                <Button
                  onClick={() => {
                    if (action.kind === "schedule") setScheduleOpen(true);
                    else if (action.kind === "report") setReportOpen(true);
                    else action.run();
                  }}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                      <XCircle className="mr-2 size-4 text-danger" /> Reject application
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <span className="text-sm text-muted-foreground ml-auto">
                {waitingMessage(app)}
              </span>
            )}
          </div>
        </Card>
      </div>

      <ScheduleDialog
        app={app}
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        byName={byName}
      />
      <ReportDialog
        app={app}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        byName={byName}
      />
      <RejectDialog app={app} open={rejectOpen} onClose={() => setRejectOpen(false)} byName={byName} />
    </>
  );
}

type DockAction =
  | { kind: "run"; label: string; icon: React.ReactNode; run: () => void }
  | { kind: "schedule"; label: string; icon: React.ReactNode }
  | { kind: "report"; label: string; icon: React.ReactNode };

function pickAction(app: Application, role: string): DockAction | null {
  if (role === "document_verifier") {
    if (app.currentStageId === "submitted")
      return {
        kind: "run",
        label: "Start Document Verification",
        icon: <ShieldCheck className="size-4" />,
        run: () => {
          startDocVerification(app.id, "Verifier");
          toast.success("Document verification started");
        },
      };
    if (app.currentStageId === "under_doc_verification") {
      const all = app.documents.every((d) => d.status === "Verified");
      return {
        kind: "run",
        label: "Verify Application",
        icon: <CheckCircle2 className="size-4" />,
        run: () => {
          if (!all) {
            toast.error("Mark all documents as Verified first");
            return;
          }
          verifyApplication(app.id, "Verifier");
          toast.success("Application forwarded for inspection");
        },
      };
    }
  }
  if (role === "field_inspector") {
    if (app.currentStageId === "inspection_pending")
      return { kind: "schedule", label: "Schedule Inspection", icon: <CalendarClock className="size-4" /> };
    if (app.currentStageId === "inspection_scheduled")
      return { kind: "report", label: "Complete Inspection", icon: <CheckCircle2 className="size-4" /> };
  }
  if (role === "approver") {
    if (app.currentStageId === "paid")
      return {
        kind: "run",
        label: "Issue License",
        icon: <Award className="size-4" />,
        run: () => {
          issueLicense(app.id, "Approver");
          toast.success("License issued");
        },
      };
  }
  return null;
}

function waitingMessage(app: Application) {
  if (app.currentStageId === "payment_pending") return "Waiting for citizen to pay.";
  if (app.currentStageId === "issued") return `License ${app.licenseNumber} issued.`;
  if (app.currentStageId === "rejected") return "Application rejected.";
  return "No actions available for your role.";
}

function ScheduleDialog({
  app,
  open,
  onClose,
  byName,
}: {
  app: Application;
  open: boolean;
  onClose: () => void;
  byName: string;
}) {
  const [date, setDate] = useState(new Date(Date.now() + 86_400_000).toISOString().slice(0, 10));
  const [slot, setSlot] = useState("10:00 – 12:00");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule inspection</DialogTitle>
          <DialogDescription>Set a date and time slot for the site visit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time slot</Label>
            <Input value={slot} onChange={(e) => setSlot(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              scheduleInspection(
                app.id,
                { scheduledAt: new Date(date).getTime(), slot, inspectorName: byName },
                byName,
              );
              toast.success("Inspection scheduled");
              onClose();
            }}
          >
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportDialog({
  app,
  open,
  onClose,
  byName,
}: {
  app: Application;
  open: boolean;
  onClose: () => void;
  byName: string;
}) {
  const [findings, setFindings] = useState("Site visit completed. Premises match the declared address. Signage in place.");
  const [rec, setRec] = useState<"pass" | "fail" | "conditional">("pass");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete inspection</DialogTitle>
          <DialogDescription>File the inspection report for {app.id}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Findings</Label>
            <Textarea rows={5} value={findings} onChange={(e) => setFindings(e.target.value)} />
          </div>
          <div>
            <Label>Recommendation</Label>
            <div className="flex gap-2 mt-1.5">
              {(["pass", "conditional", "fail"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRec(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md border capitalize",
                    rec === r ? "bg-primary text-primary-foreground border-primary" : "bg-surface",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              completeInspection(app.id, { findings, recommendation: rec }, byName);
              toast.success("Inspection report filed");
              onClose();
            }}
          >
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  app,
  open,
  onClose,
  byName,
}: {
  app: Application;
  open: boolean;
  onClose: () => void;
  byName: string;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject application</DialogTitle>
          <DialogDescription>This will end the workflow. A note is required.</DialogDescription>
        </DialogHeader>
        <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason…" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => {
              completeInspection(app.id, { findings: reason, recommendation: "fail" }, byName);
              toast.success("Application rejected");
              onClose();
            }}
          >
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
