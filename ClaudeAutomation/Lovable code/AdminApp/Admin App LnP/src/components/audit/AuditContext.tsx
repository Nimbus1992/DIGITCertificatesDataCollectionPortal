import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  governanceEvents,
  configActivityEvents,
  deployments,
  runtimeEvents,
  SERVICES,
  USERS,
  type Environment,
  type Result,
  type GovernanceEvent,
  type ConfigActivityEvent,
  type Deployment,
  type RuntimeEvent,
} from "@/data/auditLogs";

export type DateRange = { from?: Date; to?: Date };
export type AuditCategory = "governance" | "config" | "deployment" | "runtime";

export type AuditFilters = {
  search: string;
  service: string;
  user: string;
  environment: "all" | Environment;
  eventType: string;
  severity: "all" | Result;
  status: string;
  dateRange: DateRange;
  serviceScopeId?: string;
  category: "all" | AuditCategory;
  quickView: string; // "all" | "failures" | "permissions" | "config" | "deployments" | "approvals" | "security"
};

const defaultFilters: AuditFilters = {
  search: "",
  service: "all",
  user: "all",
  environment: "all",
  eventType: "all",
  severity: "all",
  status: "all",
  dateRange: {},
  category: "all",
  quickView: "all",
};

type Ctx = {
  filters: AuditFilters;
  setFilters: React.Dispatch<React.SetStateAction<AuditFilters>>;
  debouncedSearch: string;
};

const AuditCtx = createContext<Ctx | null>(null);

export const AuditProvider: React.FC<{ children: React.ReactNode; serviceScopeId?: string }> = ({
  children,
  serviceScopeId,
}) => {
  const [filters, setFilters] = useState<AuditFilters>({ ...defaultFilters, serviceScopeId });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [filters.search]);

  return (
    <AuditCtx.Provider value={{ filters, setFilters, debouncedSearch }}>{children}</AuditCtx.Provider>
  );
};

export function useAudit() {
  const ctx = useContext(AuditCtx);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}

export const SERVICE_OPTIONS = ["all", ...SERVICES] as const;
export const USER_OPTIONS = ["all", ...USERS] as const;

function matchSearch(haystacks: (string | undefined | null)[], q: string) {
  if (!q) return true;
  return haystacks.some((h) => (h ?? "").toLowerCase().includes(q));
}

function inRange(ts: string, range: DateRange) {
  if (!range.from && !range.to) return true;
  const t = new Date(ts).getTime();
  if (range.from && t < range.from.getTime()) return false;
  if (range.to && t > range.to.getTime() + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
}

export function useGovernance() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return governanceEvents.filter((e) => {
      if (filters.serviceScopeId) return false;
      if (filters.user !== "all" && e.user !== filters.user) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      if (filters.severity !== "all" && e.result !== filters.severity) return false;
      if (filters.service !== "all" && !e.affectedServices.includes(filters.service)) return false;
      if (!inRange(e.timestamp, filters.dateRange)) return false;
      return matchSearch([e.id, e.user, e.action, e.entity, e.scope, ...e.affectedServices], debouncedSearch);
    });
  }, [filters, debouncedSearch]);
}

