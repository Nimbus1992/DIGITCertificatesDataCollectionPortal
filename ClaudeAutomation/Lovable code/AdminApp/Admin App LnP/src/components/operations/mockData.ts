import type { OperationsMetadata } from "./useOperationsMetadata";

export interface TrendPoint { label: string; value: number; prev?: number }
export interface NamedValue { name: string; value: number; secondary?: number }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export function buildOperationsData(meta: OperationsMetadata) {
  const rng = seeded(meta.serviceName.length + 42);

  const monthlyApps: TrendPoint[] = MONTHS.slice(0, 12).map((m, i) => ({
    label: m,
    value: Math.round(800 + rng() * 1200 + i * 30),
    prev: Math.round(700 + rng() * 1000 + i * 25),
  }));

  const monthlyRevenue: TrendPoint[] = monthlyApps.map((p) => ({
    label: p.label,
    value: Math.round(p.value * (180 + rng() * 60)),
    prev: Math.round((p.prev ?? 0) * (180 + rng() * 60)),
  }));

  const stageMetrics = meta.workflowStages.map((s) => ({
    stage: s.name,
    pending: Math.round(20 + rng() * 180),
    avgHours: Math.round(s.slaHours * (0.4 + rng() * 1.3)),
    sla: s.slaHours,
    breaches: Math.round(rng() * 25),
    rejectionRate: +(rng() * 14).toFixed(1),
    sendBackRate: +(rng() * 10).toFixed(1),
    escalations: Math.round(rng() * 8),
    oldestDays: Math.round(rng() * 12),
  }));

  const categoryDist: NamedValue[] = meta.categories.map((c) => ({
    name: c,
    value: Math.round(100 + rng() * 900),
    secondary: Math.round(rng() * 50000 + 20000),
  }));

  const subcategoryDist: NamedValue[] = meta.subcategories.slice(0, 8).map((s) => ({
    name: s.name,
    value: Math.round(40 + rng() * 400),
  }));

  const zoneRevenue: NamedValue[] = (meta.zones.length ? meta.zones : ["North", "South", "East", "West", "Central"])
    .slice(0, 6)
    .map((z) => ({ name: z, value: Math.round(50000 + rng() * 250000) }));

  const renewalBuckets = [
    { name: "≤ 7 days", value: 42 },
    { name: "8–30 days", value: 128 },
    { name: "31–60 days", value: 86 },
    { name: "61–90 days", value: 54 },
    { name: "Expired", value: 31 },
  ];

  const renewalFunnel = [
    { name: "Eligible", value: 1240 },
    { name: "Notified", value: 1180 },
    { name: "Started", value: 920 },
    { name: "Paid", value: 780 },
    { name: "Issued", value: 765 },
  ];

  const queues = meta.workflowStages.map((s, i) => ({
    stage: s.name,
    pending: stageMetrics[i].pending,
    assignees: 2 + Math.round(rng() * 6),
    oldestDays: stageMetrics[i].oldestDays,
    capacity: 50 + Math.round(rng() * 100),
    load: Math.round(40 + rng() * 60),
  }));

  const oldestPending = Array.from({ length: 8 }).map((_, i) => ({
    id: `APP-2025-${(10234 + i).toString()}`,
    applicant: ["R. Sharma", "M. Iyer", "S. Khan", "P. Banerjee", "A. Reddy", "K. Joshi", "N. Verma", "T. Das"][i],
    stage: meta.workflowStages[i % meta.workflowStages.length].name,
    ageDays: 18 - i,
    assignee: ["officer.a", "officer.b", "officer.c", "officer.d"][i % 4],
    zone: (meta.zones.length ? meta.zones : ["North", "South", "East", "West"])[i % 4],
  }));

  return {
    monthlyApps,
    monthlyRevenue,
    stageMetrics,
    categoryDist,
    subcategoryDist,
    zoneRevenue,
    renewalBuckets,
    renewalFunnel,
    queues,
    oldestPending,
    kpis: {
      activeLicenses: 18420,
      applicationsThisMonth: monthlyApps.at(-1)?.value ?? 1200,
      pending: stageMetrics.reduce((a, b) => a + b.pending, 0),
      revenue: monthlyRevenue.at(-1)?.value ?? 0,
      slaCompliance: 92.4,
      avgApprovalHours: 38,
      renewalRate: 81.2,
      rejectionRate: 6.4,
      outstanding: 184500,
      collectionEfficiency: 94.1,
    },
  };
}

export type OperationsData = ReturnType<typeof buildOperationsData>;
