import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/reports/KpiCard";
import {
  APP_KPIS, OPEN_APPS_BY_STAGE, RENEWAL_AGING, RENEWAL_RATE_CATEGORY,
  RENEWAL_RATE_WARDS, RENEWAL_RATE_ZONE, SUBMISSION_CHANNEL, fmtNum,
} from "@/lib/reportsMock";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

const DONUT_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function ApplicationsRenewals() {
  const [range, setRange] = useState("30d");
  const [scope, setScope] = useState<"category" | "zone">("category");
  const renewalData = scope === "category" ? RENEWAL_RATE_CATEGORY : RENEWAL_RATE_ZONE;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">All categories · Cape Town</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Applications" value={fmtNum(APP_KPIS.totalApplications)} delta={{ value: 5.2, note: "vs prior" }} />
        <KpiCard label="Submitted" value={fmtNum(APP_KPIS.submitted)} delta={{ value: 2.1 }} />
        <KpiCard label="Approved" value={fmtNum(APP_KPIS.approved)} delta={{ value: 3.8 }} accent="success" />
        <KpiCard label="Rejected" value={fmtNum(APP_KPIS.rejected)} delta={{ value: 0.6, positiveIsGood: false }} accent="danger" />
        <KpiCard label="Pending Renewals" value={fmtNum(APP_KPIS.pendingRenewals)} delta={{ value: -4.8 }} accent="warning" />
        <KpiCard label="Renewal Rate" value={`${APP_KPIS.renewalRate}%`} delta={{ value: 2.1 }} accent="success" />
        <KpiCard label="On-time Renewal Rate" value={`${APP_KPIS.onTimeRenewalRate}%`} delta={{ value: 1.2 }} accent="primary" />
        <KpiCard label="Late Renewal Rate" value={`${APP_KPIS.lateRenewalRate}%`} delta={{ value: -0.6, positiveIsGood: false }} accent="warning" />
        <KpiCard label="Revoked / Cancelled" value={fmtNum(APP_KPIS.revokedCancelled)} delta={{ value: 0.4, positiveIsGood: false }} accent="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold">Open Applications by Workflow Stage</h3>
          <p className="text-xs text-muted-foreground mb-3">Counts reconcile with the Process Efficiency tab</p>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={OPEN_APPS_BY_STAGE} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={170} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Applications by Submission Channel</h3>
          <div className="h-[280px] mt-3">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SUBMISSION_CHANNEL} dataKey="count" nameKey="channel"
                     innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {SUBMISSION_CHANNEL.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold">Renewal Rate by {scope === "category" ? "Category" : "Zone"}</h3>
            <div className="flex gap-1.5">
              <Button size="sm" variant={scope === "category" ? "default" : "outline"}
                      className="h-7 text-xs" onClick={() => setScope("category")}>Category</Button>
              <Button size="sm" variant={scope === "zone" ? "default" : "outline"}
                      className="h-7 text-xs" onClick={() => setScope("zone")}>Zone</Button>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={renewalData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)"
                       interval={0} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                         formatter={(v: number) => `${v}%`} />
                <Bar dataKey="rate" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Top Wards by Renewal Rate</h3>
          <div className="mt-4 space-y-3">
            {RENEWAL_RATE_WARDS.map((w, i) => (
              <div key={w.name} className="flex items-center gap-3">
                <span className="w-5 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="w-32 text-sm font-medium">{w.name}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{
                         width: `${w.rate}%`,
                         background: w.rate >= 90 ? "var(--success)" : w.rate >= 86 ? "var(--chart-3)" : "var(--danger)",
                       }} />
                </div>
                <span className="w-12 text-sm font-semibold tabular-nums text-right">{w.rate}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold uppercase text-xs tracking-wider text-muted-foreground">Renewal Aging</h3>
        <p className="text-xs text-muted-foreground mb-3">Time to expiry</p>
        <div className="h-[240px]">
          <ResponsiveContainer>
            <BarChart data={RENEWAL_AGING} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis dataKey="bucket" type="category" tick={{ fontSize: 11 }} width={90} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
