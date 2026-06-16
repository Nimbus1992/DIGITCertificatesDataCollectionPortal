import { describe, it, expect } from "vitest";
import { computeDemandForStage } from "@/lib/citizen/fees";
import type { FeeRule, ServiceConfig } from "@/config/types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeService(fees: FeeRule[]): ServiceConfig {
  return {
    id: "test-svc",
    arnPrefix: "TL",
    name: "Test Service",
    category: "test",
    icon: "file",
    summary: "Test",
    eligibility: [],
    documentsRequired: [],
    form: [],
    workflow: { states: [], transitions: [] },
    fees,
    notifications: [],
  };
}

function makeFee(overrides: Partial<FeeRule> = {}): FeeRule {
  return {
    id: "f1",
    stageId: "payment_due",
    label: "Application Fee",
    baseAmount: 1000,
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("computeDemandForStage", () => {
  // Test 1: Returns null when no fee rules match the given stageId
  it("returns null when no fee rules match the given stageId", () => {
    const service = makeService([makeFee({ stageId: "inspection" })]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result).toBeNull();
  });

  // Test 2: Returns null for empty fees array
  it("returns null for empty fees array", () => {
    const service = makeService([]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result).toBeNull();
  });

  // Test 3: Returns a Demand object when one matching rule exists
  it("returns a Demand object when one matching rule exists", () => {
    const service = makeService([makeFee()]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("subtotal");
    expect(result).toHaveProperty("tax");
    expect(result).toHaveProperty("total");
  });

  // Test 4: subtotal equals baseAmount for a single rule
  it("subtotal equals baseAmount for a single rule", () => {
    const service = makeService([makeFee({ baseAmount: 1000 })]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result?.subtotal).toBe(1000);
  });

  // Test 5: tax is correctly calculated: Math.round(1000 * 10 / 100) === 100
  it("calculates tax correctly as Math.round(subtotal * taxPercent / 100)", () => {
    const service = makeService([makeFee({ baseAmount: 1000, taxPercent: 10 })]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result?.tax).toBe(Math.round(1000 * 10 / 100));
    expect(result?.tax).toBe(100);
  });

  // Test 6: total = subtotal + tax (e.g. 1000 + 100 = 1100)
  it("total equals subtotal + tax", () => {
    const service = makeService([makeFee({ baseAmount: 1000, taxPercent: 10 })]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result?.total).toBe(1000 + 100);
    expect(result?.total).toBe(result!.subtotal + result!.tax);
  });

  // Test 7: items array includes the fee item AND a tax item when taxPercent > 0
  it("items includes both fee item and tax item when taxPercent > 0", () => {
    const service = makeService([makeFee({ baseAmount: 1000, taxPercent: 10 })]);
    const result = computeDemandForStage(service, "payment_due");
    expect(result?.items).toHaveLength(2);
    const feeItem = result?.items.find((i) => i.label === "Application Fee");
    const taxItem = result?.items.find((i) => i.isTax === true);
    expect(feeItem).toBeDefined();
    expect(taxItem).toBeDefined();
  });

  // Test 8: Tax item has isTax: true
  it("tax item has isTax: true", () => {
    const service = makeService([makeFee({ baseAmount: 1000, taxPercent: 10 })]);
    const result = computeDemandForStage(service, "payment_due");
    const taxItem = result?.items.find((i) => i.isTax === true);
    expect(taxItem?.isTax).toBe(true);
  });

  // Test 9: Multiple matching rules: subtotal is sum of all baseAmount values
  it("subtotal is sum of all baseAmount values for multiple matching rules", () => {
    const fees: FeeRule[] = [
      makeFee({ id: "f1", baseAmount: 500 }),
      makeFee({ id: "f2", baseAmount: 750, label: "Inspection Fee" }),
      makeFee({ id: "f3", baseAmount: 250, label: "Processing Fee" }),
    ];
    const service = makeService(fees);
    const result = computeDemandForStage(service, "payment_due");
    expect(result?.subtotal).toBe(500 + 750 + 250);
    expect(result?.subtotal).toBe(1500);
  });

  // Test 10: taxPercent: 0 (or undefined) produces tax: 0 and no tax item in items
  it("produces tax: 0 and no tax item when taxPercent is 0 or undefined", () => {
    // With taxPercent: 0
    const serviceZero = makeService([makeFee({ baseAmount: 1000, taxPercent: 0 })]);
    const resultZero = computeDemandForStage(serviceZero, "payment_due");
    expect(resultZero?.tax).toBe(0);
    expect(resultZero?.items.some((i) => i.isTax)).toBe(false);

    // With taxPercent: undefined
    const serviceUndef = makeService([makeFee({ baseAmount: 1000 })]);
    const resultUndef = computeDemandForStage(serviceUndef, "payment_due");
    expect(resultUndef?.tax).toBe(0);
    expect(resultUndef?.items.some((i) => i.isTax)).toBe(false);
  });
});
