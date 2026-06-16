import { useCallback, useEffect, useMemo, useState } from "react";
import { MODULE_STATE_EVENT, type ModuleStateEventDetail } from "./moduleStorage";
import { buildDefaultRoles, type ServiceRoleRecord } from "./useServiceRoles";

import {
  TRADE_CHECKLISTS,
  TRADE_DOCUMENTS,
  TRADE_FEES,
  TRADE_PAYMENT_STAGES,
  type TradeDocumentSeed,
  type TradeFeeSeed,
  type TradePaymentStageSeed,
  type TradeChecklist,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_CHECKLISTS,
  RENEWAL_DOCUMENTS,
  RENEWAL_FEES,
  RENEWAL_PAYMENT_STAGES,
  isRenewalModule,
} from "@/data/renewalTemplate";

export interface PreviewChecklist {
  id: string;
  name: string;
  workflowState: string;
  questions: { id: string; text: string; required: boolean }[];
}

export interface PreviewDocumentSeed {
  id: string;
  name: string;
  type: string;
  generateWhen: string;
}

export interface PreviewFee {
  id: string;
  name: string;
  type: "fixed" | "slab" | "conditional" | "formula";
  amount?: number;
  slabs?: { id: string; conditionLabel: string; amount: number }[];
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  conditionAmount?: number;
  applicableStage: string;
}

export interface PreviewPaymentStage {
  id: string;
  name: string;
  workflowState: string;
  fees: string[]; // names
}

interface ModuleConfig {
  checklists: PreviewChecklist[];
  documents: PreviewDocumentSeed[];
  fees: PreviewFee[];
  paymentStages: PreviewPaymentStage[];
}

interface PreviewConfig {
  roles: ServiceRoleRecord[];
  issuance: ModuleConfig;
  renewal: ModuleConfig;
  forType: (type: "NEW" | "RENEWAL") => ModuleConfig;
}

const readArr = <T,>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => x != null) as T[];
  } catch { /* ignore */ }
  return fallback;
};

const buildModule = (serviceId: string, moduleName: string): ModuleConfig => {
  const renewal = isRenewalModule(moduleName);
  const seedChecklists: TradeChecklist[] = renewal ? (RENEWAL_CHECKLISTS as TradeChecklist[]) : TRADE_CHECKLISTS;
  const seedDocs: TradeDocumentSeed[] = renewal ? (RENEWAL_DOCUMENTS as TradeDocumentSeed[]) : TRADE_DOCUMENTS;
  const seedFees: TradeFeeSeed[] = renewal ? (RENEWAL_FEES as TradeFeeSeed[]) : TRADE_FEES;
  const seedStages: TradePaymentStageSeed[] = renewal ? (RENEWAL_PAYMENT_STAGES as TradePaymentStageSeed[]) : TRADE_PAYMENT_STAGES;

  const checklists = readArr<TradeChecklist>(
    `checklists:${serviceId}:${moduleName}`,
    seedChecklists,
  ).map((c) => ({
    id: c.id,
    name: c.name,
    workflowState: c.workflowState,
    questions: (c.questions ?? []).map((q) => ({
      id: q.id,
      text: q.text,
      required: !!q.required,
    })),
  }));

  const documents = readArr<TradeDocumentSeed>(
    `documents:${serviceId}:${moduleName}`,
    seedDocs,
  ).map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    generateWhen: d.generateWhen,
  }));

  const fees = readArr<TradeFeeSeed>(
    `fees:${serviceId}:${moduleName}`,
    seedFees,
  ).map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    amount: f.amount,
    slabs: f.slabs,
    conditionField: f.conditionField,
    conditionOperator: f.conditionOperator,
    conditionValue: f.conditionValue,
    conditionAmount: f.conditionAmount,
    applicableStage: f.applicableStage,
  }));

  const paymentStages = readArr<TradePaymentStageSeed>(
    `payments:${serviceId}:${moduleName}`,
    seedStages,
  ).map((s) => ({
    id: s.id,
    name: s.name,
    workflowState: s.workflowState,
    fees: [...(s.fees ?? [])],
  }));

  return { checklists, documents, fees, paymentStages };
};

const buildRoles = (serviceId: string): ServiceRoleRecord[] =>
  readArr<ServiceRoleRecord>(`roles:${serviceId}:__shared__`, buildDefaultRoles("Issuance"));

const buildAll = (serviceId: string) => ({
  roles: buildRoles(serviceId),
  issuance: buildModule(serviceId, "Issuance"),
  renewal: buildModule(serviceId, "Renewal"),
});

/**
 * Live, reactive view of every configurator's saved state for the current
 * service. Re-reads on `MODULE_STATE_EVENT` (same-tab) and `storage` (cross-tab).
 */
