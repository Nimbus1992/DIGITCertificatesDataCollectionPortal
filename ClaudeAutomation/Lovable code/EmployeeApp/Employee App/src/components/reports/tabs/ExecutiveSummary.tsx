import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/reports/KpiCard";
import { CapeTownMap, MAP_METRICS } from "@/components/reports/CapeTownMap";
import {
  CATEGORIES, CATEGORY_ROWS, EXEC_KPIS, fmtNum, fmtZAR,
  WARDS, WARD_METRICS, zoneMetrics,
} from "@/lib/reportsMock";
import { useDashboardFilter, type MapMetric } from "@/lib/reportsFilter";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";

// Category weights (must match reportsMock so totals reconcile).
const CAT_WEIGHTS: Record<typeof CATEGORIES[number], number> = {
  "Retail": 0.22, "Food & Beverage": 0.16, "Professional Services": 0.15,
  "Manufacturing": 0.10, "Health & Wellness": 0.08, "Construction": 0.08,
  "Transport & Logistics": 0.07, "Education": 0.07, "Hospitality": 0.07,
};

export function ExecutiveSummary() {
  const { filter, setCategory } = useDashboardFilter();
  const metric: MapMetric = filter.metric;

  // Filter-aware KPIs
  const kpis = useMemo(() => {
    if (filter.wardId) {
      const wm = WARD_METRICS[filter.wardId];
      return {
        activeTrades: wm.trades,
        openApplications: wm.newReg,
        revenueCollected: wm.revenue,
        renewalRate: wm.renewalPct,
      };
    }
    if (filter.zoneId) {
      const zm = zoneMetrics(filter.zoneId);
      return {
        activeTrades: zm.trades,
        openApplications: zm.newReg,
        revenueCollected: zm.revenue,
        renewalRate: zm.renewalPct,
      };
    }
    return EXEC_KPIS;
  }, [filter.wardId, filter.zoneId]);

  // Scope total for the selected metric matches the map's current scope.
  const scopeTotal = useMemo(() => {
    if (filter.wardId) return WARD_METRICS[filter.wardId][metric];
    if (filter.zoneId) return zoneMetrics(filter.zoneId)[metric];
    // city
    const cityVals = CATEGORY_ROWS; // not used directly for metric totals
    void cityVals;
    if (metric === "trades") return EXEC_KPIS.activeTrades;
    if (metric === "newReg") return EXEC_KPIS.openApplications;
    if (metric === "revenue") return EXEC_KPIS.revenueCollected;
    if (metric === "renewalPct") return EXEC_KPIS.renewalRate;
    // procDays — average across categories below; use city procDays.
    return 0;
  }, [filter.wardId, filter.zoneId, metric]);

  const metricLabel = MAP_METRICS.find((m) => m.key === metric)?.label ?? "Active Businesses";

  const fmtY = (v: number) => {
    if (metric === "revenue") return fmtZAR(v);
    if (metric === "renewalPct") return `${Math.round(v)}%`;
    if (metric === "procDays") return `${v.toFixed(1)}d`;
    return fmtNum(v, true);
  };
  const fmtTip = (v: number) => {
    if (metric === "revenue") return fmtZAR(v, false);
    if (metric === "renewalPct") return `${v.toFixed(1)}%`;
    if (metric === "procDays") return `${v.toFixed(1)} days`;
    return fmtNum(v);
  };

  // Build per-category values for the selected metric.
  const chartData = useMemo(() => {
    return CATEGORIES.map((c, i) => {
      const w = CAT_WEIGHTS[c];
      let value: number;
      if (metric === "renewalPct") {
        // Per-category renewal rate (matches CATEGORY_ROWS)
        value = 79 + ((i * 3) % 14);
      } else if (metric === "procDays") {
        // Synthetic per-category days
        value = 4 + ((i * 1.3) % 9);
      } else {
        value = Math.round(scopeTotal * w);
      }
      return { name: c, value };
    });
  }, [metric, scopeTotal]);

  const wardName = filter.wardId ? WARDS.find((w) => w.id === filter.wardId)?.name : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Executive Summary</h2>
          <p className="text-xs text-muted-foreground">
            {wardName ? `Filtered: ${wardName}` : filter.zoneId ? `Filtered: ${filter.zoneId.replace(/_/g, " ")}` : "All of Cape Town"}
            {filter.category && ` · ${filter.category}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard size="lg" accent="primary" label="Active Businesses" value={fmtNum(kpis.activeTrades)} />
        <KpiCard size="lg" accent="info" label="New Applications" value={fmtNum(kpis.openApplications)} />
        <KpiCard size="lg" accent="success" label="Revenue Collected" value={fmtZAR(kpis.revenueCollected)} />
        <KpiCard size="lg" accent="warning" label="Renewal Rate" value={`${kpis.renewalRate}%`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CapeTownMap />

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold">{metricLabel} by Business Category</h3>
              <p className="text-xs text-muted-foreground">
                Follows the map's metric · Click a bar to filter the dashboard
              </p>
            </div>
            {filter.category && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCategory(null)}>
                Clear category
              </Button>
            )}
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)"
                       interval={0} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)"
                       tickFormatter={(v) => fmtY(Number(v))} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtTip(v)}
                  labelFormatter={(l) => `${l} · ${metricLabel}`}
                />
                <Bar dataKey="value" name={metricLabel} radius={[4, 4, 0, 0]} className="cursor-pointer">
                  {chartData.map((d, i) => (
                    <Cell key={i}
                          onClick={() => setCategory(filter.category === d.name ? null : (d.name as typeof CATEGORIES[number]))}
                          fill={filter.category === d.name ? "var(--primary)" : "var(--chart-2)"}
                          opacity={filter.category && filter.category !== d.name ? 0.35 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
