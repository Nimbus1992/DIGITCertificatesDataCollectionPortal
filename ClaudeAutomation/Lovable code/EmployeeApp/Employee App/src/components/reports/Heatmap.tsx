import { cn } from "@/lib/utils";

type Props<R extends string, C extends string> = {
  rows: readonly R[];
  cols: readonly C[];
  data: Record<R, Partial<Record<C, number>>>;
  /**
   * - "teal" — single-hue ramp (low→high, primary).
   * - "red"  — threshold-based diverging ramp (green ≤7, amber ≤14, red >14).
   *           Designed for "lower is better" metrics like days-to-issuance.
   */
  ramp?: "teal" | "red";
  unit?: string;
};

export function Heatmap<R extends string, C extends string>({
  rows, cols, data, ramp = "teal", unit,
}: Props<R, C>) {
  const all = rows.flatMap((r) => cols.map((c) => data[r]?.[c] ?? 0));
  const min = Math.min(...all);
  const max = Math.max(...all);

  const tealBg = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min);
    const a = 0.12 + t * 0.78;
    return `color-mix(in oklab, var(--primary) ${(a * 100).toFixed(0)}%, transparent)`;
  };
  const tealFg = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min);
    return t > 0.6 ? "var(--primary-foreground)" : "var(--foreground)";
  };

  // Threshold ramp: tuned for "days" metrics — most cells should read green
  // when SLA compliance is healthy, amber for borderline, red for outliers.
  const thresholdBg = (v: number) => {
    let token: string;
    let intensity: number;
    if (v <= 7) {
      token = "var(--success)";
      intensity = 0.25 + (v / 7) * 0.4;          // 0.25 → 0.65
    } else if (v <= 14) {
      token = "var(--warning)";
      intensity = 0.35 + ((v - 7) / 7) * 0.45;   // 0.35 → 0.80
    } else {
      token = "var(--danger)";
      const cap = Math.min(v, max);
      intensity = 0.45 + ((cap - 14) / Math.max(max - 14, 1)) * 0.4; // 0.45 → 0.85
    }
    return `color-mix(in oklab, ${token} ${(intensity * 100).toFixed(0)}%, transparent)`;
  };
  const thresholdFg = (v: number) => (v > 14 ? "var(--danger-foreground)" : "var(--foreground)");

  const bg = ramp === "teal" ? tealBg : thresholdBg;
  const fg = ramp === "teal" ? tealFg : thresholdFg;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="text-left py-2 pr-2">Zone</th>
            {cols.map((c) => (
              <th key={c} className="text-center py-2 px-1.5">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="py-1.5 pr-2 font-medium text-xs whitespace-nowrap">{r}</td>
              {cols.map((c) => {
                const v = data[r]?.[c] ?? 0;
                return (
                  <td key={c} className="p-0.5">
                    <div
                      className={cn(
                        "rounded-md text-center font-semibold tabular-nums py-2 px-1.5 text-[11px]",
                      )}
                      style={{ background: bg(v), color: fg(v) }}
                    >
                      {v.toLocaleString()}{unit}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
