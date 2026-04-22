import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { updateServiceStatus, verifyOrgTemplateLink } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Eye, Rocket, Check, Info, Loader2,
  Lock, Settings, Users, Database, ScrollText,
  AlertTriangle, ShieldCheck, UserPlus, Filter,
  Download, Search, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { defaultModules, configTiles } from "@/data/serviceModules";
import RolesDesigner from "@/components/service-config/RolesDesigner";
import NotificationsManager from "@/components/service-config/NotificationsManager";
import ChecklistBuilder from "@/components/service-config/ChecklistBuilder";
import FormBuilder from "@/components/service-config/FormBuilder";
import DocumentDesigner from "@/components/service-config/DocumentDesigner";
import WorkflowBuilder from "@/components/service-config/WorkflowBuilder";
import BillingConfig from "@/components/service-config/BillingConfig";
import PaymentsConfig from "@/components/service-config/PaymentsConfig";
import PluginsManager from "@/components/service-config/PluginsManager";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceState = "draft" | "published" | "live";
type MainTab = "config" | "production";
type ProductionTab = "users" | "data" | "audit_logs";
type TileStatus = "not_started" | "in_progress" | "completed";

interface LocationState {
  status?: ServiceState;
  name?: string;
}

// ─── Status display ───────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ServiceState, { label: string; className: string; icon: React.FC<{ className?: string }> }> = {
  draft:     { label: "Draft",     className: "bg-muted text-muted-foreground border-border",   icon: Clock },
  published: { label: "Published", className: "bg-blue-100 text-blue-700 border-blue-200",      icon: CheckCircle2 },
  live:      { label: "Live",      className: "bg-green-100 text-green-700 border-green-200",   icon: Rocket },
};

const tileStatusConfig: Record<TileStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
  completed:   { label: "Completed",   className: "bg-green-100 text-green-800" },
};

// ─── Production sub-panels ────────────────────────────────────────────────────

const MOCK_APPLICATIONS = [
  { id: "APP-001", applicant: "James Wilson",   service: "Business License",   status: "approved",  date: "2025-06-12" },
  { id: "APP-002", applicant: "Priya Sharma",   service: "Business License",   status: "pending",   date: "2025-06-14" },
  { id: "APP-003", applicant: "Mohammed Al-Ali",service: "Business License",   status: "rejected",  date: "2025-06-15" },
  { id: "APP-004", applicant: "Chen Wei",        service: "Business License",   status: "pending",   date: "2025-06-17" },
  { id: "APP-005", applicant: "Sarah Connor",   service: "Business License",   status: "approved",  date: "2025-06-18" },
];

const APP_STATUS_STYLE: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const APP_STATUS_ICON: Record<string, React.FC<{ className?: string }>> = {
  approved: CheckCircle2,
  pending:  Clock,
  rejected: XCircle,
};

const MOCK_AUDIT = [
  { id: 1, action: "Service went live",                actor: "admin@city.gov",      time: "2025-06-10 09:14" },
  { id: 2, action: "Team member invited",              actor: "admin@city.gov",      time: "2025-06-10 09:20" },
  { id: 3, action: "Application APP-001 approved",     actor: "officer@city.gov",    time: "2025-06-12 11:05" },
  { id: 4, action: "Application APP-003 rejected",     actor: "officer@city.gov",    time: "2025-06-15 14:30" },
  { id: 5, action: "Workflow stage updated",           actor: "admin@city.gov",      time: "2025-06-16 10:00" },
  { id: 6, action: "Fee rule modified",                actor: "admin@city.gov",      time: "2025-06-17 09:45" },
];

