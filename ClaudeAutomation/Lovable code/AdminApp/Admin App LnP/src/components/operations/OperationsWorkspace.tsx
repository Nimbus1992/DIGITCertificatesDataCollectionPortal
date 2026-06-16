import React, { useMemo, useState } from "react";
import { BarChart3, Gauge, ListChecks, ClipboardList, FileSpreadsheet, Activity, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useOperationsMetadata } from "./useOperationsMetadata";
import { buildOperationsData } from "./mockData";
import { OperationsFilterBar, DEFAULT_FILTERS, type OpsFilters } from "./shared/FilterBar";
import { AnalyticsView } from "./views/AnalyticsView";
import { SlaView } from "./views/SlaView";
import { QueuesView } from "./views/QueuesView";
import { AuditView } from "./views/AuditView";
import { ReportsView } from "./views/ReportsView";

type Section = "analytics" | "sla" | "queues" | "audit" | "reports";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Operational dashboards" },
  { id: "sla", label: "SLA Monitoring", icon: Gauge, description: "Compliance & breaches" },
  { id: "queues", label: "Workflow Queues", icon: ListChecks, description: "Live work assignment" },
  { id: "audit", label: "Audit Logs", icon: ClipboardList, description: "System activity trail" },
  { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet, description: "Prebuilt exports" },
];

interface Props {
  serviceId: string;
}

export const OperationsWorkspace: React.FC<Props> = ({ serviceId }) => {
  const { state } = useOnboarding();
  const service = state.services.find((s) => s.id === serviceId);
  const meta = useOperationsMetadata(service);
  const [section, setSection] = useState<Section>("analytics");
  const [filters, setFilters] = useState<OpsFilters>(DEFAULT_FILTERS);
  const [syncStamp, setSyncStamp] = useState(() => new Date());

  const data = useMemo(() => buildOperationsData(meta), [meta]);
  const lastSynced = useMemo(() => {
    const d = syncStamp;
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }, [syncStamp]);

  const handleExport = () => {
    toast.success(`${SECTIONS.find((s) => s.id === section)?.label} export queued`);
  };

  return (
    <div className="flex h-full min-h-0 bg-muted/30">
      {/* Left secondary nav */}
      <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Monitor</h2>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Circle
              className={cn(
                "h-1.5 w-1.5 fill-current",
                meta.status === "live" ? "text-success" : "text-muted-foreground",
              )}
            />
            <span className="capitalize">{meta.status}</span>
            <span>·</span>
            <span className="truncate">{meta.serviceName}</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "w-full flex items-start gap-2.5 px-2.5 py-2 rounded text-left transition-colors",
                  active
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <s.icon className={cn("h-4 w-4 mt-0.5 shrink-0", active && "text-primary")} />
                <div className="min-w-0">
                  <div className={cn("text-[13px] font-medium", active && "text-foreground")}>{s.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.description}</div>
                </div>
                {active && <span className="ml-auto w-0.5 self-stretch bg-primary rounded-full" />}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-2.5 border-t text-[10px] text-muted-foreground leading-relaxed">
          Analytics auto-generated from service configuration. Sections appear based on enabled modules.
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-10">
          <OperationsFilterBar
            filters={filters}
            onChange={setFilters}
            meta={meta}
            lastSynced={lastSynced}
            onRefresh={() => {
              setSyncStamp(new Date());
              toast.success("Monitor data refreshed");
            }}
            onExport={handleExport}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            {section === "analytics" && <AnalyticsView meta={meta} data={data} />}
            {section === "sla" && <SlaView meta={meta} data={data} />}
            {section === "queues" && <QueuesView meta={meta} data={data} />}
            {section === "audit" && <AuditView scopeId={serviceId} />}
            {section === "reports" && <ReportsView />}
          </div>
        </div>
      </div>
    </div>
  );
};
