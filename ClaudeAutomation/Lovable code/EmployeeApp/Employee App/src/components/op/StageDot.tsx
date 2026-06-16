import { STAGE_LABELS, STAGE_TONE } from "@/lib/store";
import type { StageId } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  primary: "bg-primary/10 text-primary",
};

const dotClasses: Record<string, string> = {
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  primary: "bg-primary",
};

export function StageDot({ stage, className }: { stage: StageId; className?: string }) {
  const tone = STAGE_TONE[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClasses[tone])} />
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function StageAccentBar({ stage }: { stage: StageId }) {
  const tone = STAGE_TONE[stage];
  return <div className={cn("h-1 w-full rounded-t-xl", dotClasses[tone])} />;
}