function UsersPanel({ orgId }: { orgId: string }) {
  const { state } = useOnboarding();
  const members = state.teamMembers.length > 0
    ? state.teamMembers
    : [
        { id: "u1", name: "Alex Thompson",  email: "alex@city.gov",    role: "admin" as const },
        { id: "u2", name: "Priya Singh",    email: "priya@city.gov",   role: "operator" as const },
        { id: "u3", name: "James Carter",   email: "james@city.gov",   role: "approver" as const },
      ];

  const ROLE_BADGE: Record<string, string> = {
    admin:    "bg-purple-100 text-purple-700",
    operator: "bg-blue-100 text-blue-700",
    approver: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Team Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{members.length} members with access to this service</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Invite Member
        </Button>
      </div>

      <div className="rounded-xl border divide-y overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
            </div>
            <Badge className={`text-[10px] px-2 capitalize ${ROLE_BADGE[m.role] ?? "bg-muted text-muted-foreground"}`}>
              {m.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataPanel({ serviceName }: { serviceName: string }) {
  const [search, setSearch] = useState("");
  const filtered = MOCK_APPLICATIONS.filter(
    (a) => a.applicant.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
  );
  const counts = { total: MOCK_APPLICATIONS.length, pending: MOCK_APPLICATIONS.filter(a => a.status === "pending").length, approved: MOCK_APPLICATIONS.filter(a => a.status === "approved").length };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Applications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All submissions for {serviceName}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",    value: counts.total,    color: "text-foreground" },
          { label: "Pending",  value: counts.pending,  color: "text-amber-600" },
          { label: "Approved", value: counts.approved, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          className="w-full h-9 pl-8 pr-3 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="Search by name or application ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium">ID</th>
              <th className="px-4 py-2.5 text-left font-medium">Applicant</th>
              <th className="px-4 py-2.5 text-left font-medium">Date</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((app) => {
              const Icon = APP_STATUS_ICON[app.status] ?? Clock;
              return (
                <tr key={app.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{app.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{app.applicant}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{app.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${APP_STATUS_STYLE[app.status]}`}>
                      <Icon className="h-2.5 w-2.5" />
                      {app.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogsPanel({ serviceName }: { serviceName: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Audit Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All recorded activity for {serviceName}</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden divide-y">
        {MOCK_AUDIT.map((entry, i) => (
          <div key={entry.id} className="flex items-start gap-4 px-4 py-3 bg-card hover:bg-muted/20 transition-colors">
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-accent" : "bg-border"}`} />
              {i < MOCK_AUDIT.length - 1 && <div className="w-px flex-1 bg-border mt-1" style={{ height: "24px" }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{entry.action}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{entry.actor}</p>
                <span className="text-muted-foreground/40">·</span>
                <p className="text-xs text-muted-foreground">{entry.time}</p>
              </div>
            </div>
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ServiceConfig: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: serviceIdParam } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Resolve service metadata — prefer navigation state for demo services,
  // fall back to OnboardingContext for the real persisted service.
  const resolvedStatus: ServiceState =
    (locationState?.status as ServiceState) ??
    (state.serviceStatus as ServiceState) ??
    "draft";
  const resolvedName =
    locationState?.name ?? state.serviceName ?? "Service Configuration";

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [mainTab, setMainTab] = useState<MainTab>(
    resolvedStatus === "live" ? "production" : "config"
  );
  const [productionTab, setProductionTab] = useState<ProductionTab>("users");

  // ── Config state ───────────────────────────────────────────────────────────
  const [selectedModule, setSelectedModule] = useState(defaultModules[0].id);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tileStatuses, setTileStatuses] = useState<Record<string, Record<string, TileStatus>>>(() => {
    const init: Record<string, Record<string, TileStatus>> = {};
    defaultModules.forEach((m) => {
      init[m.id] = {};
      configTiles.forEach((t) => { init[m.id][t.id] = "not_started"; });
    });
    return init;
  });

  // ── Org-Template link verification ────────────────────────────────────────
  const [linkVerified, setLinkVerified] = useState<boolean | null>(null); // null = pending

  useEffect(() => {
    const realServiceId = serviceIdParam && !serviceIdParam.startsWith("svc-demo")
      ? serviceIdParam
      : state.serviceId;
    const orgId = state.organizationId;

    if (!realServiceId || !orgId) {
      setLinkVerified(true); // demo / in-progress service — skip DB check
      return;
    }

    verifyOrgTemplateLink(realServiceId, orgId).then((row) => {
      setLinkVerified(row !== null);
    });
  }, [serviceIdParam, state.serviceId, state.organizationId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const currentModule = defaultModules.find((m) => m.id === selectedModule)!;
  const currentStatuses = tileStatuses[selectedModule] || {};
  const completedCount = Object.values(currentStatuses).filter((s) => s === "completed").length;
  const progressPercent = (completedCount / configTiles.length) * 100;
  const activeTileData = activeTile ? configTiles.find((t) => t.id === activeTile) : null;

  const isDraft = resolvedStatus === "draft" || resolvedStatus === "published";
  const isLive  = resolvedStatus === "live";

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (state.serviceId) await updateServiceStatus(state.serviceId, "published");
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setPublishing(false);
    }
    updateState({ isPublished: true, serviceStatus: "published" });
    setShowPublishConfirm(true);
  };

  // ── Verification loading ───────────────────────────────────────────────────
  if (linkVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Verifying service link…</p>
        </div>
      </div>
    );
  }

  if (linkVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Service not found</h2>
          <p className="text-sm text-muted-foreground">
            This service doesn't exist or doesn't belong to your organisation.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // ── Publish confirmation ───────────────────────────────────────────────────
  if (showPublishConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Service Published!</h2>
          <p className="text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{resolvedName}</span> has been published.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Continue to Go Live to make it available to users.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/go-live")} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Rocket className="h-4 w-4" /> Continue to Go Live
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tile detail screens ────────────────────────────────────────────────────
  const tileScreens: Record<string, React.ReactNode> = {
    forms:         <FormBuilder         moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    roles:         <RolesDesigner       moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    notifications: <NotificationsManager moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    checklists:    <ChecklistBuilder    moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    documents:     <DocumentDesigner    moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    workflow:      <WorkflowBuilder     moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    billing:       <BillingConfig       moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    payments:      <PaymentsConfig      moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
    plugins:       <PluginsManager      moduleName={currentModule.name} onBack={() => setActiveTile(null)} />,
  };

  if (activeTile && tileScreens[activeTile]) return <>{tileScreens[activeTile]}</>;

  if (activeTile && activeTileData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveTile(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{currentModule.name} — {activeTileData.title}</h1>
              <p className="text-xs text-muted-foreground">Module configuration</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
            <activeTileData.icon className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{activeTileData.title}</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Configure {activeTileData.title.toLowerCase()} for the <span className="font-medium text-foreground">{currentModule.name}</span> module.
          </p>
          <Button variant="outline" onClick={() => setActiveTile(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </main>
      </div>
    );
  }

  // ── Status badge ───────────────────────────────────────────────────────────
  const statusCfg  = STATUS_BADGE[resolvedStatus];
  const StatusIcon = statusCfg.icon;

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground text-lg truncate">{resolvedName}</h1>
                <Badge className={`text-[10px] px-2 py-0.5 gap-1 flex items-center border shrink-0 ${statusCfg.className}`}>
                  <StatusIcon className="h-2.5 w-2.5" />
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Service management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDraft && (
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Eye className="h-4 w-4" /> Preview
              </Button>
            )}
            {isDraft && !state.isPublished && (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={publishing}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {publishing ? "Publishing…" : "Publish Service"}
              </Button>
            )}
            {isLive && (
              <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Service Live
              </Button>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-0">
          {/* Config tab */}
          <button
            onClick={() => isDraft && setMainTab("config")}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              mainTab === "config"
                ? "border-accent text-accent"
                : isDraft
                  ? "border-transparent text-muted-foreground hover:text-foreground"
                  : "border-transparent text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Config
            {isLive && (
              <Lock className="h-3 w-3 text-muted-foreground/50" />
            )}
            {isDraft && mainTab !== "config" && (
              <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>

          {/* Production tab */}
          <button
            onClick={() => isLive && setMainTab("production")}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              mainTab === "production"
                ? "border-accent text-accent"
                : isLive
                  ? "border-transparent text-muted-foreground hover:text-foreground"
                  : "border-transparent text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Production
            {isDraft && (
              <Lock className="h-3 w-3 text-muted-foreground/50" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">

        {/* ════════════════════════════════════════════════════════
            CONFIG TAB — draft only
        ════════════════════════════════════════════════════════ */}
        {mainTab === "config" && (
          <>
            {isDraft ? (
              <div className="space-y-6">
                {/* Guidance */}
                <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
                  <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-foreground">
                      Configuring <span className="font-semibold">{currentModule.name}</span>. Switch modules using the dropdown.
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Complete all required tiles before publishing.
                    </p>
                  </div>
                  <Select
                    value={selectedModule}
                    onValueChange={(v) => { setSelectedModule(v); setActiveTile(null); }}
                  >
                    <SelectTrigger className="w-[180px] ml-auto shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultModules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {completedCount} / {configTiles.length} configured
                  </span>
                </div>

                {/* Tiles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {configTiles.map((tile) => {
                    const status = currentStatuses[tile.id] || "not_started";
                    const cfg = tileStatusConfig[status];
                    return (
                      <Card
                        key={tile.id}
                        className="group hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActiveTile(tile.id)}
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                              <tile.icon className="h-5 w-5 text-accent" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {tile.required && <span className="w-1.5 h-1.5 rounded-full bg-destructive" title="Required" />}
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${cfg.className}`}>
                                {cfg.label}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{tile.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tile.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                            onClick={(e) => { e.stopPropagation(); setActiveTile(tile.id); }}
                          >
                            {tile.ctaLabel}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Config locked — service is live */
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
                  <Lock className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Config is locked while the service is live</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  To make configuration changes, take the service offline first. Active applications will not be affected.
                </p>
                <Button variant="outline" className="gap-2">
                  Request Config Change
                </Button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            PRODUCTION TAB — live only
        ════════════════════════════════════════════════════════ */}
        {mainTab === "production" && (
          <>
            {isLive ? (
              <div className="space-y-6">
                {/* Production sub-tabs */}
                <div className="flex gap-1 border-b">
                  {(
                    [
                      { id: "users" as ProductionTab,     label: "Users",       icon: Users },
                      { id: "data" as ProductionTab,      label: "Data",        icon: Database },
                      { id: "audit_logs" as ProductionTab,label: "Audit Logs",  icon: ScrollText },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setProductionTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        productionTab === t.id
                          ? "border-accent text-accent"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                {productionTab === "users"      && <UsersPanel orgId={state.organizationId} />}
                {productionTab === "data"       && <DataPanel serviceName={resolvedName} />}
                {productionTab === "audit_logs" && <AuditLogsPanel serviceName={resolvedName} />}
              </div>
            ) : (
              /* Production locked — not yet live */
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted border flex items-center justify-center">
                  <Lock className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Production unlocks when your service goes live</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Complete configuration, publish your service, then go live to access Users, Data, and Audit Logs.
                </p>
                <Button
                  onClick={() => navigate("/go-live")}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                >
                  <Rocket className="h-4 w-4" /> Go Live
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ServiceConfig;
