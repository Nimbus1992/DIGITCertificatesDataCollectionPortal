import React from "react";
import { Section, Panel, Kpi, KpiRow, Chip } from "../shared/primitives";
import { TrendArea, HBar, Donut, Funnel, Sparkline } from "../shared/charts";
import type { OperationsMetadata } from "../useOperationsMetadata";
import type { OperationsData } from "../mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fmtMoney = (v: number) => `₹${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k`;
const fmtNum = (v: number) => v.toLocaleString();

interface Props {
  meta: OperationsMetadata;
  data: OperationsData;
}

const spark = (d: { value: number }[]) => d.slice(-12).map((x) => ({ value: x.value }));

export const AnalyticsView: React.FC<Props> = ({ meta, data }) => {
  const k = data.kpis;
  const stageRejectionData = data.stageMetrics.map((s) => ({ name: s.stage, value: s.rejectionRate }));
  const stageAvgData = data.stageMetrics.map((s) => ({ name: s.stage, value: s.avgHours }));

  return (
    <div className="space-y-8">
      {/* SECTION 1 — OVERVIEW */}
      <Section title="Overview" description="Executive operational summary of service performance.">
        <KpiRow cols={8}>
          <Kpi label="Active Licenses" value={fmtNum(k.activeLicenses)} delta={3.4} hint="vs last period" intent="good" />
          <Kpi label="Applications · Month" value={fmtNum(k.applicationsThisMonth)} delta={5.8} intent="good" />
          <Kpi label="Pending" value={fmtNum(k.pending)} delta={-2.1} intent="good" />
          <Kpi label="Revenue Collected" value={fmtMoney(k.revenue)} delta={4.2} intent="good" />
          <Kpi label="SLA Compliance" value={`${k.slaCompliance}`} unit="%" delta={-1.3} intent="warn" />
          <Kpi label="Avg Approval" value={`${k.avgApprovalHours}`} unit="hrs" delta={-6.4} intent="good" />
          <Kpi label="Renewal Rate" value={`${k.renewalRate}`} unit="%" delta={2.1} intent="good" />
          <Kpi label="Rejection Rate" value={`${k.rejectionRate}`} unit="%" delta={0.4} intent="warn" />
        </KpiRow>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Application Trend" subtitle="Current vs previous period" className="lg:col-span-2">
            <TrendArea data={data.monthlyApps} />
          </Panel>
          <Panel title="Pending vs Approved" subtitle="Current period">
            <Donut
              data={[
                { name: "Approved", value: 1480 },
                { name: "Pending", value: k.pending },
                { name: "Rejected", value: 120 },
                { name: "Returned", value: 84 },
              ]}
            />
          </Panel>
          <Panel title="Revenue Trend" subtitle="Monthly collections" className="lg:col-span-3">
            <TrendArea data={data.monthlyRevenue} height={180} />
          </Panel>
        </div>

        {meta.hasCategories && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Applications by Category">
              <HBar data={data.categoryDist} />
            </Panel>
            <Panel title="Revenue by Category">
              <HBar
                data={data.categoryDist.map((c) => ({ name: c.name, value: c.secondary ?? 0 }))}
                formatter={fmtMoney}
              />
            </Panel>
            <Panel title="Top Performing Categories" padded={false}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 text-[11px] uppercase tracking-wider">Category</TableHead>
                    <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Apps</TableHead>
                    <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.categoryDist
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="py-2 text-sm">{c.name}</TableCell>
                        <TableCell className="py-2 text-right text-sm tabular-nums">{fmtNum(c.value)}</TableCell>
                        <TableCell className="py-2 w-24">
                          <Sparkline data={spark(data.monthlyApps)} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Panel>
          </div>
        )}
      </Section>

      {/* SECTION 2 — BUSINESS LANDSCAPE */}
      {meta.hasCategories && (
        <Section title="Business Landscape" description="Composition and growth of licensed businesses.">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Category Distribution">
              <Donut data={data.categoryDist} />
            </Panel>
            {meta.hasSubcategories && (
              <Panel title="Subcategory Distribution">
                <HBar data={data.subcategoryDist} />
              </Panel>
            )}
            <Panel title="Active vs Expired">
              <Donut
                data={[
                  { name: "Active", value: k.activeLicenses },
                  { name: "Expiring 30d", value: 820 },
                  { name: "Expired", value: 410 },
                ]}
              />
            </Panel>
            <Panel title="Growth by Category" className="lg:col-span-2">
              <TrendArea data={data.monthlyApps} height={180} showPrev={false} />
            </Panel>
            <Panel title="New Registrations">
              <KpiRow cols={4}>
                <Kpi label="This Month" value={fmtNum(312)} delta={6.2} intent="good" />
                <Kpi label="Last Month" value={fmtNum(294)} />
                <Kpi label="YTD" value={fmtNum(2860)} delta={4.4} intent="good" />
                <Kpi label="Avg / Day" value={fmtNum(10)} />
              </KpiRow>
            </Panel>
            {meta.hasGeography && (
              <Panel title="Geographic Distribution" className="lg:col-span-3">
                <HBar data={data.zoneRevenue} formatter={fmtMoney} height={180} />
              </Panel>
            )}
          </div>
        </Section>
      )}

      {/* SECTION 3 — APPLICATIONS & RENEWALS */}
      <Section title="Applications & Renewals" description="Operational lifecycle and renewal flow.">
        <KpiRow cols={meta.hasRenewals ? 6 : 4}>
          <Kpi label="Total Applications" value={fmtNum(14820)} delta={5.2} intent="good" />
          <Kpi label="Submitted · 7d" value={fmtNum(412)} delta={2.1} />
          <Kpi label="Approved · 7d" value={fmtNum(386)} delta={3.8} intent="good" />
          <Kpi label="Rejected · 7d" value={fmtNum(28)} delta={0.6} intent="warn" />
          {meta.hasRenewals && <Kpi label="Pending Renewals" value={fmtNum(342)} delta={-4.8} intent="good" />}
          {meta.hasRenewals && <Kpi label="Renewal Rate" value={`${k.renewalRate}`} unit="%" delta={2.1} intent="good" />}
        </KpiRow>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Applications by Stage">
            <HBar data={data.stageMetrics.map((s) => ({ name: s.stage, value: s.pending }))} />
          </Panel>
          <Panel title="Submission Channel">
            <Donut
              data={[
                { name: "Citizen Portal", value: 8420 },
                { name: "CSC Centers", value: 3120 },
                { name: "Mobile App", value: 2680 },
                { name: "Counter", value: 600 },
              ]}
            />
          </Panel>

          {meta.hasRenewals && (
            <>
              <Panel title="Renewal Aging" subtitle="Time to expiry">
                <HBar data={data.renewalBuckets} />
              </Panel>
              <Panel title="Renewal Funnel">
                <Funnel data={data.renewalFunnel} />
              </Panel>
            </>
          )}

          {meta.hasRenewals && meta.renewalByCategory && meta.hasCategories && (
            <Panel title="Renewals by Category" className="lg:col-span-2">
              <HBar
                data={data.categoryDist.map((c, i) => ({
                  name: c.name,
                  value: Math.round(c.value * (0.4 + (i % 5) * 0.08)),
                }))}
                height={200}
              />
            </Panel>
          )}
        </div>
      </Section>

      {/* SECTION 4 — REVENUE */}
      <Section title="Revenue & Collections" description="Financial monitoring and collection efficiency.">
        <KpiRow cols={5}>
          <Kpi label="Total Revenue" value={fmtMoney(k.revenue * 12)} delta={6.4} intent="good" />
          <Kpi label="This Month" value={fmtMoney(k.revenue)} delta={4.2} intent="good" />
          <Kpi label="Outstanding" value={fmtMoney(k.outstanding)} delta={-3.1} intent="good" />
          {meta.hasRenewals && <Kpi label="Renewal Revenue" value={fmtMoney(k.revenue * 0.32)} delta={5.6} intent="good" />}
          <Kpi label="Collection Efficiency" value={`${k.collectionEfficiency}`} unit="%" delta={0.8} intent="good" />
        </KpiRow>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Monthly Revenue Trend" className="lg:col-span-2">
            <TrendArea data={data.monthlyRevenue} />
          </Panel>
          <Panel title="Outstanding Breakdown">
            <Donut
              data={[
                { name: "0–30 days", value: 92000 },
                { name: "31–60 days", value: 48000 },
                { name: "61–90 days", value: 28000 },
                { name: "> 90 days", value: 16500 },
              ]}
            />
          </Panel>
          {meta.hasCategories && (
            <Panel title="Revenue by License Type" className="lg:col-span-2">
              <HBar
                data={data.categoryDist.map((c) => ({ name: c.name, value: c.secondary ?? 0 }))}
                formatter={fmtMoney}
              />
            </Panel>
          )}
          {meta.hasGeography && (
            <Panel title="Revenue by Zone">
              <HBar data={data.zoneRevenue} formatter={fmtMoney} />
            </Panel>
          )}
        </div>
      </Section>

      {/* SECTION 5 — PROCESS EFFICIENCY */}
      <Section title="Process Efficiency" description="Workflow operational intelligence per stage.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Most Delayed Stage">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-foreground">
                {data.stageMetrics.slice().sort((a, b) => b.avgHours - a.avgHours)[0].stage}
              </div>
              <div className="text-xs text-muted-foreground">
                Avg {data.stageMetrics.slice().sort((a, b) => b.avgHours - a.avgHours)[0].avgHours}h · target{" "}
                {data.stageMetrics.slice().sort((a, b) => b.avgHours - a.avgHours)[0].sla}h
              </div>
            </div>
          </Panel>
          <Panel title="Highest Rejection Stage">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-foreground">
                {data.stageMetrics.slice().sort((a, b) => b.rejectionRate - a.rejectionRate)[0].stage}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.stageMetrics.slice().sort((a, b) => b.rejectionRate - a.rejectionRate)[0].rejectionRate}% rejected
              </div>
            </div>
          </Panel>
          <Panel title="Longest Avg Processing">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-foreground">
                {data.stageMetrics.slice().sort((a, b) => b.avgHours - a.avgHours)[0].stage}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.stageMetrics.slice().sort((a, b) => b.avgHours - a.avgHours)[0].avgHours} hours average
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Stage Performance" subtitle="Auto-generated from workflow configuration" padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Stage</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Pending</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Avg Time</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">SLA</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Breaches</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Rejection %</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Send-back %</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider text-right">Escalations</TableHead>
                <TableHead className="h-9 text-[11px] uppercase tracking-wider">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stageMetrics.map((s) => {
                const ratio = s.avgHours / s.sla;
                const tone = ratio > 1.2 ? "bad" : ratio > 0.9 ? "warn" : "good";
                return (
                  <TableRow key={s.stage}>
                    <TableCell className="py-2 text-sm font-medium">{s.stage}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.pending}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.avgHours}h</TableCell>
                    <TableCell className="py-2 text-right text-xs text-muted-foreground tabular-nums">{s.sla}h</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.breaches}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.rejectionRate}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.sendBackRate}</TableCell>
                    <TableCell className="py-2 text-right text-sm tabular-nums">{s.escalations}</TableCell>
                    <TableCell className="py-2">
                      <Chip tone={tone}>{tone === "bad" ? "Over SLA" : tone === "warn" ? "At risk" : "Healthy"}</Chip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Avg Stage Processing Time">
            <HBar data={stageAvgData} formatter={(v) => `${v}h`} />
          </Panel>
          <Panel title="Stage Rejection Rate">
            <HBar data={stageRejectionData} formatter={(v) => `${v}%`} />
          </Panel>
        </div>
      </Section>
    </div>
  );
};