export function useConfigActivity() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return configActivityEvents.filter((e) => {
      if (filters.serviceScopeId && e.serviceId !== filters.serviceScopeId) return false;
      if (filters.service !== "all" && e.serviceName !== filters.service) return false;
      if (filters.user !== "all" && e.actor !== filters.user) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      if (!inRange(e.timestamp, filters.dateRange)) return false;
      return matchSearch(
        [e.id, e.actor, e.serviceName, e.module, e.summary, e.version, ...e.affected],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}

export function useDeployments() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return deployments.filter((d) => {
      if (filters.serviceScopeId && d.serviceId !== filters.serviceScopeId) return false;
      if (filters.service !== "all" && d.serviceName !== filters.service) return false;
      if (filters.user !== "all" && d.publishedBy !== filters.user) return false;
      if (filters.environment !== "all" && d.environment !== filters.environment) return false;
      if (filters.status !== "all" && d.status !== filters.status) return false;
      if (!inRange(d.timestamp, filters.dateRange)) return false;
      return matchSearch(
        [d.id, d.version, d.publishedBy, d.serviceName, ...d.changedModules, ...d.notes],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}

export function useRuntime() {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return runtimeEvents.filter((e) => {
      if (filters.serviceScopeId && e.serviceId !== filters.serviceScopeId) return false;
      if (filters.service !== "all" && e.serviceName !== filters.service) return false;
      if (filters.user !== "all" && e.actor !== filters.user) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (!inRange(e.timestamp, filters.dateRange)) return false;
      return matchSearch(
        [e.id, e.applicationId, e.applicant, e.serviceName, e.stage, e.actor, e.eventType],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}

// ---------- Unified events ----------

export type StatusTone = "success" | "warning" | "failed" | "neutral" | "info";

export type UnifiedEvent = {
  id: string;
  timestamp: string;
  actor: string;
  category: AuditCategory;
  action: string;
  entity: string;
  service?: string;
  services: string[];
  environment?: Environment;
  statusLabel: string;
  statusTone: StatusTone;
  severity: Result | "neutral";
  raw:
    | { kind: "governance"; data: GovernanceEvent }
    | { kind: "config"; data: ConfigActivityEvent }
    | { kind: "deployment"; data: Deployment }
    | { kind: "runtime"; data: RuntimeEvent };
};

const resultToTone: Record<Result, StatusTone> = {
  success: "success",
  warning: "warning",
  failed: "failed",
};

function normalize(): UnifiedEvent[] {
  const g: UnifiedEvent[] = governanceEvents.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    actor: e.user,
    category: "governance",
    action: e.action,
    entity: e.entity,
    service: e.affectedServices[0],
    services: e.affectedServices,
    environment: e.environment,
    statusLabel: e.result === "success" ? "Success" : e.result === "warning" ? "Warning" : "Failed",
    statusTone: resultToTone[e.result],
    severity: e.result,
    raw: { kind: "governance", data: e },
  }));
  const c: UnifiedEvent[] = configActivityEvents.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    actor: e.actor,
    category: "config",
    action: e.summary,
    entity: `${e.serviceName} · ${e.module}`,
    service: e.serviceName,
    services: [e.serviceName],
    environment: e.environment,
    statusLabel: e.version,
    statusTone: "info",
    severity: "neutral",
    raw: { kind: "config", data: e },
  }));
  const d: UnifiedEvent[] = deployments.map((e) => {
    const tone: StatusTone =
      e.status === "published"
        ? "success"
        : e.status === "failed"
        ? "failed"
        : e.status === "rolled_back"
        ? "warning"
        : "neutral";
    const sev: Result | "neutral" =
      e.status === "failed" ? "failed" : e.status === "rolled_back" ? "warning" : "neutral";
    return {
      id: e.id,
      timestamp: e.timestamp,
      actor: e.publishedBy,
      category: "deployment",
      action: `${e.status === "rolled_back" ? "Rolled back" : e.status === "published" ? "Published" : e.status === "failed" ? "Deploy failed" : "Drafted"} ${e.version}`,
      entity: e.serviceName,
      service: e.serviceName,
      services: e.impactedServices,
      environment: e.environment,
      statusLabel: e.status === "rolled_back" ? "Rolled back" : e.status.charAt(0).toUpperCase() + e.status.slice(1),
      statusTone: tone,
      severity: sev,
      raw: { kind: "deployment", data: e },
    };
  });
  const r: UnifiedEvent[] = runtimeEvents.map((e) => {
    const tone: StatusTone =
      e.status === "approved"
        ? "success"
        : e.status === "rejected"
        ? "failed"
        : e.status === "sent_back"
        ? "warning"
        : e.status === "in_progress"
        ? "info"
        : "neutral";
    const sev: Result | "neutral" =
      e.status === "rejected" ? "failed" : e.status === "sent_back" ? "warning" : "neutral";
    const label = e.status.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
    const actionLabel = e.eventType.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
    return {
      id: e.id,
      timestamp: e.timestamp,
      actor: e.actor,
      category: "runtime",
      action: `${actionLabel} · ${e.applicationId}`,
      entity: `${e.applicant} · ${e.stage}`,
      service: e.serviceName,
      services: [e.serviceName],
      statusLabel: label,
      statusTone: tone,
      severity: sev,
      raw: { kind: "runtime", data: e },
    };
  });
  return [...g, ...c, ...d, ...r].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

const ALL_UNIFIED = normalize();

export function useUnifiedEvents(): UnifiedEvent[] {
  const { filters, debouncedSearch } = useAudit();
  return useMemo(() => {
    return ALL_UNIFIED.filter((e) => {
      if (filters.serviceScopeId) return false;

      // Category
      if (filters.category !== "all" && e.category !== filters.category) return false;

      // Quick views
      switch (filters.quickView) {
        case "failures":
          if (e.severity !== "failed") return false;
          break;
        case "permissions":
          if (
            !(
              e.category === "governance" &&
              /role|permission|user|session|api key|auth/i.test(e.action)
            )
          )
            return false;
          break;
        case "config":
          if (e.category !== "config") return false;
          break;
        case "deployments":
          if (e.category !== "deployment") return false;
          break;
        case "approvals":
          if (!(e.category === "runtime" && /approv|reject|sent back/i.test(e.action))) return false;
          break;
        case "security":
          if (e.raw.kind !== "governance" || e.raw.data.category !== "security") return false;
          break;
        case "all":
        default:
          break;
      }

      // Common filters
      if (filters.user !== "all" && e.actor !== filters.user) return false;
      if (filters.environment !== "all" && e.environment !== filters.environment) return false;
      if (filters.service !== "all" && !e.services.includes(filters.service)) return false;
      if (filters.severity !== "all" && e.severity !== filters.severity) return false;
      if (!inRange(e.timestamp, filters.dateRange)) return false;

      // Status filter only applies to deployments + runtime
      if (filters.status !== "all") {
        if (e.raw.kind === "deployment" && e.raw.data.status !== filters.status) return false;
        if (e.raw.kind === "runtime" && e.raw.data.status !== filters.status) return false;
        if (e.raw.kind === "governance" || e.raw.kind === "config") return false;
      }

      // Event type filter only applies to runtime
      if (filters.eventType !== "all") {
        if (e.raw.kind !== "runtime" || e.raw.data.eventType !== filters.eventType) return false;
      }

      return matchSearch(
        [e.id, e.actor, e.action, e.entity, e.service, ...(e.services || [])],
        debouncedSearch,
      );
    });
  }, [filters, debouncedSearch]);
}