export function usePreviewConfig(serviceId: string): PreviewConfig {
  const [snap, setSnap] = useState(() => buildAll(serviceId));

  useEffect(() => { setSnap(buildAll(serviceId)); }, [serviceId]);

  useEffect(() => {
    const reload = () => setSnap(buildAll(serviceId));
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<ModuleStateEventDetail>).detail;
      if (!detail || detail.serviceId === serviceId || detail.serviceId === "service") reload();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      const prefixes = [
        `checklists:${serviceId}:`,
        `documents:${serviceId}:`,
        `fees:${serviceId}:`,
        `payments:${serviceId}:`,
        `roles:${serviceId}:`,
      ];
      if (prefixes.some((p) => e.key!.startsWith(p))) reload();
    };
    window.addEventListener(MODULE_STATE_EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(MODULE_STATE_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [serviceId]);

  const forType = useCallback(
    (type: "NEW" | "RENEWAL"): ModuleConfig =>
      type === "RENEWAL" ? snap.renewal : snap.issuance,
    [snap],
  );

  return useMemo(() => ({ ...snap, forType }), [snap, forType]);
}

// ─── Demand computation ───────────────────────────────────────────────

export interface ComputedDemandLine {
  feeId: string;
  name: string;
  amount: number;
}

export interface ComputedDemand {
  lines: ComputedDemandLine[];
  fee: number;
  tax: number;
  total: number;
}

const TAX_RATE = 0.1;

const evalConditional = (fee: PreviewFee, formData: Record<string, string>): number => {
  if (!fee.conditionField) return 0;
  // Map UI labels to known form field IDs we already collect in the wizard.
  const fieldMap: Record<string, string> = {
    "Is Hazardous": "isHazardous",
    "Area (sq ft)": "shopArea",
    "No. of Employees": "employees",
    "Business Type": "tradeType",
    "Zone": "zone",
    "Category": "businessCategory",
  };
  const valueKey = fieldMap[fee.conditionField] ?? fee.conditionField;
  const actual = (formData[valueKey] ?? "").toString();
  const expected = (fee.conditionValue ?? "").toString();
  const op = fee.conditionOperator ?? "=";
  const numActual = parseFloat(actual);
  const numExpected = parseFloat(expected);
  let matches = false;
  switch (op) {
    case "=":  matches = actual.toLowerCase() === expected.toLowerCase(); break;
    case "!=": matches = actual.toLowerCase() !== expected.toLowerCase(); break;
    case ">":  matches = numActual >  numExpected; break;
    case "<":  matches = numActual <  numExpected; break;
    case ">=": matches = numActual >= numExpected; break;
    case "<=": matches = numActual <= numExpected; break;
  }
  return matches ? (fee.conditionAmount ?? 0) : 0;
};

const evalSlab = (fee: PreviewFee, formData: Record<string, string>): number => {
  if (!fee.slabs || fee.slabs.length === 0) return 0;
  // Slabs labelled like "0–100 sq ft", "100–500 sq ft", "500+ sq ft" — match by shopArea.
  const area = parseFloat(formData.shopArea ?? "0") || 0;
  for (const slab of fee.slabs) {
    const m = slab.conditionLabel.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
    if (m) {
      const lo = parseFloat(m[1]); const hi = parseFloat(m[2]);
      if (area >= lo && area <= hi) return slab.amount;
      continue;
    }
    const open = slab.conditionLabel.match(/(\d+(?:\.\d+)?)\s*\+/);
    if (open && area >= parseFloat(open[1])) return slab.amount;
  }
  // Fallback to first slab.
  return fee.slabs[0].amount;
};

// "License Fee" type: "formula" → Area × ₹10/sq ft (with sensible floor).
const evalFormula = (_fee: PreviewFee, formData: Record<string, string>): number => {
  const area = parseFloat(formData.shopArea ?? "0") || 0;
  const computed = Math.round(area * 10);
  return computed > 0 ? computed : 1000;
};

const evalFee = (fee: PreviewFee, formData: Record<string, string>): number => {
  switch (fee.type) {
    case "fixed":       return fee.amount ?? 0;
    case "slab":        return evalSlab(fee, formData);
    case "conditional": return evalConditional(fee, formData);
    case "formula":     return evalFormula(fee, formData);
  }
};

export const computeDemandForStage = (
  stage: PreviewPaymentStage | undefined,
  fees: PreviewFee[],
  formData: Record<string, string>,
): ComputedDemand | null => {
  if (!stage) return null;
  const lines: ComputedDemandLine[] = [];
  stage.fees.forEach((feeName) => {
    const fee = fees.find((f) => f.name === feeName);
    if (!fee) return;
    const amount = evalFee(fee, formData);
    if (amount > 0) lines.push({ feeId: fee.id, name: fee.name, amount });
  });
  const fee = lines.reduce((s, l) => s + l.amount, 0);
  const tax = Math.round(fee * TAX_RATE);
  return { lines, fee, tax, total: fee + tax };
};

export const findPaymentStageForState = (
  stateName: string,
  stages: PreviewPaymentStage[],
): PreviewPaymentStage | undefined =>
  stages.find((s) => s.workflowState.trim().toLowerCase() === stateName.trim().toLowerCase());
