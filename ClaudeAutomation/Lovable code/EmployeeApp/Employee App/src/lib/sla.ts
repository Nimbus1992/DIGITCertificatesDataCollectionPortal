import type { Application, StageId } from "./types";

const DAY = 86_400_000;

export type SlaStatus = "ontrack" | "atrisk" | "breached";

type StageSla = { target: number; atRisk: number };

const SLA_BY_STAGE: Record<StageId, StageSla> = {
  submitted: { target: 3, atRisk: 5 },
  under_doc_verification: { target: 3, atRisk: 5 },
  inspection_pending: { target: 7, atRisk: 10 },
  inspection_scheduled: { target: 7, atRisk: 10 },
  payment_pending: { target: 5, atRisk: 7 },
  paid: { target: 2, atRisk: 3 },
  issued: { target: 0, atRisk: 0 },
  rejected: { target: 0, atRisk: 0 },
};

export function getStageEnteredAt(app: Application): number {
  for (let i = app.history.length - 1; i >= 0; i--) {
    if (app.history[i].stageId === app.currentStageId) return app.history[i].at;
  }
  return app.createdAt;
}

export function getSlaStatus(app: Application): {
  status: SlaStatus;
  ageDays: number;
  targetDays: number;
} {
  const sla = SLA_BY_STAGE[app.currentStageId];
  const ageDays = Math.max(0, Math.floor((Date.now() - getStageEnteredAt(app)) / DAY));
  let status: SlaStatus = "ontrack";
  if (sla.target > 0) {
    if (ageDays > sla.atRisk) status = "breached";
    else if (ageDays >= sla.target) status = "atrisk";
  }
  return { status, ageDays, targetDays: sla.target };
}

export const SLA_LABEL: Record<SlaStatus, string> = {
  ontrack: "On track",
  atrisk: "At risk",
  breached: "Breached",
};
