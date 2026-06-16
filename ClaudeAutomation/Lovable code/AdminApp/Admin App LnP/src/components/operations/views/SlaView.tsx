import React from "react";
import { AlertTriangle } from "lucide-react";
import { Section, Panel, Kpi, KpiRow, Chip } from "../shared/primitives";
import { TrendArea, HBar } from "../shared/charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OperationsMetadata } from "../useOperationsMetadata";
import type { OperationsData } from "../mockData";

interface Props {
  meta: OperationsMetadata;
  data: OperationsData;
}

export const SlaView: React.FC<Props> = ({ meta, data }) => {
  const breached = data.stageMetrics.reduce((a, b) => a + b.breaches, 0);
  const totalApps = data.kpis.applicationsThisMonth;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-warning/30 bg-warning/5 px-4 py-2.5 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <div className="text-xs">
          <span className="font-medium text-foreground">{breached} applications</span>
          <span className="text-muted-foreground">
            {" "}
            have breached SLA in the last 30 days. The{" "}
            <span className="font-medium text-foreground">
              {data.stageMetrics.slice().sort((a, b) => b.breaches - a.breaches)[0].stage}
            </span>{" "}
            stage accounts for the highest share.
          </span>
        </div>
      </div>

      <Section title="SLA Monitoring" description="Service Level Agreement compliance across the workflow.">
        <KpiRow cols={4}>
          <Kpi label="SLA Compliance" value={`${data.kpis.slaCompliance}`} unit="%" delta={-1.3} intent="warn" />
          <Kpi label="Breached Applications" value={breached} delta={4.2} intent="bad" hint="last 30d" />
          <Kpi label="Avg Processing" value={`${data.kpis.avgApprovalHours}`} unit="hrs" delta={-3.1} intent="good" />
          <Kpi label="Escalated Cases" value={data.stageMetrics.reduce((a, b) => a + b.escalations, 0)} delta={1.4} intent="warn" />
        </KpiRow>

        <Panel title="SLA Trend" subtitle="Compliance % over time">
          <TrendArea
            data={data.monthlyApps.map((p, i) => ({
              label: p.label,
              value: 88 + ((i * 7) % 10),
              prev: 86 + ((i * 5) % 8),
            }))}
            height={200}
          />
        </Panel>

        <Panel title="SLA by Workflow Stage" padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Stage</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Target</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Actual</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Compliance</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Breaches</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stageMetrics.map((s) => {
                const compliance = Math.max(0, 100 - (s.breaches / Math.max(s.pending, 1)) * 100);
                const tone = compliance > 92 ? "good" : compliance > 80 ? "warn" : "bad";
                return (
                  <TableRow key={s.stage}>
                    <TableCell className="py-2 text-sm font-medium">{s.stage}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums text-muted-foreground">{s.sla}h</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.avgHours}h</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{compliance.toFixed(1)}%</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.breaches}</TableCell>
                    <TableCell className="py-2">
                      <Chip tone={tone}>{tone === "good" ? "On track" : tone === "warn" ? "At risk" : "Breached"}</Chip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="High-risk Applications" subtitle="Approaching or exceeding SLA threshold" padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Application</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Stage</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Assignee</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Age</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.oldestPending.map((a) => {
                const tone = a.ageDays > 14 ? "bad" : a.ageDays > 7 ? "warn" : "info";
                return (
                  <TableRow key={a.id}>
                    <TableCell className="py-2 text-xs font-mono">{a.id}</TableCell>
                    <TableCell className="py-2 text-sm">{a.stage}</TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">{a.assignee}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{a.ageDays}d</TableCell>
                    <TableCell className="py-2">
                      <Chip tone={tone}>{tone === "bad" ? "Critical" : tone === "warn" ? "High" : "Watch"}</Chip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Breaches by Stage">
          <HBar data={data.stageMetrics.map((s) => ({ name: s.stage, value: s.breaches }))} />
        </Panel>
      </Section>
    </div>
  );
};
