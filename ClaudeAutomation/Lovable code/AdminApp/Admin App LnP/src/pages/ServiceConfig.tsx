import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Rocket, Check, AlertCircle, Settings2 } from "lucide-react";
import { defaultModules, configTiles } from "@/data/serviceModules";
import RolesDesigner from "@/components/service-config/RolesDesigner";
import NotificationsManager from "@/components/service-config/NotificationsManager";
import ChecklistBuilder from "@/components/service-config/ChecklistBuilder";
import FormBuilder from "@/components/service-config/FormBuilder";
import DocumentDesigner from "@/components/service-config/DocumentDesigner";
import WorkflowDesigner from "@/components/service-config/WorkflowDesigner";
import FeesConfigurator from "@/components/service-config/FeesConfigurator";
import PaymentsConfigurator from "@/components/service-config/PaymentsConfigurator";
import { ServicePreviewWorkspace } from "@/components/preview/ServicePreview";
import MasterTemplateConfigurator from "@/components/service-config/MasterTemplateConfigurator";
import ModuleTabs from "@/components/service-config/ModuleTabs";
import OverviewWorkspace from "@/components/service-config/OverviewWorkspace";
import { ServiceConfigProvider } from "@/contexts/ServiceConfigContext";
import { OperationsWorkspace } from "@/components/operations/OperationsWorkspace";

const deploymentSections: { title: string; description: string }[] = [
  { title: "Production Status", description: "Real-time health, uptime, and recent incidents." },
  { title: "Active Modules", description: "Modules currently serving live traffic." },
  { title: "Published Versions", description: "Released versions and rollback history." },
  { title: "Operational Settings", description: "Runtime configuration for the live service." },
  { title: "Monitoring", description: "Metrics, alerts, and performance signals." },
  { title: "Integrations", description: "Connected systems and outbound services." },
  { title: "Audit Logs", description: "Activity trail across operators and applicants." },
  { title: "Environment Management", description: "Manage staging, production, and secrets." },
];

