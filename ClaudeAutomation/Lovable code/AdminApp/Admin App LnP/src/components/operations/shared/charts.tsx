import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AXIS = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };
const GRID = "hsl(var(--border))";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  fontSize: 11,
  padding: "6px 8px",
  color: "hsl(var(--popover-foreground))",
};

export const TrendArea: React.FC<{
  data: { label: string; value: number; prev?: number }[];
  height?: number;
  showPrev?: boolean;
}> = ({ data, height = 200, showPrev = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="2 4" stroke={GRID} vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS} />
      <YAxis tickLine={false} axisLine={false} tick={AXIS} width={40} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: GRID }} />
      {showPrev && (
        <Area
          type="monotone"
          dataKey="prev"
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="3 3"
          fill="transparent"
          strokeWidth={1}
          dot={false}
        />
      )}
      <Area
        type="monotone"
        dataKey="value"
        stroke="hsl(var(--primary))"
        strokeWidth={1.5}
        fill="url(#trendFill)"
        dot={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const Sparkline: React.FC<{ data: { value: number }[]; height?: number }> = ({ data, height = 32 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.25} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const HBar: React.FC<{
  data: { name: string; value: number }[];
  height?: number;
  formatter?: (v: number) => string;
}> = ({ data, height = 220, formatter }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
      <CartesianGrid strokeDasharray="2 4" stroke={GRID} horizontal={false} />
      <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={formatter} />
      <YAxis dataKey="name" type="category" tick={{ ...AXIS, fontSize: 11 }} width={120} tickLine={false} axisLine={false} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} formatter={(v: number) => (formatter ? formatter(v) : v)} />
      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={14} />
    </BarChart>
  </ResponsiveContainer>
);

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(174 35% 50%)",
  "hsl(210 40% 55%)",
  "hsl(38 70% 55%)",
  "hsl(280 25% 55%)",
  "hsl(140 30% 50%)",
  "hsl(0 50% 60%)",
  "hsl(200 30% 70%)",
];

export const Donut: React.FC<{ data: { name: string; value: number }[]; height?: number }> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Tooltip contentStyle={tooltipStyle} />
      <Legend
        verticalAlign="middle"
        layout="vertical"
        align="right"
        iconType="square"
        wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
      />
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} strokeWidth={1} stroke="hsl(var(--card))">
        {data.map((_, i) => (
          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export const Funnel: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const drop = i > 0 ? (((data[i - 1].value - d.value) / data[i - 1].value) * 100).toFixed(1) : null;
        return (
          <div key={d.name} className="flex items-center gap-3 text-xs">
            <div className="w-24 text-muted-foreground truncate">{d.name}</div>
            <div className="flex-1 h-6 bg-muted/50 rounded-sm overflow-hidden">
              <div className="h-full bg-primary/80 flex items-center px-2 text-[10px] font-medium text-primary-foreground" style={{ width: `${pct}%` }}>
                {d.value.toLocaleString()}
              </div>
            </div>
            <div className="w-12 text-right tabular-nums text-muted-foreground">
              {drop ? `-${drop}%` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
};
