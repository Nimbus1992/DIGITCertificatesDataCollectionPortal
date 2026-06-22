import type { StatusVariant } from "@/lib/citizen/workflow";

const styles: Record<StatusVariant, string> = {
  submitted: "bg-info-soft text-brand-navy",
  in_review: "bg-warning-soft text-warning-foreground",
  payment_required: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  issued: "bg-success text-success-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export function StatusChip({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  );
}