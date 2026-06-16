import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Category, WorkflowStage } from "./reportsMock";
import type { ZoneId } from "./capeTownGeo";

export type MapMetric = "trades" | "newReg" | "revenue" | "renewalPct" | "procDays";

export type DashboardFilter = {
  zoneId: ZoneId | null;
  wardId: string | null;
  category: Category | null;
  stage: WorkflowStage | null;
  metric: MapMetric;
};

type Ctx = {
  filter: DashboardFilter;
  setZone: (z: ZoneId | null) => void;
  setWard: (w: string | null) => void;
  setCategory: (c: Category | null) => void;
  setStage: (s: WorkflowStage | null) => void;
  setMetric: (m: MapMetric) => void;
  reset: () => void;
  hasAny: boolean;
};

const emptyFilter: DashboardFilter = { zoneId: null, wardId: null, category: null, stage: null, metric: "trades" };

const FilterCtx = createContext<Ctx | null>(null);

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<DashboardFilter>(emptyFilter);

  const setZone = useCallback((zoneId: ZoneId | null) => setFilter((f) => ({ ...f, zoneId, wardId: null })), []);
  const setWard = useCallback((wardId: string | null) => setFilter((f) => ({ ...f, wardId })), []);
  const setCategory = useCallback((category: Category | null) => setFilter((f) => ({ ...f, category })), []);
  const setStage = useCallback((stage: WorkflowStage | null) => setFilter((f) => ({ ...f, stage })), []);
  const setMetric = useCallback((metric: MapMetric) => setFilter((f) => ({ ...f, metric })), []);
  const reset = useCallback(() => setFilter(emptyFilter), []);

  const value = useMemo<Ctx>(() => ({
    filter, setZone, setWard, setCategory, setStage, setMetric, reset,
    hasAny: !!(filter.zoneId || filter.wardId || filter.category || filter.stage),
  }), [filter, setZone, setWard, setCategory, setStage, setMetric, reset]);

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useDashboardFilter(): Ctx {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("useDashboardFilter must be used inside DashboardFilterProvider");
  return ctx;
}
