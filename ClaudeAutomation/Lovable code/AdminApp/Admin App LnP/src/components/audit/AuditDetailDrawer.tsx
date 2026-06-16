import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UnifiedEvent } from "./AuditContext";
import { CategoryBadge, EnvBadge, JsonPanel, RelativeTime, StatusToneBadge } from "./shared";

export const AuditDetailDrawer: React.FC<{
  event: UnifiedEvent | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}> = ({ event, open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 overflow-y-auto">
        {event && (
          <div>
            <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={event.category} />
                <StatusToneBadge tone={event.statusTone} label={event.statusLabel} />
                {event.environment && <EnvBadge env={event.environment} />}
              </div>
              <SheetTitle className="text-base font-semibold leading-snug pr-6 text-left">
                {event.action}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] text-muted-foreground">{event.id}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(event.id);
                    toast.success("Audit ID copied");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
            </SheetHeader>

            <div className="px-6 py-5 space-y-5">
              {/* Summary grid */}
              <Section title="Summary">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Meta label="When">
                    <RelativeTime ts={event.timestamp} stacked />
                  </Meta>
                  <Meta label="Actor">{event.actor}</Meta>
                  <Meta label="Entity">{event.entity}</Meta>
                  <Meta label="Service(s)">{event.services.length ? event.services.join(", ") : "—"}</Meta>
                </div>
              </Section>

              {/* Domain-specific */}
              {event.raw.kind === "governance" && (
                <Section title="Governance details">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Meta label="Scope">{event.raw.data.scope}</Meta>
                    <Meta label="Category">{event.raw.data.category}</Meta>
                    <Meta label="IP address" mono>{event.raw.data.ip}</Meta>
                    <Meta label="Result">{event.raw.data.result}</Meta>
                  </div>
                  {event.raw.data.related.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Related events
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {event.raw.data.related.map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center h-6 px-2 rounded-md border bg-muted/40 font-mono text-[11px] text-foreground/80"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <BeforeAfter before={event.raw.data.before} after={event.raw.data.after} />
                </Section>
              )}

              {event.raw.kind === "config" && (
                <Section title="Configuration change">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Meta label="Module">{event.raw.data.module}</Meta>
                    <Meta label="Version">{event.raw.data.version}</Meta>
                    <Meta label="Published by">{event.raw.data.publishedBy || "—"}</Meta>
                    <Meta label="Affected">{event.raw.data.affected.join(", ") || "—"}</Meta>
                  </div>
                  {event.raw.data.notes && (
                    <div className="mt-3 rounded-md border bg-muted/30 p-3 text-xs text-foreground/80">
                      {event.raw.data.notes}
                    </div>
                  )}
                  <BeforeAfter before={event.raw.data.before} after={event.raw.data.after} />
                </Section>
              )}

              {event.raw.kind === "deployment" && (
                <Section title="Deployment">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Meta label="Version">{event.raw.data.version}</Meta>
                    <Meta label="Duration">{event.raw.data.durationSec}s</Meta>
                    <Meta label="Runtime health">{event.raw.data.runtimeHealth}</Meta>
                    <Meta label="Changed">{event.raw.data.changedModules.join(", ")}</Meta>
                  </div>
                  {event.raw.data.notes.length > 0 && (
                    <List title="Release notes" items={event.raw.data.notes} />
                  )}
                  {event.raw.data.warnings.length > 0 && (
                    <List title="Warnings" items={event.raw.data.warnings} tone="warning" />
                  )}
                </Section>
              )}

              {event.raw.kind === "runtime" && (
                <Section title="Runtime activity">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Meta label="Application" mono>{event.raw.data.applicationId}</Meta>
                    <Meta label="Applicant">{event.raw.data.applicant}</Meta>
                    <Meta label="Stage">{event.raw.data.stage}</Meta>
                    <Meta label="Event type">{event.raw.data.eventType.replace(/_/g, " ")}</Meta>
                  </div>
                  {event.raw.data.documents.length > 0 && (
                    <List title="Documents" items={event.raw.data.documents} />
                  )}
                  {event.raw.data.payments.length > 0 && (
                    <List title="Payments" items={event.raw.data.payments} />
                  )}
                  {event.raw.data.notifications.length > 0 && (
                    <List title="Notifications" items={event.raw.data.notifications} />
                  )}
                </Section>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(event.raw.data, null, 2));
                    toast.success("Event JSON copied");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy raw JSON
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled>
                  Open source <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
    {children}
  </div>
);

const Meta: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
    <div className={cn("text-sm text-foreground truncate", mono && "font-mono text-xs")}>{children}</div>
  </div>
);

const List: React.FC<{ title: string; items: string[]; tone?: "warning" }> = ({ title, items, tone }) => (
  <div className="mt-3">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{title}</div>
    <ul className="space-y-1">
      {items.map((it, i) => (
        <li
          key={i}
          className={cn(
            "text-xs rounded-md border px-2.5 py-1.5",
            tone === "warning"
              ? "border-warning/30 bg-warning/5 text-foreground"
              : "border-border bg-muted/30 text-foreground/80",
          )}
        >
          {it}
        </li>
      ))}
    </ul>
  </div>
);

const BeforeAfter: React.FC<{ before: unknown; after: unknown }> = ({ before, after }) => {
  if (before == null && after == null) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      <JsonPanel label="Before" value={before} tone="before" />
      <JsonPanel label="After" value={after} tone="after" />
    </div>
  );
};
