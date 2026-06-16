import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, FileText, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useSession, useStore } from "@/lib/store";
import { StageDot } from "@/components/op/StageDot";
import { SlaBadge } from "@/components/op/SlaBadge";
import { getSlaStatus } from "@/lib/sla";
import { ROLE_LABELS } from "@/lib/users";
import type { StageId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inbox/")({
  component: InboxPage,
});

function queueStagesFor(role: string): StageId[] {
  if (role === "document_verifier") return ["submitted", "under_doc_verification"];
  if (role === "field_inspector") return ["inspection_pending", "inspection_scheduled"];
  if (role === "approver") return ["payment_pending", "paid"];
  return [];
}

function InboxPage() {
  const session = useSession()!;
  const apps = useStore((s) => s.applications);
  const queue = apps.filter((a) => queueStagesFor(session.roleId).includes(a.currentStageId));

  const counts = queue.reduce(
    (acc, a) => {
      const { status } = getSlaStatus(a);
      acc[status]++;
      return acc;
    },
    { ontrack: 0, atrisk: 0, breached: 0 } as Record<string, number>,
  );

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Inbox</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <span className="text-xs font-medium bg-warning-soft text-warning-foreground px-2.5 py-1 rounded-full">
            {queue.length} application{queue.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground border rounded-md px-3 py-1.5 bg-surface">
          <Filter className="size-3.5" />
          Showing: {ROLE_LABELS[session.roleId]} queue
        </div>
      </div>

      {/* Pipeline banner */}
      <Card className="p-4 flex items-start gap-3 bg-surface-muted/40">
        <Workflow className="size-4 mt-0.5 text-primary" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          Each application flows through three roles in sequence:{" "}
          <RoleChip active={session.roleId === "document_verifier"} label="Document Verifier" />{" "}
          <span className="text-muted-foreground/60">→</span>{" "}
          <RoleChip active={session.roleId === "field_inspector"} label="Field Inspector" />{" "}
          <span className="text-muted-foreground/60">→</span>{" "}
          <RoleChip active={session.roleId === "approver"} label="Approver" />.{" "}
          You're seeing the items currently at your stage.
        </div>
      </Card>

      {/* SLA summary chips */}
      <div className="flex items-center gap-2">
        <SlaChip tone="success" label="On track" value={counts.ontrack} />
        <SlaChip tone="warning" label="At risk" value={counts.atrisk} />
        <SlaChip tone="danger" label="Breached" value={counts.breached} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.6fr_0.7fr_1.2fr_1fr_1fr_0.8fr] gap-4 px-5 py-3.5 text-sm font-semibold bg-surface-muted border-b">
          <div>Application Number</div>
          <div>Type</div>
          <div>Business</div>
          <div>Stage</div>
          <div>SLA</div>
          <div>Submitted</div>
        </div>
        {queue.length === 0 ? (
          <div className="p-14 text-center">
            <FileText className="size-8 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground">Your queue is empty.</div>
          </div>
        ) : (
          queue.map((a) => (
            <Link
              key={a.id}
              to="/inbox/$appId"
              params={{ appId: a.id }}
              className="grid grid-cols-[1.6fr_0.7fr_1.2fr_1fr_1fr_0.8fr] gap-4 px-5 py-4 items-center border-b last:border-0 hover:bg-surface-muted/60 transition-colors"
            >
              <div className="font-mono text-xs font-semibold">{a.id}</div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase bg-info-soft text-info px-2 py-0.5 rounded">
                  <FileText className="size-3" /> NEW
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">{a.business?.name ?? "—"}</div>
              <div><StageDot stage={a.currentStageId} /></div>
              <div><SlaBadge app={a} /></div>
              <div className="text-sm text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString("en-GB")}
              </div>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
}

function RoleChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-semibold px-2 py-0.5 rounded",
        active
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function SlaChip({
  tone,
  label,
  value,
}: {
  tone: "success" | "warning" | "danger";
  label: string;
  value: number;
}) {
  const bg =
    tone === "success" ? "bg-success-soft text-success"
    : tone === "warning" ? "bg-warning-soft text-warning"
    : "bg-danger-soft text-danger";
  const dot =
    tone === "success" ? "bg-success"
    : tone === "warning" ? "bg-warning"
    : "bg-danger";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", bg)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label} · <span className="font-bold">{value}</span>
    </span>
  );
}
