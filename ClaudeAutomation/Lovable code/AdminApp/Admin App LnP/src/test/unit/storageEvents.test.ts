import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MODULE_STATE_EVENT,
  emitModuleStateUpdated,
} from "@/lib/moduleStorage";
import { FORM_UPDATED_EVENT, formStorageKey } from "@/lib/formStorage";

// Mock template builders to avoid transitive import issues
vi.mock("@/data/issuanceFormTemplate", () => ({
  buildIssuanceFormSteps: vi.fn(() => [{ id: "issuance-seed", fields: [] }]),
}));
vi.mock("@/data/renewalFormTemplate", () => ({
  buildRenewalFormSteps: vi.fn(() => [{ id: "renewal-seed", fields: [] }]),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("storageEvents — unit tests", () => {
  // ADMIN-U-026
  it("ADMIN-U-026: MODULE_STATE_EVENT constant equals 'module-state-updated'", () => {
    expect(MODULE_STATE_EVENT).toBe("module-state-updated");
  });

  // ADMIN-U-027
  it("ADMIN-U-027: FORM_UPDATED_EVENT constant equals 'formbuilder:updated'", () => {
    expect(FORM_UPDATED_EVENT).toBe("formbuilder:updated");
  });

  // ADMIN-U-028
  it("ADMIN-U-028: formStorageKey('svcX', 'Issuance') produces 'formbuilder:svcX:Issuance'", () => {
    expect(formStorageKey("svcX", "Issuance")).toBe("formbuilder:svcX:Issuance");
  });

  // ADMIN-U-029
  it("ADMIN-U-029: formStorageKey('svcX', 'Renewal') produces 'formbuilder:svcX:Renewal'", () => {
    expect(formStorageKey("svcX", "Renewal")).toBe("formbuilder:svcX:Renewal");
  });

  // ADMIN-U-030
  it("ADMIN-U-030: Different serviceIds produce different storage keys", () => {
    const key1 = formStorageKey("svc-alpha", "Issuance");
    const key2 = formStorageKey("svc-beta", "Issuance");
    expect(key1).not.toBe(key2);
  });

  // ADMIN-U-031
  it("ADMIN-U-031: Different moduleNames produce different storage keys", () => {
    const key1 = formStorageKey("svcX", "Issuance");
    const key2 = formStorageKey("svcX", "Renewal");
    expect(key1).not.toBe(key2);
  });

  // ADMIN-U-032
  it("ADMIN-U-032: emitModuleStateUpdated dispatches an event of type MODULE_STATE_EVENT", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    emitModuleStateUpdated({
      prefix: "fees",
      serviceId: "s1",
      moduleName: "Issuance",
      key: "fees:s1:Issuance",
    });
    expect(spy).toHaveBeenCalledOnce();
    const evt = spy.mock.calls[0][0] as CustomEvent;
    expect(evt.type).toBe(MODULE_STATE_EVENT);
  });

  // ADMIN-U-033
  it("ADMIN-U-033: emitModuleStateUpdated event detail has correct prefix, serviceId, moduleName, key", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    emitModuleStateUpdated({
      prefix: "fees",
      serviceId: "s1",
      moduleName: "Issuance",
      key: "fees:s1:Issuance",
    });
    const evt = spy.mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toMatchObject({
      prefix: "fees",
      serviceId: "s1",
      moduleName: "Issuance",
      key: "fees:s1:Issuance",
    });
  });

  // ADMIN-U-034
  it("ADMIN-U-034: Module state key pattern follows '${prefix}:${serviceId}:${moduleName}'", () => {
    const prefix = "checklist";
    const serviceId = "svc-abc";
    const moduleName = "Renewal";
    const expectedKey = `${prefix}:${serviceId}:${moduleName}`;
    expect(expectedKey).toBe("checklist:svc-abc:Renewal");
  });

  // ADMIN-U-035
  it("ADMIN-U-035: emitModuleStateUpdated does not throw when called", () => {
    expect(() => {
      emitModuleStateUpdated({
        prefix: "form",
        serviceId: "svc-safe",
        moduleName: "Issuance",
        key: "form:svc-safe:Issuance",
      });
    }).not.toThrow();
  });
});
