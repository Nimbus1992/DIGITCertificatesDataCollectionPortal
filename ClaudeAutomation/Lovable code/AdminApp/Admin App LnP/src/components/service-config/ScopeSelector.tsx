import React from "react";
import { cn } from "@/lib/utils";
import type { WorkflowScope } from "@/contexts/OnboardingContext";

export type ScopeOption = WorkflowScope;

interface Props {
  value: ScopeOption;
  onChange: (next: ScopeOption) => void;
  available?: { by_category?: boolean; by_subcategory?: boolean };
  labels?: Partial<Record<ScopeOption, string>>;
  className?: string;
  size?: "sm" | "md";
}

const defaultLabels: Record<ScopeOption, string> = {
  shared: "All categories",
  by_category: "Specific categories",
  by_subcategory: "Specific subcategories",
};

/**
 * Reusable "Apply to" selector — used by Workflow now, ready for Fees /
 * Renewal / Documents / Notifications / Checklists.
 */
const ScopeSelector: React.FC<Props> = ({
  value, onChange, available, labels, className, size = "md",
}) => {
  const opts: ScopeOption[] = ["shared"];
  if (available?.by_category !== false) opts.push("by_category");
  if (available?.by_subcategory) opts.push("by_subcategory");

  const lbl = (k: ScopeOption) => labels?.[k] ?? defaultLabels[k];

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-md border border-input bg-background p-0.5", className)}>
      {opts.map((k) => {
        const active = value === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={cn(
              "rounded-sm transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lbl(k)}
          </button>
        );
      })}
    </div>
  );
};

export default ScopeSelector;