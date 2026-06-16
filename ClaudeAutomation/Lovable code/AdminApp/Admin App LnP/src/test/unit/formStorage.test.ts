import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formStorageKey,
  loadFormSteps,
  saveFormSteps,
  seedFormSteps,
  FORM_UPDATED_EVENT,
} from "@/lib/formStorage";

// Mock the template builders to avoid complex transitive imports
vi.mock("@/data/issuanceFormTemplate", () => ({
  buildIssuanceFormSteps: vi.fn(() => [{ id: "issuance-seed", fields: [] }]),
}));
vi.mock("@/data/renewalFormTemplate", () => ({
  buildRenewalFormSteps: vi.fn(() => [{ id: "renewal-seed", fields: [] }]),
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("formStorage — unit tests", () => {
  // ADMIN-U-001
  it("ADMIN-U-001: formStorageKey returns correct key for given serviceId and moduleName", () => {
    expect(formStorageKey("svc-1", "Issuance")).toBe("formbuilder:svc-1:Issuance");
  });

  // ADMIN-U-002
  it("ADMIN-U-002: formStorageKey falls back to 'service' when serviceId is empty", () => {
    expect(formStorageKey("", "Renewal")).toBe("formbuilder:service:Renewal");
  });

  // ADMIN-U-003
  it("ADMIN-U-003: loadFormSteps returns seed steps when localStorage has no entry", () => {
    const result = loadFormSteps("svc-1", "Issuance", {});
    expect(result).toEqual([{ id: "issuance-seed", fields: [] }]);
  });

  // ADMIN-U-004
  it("ADMIN-U-004: loadFormSteps returns persisted data when valid JSON array exists", () => {
    const persisted = [{ id: "step-persisted", fields: [{ label: "Name" }] }];
    localStorage.setItem(formStorageKey("svc-1", "Issuance"), JSON.stringify(persisted));
    const result = loadFormSteps("svc-1", "Issuance", {});
    expect(result).toEqual(persisted);
  });

  // ADMIN-U-005
  it("ADMIN-U-005: loadFormSteps returns seed when stored value is corrupt JSON", () => {
    localStorage.setItem(formStorageKey("svc-1", "Issuance"), "NOT_VALID_JSON{{{{");
    const result = loadFormSteps("svc-1", "Issuance", {});
    expect(result).toEqual([{ id: "issuance-seed", fields: [] }]);
  });

  // ADMIN-U-006
  it("ADMIN-U-006: loadFormSteps returns seed when stored value is an empty array", () => {
    localStorage.setItem(formStorageKey("svc-1", "Issuance"), JSON.stringify([]));
    const result = loadFormSteps("svc-1", "Issuance", {});
    expect(result).toEqual([{ id: "issuance-seed", fields: [] }]);
  });

  // ADMIN-U-007
  it("ADMIN-U-007: saveFormSteps writes correct JSON to localStorage", () => {
    const steps = [{ id: "step-1", fields: [] }];
    saveFormSteps("svc-1", "Issuance", steps as never);
    const stored = localStorage.getItem(formStorageKey("svc-1", "Issuance"));
    expect(stored).toBe(JSON.stringify(steps));
  });

  // ADMIN-U-008
  it("ADMIN-U-008: saveFormSteps dispatches a CustomEvent with type 'formbuilder:updated'", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    saveFormSteps("svc-1", "Issuance", [] as never);
    expect(spy).toHaveBeenCalledOnce();
    const evt = spy.mock.calls[0][0] as CustomEvent;
    expect(evt.type).toBe(FORM_UPDATED_EVENT);
  });

  // ADMIN-U-009
  it("ADMIN-U-009: saveFormSteps event detail contains serviceId, moduleName, and key", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    saveFormSteps("svc-1", "Issuance", [] as never);
    const evt = spy.mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toMatchObject({
      serviceId: "svc-1",
      moduleName: "Issuance",
      key: formStorageKey("svc-1", "Issuance"),
    });
  });

  // ADMIN-U-010
  it("ADMIN-U-010: seedFormSteps('Renewal', {}) calls the renewal builder", async () => {
    const { buildRenewalFormSteps } = await import("@/data/renewalFormTemplate");
    const result = seedFormSteps("Renewal", {});
    expect(buildRenewalFormSteps).toHaveBeenCalled();
    expect(result).toEqual([{ id: "renewal-seed", fields: [] }]);
  });

  // ADMIN-U-011
  it("ADMIN-U-011: seedFormSteps('Issuance', {}) calls the issuance builder", async () => {
    const { buildIssuanceFormSteps } = await import("@/data/issuanceFormTemplate");
    const result = seedFormSteps("Issuance", {});
    expect(buildIssuanceFormSteps).toHaveBeenCalled();
    expect(result).toEqual([{ id: "issuance-seed", fields: [] }]);
  });

  // ADMIN-U-012
  it("ADMIN-U-012: Round-trip: saveFormSteps then loadFormSteps returns identical data", () => {
    const steps = [{ id: "round-trip", fields: [{ label: "Email" }] }];
    saveFormSteps("svc-rt", "Issuance", steps as never);
    const loaded = loadFormSteps("svc-rt", "Issuance", {});
    expect(loaded).toEqual(steps);
  });
});
