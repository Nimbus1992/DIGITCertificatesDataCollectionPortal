import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Rocket,
  Eye,
  Settings2,
  BarChart3,
  User,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { allTemplates } from "@/data/serviceTemplates";

const getTemplateName = (templateId: string): string => {
  return allTemplates.find((t) => t.id === templateId)?.name ?? "selected";
};

type Mode = "overview" | "configure" | "preview" | "operations" | "deployment";

interface Props {
  service: ServiceItem;
  isLive: boolean;
  onNavigate: (mode: Mode) => void;
}

const renewalLabel = (service: ServiceItem): string => {
  const rp = service.renewalPolicy;
  if (!rp) return "Not enabled";
  if (rp.mode === "global") return `${rp.globalMonths} Months (Global)`;
  if (rp.mode === "by_category") return "Category Based";
  if (rp.mode === "by_subcategory") return "Subcategory Based";
  return "Configured";
};

const ReadyBadge: React.FC<{ label?: string }> = ({ label = "Ready" }) => (
  <Badge
    variant="secondary"
    className="gap-1 font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent"
  >
    <CheckCircle2 className="h-3 w-3" /> {label}
  </Badge>
);

const ReadinessRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
    <div className="text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {value && <span className="text-muted-foreground">: {value}</span>}
    </div>
  </div>
);

const OverviewWorkspace: React.FC<Props> = ({ service, isLive, onNavigate }) => {
  const navigate = useNavigate();
  const { setActiveService } = useOnboarding();

  const modules = service.customModules ?? [];
  const categories = service.templateSetup?.categoriesList ?? [];

  const summarize = (items: string[], max = 4) => {
    if (!items.length) return "None";
    if (items.length <= max) return items.join(", ");
    return `${items.slice(0, max).join(", ")} +${items.length - max} more`;
  };

  const handleGoLive = () => {
    setActiveService(service.id);
    navigate("/go-live");
  };

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8 space-y-8 flex-1 min-h-0 overflow-auto">
      {/* HERO */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <CardContent className="p-7 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ReadyBadge label={isLive ? "Live" : "Ready for Launch"} />
            {isLive && (service as any).liveUrl && (
              <a
                href={(service as any).liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent hover:underline inline-flex items-center gap-1"
              >
                {(service as any).liveUrl} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">{service.name}</h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              This service has been generated successfully from the{" "}
              <span className="text-foreground font-medium">{getTemplateName(service.templateId)}</span> template. You can
              publish it immediately using default configurations or review and customize it before
              going live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!isLive && (
              <Button onClick={handleGoLive} className="gap-1.5">
                <Rocket className="h-4 w-4" /> Go Live
              </Button>
            )}
            <Button variant="secondary" onClick={() => onNavigate("preview")} className="gap-1.5">
              <Eye className="h-4 w-4" /> Preview Experience
            </Button>
            {!isLive && (
              <Button variant="ghost" onClick={() => onNavigate("configure")} className="gap-1.5">
                <Settings2 className="h-4 w-4" /> Customize Service
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SERVICE READINESS */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Service Readiness
        </h3>
        <Card>
          <CardContent className="p-5 divide-y divide-border/60">
            <div className="pb-1">
              <ReadinessRow label="License Types Generated" value={summarize(modules)} />
            </div>
            <div className="py-1">
              <ReadinessRow label="Business Categories Configured" value={summarize(categories)} />
            </div>
            <div className="py-1">
              <ReadinessRow label="Citizen Portal Generated" />
            </div>
            <div className="py-1">
              <ReadinessRow label="Employee Workspace Generated" />
            </div>
            <div className="pt-1">
              <ReadinessRow label="Renewal Policy Configured" value={renewalLabel(service)} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* GENERATED EXPERIENCES */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Generated Experiences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <ReadyBadge />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Citizen Portal</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Applicants can apply, pay fees, track status, and download licenses.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-accent" />
                </div>
                <ReadyBadge />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Employee Workspace</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Officials can review applications, process approvals, and issue licenses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NEXT ACTIONS */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          What would you like to do next?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
            onClick={() => onNavigate("preview")}
          >
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Preview Experience</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Review citizen and employee journeys generated from the template.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
            onClick={() => onNavigate("configure")}
          >
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Customize Service</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Modify forms, workflows, notifications, payments, roles, and SLA rules.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-dashed ${isLive ? "hover:shadow-md hover:border-accent/40 transition-all cursor-pointer" : "opacity-60"}`}
            onClick={() => isLive && onNavigate("operations")}
          >
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Monitor &amp; Manage</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {isLive
                    ? "Track applications, SLA performance, and manage deployment."
                    : "Available after the service goes live."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default OverviewWorkspace;
