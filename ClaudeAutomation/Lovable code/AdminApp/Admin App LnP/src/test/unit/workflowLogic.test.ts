import { vi, describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Import ONLY named exports, NOT the React hook useServiceWorkflow
// ---------------------------------------------------------------------------

import { buildSeedStates, buildSeedTransitions } from "@/data/workflowSeeds";
import { WORKFLOW_UPDATED_EVENT, emitWorkflowUpdated } from "@/lib/useServiceWorkflow";

describe("GAP-003: Workflow Logic Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: buildSeedStates("Issuance") returns non-empty array
  it("buildSeedStates('Issuance') returns a non-empty array", () => {
    const states = buildSeedStates("Issuance");
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThan(0);
  });

  // Test 2: each element has id, name, type fields
  it("buildSeedStates('Issuance') — each element has id, name, type fields", () => {
    const states = buildSeedStates("Issuance");
    for (const state of states) {
      expect(state).toHaveProperty("id");
      expect(state).toHaveProperty("name");
      expect(state).toHaveProperty("type");
      expect(typeof state.id).toBe("string");
      expect(typeof state.name).toBe("string");
      expect(typeof state.type).toBe("string");
    }
  });

  // Test 3: at least one state with type === "start"
  it("buildSeedStates('Issuance') has at least one state with type === 'start'", () => {
    const states = buildSeedStates("Issuance");
    const startStates = states.filter((s) => s.type === "start");
    expect(startStates.length).toBeGreaterThanOrEqual(1);
  });

  // Test 4: at least one state with type === "end"
  it("buildSeedStates('Issuance') has at least one state with type === 'end'", () => {
    const states = buildSeedStates("Issuance");
    const endStates = states.filter((s) => s.type === "end");
    expect(endStates.length).toBeGreaterThanOrEqual(1);
  });

  // Test 5: buildSeedStates("Renewal") returns different states than "Issuance"
  it("buildSeedStates('Renewal') returns different states than 'Issuance'", () => {
    const issuanceStates = buildSeedStates("Issuance");
    const renewalStates = buildSeedStates("Renewal");
    // They should differ in at least their first element's name or id
    const firstIssuance = issuanceStates[0];
    const firstRenewal = renewalStates[0];
    const different =
      firstIssuance.name !== firstRenewal.name || firstIssuance.id !== firstRenewal.id;
    expect(different).toBe(true);
  });

  // Test 6: buildSeedTransitions("Issuance") returns non-empty array
  it("buildSeedTransitions('Issuance') returns a non-empty array", () => {
    const transitions = buildSeedTransitions("Issuance");
    expect(Array.isArray(transitions)).toBe(true);
    expect(transitions.length).toBeGreaterThan(0);
  });

  // Test 7: each element has fromStateId, toStateId, id fields
  it("buildSeedTransitions('Issuance') — each element has fromStateId, toStateId, id fields", () => {
    const transitions = buildSeedTransitions("Issuance");
    for (const t of transitions) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("fromStateId");
      expect(t).toHaveProperty("toStateId");
      expect(typeof t.id).toBe("string");
      expect(typeof t.fromStateId).toBe("string");
      expect(typeof t.toStateId).toBe("string");
    }
  });

  // Test 8: WORKFLOW_UPDATED_EVENT constant equals "workflow-updated"
  it("WORKFLOW_UPDATED_EVENT equals 'workflow-updated'", () => {
    expect(WORKFLOW_UPDATED_EVENT).toBe("workflow-updated");
  });

  // Test 9: emitWorkflowUpdated("svc-test") dispatches event with type "workflow-updated"
  it("emitWorkflowUpdated('svc-test') dispatches a 'workflow-updated' event", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    emitWorkflowUpdated("svc-test");
    expect(spy).toHaveBeenCalledTimes(1);
    const dispatchedEvent = spy.mock.calls[0][0] as CustomEvent;
    expect(dispatchedEvent.type).toBe("workflow-updated");
  });

  // Test 10: emitWorkflowUpdated("svc-test") event detail has serviceId === "svc-test"
  it("emitWorkflowUpdated('svc-test') event detail has serviceId === 'svc-test'", () => {
    const spy = vi.spyOn(window, "dispatchEvent");
    emitWorkflowUpdated("svc-test");
    const dispatchedEvent = spy.mock.calls[0][0] as CustomEvent;
    expect(dispatchedEvent.detail).toMatchObject({ serviceId: "svc-test" });
  });
});
