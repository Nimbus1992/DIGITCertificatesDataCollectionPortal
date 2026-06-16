import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, FileText, GitBranch, Bell, Wallet, ShieldCheck, ListChecks, Files, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfigActivity } from "./AuditContext";
import { EnvBadge, ModuleBadge, RelativeTime, JsonPanel, EmptyState, LoadMore } from "./shared";

const moduleIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Forms: FileText,
  Workflow: GitBranch,
  Roles: ShieldCheck,
  Notifications: Bell,
  Payments: Wallet,
  Checklists: ListChecks,
  Documents: Files,
};

export const ConfigActivityTab: React.FC = () => {
  const events = useConfigActivity();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(20);
  const navigate = useNavigate();

  if (events.length === 0) return <EmptyState />;
  const visible = events.slice(0, shown);

  return (
    <div className="space-y-2">
      {visible.map((e) => {
        const isOpen = !!open[e.id];
        const Icon = moduleIcon[e.module] ?? FileText;
        return (
          <div key={e.id} className="rounded-lg border bg-card overflow-hidden">
            <button
              onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
              className={cn(
                "group w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors",
                isOpen && "bg-muted/30 border-b",
              )}
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{e.serviceName}</span>
                  <ModuleBadge module={e.module} />
                  <EnvBadge env={e.environment} />
                  <span className="text-[11px] font-mono text-muted-foreground">{e.version}</span>
                </div>
                <p className="text-sm text-foreground mt-1">{e.summary}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="text-foreground/80 font-medium">{e.actor}</span>
                  <span className="text-border">·</span>
                  <RelativeTime ts={e.timestamp} />
                  <span className="text-border">·</span>
                  <span className="font-mono text-[11px]">{e.id}</span>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary opacity-0 transition-opacity",
                  "group-hover:opacity-100",
                  isOpen && "opacity-100",
                )}
              >
                {isOpen ? "Hide" : "View details"}
                <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
              </span>
            </button>

            {isOpen && (
              <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <JsonPanel label="Before" value={e.before} tone="before" />
                  <JsonPanel label="After" value={e.after} tone="after" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Meta label="Affected" value={e.affected.join(", ")} />
                  <Meta label="Version" value={<span className="font-mono">{e.version}</span>} />
                  <Meta label="Published by" value={e.publishedBy || "—"} />
                  <Meta label="Notes" value={e.notes || "—"} />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/service/${e.serviceId}/configure`)}
                  >
                    Open Service Configuration <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <LoadMore shown={Math.min(shown, events.length)} total={events.length} onMore={() => setShown((s) => s + 20)} />
    </div>
  );
};

const Meta: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-foreground mt-0.5">{value}</div>
  </div>
);
