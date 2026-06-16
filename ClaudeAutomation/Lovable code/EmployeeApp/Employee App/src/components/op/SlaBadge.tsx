import type { Application } from "@/lib/types";
import { getSlaStatus, SLA_LABEL, type SlaStatus } from "@/lib/sla";
import { cn } from "@/lib/utils";

const toneBg: Record<SlaStatus, string> = {
  ontrack: "bg-success-soft text-success",
  atrisk: "bg-warning-soft text-warning",
  breached: "bg-danger-soft text-danger",
};

const toneDot: Record<SlaStatus, string> = {
  ontrack: "bg-success",
  atrisk: "bg-warning",
  breached: "bg-danger",
};

export function SlaBadge({ app, className }: { app: Application; className?: string }) {
  const { status, ageDays } = getSlaStatus(app);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneBg[status],
        className,
      )}
      title={`SLA: ${SLA_LABEL[status]} · ${ageDays}d in stage`}
    >
      <span className={cn("size-1.5 rounded-full", toneDot[status])} />
      {SLA_LABEL[status]} · {ageDays}d
    </span>
  );
}
