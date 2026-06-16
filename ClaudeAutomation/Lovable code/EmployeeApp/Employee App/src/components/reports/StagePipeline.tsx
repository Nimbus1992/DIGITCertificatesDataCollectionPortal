import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fmtNum, PENDING_BY_STAGE_AGED, STAGE_TONE, type WorkflowStage } from "@/lib/reportsMock";
import { useDashboardFilter } from "@/lib/reportsFilter";
import { cn } from "@/lib/utils";

const BUCKETS = [
  { key: "≤3d",   color: "var(--success)" },
  { key: "4-7d",  color: "var(--chart-3)" },
  { key: "8-14d", color: "var(--warning)" },
  { key: ">14d",  color: "var(--danger)" },
] as const;

type Row = (typeof PENDING_BY_STAGE_AGED)[number];

const toneClass: Record<WorkflowStage, string> = {
  "Submitted": "bg-info-soft text-info",
  "Document Verification": "bg-warning-soft text-warning",
  "Field Inspection": "bg-warning-soft text-warning",
  "Officer Review": "bg-primary/10 text-primary",
  "Payment Pending": "bg-warning-soft text-warning",
  "License Issued": "bg-success-soft text-success",
};

export function StagePipeline() {
  const { filter, setStage } = useDashboardFilter();
  const max = Math.max(...PENDING_BY_STAGE_AGED.map((r) => r.total));

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">Pending Applications by Workflow Stage</h3>
          <p className="text-xs text-muted-foreground">
            Backlog distribution · Segments coloured by aging bucket · Click a stage to filter the table below
          </p>
        </div>
        {filter.stage && (
          <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => setStage(null)}>Clear stage filter</Button>
        )}
      </div>

      <div className="space-y-3">
        {PENDING_BY_STAGE_AGED.map((r: Row) => {
          const active = filter.stage === r.stage;
          const pctOfMax = (r.total / max) * 100;
          return (
            <button
              key={r.stage}
              onClick={() => setStage(active ? null : r.stage)}
              className={cn(
                "w-full text-left rounded-md p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "bg-accent" : "hover:bg-accent/40",
              )}
            >
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", toneClass[r.stage])}>
                    {STAGE_TONE[r.stage].toUpperCase()}
                  </span>
                  <span className="font-medium">{r.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="tabular-nums">avg {r.avgDays}d</Badge>
                  <span className="font-semibold tabular-nums">{fmtNum(r.total)}</span>
                </div>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted"
                   style={{ width: `${Math.max(pctOfMax, 10)}%` }}>
                {BUCKETS.map((b) => {
                  const v = r[b.key];
                  if (v <= 0) return null;
                  return (
                    <div
                      key={b.key}
                      title={`${b.key} · ${fmtNum(v)}`}
                      style={{ width: `${(v / r.total) * 100}%`, background: b.color }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {BUCKETS.map((b) => (
          <div key={b.key} className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: b.color }} />
            {b.key}
          </div>
        ))}
      </div>
    </Card>
  );
}
