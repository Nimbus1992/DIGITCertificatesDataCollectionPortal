import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  highlightedLevel?: string;
  className?: string;
  compact?: boolean;
}

// Static SVG polygons simulating boundary shapes on a map
const POLYGONS = [
  { d: "M 60 30 L 180 20 L 220 80 L 190 150 L 120 160 L 60 120 Z", opacity: 0.18 },
  { d: "M 180 20 L 290 40 L 310 110 L 220 80 Z", opacity: 0.13 },
  { d: "M 220 80 L 310 110 L 280 190 L 190 150 Z", opacity: 0.16 },
  { d: "M 60 120 L 120 160 L 90 220 L 30 180 Z", opacity: 0.12 },
  { d: "M 120 160 L 190 150 L 210 230 L 130 250 L 90 220 Z", opacity: 0.20 },
  { d: "M 190 150 L 280 190 L 270 260 L 210 230 Z", opacity: 0.14 },
  { d: "M 30 180 L 90 220 L 80 290 L 20 260 Z", opacity: 0.10 },
  { d: "M 130 250 L 210 230 L 220 300 L 140 310 Z", opacity: 0.17 },
];

export function MockMapPanel({ highlightedLevel, className, compact = false }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-border bg-muted/20",
        compact ? "h-40" : "h-full min-h-[280px]",
        className,
      )}
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.06) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* SVG boundary shapes */}
      <svg
        viewBox="0 0 340 330"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {POLYGONS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={`hsl(var(--primary) / ${p.opacity})`}
            stroke="hsl(var(--primary) / 0.35)"
            strokeWidth="1.5"
          />
        ))}
        {/* Active "selected" polygon highlight */}
        {highlightedLevel && (
          <path
            d={POLYGONS[4].d}
            fill="hsl(var(--primary) / 0.30)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        )}
        {/* Map pins */}
        <circle cx="145" cy="205" r="4" fill="hsl(var(--primary))" opacity="0.8" />
        <circle cx="230" cy="165" r="3" fill="hsl(var(--primary))" opacity="0.6" />
        <circle cx="100" cy="140" r="3" fill="hsl(var(--primary))" opacity="0.6" />
      </svg>

      {/* Overlay labels */}
      {!compact && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {highlightedLevel ? `Showing: ${highlightedLevel}` : "Boundary preview"}
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-md px-2 py-1 border border-border text-[10px] text-muted-foreground">
            Prototype map
          </div>
        </div>
      )}
    </div>
  );
}
