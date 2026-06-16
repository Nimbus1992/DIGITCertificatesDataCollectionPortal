import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------- Section -------- */
export const Section: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}> = ({ title, description, actions, children, id }) => (
  <section id={id} className="scroll-mt-20">
    <div className="flex items-end justify-between gap-4 mb-3 pb-2 border-b border-border/70">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {actions}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

/* -------- Panel -------- */
export const Panel: React.FC<{
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
}> = ({ title, subtitle, actions, className, children, padded = true }) => (
  <div className={cn("rounded-md border bg-card", className)}>
    {(title || actions) && (
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <div>
          {title && <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h3>}
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className={cn(padded && "p-4")}>{children}</div>
  </div>
);

/* -------- KPI -------- */
export interface KpiProps {
  label: string;
  value: string | number;
  delta?: number; // percentage change
  hint?: string;
  unit?: string;
  intent?: "neutral" | "good" | "warn" | "bad";
}

function formatDelta(d: number) {
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}%`;
}

export const Kpi: React.FC<KpiProps> = ({ label, value, delta, hint, unit, intent = "neutral" }) => {
  const dirUp = (delta ?? 0) > 0;
  const dirDown = (delta ?? 0) < 0;
  const tone =
    intent === "good"
      ? "text-success"
      : intent === "warn"
        ? "text-warning"
        : intent === "bad"
          ? "text-destructive"
          : dirUp
            ? "text-success"
            : dirDown
              ? "text-destructive"
              : "text-muted-foreground";

  return (
    <div className="px-4 py-3 flex flex-col justify-between min-h-[88px]">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="text-2xl font-semibold text-foreground tabular-nums leading-none">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium tabular-nums", tone)}>
            {dirUp ? <ArrowUpRight className="h-3 w-3" /> : dirDown ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {formatDelta(delta)}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
};

export const KpiRow: React.FC<{ children: React.ReactNode; cols?: number }> = ({ children, cols = 4 }) => (
  <div
    className={cn(
      "rounded-md border bg-card grid divide-x divide-y md:divide-y-0 divide-border",
      cols === 4 && "grid-cols-2 md:grid-cols-4",
      cols === 5 && "grid-cols-2 md:grid-cols-5",
      cols === 6 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      cols === 8 && "grid-cols-2 md:grid-cols-4 lg:grid-cols-8",
    )}
  >
    {children}
  </div>
);

/* -------- Severity Chip -------- */
export const Chip: React.FC<{
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  children: React.ReactNode;
  className?: string;
}> = ({ tone = "neutral", children, className }) => (
  <span
    className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border",
      tone === "neutral" && "bg-muted text-muted-foreground border-border",
      tone === "good" && "bg-success/10 text-success border-success/30",
      tone === "warn" && "bg-warning/10 text-warning border-warning/30",
      tone === "bad" && "bg-destructive/10 text-destructive border-destructive/30",
      tone === "info" && "bg-primary/10 text-primary border-primary/30",
      className,
    )}
  >
    {children}
  </span>
);
