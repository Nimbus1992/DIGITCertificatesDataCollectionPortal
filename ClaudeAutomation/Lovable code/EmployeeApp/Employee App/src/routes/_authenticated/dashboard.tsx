import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  Building2,
  CalendarRange,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, useStore, STAGE_LABELS, STAGE_TONE } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/users";
import { StageDot } from "@/components/op/StageDot";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type ServiceMeta = {
  id: "business_license" | "building_permit" | "event_permit";
  label: string;
  icon: typeof Store;
  comingSoon?: boolean;
};

const SERVICES: ServiceMeta[] = [
  { id: "business_license", label: "Business License", icon: Store },
  { id: "building_permit", label: "Building Permit", icon: Building2, comingSoon: true },
  { id: "event_permit", label: "Event Permit", icon: CalendarRange, comingSoon: true },
];

function getWeekRange(now = new Date()): { start: number; end: number } {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun..6=Sat
  const daysSinceMon = (dow + 6) % 7;
  d.setDate(d.getDate() - daysSinceMon);
  const start = d.getTime();
  return { start, end: start + 7 * 86_400_000 };
}

function Dashboard() {
  const session = useSession()!;
  const apps = useStore((s) => s.applications);

  const { start, end } = getWeekRange();
  const inWeek = (t: number) => t >= start && t < end;

  const weekApps = apps.filter((a) => inWeek(a.createdAt));
  const approvedThisWeek = weekApps.filter((a) => a.currentStageId === "issued");
  const rejectedThisWeek = weekApps.filter((a) => a.currentStageId === "rejected");
  const pendingThisWeek = weekApps.filter(
    (a) => a.currentStageId !== "issued" && a.currentStageId !== "rejected",
  );

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          {ROLE_LABELS[session.roleId]}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Licenses &amp; Permits</h1>
        <p className="text-muted-foreground mt-1">Review and process applications across services</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Applications" sublabel="This week" value={weekApps.length} icon={FileText} tone="info" />
        <MetricCard label="Pending Review" sublabel="This week" value={pendingThisWeek.length} icon={Clock} tone="warning" />
        <MetricCard label="Approved" sublabel="This week" value={approvedThisWeek.length} icon={CheckCircle2} tone="success" />
        <MetricCard label="Rejected" sublabel="This week" value={rejectedThisWeek.length} icon={XCircle} tone="danger" />
      </section>

      <section>
        <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
          Services
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => {
            const queue = apps.filter(
              (a) => a.serviceId === s.id && queueStagesFor(session.roleId).includes(a.currentStageId),
            );
            const active = !s.comingSoon && queue.length > 0;
            return (
              <Card
                key={s.id}
                className={cn(
                  "p-4 transition-shadow relative",
                  s.comingSoon ? "opacity-60" : active ? "ring-1 ring-primary/30 shadow-sm" : "opacity-90",
                )}
              >
                {s.comingSoon && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-muted text-muted-foreground border">
                    Coming soon
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-surface-muted grid place-items-center text-muted-foreground">
                    <s.icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.comingSoon
                        ? "Not yet available"
                        : queue.length === 0
                        ? "No pending items"
                        : `${queue.length} pending review`}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {s.comingSoon ? (
                    <Button className="flex-1" variant="secondary" disabled aria-disabled="true">
                      Inbox · 0
                    </Button>
                  ) : (
                    <Button asChild className="flex-1" variant={active ? "default" : "secondary"} disabled={!active}>
                      <Link to="/inbox">Inbox · {queue.length}</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="icon" className="shrink-0" title="Open reports">
                    <Link to="/reports"><BarChart2 className="size-4" /></Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Recent Activity
          </div>
          <Link to="/inbox" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            View inbox <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground bg-surface-muted border-b font-semibold">
            <div>Application ID</div>
            <div>Applicant</div>
            <div>Service</div>
            <div>Status</div>
            <div>Last Updated</div>
            <div className="text-right">Action</div>
          </div>
          {apps.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No applications yet.</div>
          ) : (
            apps
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center border-b last:border-0 hover:bg-surface-muted/60 transition-colors"
                >
                  <div className="font-mono text-xs">{a.id}</div>
                  <div className="text-sm">{a.applicantName}</div>
                  <div className="text-sm">{a.serviceLabel}</div>
                  <div>
                    <StageDot stage={a.currentStageId} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(a.updatedAt).toLocaleDateString("en-GB")}
                  </div>
                  <div className="text-right">
                    <Link to="/inbox/$appId" params={{ appId: a.id }} className="text-sm text-primary hover:underline">
                      Review
                    </Link>
                  </div>
                </div>
              ))
          )}
        </Card>
      </section>
    </div>
  );
}

function queueStagesFor(role: string) {
  if (role === "document_verifier") return ["submitted", "under_doc_verification"];
  if (role === "field_inspector") return ["inspection_pending", "inspection_scheduled"];
  if (role === "approver") return ["payment_pending", "paid"];
  return [];
}

function MetricCard({
  label,
  sublabel,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  sublabel?: string;
  value: number;
  icon: typeof Store;
  tone: "info" | "warning" | "success" | "danger";
}) {
  const toneClass = {
    info: "text-info",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {sublabel && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{sublabel}</div>}
        </div>
        <Icon className={cn("size-4", toneClass)} />
      </div>
      <div className="text-4xl font-bold mt-3">{value}</div>
    </Card>
  );
}
