import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildSeedStates,
  buildSeedTransitions,
  type WorkflowStateRecord,
  type WorkflowTransitionRecord,
} from "@/data/workflowSeeds";

export const WORKFLOW_UPDATED_EVENT = "workflow-updated";

export interface ModuleWorkflow {
  states: WorkflowStateRecord[];
  transitions: WorkflowTransitionRecord[];
}

const readArr = <T,>(key: string): T[] | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => x != null) as T[];
  } catch { /* ignore */ }
  return null;
};

const readModule = (serviceId: string, moduleName: string): ModuleWorkflow => {
  const states = readArr<WorkflowStateRecord>(`workflow-states-v4:${serviceId}:${moduleName}`)
    ?? buildSeedStates(moduleName);
  const transitions = readArr<WorkflowTransitionRecord>(`workflow-transitions-v4:${serviceId}:${moduleName}`)
    ?? buildSeedTransitions(moduleName);
  return { states, transitions };
};

export function useServiceWorkflow(serviceId: string) {
  const read = useCallback(() => ({
    issuance: readModule(serviceId, "Issuance"),
    renewal:  readModule(serviceId, "Renewal"),
  }), [serviceId]);

  const [store, setStore] = useState(read);
  const readRef = useRef(read);
  readRef.current = read;

  useEffect(() => { setStore(readRef.current()); }, [serviceId]);

  useEffect(() => {
    const reload = () => setStore(readRef.current());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { serviceId?: string } | undefined;
      if (!detail || !detail.serviceId || detail.serviceId === serviceId) reload();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith(`workflow-states-v4:${serviceId}:`)
        || e.key.startsWith(`workflow-transitions-v4:${serviceId}:`)) reload();
    };
    window.addEventListener(WORKFLOW_UPDATED_EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(WORKFLOW_UPDATED_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [serviceId]);

  const forType = useCallback(
    (type: "NEW" | "RENEWAL"): ModuleWorkflow =>
      type === "RENEWAL" ? store.renewal : store.issuance,
    [store]
  );

  return { ...store, forType };
}

export const emitWorkflowUpdated = (serviceId: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent(WORKFLOW_UPDATED_EVENT, { detail: { serviceId } })
    );
  } catch { /* ignore */ }
};
