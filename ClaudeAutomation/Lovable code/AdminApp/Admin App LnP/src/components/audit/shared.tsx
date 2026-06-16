import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2, FileSearch, Shield, Settings2, Rocket, Activity } from "lucide-react";
import type { Result, Environment, DeploymentStatus, RuntimeStatus } from "@/data/auditLogs";
import type { AuditCategory, StatusTone } from "./AuditContext";

export const ResultBadge: React.FC<{ result: Result; className?: string }> = ({ result, className }) => {
  const map: Record<Result, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
    success: { label: "Success", cls: "bg-success/10 text-success border-success/20", Icon: CheckCircle2 },
    warning: { label: "Warning", cls: "bg-warning/10 text-warning border-warning/20", Icon: AlertTriangle },
    failed: { label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: XCircle },
  };
  const { label, cls, Icon } = map[result];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cls, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export const EnvBadge: React.FC<{ env: Environment; className?: string }> = ({ env, className }) => {
  const label = env === "production" ? "Production" : env === "staging" ? "Staging" : "Sandbox";
  const dot =
    env === "production"
      ? "bg-foreground/60"
      : env === "staging"
      ? "bg-warning"
      : "bg-muted-foreground/50";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted/40",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </Badge>
  );
};

export const DeploymentStatusBadge: React.FC<{ status: DeploymentStatus }> = ({ status }) => {
  const map: Record<DeploymentStatus, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-muted text-muted-foreground border-border" },
    published: { label: "Published", cls: "bg-success/10 text-success border-success/20" },
    failed: { label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/20" },
    rolled_back: { label: "Rolled Back", cls: "bg-warning/10 text-warning border-warning/20" },
  };
  const { label, cls } = map[status];
  return (
    <Badge variant="outline" className={cn("font-medium", cls)}>
      {label}
    </Badge>
  );
};

export const RuntimeStatusBadge: React.FC<{ status: RuntimeStatus }> = ({ status }) => {
  const map: Record<RuntimeStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> =
    {
      approved: { label: "Approved", cls: "bg-success/10 text-success border-success/20", Icon: CheckCircle2 },
      sent_back: { label: "Sent Back", cls: "bg-warning/10 text-warning border-warning/20", Icon: AlertTriangle },
      rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: XCircle },
      pending: { label: "Pending", cls: "bg-muted text-muted-foreground border-border", Icon: Clock },
      in_progress: { label: "In Progress", cls: "bg-primary/10 text-primary border-primary/20", Icon: Loader2 },
    };
  const { label, cls, Icon } = map[status];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", cls)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export const ModuleBadge: React.FC<{ module: string }> = ({ module }) => (
  <Badge variant="secondary" className="font-medium">
    {module}
  </Badge>
);

const CATEGORY_META: Record<AuditCategory, { label: string; Icon: React.ComponentType<{ className?: string }>; dot: string; text: string }> = {
  governance: { label: "Governance", Icon: Shield, dot: "bg-primary", text: "text-foreground/80" },
  config: { label: "Config", Icon: Settings2, dot: "bg-accent", text: "text-foreground/80" },
  deployment: { label: "Deployment", Icon: Rocket, dot: "bg-foreground/70", text: "text-foreground/80" },
  runtime: { label: "Runtime", Icon: Activity, dot: "bg-warning", text: "text-foreground/80" },
};

export const CategoryBadge: React.FC<{ category: AuditCategory; className?: string }> = ({ category, className }) => {
  const { label, Icon, dot, text } = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border/80 bg-muted/40 text-[11px] font-medium",
        text,
        className,
      )}
    >
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
};

export const StatusToneBadge: React.FC<{ tone: StatusTone; label: string; className?: string }> = ({
  tone,
  label,
  className,
}) => {
  const cls =
    tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : tone === "warning"
      ? "bg-warning/10 text-warning border-warning/20"
      : tone === "failed"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : tone === "info"
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-medium", cls, className)}>
      {label}
    </Badge>
  );
};

export const JsonPanel: React.FC<{ label: string; value: unknown; tone?: "before" | "after" | "neutral" }> = ({
  label,
  value,
  tone = "neutral",
}) => {
  const toneCls =
    tone === "before"
      ? "border-l-2 border-l-muted-foreground/40"
      : tone === "after"
      ? "border-l-2 border-l-primary"
      : "border-l-2 border-l-border";
  return (
    <div className={cn("rounded-md bg-muted/60 p-3", toneCls)}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-all">
        {value === null ? "null" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

function relLabel(ts: string) {
  const date = new Date(ts);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 60 / 24)}d ago`;
}

export const RelativeTime: React.FC<{ ts: string; className?: string; stacked?: boolean }> = ({
  ts,
  className,
  stacked,
}) => {
  const date = new Date(ts);
  const rel = relLabel(ts);
  const abs = date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  if (stacked) {
    return (
      <span className={cn("inline-flex flex-col leading-tight", className)} title={date.toLocaleString()}>
        <span className="text-sm font-medium text-foreground/90">{rel}</span>
        <span className="text-[11px] text-muted-foreground">{abs}</span>
      </span>
    );
  }
  return (
    <span className={cn("text-xs text-muted-foreground", className)} title={date.toLocaleString()}>
      <span className="text-foreground/80 font-medium">{rel}</span>
      <span className="mx-1.5 text-border">·</span>
      <span>{abs}</span>
    </span>
  );
};

export const EmptyState: React.FC<{ title?: string; hint?: string }> = ({
  title = "No matching records",
  hint = "Try adjusting filters or clearing the search.",
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
      <FileSearch className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
  </div>
);

export const LoadMore: React.FC<{ shown: number; total: number; onMore: () => void }> = ({ shown, total, onMore }) =>
  shown < total ? (
    <div className="flex items-center justify-center pt-4">
      <button
        onClick={onMore}
        className="text-xs font-medium text-primary hover:underline"
      >
        Load {Math.min(20, total - shown)} more · {shown}/{total}
      </button>
    </div>
  ) : (
    <div className="text-center pt-4 text-[11px] text-muted-foreground">All {total} records loaded</div>
  );
