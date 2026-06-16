// Canonical, deterministic mock dataset for the Cape Town reports dashboard.
// All tabs read from this single file so totals reconcile across widgets.

import { WARDS, ZONES, WARDS_BY_ZONE, type Ward, type ZoneId } from "./capeTownGeo";

export { WARDS, ZONES, WARDS_BY_ZONE };
export type { Ward, ZoneId };

export const CITY = "Cape Town";
export const CURRENCY = "ZAR";

// ----- Formatters --------------------------------------------------------
export const fmtZAR = (n: number, compact = true) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(n);

export const fmtNum = (n: number, compact = false) =>
  new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);

// ----- Taxonomy ----------------------------------------------------------
export const CATEGORIES = [
  "Retail",
  "Food & Beverage",
  "Professional Services",
  "Manufacturing",
  "Health & Wellness",
  "Construction",
  "Transport & Logistics",
  "Education",
  "Hospitality",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const WORKFLOW_STAGES = [
  "Submitted",
  "Document Verification",
  "Field Inspection",
  "Officer Review",
  "Payment Pending",
  "License Issued",
] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export const STAGE_TONE: Record<WorkflowStage, "info" | "warning" | "primary" | "success"> = {
  "Submitted": "info",
  "Document Verification": "warning",
  "Field Inspection": "warning",
  "Officer Review": "primary",
  "Payment Pending": "warning",
  "License Issued": "success",
};

export const STATUSES = ["Submitted", "In Progress", "On Hold", "Approved", "Rejected", "Issued"] as const;
export type ApplicationStatus = (typeof STATUSES)[number];

// ----- Deterministic RNG -------------------------------------------------
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const pick = <T,>(r: () => number, arr: readonly T[]) => arr[Math.floor(r() * arr.length)];

// ----- Employees ---------------------------------------------------------
export type Employee = { name: string; role: "Verifier" | "Inspector" | "Approver"; email: string };
export const EMPLOYEES: Employee[] = [
  { name: "Priya Sharma",    role: "Verifier",  email: "priya.sharma@capetown.gov.za" },
  { name: "Rahul Verma",     role: "Verifier",  email: "rahul.verma@capetown.gov.za" },
  { name: "Anita Reddy",     role: "Approver",  email: "anita.reddy@capetown.gov.za" },
  { name: "Sipho Ndlovu",    role: "Inspector", email: "sipho.ndlovu@capetown.gov.za" },
  { name: "Naledi Sithole",  role: "Inspector", email: "naledi.sithole@capetown.gov.za" },
  { name: "Daniel Botha",    role: "Approver",  email: "daniel.botha@capetown.gov.za" },
];

// Deterministic mapping of workflow stage → employee responsible for that stage.
export const STAGE_EMPLOYEE: Record<WorkflowStage, Employee> = {
  "Submitted":              { name: "Citizen Portal",  role: "Verifier",  email: "portal@capetown.gov.za" },
  "Document Verification":  EMPLOYEES[0], // Priya Sharma
  "Field Inspection":       EMPLOYEES[3], // Sipho Ndlovu
  "Officer Review":         EMPLOYEES[2], // Anita Reddy
  "Payment Pending":        { name: "Payments Gateway", role: "Verifier", email: "payments@capetown.gov.za" },
  "License Issued":         EMPLOYEES[5], // Daniel Botha
};


const APPLICANTS = [
  "Thabo Mokoena", "Sipho Mthembu", "Nomvula Dlamini", "Zinhle Khumalo",
  "Liam Petersen", "Marius Botha", "Pieter de Villiers", "Marcus van Wyk",
  "Chloé Williams", "Megan Brink", "Tanya Roux", "Joshua Hendricks",
  "Fatima Adams", "Imran Khan", "Rashid Cassim", "Yusuf Domingo",
  "Ayesha Manuel", "Hassan Salie", "Naledi Sithole", "Lerato Mahlangu",
  "Khanyi Zulu", "Sibongile Hadebe", "Bongani Cele", "Sanele Maseko",
  "Nokuthula Buthelezi", "Karabo Mahlatsi", "Aisha Patel", "Riya Singh",
  "Luca Moodley", "Ethan Naidoo",
];


const BIZ_SUFFIX = ["Traders", "Holdings", "Enterprises", "& Co.", "Ventures", "Group", "Bros."];
const STREETS = ["Long Street", "Bree Street", "Voortrekker Rd", "Main Rd", "Klipfontein Rd",
  "Lansdowne Rd", "Modderdam Rd", "Strand Street", "Wale Street", "Buitengracht St"];

// ----- Application generation -------------------------------------------
export type AppRecord = {
  id: string;
  applicant: string;
  contact: { phone: string; email: string };
  idType: "SA ID" | "Passport";
  idNumber: string;
  business: {
    name: string;
    category: Category;
    ownership: "Sole Proprietor" | "Pty (Ltd)" | "Partnership" | "Cooperative";
    startDate: string;
    shopAreaSqFt: number;
    hazardous: boolean;
  };
  location: { line1: string; ward: string; zoneId: ZoneId; postcode: string };
  stage: WorkflowStage;
  status: ApplicationStatus;
  assignedTo: Employee;
  channel: "Online" | "Counter" | "Agent" | "Mobile";
  submittedAt: number;
  ageDays: number;
  feeZAR: number;
  history: { stage: WorkflowStage; at: number; actor: string; role: string; note: string }[];
  inspection?: { scheduledAt?: number; inspector?: string; findings?: string; recommendation?: "Pass" | "Conditional" | "Fail" };
};

const STAGE_AGE_WEIGHT: Record<WorkflowStage, number> = {
  "Submitted": 1,
  "Document Verification": 4,
  "Field Inspection": 6, // intentionally heaviest (back-log realism)
  "Officer Review": 3,
  "Payment Pending": 2,
  "License Issued": 5,
};

const NOW = Date.UTC(2026, 4, 27); // fixed reference so demo data is stable

function generateApplications(): AppRecord[] {
  const r = rng(2026);
  const list: AppRecord[] = [];
  // Build a weighted stage pool to bias the distribution realistically.
  const stagePool: WorkflowStage[] = [];
  WORKFLOW_STAGES.forEach((s) => {
    for (let i = 0; i < STAGE_AGE_WEIGHT[s] * 4; i++) stagePool.push(s);
  });

  for (let i = 0; i < 80; i++) {
    const ward = pick(r, WARDS);
    const cat = pick(r, CATEGORIES);
    const applicant = pick(r, APPLICANTS);
    const stage = stagePool[Math.floor(r() * stagePool.length)];
    const status: ApplicationStatus =
      stage === "License Issued" ? "Issued"
      : stage === "Submitted" ? "Submitted"
      : "In Progress";
    const stageIdx = WORKFLOW_STAGES.indexOf(stage);
    const ageDays = Math.max(1, Math.floor(r() * 22) + stageIdx * 2);
    const submittedAt = NOW - ageDays * 86400_000;
    const emp = pick(r, EMPLOYEES);
    const channel = pick(r, ["Online", "Online", "Online", "Counter", "Agent", "Mobile"] as const);
    const startYear = 2018 + Math.floor(r() * 8);
    const bizName = `${applicant.split(" ")[0]} ${pick(r, BIZ_SUFFIX)}`;
    const phone = `+27 ${60 + Math.floor(r() * 40)} ${100 + Math.floor(r() * 899)} ${1000 + Math.floor(r() * 8999)}`;
    const idType: "SA ID" | "Passport" = r() < 0.85 ? "SA ID" : "Passport";
    const idNumber = idType === "SA ID"
      ? `${800101 + Math.floor(r() * 99999)}${1000 + Math.floor(r() * 8999)}${80 + Math.floor(r() * 19)}`
      : `A${String(10000000 + Math.floor(r() * 89999999))}`;

    // Build a history up to current stage.
    const history: AppRecord["history"] = [
      { stage: "Submitted", at: submittedAt, actor: applicant, role: "Citizen", note: `Application submitted via ${channel}.` },
    ];
    for (let j = 1; j <= stageIdx; j++) {
      const at = submittedAt + Math.floor((ageDays / Math.max(stageIdx, 1)) * j * 86400_000 * (0.7 + r() * 0.6));
      const stageName = WORKFLOW_STAGES[j];
      const roleMap: Record<WorkflowStage, string> = {
        "Submitted": "Citizen",
        "Document Verification": "Document Verifier",
        "Field Inspection": "Field Inspector",
        "Officer Review": "Reviewing Officer",
        "Payment Pending": "Payments",
        "License Issued": "Approver",
      };
      const actor = stageName === "Payment Pending" ? "Payments Gateway"
        : stageName === "Submitted" ? applicant
        : pick(r, EMPLOYEES).name;
      history.push({ stage: stageName, at, actor, role: roleMap[stageName],
        note: stageName === "Document Verification" ? "Documents under review."
          : stageName === "Field Inspection" ? "Inspection assigned to field officer."
          : stageName === "Officer Review" ? "Sent to officer for compliance check."
          : stageName === "Payment Pending" ? "Issuance invoice raised."
          : stageName === "License Issued" ? "Business license issued to applicant."
          : "Stage updated." });
    }

    const inspection = stageIdx >= 2 ? {
      scheduledAt: submittedAt + 5 * 86400_000,
      inspector: emp.role === "Inspector" ? emp.name : pick(r, EMPLOYEES.filter((e) => e.role === "Inspector")).name,
      findings: stageIdx >= 3
        ? "Premises compliant. Signage and safety norms verified."
        : "Inspection pending walkthrough.",
      recommendation: stageIdx >= 3 ? "Pass" as const : undefined,
    } : undefined;

    list.push({
      id: `CT-TL-${(20240 + i).toString()}`,
      applicant,
      contact: { phone, email: `${applicant.toLowerCase().replace(/\W+/g, ".")}@capetown.demo` },
      idType, idNumber,
      business: {
        name: bizName,
        category: cat,
        ownership: pick(r, ["Sole Proprietor", "Pty (Ltd)", "Partnership", "Cooperative"] as const),
        startDate: `${startYear}-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
        shopAreaSqFt: 120 + Math.floor(r() * 1400),
        hazardous: r() < 0.12,
      },
      location: {
        line1: `${1 + Math.floor(r() * 240)} ${pick(r, STREETS)}`,
        ward: ward.name,
        zoneId: ward.zoneId,
        postcode: ward.postcode,
      },
      stage, status, assignedTo: emp, channel,
      submittedAt, ageDays,
      feeZAR: 320 + Math.floor(r() * 1800),
      history, inspection,
    });
  }
  return list.sort((a, b) => b.ageDays - a.ageDays);
}

export const APPLICATIONS: AppRecord[] = generateApplications();

// ----- Derived aggregates (single source of truth) ----------------------
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const COUNTS_BY_STAGE: Record<WorkflowStage, number> = WORKFLOW_STAGES.reduce((acc, s) => {
  acc[s] = APPLICATIONS.filter((a) => a.stage === s).length;
  return acc;
}, {} as Record<WorkflowStage, number>);

// Scale factor so the dashboard reads at municipal scale (real apps × N).
const SCALE = 80;

export const COUNTS_BY_STAGE_SCALED: Record<WorkflowStage, number> = WORKFLOW_STAGES.reduce((acc, s) => {
  acc[s] = COUNTS_BY_STAGE[s] * SCALE;
  return acc;
}, {} as Record<WorkflowStage, number>);

// Override scaled counts so Field Inspection clearly outranks Document Verification.
COUNTS_BY_STAGE_SCALED["Document Verification"] = 1840;
COUNTS_BY_STAGE_SCALED["Field Inspection"]     = 2160;
COUNTS_BY_STAGE_SCALED["Officer Review"]       = 1280;
COUNTS_BY_STAGE_SCALED["Payment Pending"]      = 720;
COUNTS_BY_STAGE_SCALED["Submitted"]            = 412;
COUNTS_BY_STAGE_SCALED["License Issued"]       = 11_840;

// Ward-level operational data for the map (volumes scale × 80).
export type WardMetrics = {
  trades: number; newReg: number; revenue: number; renewalPct: number; procDays: number;
};
export const WARD_METRICS: Record<string, WardMetrics> = (() => {
  const r = rng(99);
  const out: Record<string, WardMetrics> = {};
  WARDS.forEach((w) => {
    const base = 1200 + Math.floor(r() * 9000);
    out[w.id] = {
      trades: base,
      newReg: Math.floor(base * (0.25 + r() * 0.25)),
      revenue: Math.floor(base * (800 + r() * 1400)),
      renewalPct: 78 + Math.floor(r() * 16),
      procDays: 3 + Math.round(r() * 40) / 10,
    };
  });
  return out;
})();

export const zoneMetrics = (zoneId: ZoneId): WardMetrics => {
  const ws = WARDS_BY_ZONE[zoneId];
  return {
    trades: sum(ws.map((w) => WARD_METRICS[w.id].trades)),
    newReg: sum(ws.map((w) => WARD_METRICS[w.id].newReg)),
    revenue: sum(ws.map((w) => WARD_METRICS[w.id].revenue)),
    renewalPct: Math.round(sum(ws.map((w) => WARD_METRICS[w.id].renewalPct)) / ws.length),
    procDays: Math.round(sum(ws.map((w) => WARD_METRICS[w.id].procDays)) * 10 / ws.length) / 10,
  };
};

export const cityMetrics = (): WardMetrics => ({
  trades: sum(ZONES.map((z) => zoneMetrics(z.id).trades)),
  newReg: sum(ZONES.map((z) => zoneMetrics(z.id).newReg)),
  revenue: sum(ZONES.map((z) => zoneMetrics(z.id).revenue)),
  renewalPct: Math.round(sum(ZONES.map((z) => zoneMetrics(z.id).renewalPct)) / ZONES.length),
  procDays: Math.round(sum(ZONES.map((z) => zoneMetrics(z.id).procDays)) * 10 / ZONES.length) / 10,
});

// ----- Executive Summary KPIs (city totals) -----------------------------
const CITY_TOTALS = cityMetrics();
export const EXEC_KPIS = {
  activeTrades: CITY_TOTALS.trades,
  openApplications:
    COUNTS_BY_STAGE_SCALED["Submitted"] +
    COUNTS_BY_STAGE_SCALED["Document Verification"] +
    COUNTS_BY_STAGE_SCALED["Field Inspection"] +
    COUNTS_BY_STAGE_SCALED["Officer Review"] +
    COUNTS_BY_STAGE_SCALED["Payment Pending"],
  revenueCollected: CITY_TOTALS.revenue,
  renewalRate: CITY_TOTALS.renewalPct,
};

// ----- Trades by Category (canonical) -----------------------------------
const CAT_WEIGHTS: Record<Category, number> = {
  "Retail": 0.22, "Food & Beverage": 0.16, "Professional Services": 0.15,
  "Manufacturing": 0.10, "Health & Wellness": 0.08, "Construction": 0.08,
  "Transport & Logistics": 0.07, "Education": 0.07, "Hospitality": 0.07,
};
export type CategoryRow = {
  category: Category; active: number; newReg: number; revenue: number;
  renewalRate: number; yoyGrowth: number;
};
export const CATEGORY_ROWS: CategoryRow[] = CATEGORIES.map((c, i) => {
  const w = CAT_WEIGHTS[c];
  return {
    category: c,
    active: Math.round(EXEC_KPIS.activeTrades * w),
    newReg:  Math.round(EXEC_KPIS.openApplications * w * 0.9),
    revenue: Math.round(EXEC_KPIS.revenueCollected * w),
    renewalRate: 79 + ((i * 3) % 14),
    yoyGrowth:  -2 + ((i * 5) % 22),
  };
});

// ----- YoY series -------------------------------------------------------
export const YOY_TRADES_FY = [
  { fy: "FY 21-22", trades: Math.round(EXEC_KPIS.activeTrades * 0.79) },
  { fy: "FY 22-23", trades: Math.round(EXEC_KPIS.activeTrades * 0.87) },
  { fy: "FY 23-24", trades: Math.round(EXEC_KPIS.activeTrades * 0.94) },
  { fy: "FY 24-25", trades: EXEC_KPIS.activeTrades },
];
export const YOY_TRADES_MONTHLY = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"]
  .map((m, i) => ({ m, trades: Math.round(EXEC_KPIS.activeTrades * (0.94 + i * 0.005)) }));

export const CATEGORY_MIX_TREND = YOY_TRADES_FY.map((y, idx) => {
  const scale = y.trades / EXEC_KPIS.activeTrades;
  // Slight drift per FY so the trend reads as believable composition shift.
  const drift = (i: number) => 1 + ((3 - idx) * (i % 2 === 0 ? -0.015 : 0.022));
  const row: Record<string, number | string> = { fy: y.fy };
  CATEGORY_ROWS.forEach((r, i) => {
    row[r.category] = Math.round(r.active * scale * drift(i));
  });
  return row as { fy: string } & Record<Category, number>;
});

// Category × Zone density (active trades)
export const ZONE_CATEGORY_DENSITY: Record<string, Partial<Record<Category, number>>> =
  ZONES.reduce((acc, z) => {
    const zTrades = zoneMetrics(z.id).trades;
    acc[z.name] = {};
    CATEGORIES.forEach((c) => {
      acc[z.name]![c] = Math.round(zTrades * CAT_WEIGHTS[c]);
    });
    return acc;
  }, {} as Record<string, Partial<Record<Category, number>>>);


export const ZONE_NAMES = ZONES.map((z) => z.name);

export const NET_DELTA_CATEGORY = CATEGORY_ROWS.map((r) => ({
  category: r.category,
  newReg: Math.round(r.newReg * 0.55),
  lapsed: Math.round(r.newReg * 0.32),
}));

export const NET_DELTA_ZONE = ZONES.map((z) => {
  const zm = zoneMetrics(z.id);
  return { zone: z.name, newReg: zm.newReg, exits: Math.round(zm.newReg * 0.45), net: Math.round(zm.newReg * 0.55) };
});

// ----- Applications & Renewals ------------------------------------------
const totalOpen = EXEC_KPIS.openApplications;
export const APP_KPIS = {
  totalApplications: totalOpen + COUNTS_BY_STAGE_SCALED["License Issued"],
  submitted: COUNTS_BY_STAGE_SCALED["Submitted"],
  approved: COUNTS_BY_STAGE_SCALED["License Issued"],
  rejected: 86,
  pendingRenewals: 342,
  renewalRate: EXEC_KPIS.renewalRate,
  onTimeRenewalRate: EXEC_KPIS.renewalRate - 12,
  lateRenewalRate: 8.4,
  revokedCancelled: 124,
};

export const OPEN_APPS_BY_STAGE = (
  ["Submitted", "Document Verification", "Field Inspection", "Officer Review", "Payment Pending"] as WorkflowStage[]
).map((s) => ({ stage: s, count: COUNTS_BY_STAGE_SCALED[s] }));

export const SUBMISSION_CHANNEL = [
  { channel: "Online",  count: Math.round(totalOpen * 0.62) },
  { channel: "Counter", count: Math.round(totalOpen * 0.21) },
  { channel: "Agent",   count: Math.round(totalOpen * 0.11) },
  { channel: "Mobile",  count: Math.round(totalOpen * 0.06) },
];

export const RENEWAL_RATE_CATEGORY = CATEGORY_ROWS.map((r) => ({
  label: r.category, rate: r.renewalRate,
}));
export const RENEWAL_RATE_ZONE = ZONES.map((z) => ({
  label: z.name, rate: zoneMetrics(z.id).renewalPct,
}));
export const RENEWAL_RATE_WARDS = WARDS
  .map((w) => ({ name: w.name, rate: WARD_METRICS[w.id].renewalPct }))
  .sort((a, b) => b.rate - a.rate)
  .slice(0, 6);

export const RENEWAL_AGING = [
  { bucket: "≤ 7 days",   count: 38 },
  { bucket: "8-30 days",  count: 132 },
  { bucket: "31-60 days", count: 88 },
  { bucket: "61-90 days", count: 56 },
  { bucket: "Expired",    count: 28 },
];

// ----- Revenue ----------------------------------------------------------
const totalRev = EXEC_KPIS.revenueCollected;
const lastRev = Math.round(totalRev * 0.92);
export const REVENUE_KPIS = {
  totalYTD: totalRev, totalYTDLast: lastRev,
  newLicense: Math.round(totalRev * 0.43),  newLicenseLast: Math.round(lastRev * 0.43),
  renewal:    Math.round(totalRev * 0.57),  renewalLast:    Math.round(lastRev * 0.57),
};
export const MONTHLY_REVENUE_TREND = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"]
  .map((m, i) => ({
    m,
    new:     +(((REVENUE_KPIS.newLicense / 12) / 1_000_000) * (0.85 + i * 0.025)).toFixed(2),
    renewal: +(((REVENUE_KPIS.renewal    / 12) / 1_000_000) * (0.85 + i * 0.028)).toFixed(2),
  }));

export const REVENUE_BY_ZONE_FY = ZONES.map((z) => {
  const cur = zoneMetrics(z.id).revenue / 1_000_000;
  return { zone: z.name, fy2425: +cur.toFixed(1), fy2324: +(cur * 0.91).toFixed(1) };
});

export const REVENUE_BY_CATEGORY = CATEGORY_ROWS.map((r) => ({
  category: r.category, revenue: +(r.revenue / 1_000_000).toFixed(1),
}));

// ----- Process Efficiency -----------------------------------------------
export const PROC_KPIS = {
  avgIssuanceDays: 4.2, avgIssuanceDaysLast: 5.0,
  slaCompliance: 78.3,  slaComplianceLast: 79.7,
  pendingApplications:
    COUNTS_BY_STAGE_SCALED["Submitted"] +
    COUNTS_BY_STAGE_SCALED["Document Verification"] +
    COUNTS_BY_STAGE_SCALED["Field Inspection"] +
    COUNTS_BY_STAGE_SCALED["Officer Review"] +
    COUNTS_BY_STAGE_SCALED["Payment Pending"],
  oldestPendingDays: Math.max(...APPLICATIONS.filter((a) => a.stage !== "License Issued").map((a) => a.ageDays)),
};

export const ISSUANCE_HEATMAP: Record<string, Partial<Record<Category, number>>> =
  ZONES.reduce((acc, z, zi) => {
    const base = zoneMetrics(z.id).procDays;
    acc[z.name] = {};
    CATEGORIES.forEach((c, i) => {
      // Most cells land ≤7d (green) or ≤14d (amber); a few high-complexity
      // categories in slower zones push past 14d to reflect the ~22% SLA miss.
      const complexity = i >= 6 ? 1.6 + (i - 6) * 1.4 : i * 0.4;
      const zoneDrag = zi >= 3 ? 1.2 : 0;
      acc[z.name]![c] = +(base + complexity + zoneDrag - 0.5).toFixed(1);
    });
    return acc;
  }, {} as Record<string, Partial<Record<Category, number>>>);


// Pipeline (backlog) with ageing buckets per workflow stage.
// Totals use raw COUNTS_BY_STAGE so the Pending Applications table row count
// matches the chart segment when a stage is selected.
export const PENDING_BY_STAGE_AGED = (
  ["Submitted", "Document Verification", "Field Inspection", "Officer Review", "Payment Pending"] as WorkflowStage[]
).map((s) => {
  const total = COUNTS_BY_STAGE[s];
  const idx = WORKFLOW_STAGES.indexOf(s);
  const tilt = idx / 5;
  const b14 = Math.round(total * (0.04 + tilt * 0.18));
  const b8  = Math.round(total * (0.10 + tilt * 0.14));
  const b4  = Math.round(total * (0.22 + tilt * 0.06));
  const b3  = total - b14 - b8 - b4;
  return {
    stage: s, total,
    "≤3d": b3, "4-7d": b4, "8-14d": b8, ">14d": b14,
    avgDays: +(1 + tilt * 4).toFixed(1),
  };
});

