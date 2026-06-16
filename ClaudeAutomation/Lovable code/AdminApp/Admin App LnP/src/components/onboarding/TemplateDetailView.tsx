import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Workflow,
  Users,
  FileText,
  Bell,
  Sliders,
  FormInput,
  UserCog,
  Tag,
  GitBranch,
  FileCheck,
  CreditCard,
  Clock,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServiceTemplate } from "@/data/serviceTemplates";
import { getServiceRoles } from "@/lib/serviceRoles";
import { TemplatePreviewEmbed } from "./TemplatePreviewEmbed";
import { AssignTemplateSheet } from "./AssignTemplateSheet";

interface Props {
  template: ServiceTemplate;
  onUseTemplate?: () => void;
  onBack: () => void;
}

const customizeChips = [
  { icon: FormInput, label: "Forms" },
  { icon: UserCog, label: "Roles" },
  { icon: Tag, label: "Fields" },
  { icon: GitBranch, label: "Workflow" },
  { icon: Bell, label: "Notifications" },
  { icon: FileCheck, label: "Documents" },
];

const TemplateDetailView: React.FC<Props> = ({ template, onUseTemplate, onBack }) => {
  const Icon = template.icon;
  const disabled = !!template.comingSoon;
  const roles = getServiceRoles(template.id);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);

  const stats = [
    { value: template.flows?.length ?? template.modules.length, label: "Flows", icon: Workflow },
    { value: roles.length, label: "Roles", icon: Users },
    { value: template.forms?.length ?? 0, label: "Forms", icon: FileText },
    { value: template.estimatedSetupTime, label: "Setup", icon: Clock },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back */}
          <Button variant="ghost" onClick={onBack} className="gap-1 mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Back to Templates
          </Button>

          {/* Hero: info left, live preview right */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 mb-12 items-start">
            {/* Left: info + CTAs */}
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center">
                <Icon className="h-8 w-8 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{template.name}</h1>
                  {disabled && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      Coming soon
                    </Badge>
                  )}
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">{template.description}</p>
              </div>

              {template.aka && template.aka.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Also called:</span>
                  {template.aka.map((a) => (
                    <span
                      key={a}
                      className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => setAssignSheetOpen(true)}
                >
                  <UserPlus className="h-4 w-4" /> Assign to teammate
                </Button>
                {onUseTemplate && (
                  <Button
                    onClick={onUseTemplate}
                    disabled={disabled}
                    size="lg"
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Use this template <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
                <Clock className="h-4 w-4" />
                <span>Setup time: {template.estimatedSetupTime}</span>
              </div>

              {/* At a glance stats — fills the left column height */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {stats.map((s) => {
                  const SIcon = s.icon;
                  return (
                    <Card key={s.label} className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <SIcon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-foreground leading-tight">{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Right: browser-frame with live preview */}
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden h-[640px] flex flex-col">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-4 h-10 bg-muted/50 border-b shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground truncate">
                  digitcertificates.gov / {template.name.toLowerCase().replace(/\s+/g, "-")}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                    Live Preview
                  </span>
                </div>
              </div>
              {/* Preview */}
              <div className="flex-1 overflow-hidden">
                <TemplatePreviewEmbed templateId={template.id} templateName={template.name} />
              </div>
              {/* Interactive hint */}
              <div className="px-4 py-2 border-t bg-muted/20 shrink-0">
                <p className="text-[10px] text-muted-foreground text-center">
                  Click through to navigate the app · Switch roles above to explore different views
                </p>
              </div>
            </div>
          </div>

          {/* How it works */}
          {template.howItWorks && template.howItWorks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                How it works
              </h2>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {template.howItWorks.map((step, i) => {
                  const SIcon = step.icon;
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex flex-col items-center gap-1.5 px-2 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center">
                          <SIcon className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{step.label}</span>
                      </div>
                      {i < template.howItWorks!.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Flows + Roles */}
          {(template.flows?.length || roles.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {template.flows && template.flows.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Flows
                    </h2>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Modify Flows</Button>
                  </div>
                  <div className="space-y-3">
                    {template.flows.map((flow) => (
                      <div key={flow.name}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-medium text-foreground">{flow.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {flow.steps.length} steps
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {flow.steps.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {roles.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Roles
                    </h2>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Add/Edit Roles</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((r) => (
                      <Tooltip key={r.id}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/15 cursor-help">
                            <Users className="h-3 w-3" />
                            {r.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{r.description}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Forms + Notifications */}
          {(template.forms?.length || template.notifications?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {template.forms && template.forms.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Forms
                    </h2>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Add/Edit Fields</Button>
                  </div>
                  <div className="space-y-3">
                    {template.forms.map((f) => (
                      <div key={f.name}>
                        <div className="text-sm font-medium text-foreground mb-1.5">{f.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {f.groups.map((g) => (
                            <span
                              key={g}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {template.notifications && template.notifications.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Notifications
                    </h2>
                    <Button variant="outline" size="sm" className="h-7 text-xs">Add/Edit Notifications</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.notifications.map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        <Bell className="h-3 w-3" />
                        {n}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Payments */}
          {template.payments && template.payments.length > 0 && (
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Payments
                  </h2>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">Edit Payment Logic</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.payments.map((p) => (
                  <div key={p.stage}>
                    <div className="text-sm font-medium text-foreground mb-1.5">{p.stage}</div>
                    <div className="flex flex-wrap gap-1">
                      {p.fees.map((f) => (
                        <span
                          key={f}
                          className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Customize */}
          <Card className="p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 mr-2">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Customize
                </span>
              </div>
              {customizeChips.map((c) => {
                const CIcon = c.icon;
                return (
                  <Tooltip key={c.label}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted text-foreground cursor-help">
                        <CIcon className="h-3 w-3" />
                        {c.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Editable in {c.label.toLowerCase()} settings</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <AssignTemplateSheet
        template={template}
        open={assignSheetOpen}
        onOpenChange={setAssignSheetOpen}
      />
    </TooltipProvider>
  );
};

export default TemplateDetailView;
