import React, { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Section, Panel, Kpi, KpiRow, Chip } from "../shared/primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OperationsData } from "../mockData";
import type { OperationsMetadata } from "../useOperationsMetadata";

interface Props {
  meta: OperationsMetadata;
  data: OperationsData;
}

export const QueuesView: React.FC<Props> = ({ data }) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"pending" | "oldestDays" | "load">("oldestDays");

  const queues = useMemo(() => {
    const filtered = data.queues.filter((q) => q.stage.toLowerCase().includes(search.toLowerCase()));
    return filtered.slice().sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [data.queues, search, sortKey]);

  const totalPending = data.queues.reduce((a, b) => a + b.pending, 0);
  const totalAssignees = data.queues.reduce((a, b) => a + b.assignees, 0);

  return (
    <div className="space-y-6">
      <Section title="Workflow Queues" description="Live monitoring of work assigned across stages.">
        <KpiRow cols={4}>
          <Kpi label="Total Pending" value={totalPending} delta={-1.8} intent="good" />
          <Kpi label="Active Assignees" value={totalAssignees} />
          <Kpi label="Avg Load" value={`${Math.round(data.queues.reduce((a, b) => a + b.load, 0) / data.queues.length)}`} unit="%" intent="warn" />
          <Kpi label="Oldest Pending" value={`${Math.max(...data.queues.map((q) => q.oldestDays))}`} unit="days" intent="bad" />
        </KpiRow>

        <Panel title="Queue by Stage" padded={false}>
          <div className="px-3 py-2 border-b flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter stages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-xs"
              />
            </div>
            <button
              onClick={() => setSortKey(sortKey === "pending" ? "oldestDays" : sortKey === "oldestDays" ? "load" : "pending")}
              className="ml-auto text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowUpDown className="h-3 w-3" /> Sort: {sortKey}
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Stage</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Pending</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Assignees</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Capacity</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Load</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Oldest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((q) => {
                const tone = q.load > 85 ? "bad" : q.load > 65 ? "warn" : "good";
                return (
                  <TableRow key={q.stage}>
                    <TableCell className="py-2 text-sm font-medium">{q.stage}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{q.pending}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{q.assignees}</TableCell>
                    <TableCell className="py-2 text-right text-xs text-muted-foreground tabular-nums">{q.capacity}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={
                              tone === "bad"
                                ? "h-full bg-destructive"
                                : tone === "warn"
                                  ? "h-full bg-warning"
                                  : "h-full bg-success"
                            }
                            style={{ width: `${Math.min(q.load, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{q.load}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <Chip tone={q.oldestDays > 10 ? "bad" : q.oldestDays > 5 ? "warn" : "neutral"}>
                        {q.oldestDays}d
                      </Chip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Oldest Pending Applications" padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Application</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Applicant</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Stage</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Assignee</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Zone</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.oldestPending.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="py-2 text-xs font-mono">{a.id}</TableCell>
                  <TableCell className="py-2 text-sm">{a.applicant}</TableCell>
                  <TableCell className="py-2 text-sm">{a.stage}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{a.assignee}</TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">{a.zone}</TableCell>
                  <TableCell className="py-2 text-right text-sm tabular-nums">{a.ageDays}d</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </Section>
    </div>
  );
};
