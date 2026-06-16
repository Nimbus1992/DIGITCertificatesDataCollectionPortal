import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/reports/KpiCard";
import {
  MONTHLY_REVENUE_TREND, REVENUE_BY_CATEGORY, REVENUE_BY_ZONE_FY, REVENUE_KPIS, fmtZAR,
} from "@/lib/reportsMock";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const pct = (a: number, b: number) => ((a - b) / b) * 100;

export function Revenue() {
  const [view, setView] = useState<"both" | "new" | "renewal">("both");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard size="lg" accent="primary" label="Total Revenue (YTD)"
                 value={fmtZAR(REVENUE_KPIS.totalYTD)}
                 delta={{ value: pct(REVENUE_KPIS.totalYTD, REVENUE_KPIS.totalYTDLast), note: `vs ${fmtZAR(REVENUE_KPIS.totalYTDLast)} last FY` }} />
        <KpiCard size="lg" accent="info" label="New License Revenue"
                 value={fmtZAR(REVENUE_KPIS.newLicense)}
                 delta={{ value: pct(REVENUE_KPIS.newLicense, REVENUE_KPIS.newLicenseLast), note: `vs ${fmtZAR(REVENUE_KPIS.newLicenseLast)} last FY` }} />
        <KpiCard size="lg" accent="success" label="Renewal Revenue"
                 value={fmtZAR(REVENUE_KPIS.renewal)}
                 delta={{ value: pct(REVENUE_KPIS.renewal, REVENUE_KPIS.renewalLast), note: `vs ${fmtZAR(REVENUE_KPIS.renewalLast)} last FY` }} />
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">Monthly Revenue Trend</h3>
            <p className="text-xs text-muted-foreground">New license vs. renewal · ZAR millions</p>
          </div>
          <div className="flex gap-1.5">
            {(["both", "new", "renewal"] as const).map((v) => (
              <Button key={v} size="sm" variant={view === v ? "default" : "outline"}
                      className="h-7 text-xs capitalize" onClick={() => setView(v)}>{v}</Button>
            ))}
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer>
            <AreaChart data={MONTHLY_REVENUE_TREND}>
              <defs>
                <linearGradient id="rNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rRen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)"
                     tickFormatter={(v) => `$${v}M`} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                       formatter={(v: number) => `$${v.toFixed(1)}M`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {(view === "both" || view === "new") &&
                <Area dataKey="new" name="New" stroke="var(--chart-2)" fill="url(#rNew)" strokeWidth={2} />}
              {(view === "both" || view === "renewal") &&
                <Area dataKey="renewal" name="Renewal" stroke="var(--chart-1)" fill="url(#rRen)" strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold">Revenue by Cape Town Zone</h3>
          <p className="text-xs text-muted-foreground mb-3">FY 24-25 vs FY 23-24</p>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={REVENUE_BY_ZONE_FY}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                         formatter={(v: number) => `$${v.toFixed(1)}M`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fy2425" name="FY 24-25" fill="var(--chart-1)" radius={[4,4,0,0]} />
                <Bar dataKey="fy2324" name="FY 23-24" fill="var(--chart-6)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Revenue by Business Category</h3>
          <div className="h-[280px] mt-3">
            <ResponsiveContainer>
              <BarChart data={REVENUE_BY_CATEGORY} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)"
                       interval={0} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                         formatter={(v: number) => `$${v.toFixed(1)}M`} />
                <Bar dataKey="revenue" fill="var(--chart-3)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
