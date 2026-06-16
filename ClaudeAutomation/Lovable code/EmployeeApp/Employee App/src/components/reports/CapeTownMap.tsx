import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import {
  COASTLINE_PATH, LAND_PATH, TABLE_MOUNTAIN_PATH,
  ZONES, WARDS_BY_ZONE, polygonPoints, type Zone, type Ward,
} from "@/lib/capeTownGeo";
import { WARD_METRICS, zoneMetrics, fmtZAR, fmtNum } from "@/lib/reportsMock";
import { useDashboardFilter, type MapMetric } from "@/lib/reportsFilter";

type MetricKey = MapMetric;
export const MAP_METRICS: { key: MetricKey; label: string }[] = [
  { key: "trades",     label: "Active Businesses" },
  { key: "newReg",     label: "New Applications" },
  { key: "revenue",    label: "Revenue" },
  { key: "renewalPct", label: "Renewal %" },
  { key: "procDays",   label: "Process Efficiency" },
];

const fmt = (k: MetricKey, v: number) => {
  if (k === "revenue") return fmtZAR(v);
  if (k === "renewalPct") return `${v}%`;
  if (k === "procDays") return `${v.toFixed(1)}d`;
  return fmtNum(v, true);
};

const FULL_VIEW: [number, number, number, number] = [0, 0, 1000, 700];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export function CapeTownMap() {
  const { filter, setZone, setWard, setMetric } = useDashboardFilter();
  const metric = filter.metric;
  const [hover, setHover] = useState<{ kind: "zone"; z: Zone } | { kind: "ward"; w: Ward } | null>(null);
  const [viewBox, setViewBox] = useState(FULL_VIEW);

  const activeZone = filter.zoneId ? ZONES.find((z) => z.id === filter.zoneId) ?? null : null;

  // Animate viewBox when activeZone changes.
  useEffect(() => {
    const target: [number, number, number, number] = activeZone
      ? (() => {
          const [x, y, w, h] = activeZone.bbox;
          const pad = 40;
          return [x - pad, y - pad, w + pad * 2, h + pad * 2];
        })()
      : FULL_VIEW;
    let raf = 0;
    const start = performance.now();
    const from = viewBox;
    const dur = 420;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setViewBox([
        lerp(from[0], target[0], e),
        lerp(from[1], target[1], e),
        lerp(from[2], target[2], e),
        lerp(from[3], target[3], e),
      ]);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZone?.id]);

  // ESC to exit drilldown.
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && activeZone) setZone(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activeZone, setZone]);

  // Color scale across the visible features.
  const features = useMemo(() => {
    if (!activeZone) {
      return ZONES.map((z) => ({ kind: "zone" as const, z, value: zoneMetrics(z.id)[metric] }));
    }
    return WARDS_BY_ZONE[activeZone.id].map((w) => ({
      kind: "ward" as const, w, value: WARD_METRICS[w.id][metric],
    }));
  }, [activeZone, metric]);

  const { min, max } = useMemo(() => {
    const vals = features.map((f) => f.value);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [features]);

  const fill = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min);
    const pct = 18 + t * 70;
    return `color-mix(in oklab, var(--primary) ${pct.toFixed(0)}%, transparent)`;
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setZone(null)}
            >
              Cape Town
            </button>
            {activeZone && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="font-medium">{activeZone.name}</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeZone
              ? `Click a ward to filter · Press Esc to go back`
              : `Click a zone to drill into its wards`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeZone && (
            <Button size="sm" variant="ghost" onClick={() => setZone(null)} className="h-7 text-xs">
              <ChevronLeft className="h-3 w-3 mr-1" /> Back
            </Button>
          )}
          {MAP_METRICS.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={metric === m.key ? "default" : "outline"}
              onClick={() => setMetric(m.key)}
              className="h-7 text-xs"
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={viewBox.join(" ")}
          className="w-full h-auto rounded-lg"
          style={{ background: "color-mix(in oklab, var(--info) 12%, transparent)" }}
        >
          {/* ocean */}
          <path d={COASTLINE_PATH} fill="color-mix(in oklab, var(--info) 18%, transparent)" />
          {/* land base */}
          <path d={LAND_PATH} fill="color-mix(in oklab, var(--surface-muted) 90%, transparent)" />

          {!activeZone && (
            <g>
              {ZONES.map((z) => {
                const v = zoneMetrics(z.id)[metric];
                const isHover = hover?.kind === "zone" && hover.z.id === z.id;
                return (
                  <g key={z.id} className="cursor-pointer"
                     onMouseEnter={() => setHover({ kind: "zone", z })}
                     onMouseLeave={() => setHover(null)}
                     onClick={() => setZone(z.id)}>
                    <polygon
                      points={polygonPoints(z.polygon)}
                      fill={fill(v)}
                      stroke="var(--primary)"
                      strokeWidth={isHover ? 2 : 1}
                      strokeOpacity={0.5}
                    />
                    <text x={z.labelAt[0]} y={z.labelAt[1]} textAnchor="middle"
                          className="pointer-events-none fill-foreground"
                          style={{ fontSize: 13, fontWeight: 700 }}>
                      {z.name}
                    </text>
                    <text x={z.labelAt[0]} y={z.labelAt[1] + 16} textAnchor="middle"
                          className="pointer-events-none fill-muted-foreground"
                          style={{ fontSize: 11 }}>
                      {fmt(metric, v)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {activeZone && (
            <g>
              {/* fade the other zones */}
              {ZONES.filter((z) => z.id !== activeZone.id).map((z) => (
                <polygon key={z.id} points={polygonPoints(z.polygon)}
                         fill="color-mix(in oklab, var(--muted) 40%, transparent)"
                         stroke="var(--border)" strokeWidth={0.5} />
              ))}
              {WARDS_BY_ZONE[activeZone.id].map((w) => {
                const v = WARD_METRICS[w.id][metric];
                const isHover = hover?.kind === "ward" && hover.w.id === w.id;
                const selected = filter.wardId === w.id;
                return (
                  <g key={w.id} className="cursor-pointer"
                     onMouseEnter={() => setHover({ kind: "ward", w })}
                     onMouseLeave={() => setHover(null)}
                     onClick={() => setWard(selected ? null : w.id)}>
                    <polygon
                      points={polygonPoints(w.polygon)}
                      fill={fill(v)}
                      stroke="var(--primary)"
                      strokeWidth={selected ? 3 : isHover ? 2 : 1}
                      strokeOpacity={selected || isHover ? 1 : 0.6}
                    />
                    <text x={w.centroid[0]} y={w.centroid[1]} textAnchor="middle"
                          className="pointer-events-none fill-foreground"
                          style={{ fontSize: 11, fontWeight: 600 }}>
                      {w.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* decorative: Table Mountain (always faint) */}
          <path d={TABLE_MOUNTAIN_PATH}
                fill="color-mix(in oklab, var(--muted-foreground) 25%, transparent)"
                opacity={0.35} pointerEvents="none" />
        </svg>

        {hover && (
          <div className="absolute bottom-3 left-3 rounded-md bg-card border shadow px-3 py-2 text-xs">
            {hover.kind === "zone" ? (
              <>
                <div className="font-semibold">{hover.z.name}</div>
                <div className="text-muted-foreground">
                  {fmt(metric, zoneMetrics(hover.z.id)[metric])} · Click to drill in
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold">{hover.w.name}</div>
                <div className="text-muted-foreground">
                  {fmt(metric, WARD_METRICS[hover.w.id][metric])} · Postcode {hover.w.postcode}
                </div>
              </>
            )}
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          Low
          <div className="h-1.5 w-24 rounded-full"
               style={{ background: "linear-gradient(to right, color-mix(in oklab, var(--primary) 18%, transparent), var(--primary))" }} />
          High
        </div>
      </div>
    </Card>
  );
}
