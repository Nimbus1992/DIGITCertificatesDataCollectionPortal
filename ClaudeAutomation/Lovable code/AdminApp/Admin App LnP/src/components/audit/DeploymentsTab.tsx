import React, { useState } from "react";
import { ChevronDown, Rocket, RotateCcw, GitCompare, ArrowUpRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDeployments } from "./AuditContext";
import { DeploymentStatusBadge, EnvBadge, RelativeTime, EmptyState, LoadMore } from "./shared";

export const DeploymentsTab: React.FC = () => {
  const releases = useDeployments();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [shown, setShown] = useState(20);

  if (releases.length === 0) return <EmptyState />;
  const visible = releases.slice(0, shown);

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
      <div className="space-y-3">
        {visible.map((r) => {
          const isOpen = !!open[r.id];
          return (
            <div key={r.id} className="relative">
              <div
                className={cn(
                  "absolute -left-[14px] top-4 h-3 w-3 rounded-full border-2 border-background",
                  r.status === "published"
                    ? "bg-success"
                    : r.status === "failed"
                    ? "bg-destructive"
                    : r.status === "rolled_back"
                    ? "bg-warning"
                    : "bg-muted-foreground",
                )}
              />
              <div
                className={cn(
                  "rounded-lg border bg-card overflow-hidden",
                  r.status === "failed" && "border-l-2 border-l-destructive",
                  r.status === "rolled_back" && "border-l-2 border-l-warning",
                )}
              >
                <button
                  onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                  className={cn("group w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors", isOpen && "bg-muted/30 border-b")}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground font-mono">{r.version}</span>
                        <span className="text-sm text-foreground/90">· {r.serviceName}</span>
                        <DeploymentStatusBadge status={r.status} />
                        <EnvBadge env={r.environment} />
                        {r.warnings.length > 0 && (
                          <Badge variant="outline" className="gap-1 bg-warning/10 text-warning border-warning/20">
                            <AlertTriangle className="h-3 w-3" />
                            {r.warnings.length} warning{r.warnings.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="text-foreground/80 font-medium">{r.publishedBy}</span>
                        <span className="text-border">·</span>
                        <RelativeTime ts={r.timestamp} />
                        <span className="text-border">·</span>
                        <span>{r.changedModules.length} module{r.changedModules.length !== 1 ? "s" : ""} changed</span>
                        {r.durationSec > 0 && (
                          <>
                            <span className="text-border">·</span>
                            <span>{r.durationSec}s</span>
                          </>
                        )}
                        <span className="text-border">·</span>
                        <span className="font-mono text-[11px]">{r.id}</span>
                      </div>
                      {r.notes.length > 0 && (
                        <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                          {r.notes.map((n, i) => (
                            <li key={i}>• {n}</li>
                          ))}
                        </ul>
                      )}
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
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <Meta label="Impacted services" value={r.impactedServices.join(", ")} />
                      <Meta label="Changed modules" value={r.changedModules.join(", ")} />
                      <Meta label="Duration" value={r.durationSec ? `${r.durationSec}s` : "—"} />
                      <Meta
                        label="Runtime health"
                        value={
                          <span
                            className={cn(
                              "font-medium",
                              r.runtimeHealth === "healthy" && "text-success",
                              r.runtimeHealth === "degraded" && "text-warning",
                              r.runtimeHealth === "down" && "text-destructive",
                            )}
                          >
                            {r.runtimeHealth}
                          </span>
                        }
                      />
                    </div>
                    {r.warnings.length > 0 && (
                      <div className="rounded-md bg-warning/10 border border-warning/20 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-warning mb-1">
                          Validation warnings
                        </div>
                        <ul className="text-xs text-foreground space-y-0.5">
                          {r.warnings.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <GitCompare className="h-3.5 w-3.5" /> Compare Versions
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        View Changes
                      </Button>
                      {r.status === "published" && (
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" /> Rollback
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Open Details <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <LoadMore shown={Math.min(shown, releases.length)} total={releases.length} onMore={() => setShown((s) => s + 20)} />
    </div>
  );
};

const Meta: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-foreground mt-0.5">{value}</div>
  </div>
);