const DeploymentWorkspace: React.FC<{ serviceUrl?: string }> = ({ serviceUrl }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-xl font-semibold text-foreground">Manage</h2>
      <p className="text-sm text-muted-foreground mt-1">Operate and manage your live service.</p>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      <span className="font-medium text-foreground">Live</span>
      {serviceUrl && (
        <a href={serviceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline ml-2">
          {serviceUrl}
        </a>
      )}
    </div>
    <div className="border-t border-border/60">
      {deploymentSections.map((s) => (
        <div key={s.title} className="flex items-center justify-between py-4 border-b border-border/60">
          <div>
            <h3 className="text-sm font-medium text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Coming soon</span>
        </div>
      ))}
    </div>
  </div>
);

const ServiceConfigInner: React.FC = () => {
  const { id } = useParams();
  const { state, updateService, setActiveService } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = (location.state as { mode?: "overview" | "configure" | "preview" | "operations" | "deployment" } | null)?.mode ?? "overview";
  const [mode, setMode] = useState<"overview" | "configure" | "preview" | "operations" | "deployment">(initialMode);
  const [setupOpen, setSetupOpen] = useState(false);

  // Honor inbound navigation state changes (e.g. clicking Configure from Preview top bar).
  useEffect(() => {
    const next = (location.state as { mode?: "overview" | "configure" | "preview" | "operations" | "deployment" } | null)?.mode;
    if (next && next !== mode) {
      setMode(next);
      setActiveTile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  useEffect(() => {
    if (id && state.activeServiceId !== id) setActiveService(id);
  }, [id, state.activeServiceId, setActiveService]);

  // Find the active service from the services array
  const service = state.services.find((s) => s.id === id);
  const serviceName = service?.name || state.serviceName || "Application Configuration";

  // Derive modules from the service's customModules, falling back to defaultModules
  const modules: { id: string; name: string }[] =
    service?.customModules && service.customModules.length > 0
      ? service.customModules.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }))
      : defaultModules;

  const [activeTile, setActiveTile] = useState<string | null>(null);
  const moduleNames = modules.map((m) => m.name);

  // Active module is owned per-tile and persisted so re-entering a configurator
  // restores the last module the user was working on.
  const moduleStorageKey = (tileId: string) =>
    `serviceconfig:${id ?? "service"}:${tileId}:activeModule`;

  const [activeModule, setActiveModule] = useState<string>(moduleNames[0]);

  useEffect(() => {
    if (!activeTile) return;
    let next = moduleNames[0];
    try {
      const stored = localStorage.getItem(moduleStorageKey(activeTile));
      if (stored && moduleNames.includes(stored)) next = stored;
    } catch { /* ignore */ }
    setActiveModule(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTile]);

  const handleModuleChange = (m: string) => {
    setActiveModule(m);
    if (activeTile) {
      try { localStorage.setItem(moduleStorageKey(activeTile), m); } catch { /* ignore */ }
    }
  };

  const activeTileData = activeTile ? configTiles.find((t) => t.id === activeTile) : null;

  const isPublished = service?.isPublished || state.isPublished;
  const isLive = service?.isLive || state.isLive;

  const coreTiles = configTiles.filter((t) => t.group === "core");
  const additionalTiles = configTiles.filter((t) => t.group === "additional");

  // Specialized config screens — wrapped with ModuleTabs so each configurator
  // owns its own module switcher at the top.
  const onBack = () => setActiveTile(null);
  const renderConfigurator = (node: React.ReactNode) => (
    <div className="flex flex-col h-screen bg-background">
      <ModuleTabs modules={moduleNames} active={activeModule} onChange={handleModuleChange} />
      <div key={activeModule} className="flex-1 min-h-0 overflow-hidden">
        {node}
      </div>
    </div>
  );

  if (activeTile === "forms") return renderConfigurator(<FormBuilder moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "roles") return renderConfigurator(<RolesDesigner moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "notifications") return renderConfigurator(<NotificationsManager moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "checklists") return renderConfigurator(<ChecklistBuilder moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "documents") return renderConfigurator(<DocumentDesigner moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "billing") return renderConfigurator(<FeesConfigurator moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "workflow") return renderConfigurator(<WorkflowDesigner moduleName={activeModule} onBack={onBack} />);
  if (activeTile === "payments") return renderConfigurator(<PaymentsConfigurator moduleName={activeModule} onBack={onBack} />);

  // Generic tile placeholder
  if (activeTileData) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <ModuleTabs modules={moduleNames} active={activeModule} onChange={handleModuleChange} />
        <header className="border-b bg-card">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{activeModule} — {activeTileData.title}</h1>
              <p className="text-xs text-muted-foreground">Flow configuration</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <activeTileData.icon className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{activeTileData.title}</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              This is where you configure {activeTileData.title.toLowerCase()} for the{" "}
              <span className="font-medium text-foreground">{activeModule}</span> flow.
            </p>
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Module Configuration
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const workspaceTabs: { id: typeof mode; label: string; disabled?: boolean; tooltip?: string }[] = isLive
    ? [
        { id: "overview", label: "Overview" },
        { id: "preview", label: "Preview" },
        { id: "operations", label: "Monitor" },
        { id: "deployment", label: "Manage" },
      ]
    : [
        { id: "overview", label: "Overview" },
        { id: "configure", label: "Configure" },
        { id: "preview", label: "Preview" },
        { id: "operations", label: "Monitor" },
        {
          id: "deployment",
          label: "Manage",
          disabled: true,
          tooltip: "Available after publishing the service",
        },
      ];

  // Main hub view
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card shrink-0">
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground text-lg truncate">{serviceName}</h1>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${isLive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                >
                  {isLive ? "Live" : "Draft"}
                </Badge>
              </div>
               <p className="text-xs text-muted-foreground">Configure, preview, and operate your service delivery apps.</p>
            </div>
            <div className="flex items-center gap-2">
              {service && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSetupOpen(true)}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="h-4 w-4" /> Template Setup
                </Button>
              )}
              {!isLive && (
                <Button
                  size="sm"
                  onClick={() => { if (service) setActiveService(service.id); navigate("/go-live"); }}
                  className="gap-1.5"
                >
                  Go Live
                </Button>
              )}
            </div>
          </div>

          <TooltipProvider delayDuration={200}>
            <nav className="mt-5 flex items-center gap-1 -mb-px">
              {workspaceTabs.map((t) => {
                const active = mode === t.id;
                const btn = (
                  <button
                    key={t.id}
                    onClick={() => !t.disabled && setMode(t.id)}
                    disabled={t.disabled}
                    className={`relative px-5 h-12 text-sm font-medium transition-colors border-b-2 ${
                      active
                        ? "border-accent text-foreground"
                        : t.disabled
                          ? "border-transparent text-muted-foreground/50 cursor-not-allowed"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                );
                return t.tooltip ? (
                  <Tooltip key={t.id}>
                    <TooltipTrigger asChild><span>{btn}</span></TooltipTrigger>
                    <TooltipContent>{t.tooltip}</TooltipContent>
                  </Tooltip>
                ) : btn;
              })}
            </nav>
          </TooltipProvider>
        </div>
      </header>

       {mode === "overview" ? (
         service ? (
           <OverviewWorkspace service={service} isLive={!!isLive} onNavigate={setMode} />
         ) : (
           <main className="max-w-5xl w-full mx-auto px-6 py-16 flex-1 min-h-0 overflow-auto">
             <div className="text-center text-muted-foreground">
               <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-60" />
               <p className="text-sm">Loading service…</p>
             </div>
           </main>
         )
       ) : mode === "configure" ? (
         <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-10 flex-1 min-h-0 overflow-auto">
           {/* Application Setup */}
           <section className="space-y-4">
             <div>
               <h2 className="text-base font-semibold text-foreground">Application Setup</h2>
               <p className="text-sm text-muted-foreground">Complete the foundational setup for your application.</p>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coreTiles.map((tile) => {
                return (
                  <Card
                    key={tile.id}
                    className="relative group hover:shadow-md hover:border-accent/40 transition-all cursor-pointer"
                    onClick={() => setActiveTile(tile.id)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <tile.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base">{tile.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tile.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Additional Setup */}
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Additional Setup</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {additionalTiles.map((tile) => {
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveTile(tile.id)}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left hover:border-accent/40 hover:bg-accent/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <tile.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{tile.title}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      ) : mode === "preview" ? (
        <main className="flex-1 min-h-0">
          <ServicePreviewWorkspace />
        </main>
      ) : mode === "operations" ? (
        <main className="flex-1 min-h-0">
          <OperationsWorkspace serviceId={id ?? ""} />
        </main>
      ) : mode === "deployment" ? (
        <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 min-h-0 overflow-auto">
          <DeploymentWorkspace serviceUrl={(service as any)?.liveUrl} />
        </main>
      ) : null}
      {service && (
        <MasterTemplateConfigurator open={setupOpen} onOpenChange={setSetupOpen} service={service} />
      )}
    </div>
  );
};

const ServiceConfig: React.FC = () => {
  const { id } = useParams();
  return (
    <ServiceConfigProvider serviceId={id ?? ""}>
      <ServiceConfigInner />
    </ServiceConfigProvider>
  );
};

export default ServiceConfig;
