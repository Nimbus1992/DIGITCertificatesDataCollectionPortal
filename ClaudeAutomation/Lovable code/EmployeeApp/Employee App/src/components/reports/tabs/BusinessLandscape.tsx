import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heatmap } from "@/components/reports/Heatmap";
import {
  CATEGORIES, CATEGORY_MIX_TREND, NET_DELTA_CATEGORY, NET_DELTA_ZONE,
  YOY_TRADES_FY, YOY_TRADES_MONTHLY, ZONE_CATEGORY_DENSITY, ZONE_NAMES,
} from "@/lib/reportsMock";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export function BusinessLandscape() {
  const [grain, setGrain] = useState<"fy" | "monthly">("fy");
  const yoyData = grain === "fy"
    ? YOY_TRADES_FY.map((d) => ({ x: d.fy, v: d.trades }))
    : YOY_TRADES_MONTHLY.map((d) => ({ x: d.m, v: d.trades }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">YoY Active Business Growth</h3>
              <p className="text-xs text-muted-foreground">Cape Town · Drill into monthly</p>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant={grain === "fy" ? "default" : "outline"}
                      className="h-7 text-xs" onClick={() => setGrain("fy")}>FY</Button>
              <Button size="sm" variant={grain === "monthly" ? "default" : "outline"}
                      className="h-7 text-xs" onClick={() => setGrain("monthly")}>Monthly</Button>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={yoyData}>
                <defs>
                  <linearGradient id="yoy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="x" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} fill="url(#yoy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Category Mix — 3 Year Trend</h3>
          <p className="text-xs text-muted-foreground mb-3">How has business composition shifted?</p>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <LineChart data={CATEGORY_MIX_TREND} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="fy" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                {CATEGORIES.map((c, i) => (
                  <Line key={c} dataKey={c} stroke={`var(--chart-${(i % 9) + 1})`} strokeWidth={2} dot={{ r: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">Category × Zone Density</h3>
        <p className="text-xs text-muted-foreground mb-3">Active businesses — which types dominate each Cape Town zone?</p>
        <Heatmap
          rows={ZONE_NAMES}
          cols={CATEGORIES}
          data={ZONE_CATEGORY_DENSITY as Record<string, Partial<Record<typeof CATEGORIES[number], number>>>}
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold">Net Delta by Category</h3>
          <p className="text-xs text-muted-foreground mb-3">New registrations vs. exits this FY</p>
          <div className="h-[320px]">
            <ResponsiveContainer>
              <BarChart data={NET_DELTA_CATEGORY.map((d) => ({ ...d, lapsed: -d.lapsed }))}
                        margin={{ top: 8, right: 8, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)"
                       interval={0} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                <Bar dataKey="newReg" name="New" fill="var(--chart-2)" radius={[4,4,0,0]} />
                <Bar dataKey="lapsed" name="Lapsed" fill="var(--chart-4)" radius={[0,0,4,4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Net Delta by Zone</h3>
          <p className="text-xs text-muted-foreground mb-3">Where is Cape Town growing vs. contracting?</p>
          <div className="h-[320px]">
            <ResponsiveContainer>
              <BarChart data={NET_DELTA_ZONE.map((d) => ({ ...d, exits: -d.exits }))}
                        margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                <Bar dataKey="newReg" name="New"   fill="var(--chart-2)" radius={[4,4,0,0]} />
                <Bar dataKey="exits"  name="Exits" fill="var(--chart-4)" />
                <Bar dataKey="net"    name="Net"   fill="var(--chart-6)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}
