import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, FileText, Bell, Users, GitBranch } from "lucide-react";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";
import { ROLES_SEED } from "@/data/usersAccess";
import { DEFAULT_STAGES_BY_SERVICE } from "@/data/usersAccess";
import { cn } from "@/lib/utils";

const SERVICE_NAME_MAP: Record<string, string> = {
  "trade-license": "Trade License",
  "building-permits": "Building Permit",
  "fire-noc": "Fire NOC",
};

const ROLE_STAGE_MAP: Record<string, string[]> = {
  "Document Verifier": ["Document Verification"],
  "Field Inspector": ["Inspection"],
  "Approver": ["Approval"],
  "Counter Operator": ["Intake", "Payment"],
  "Viewer": ["All (read-only)"],
};

interface Props {
  templateId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function TemplatePreviewPanel({ templateId, open, onOpenChange }: Props) {
  const template = allTemplates.find((t) => t.id === templateId);
  if (!template) return null;

  const serviceName = SERVICE_NAME_MAP[template.id] || template.name;
  const stages = DEFAULT_STAGES_BY_SERVICE[serviceName] || template.flows?.[0]?.steps || [];
  const serviceRoles = ROLES_SEED.filter((r) => r.type === "service" && r.id !== "service_owner");
  const Icon = template.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{template.name}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Workflow Stages */}
          <Section title="Workflow Stages" icon={GitBranch}>
            <div className="flex flex-wrap items-center gap-1.5">
              {stages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium border border-border">
                    {stage}
                  </span>
                  {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
          </Section>

          <Separator />

          {/* Roles */}
          <Section title="Roles" icon={Users}>
            <div className="space-y-2">
              {serviceRoles.map((role) => {
                const stageLabels = ROLE_STAGE_MAP[role.name] || [];
                return (
                  <div key={role.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{role.description}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {stageLabels.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Separator />

          {/* Form Sections */}
          {template.forms && template.forms.length > 0 && (
            <>
              <Section title="Form Sections" icon={FileText}>
                <div className="space-y-2">
                  {template.forms.map((form) => (
                    <div key={form.name} className="rounded-md border border-border p-3">
                      <div className="text-sm font-medium mb-2">{form.name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {form.groups.map((g) => (
                          <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <Separator />
            </>
          )}

          {/* Notifications */}
          {template.notifications && template.notifications.length > 0 && (
            <Section title="Notification Triggers" icon={Bell}>
              <div className="space-y-1.5">
                {template.notifications.map((n) => (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {n}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className={cn("px-6 py-3 border-t border-border bg-muted/30 shrink-0")}>
          <p className="text-xs text-muted-foreground">
            All sections are customisable after selection. This preview shows the template defaults.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
