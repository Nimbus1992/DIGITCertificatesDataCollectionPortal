import type { ServiceConfig, WorkflowState, WorkflowTransition } from "@/config/types";

export function getState(service: ServiceConfig, stateId: string): WorkflowState | undefined {
  return service.workflow.states.find((s) => s.id === stateId);
}

export function nextTransitions(service: ServiceConfig, currentStateId: string): WorkflowTransition[] {
  return service.workflow.transitions.filter((t) => t.from === currentStateId);
}

export function startState(service: ServiceConfig): WorkflowState {
  const s = service.workflow.states.find((x) => x.kind === "start");
  if (!s) throw new Error("Service has no start state");
  return s;
}

export function stageHasFee(service: ServiceConfig, stateId: string): boolean {
  return service.fees.some((f) => f.stageId === stateId);
}

export type StatusVariant =
  | "submitted"
  | "in_review"
  | "payment_required"
  | "approved"
  | "rejected"
  | "issued";

export function statusLabel(
  service: ServiceConfig,
  stateId: string
): { label: string; variant: StatusVariant } {
  const s = getState(service, stateId);
  if (!s) return { label: "Unknown", variant: "submitted" };
  if (s.kind === "end") {
    if (s.endStatus === "rejected") return { label: "Rejected", variant: "rejected" };
    if (s.endStatus === "issued") return { label: "Issued", variant: "issued" };
    return { label: "Approved", variant: "approved" };
  }
  const variant: StatusVariant =
    s.chip ?? (s.kind === "start" ? "submitted" : "in_review");
  if (variant === "payment_required") return { label: "Payment Required", variant };
  if (variant === "submitted") return { label: "Submitted", variant };
  return { label: "In Review", variant: "in_review" };
}