import type { FeeRule, ServiceConfig } from "@/config/types";

export type DemandLineItem = { label: string; amount: number; isTax?: boolean };

export type Demand = {
  items: DemandLineItem[];
  subtotal: number;
  tax: number;
  total: number;
};

export function computeDemandForStage(
  service: ServiceConfig,
  stageId: string,
  values?: Record<string, unknown>
): Demand | null {
  const rules = service.fees.filter((f) => f.stageId === stageId);
  if (!rules.length) return null;
  const items: DemandLineItem[] = [];
  let subtotal = 0;
  let taxPercent = 0;
  for (const rule of rules) {
    const amt = computeBase(rule, values);
    items.push({ label: rule.label, amount: amt });
    subtotal += amt;
    if (rule.taxPercent && rule.taxPercent > taxPercent) taxPercent = rule.taxPercent;
  }
  let tax = 0;
  if (taxPercent > 0) {
    tax = Math.round(subtotal * (taxPercent / 100));
    items.push({ label: `Tax (${taxPercent}%)`, amount: tax, isTax: true });
  }
  return { items, subtotal, tax, total: subtotal + tax };
}

function computeBase(rule: FeeRule, _values?: Record<string, unknown>): number {
  return rule.baseAmount;
}