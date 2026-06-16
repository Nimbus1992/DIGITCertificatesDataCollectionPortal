import React, { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, RefreshCw } from "lucide-react";

interface Viewport {
  label: string;
  width: number;
  height: number;
  category: "Mobile" | "Tablet" | "Desktop";
}

const VIEWPORTS: Viewport[] = [
  { label: "Mobile S", width: 320, height: 568, category: "Mobile" },
  { label: "Mobile M", width: 375, height: 812, category: "Mobile" },
  { label: "Mobile L", width: 414, height: 896, category: "Mobile" },
  { label: "Tablet", width: 768, height: 1024, category: "Tablet" },
  { label: "Tablet L", width: 834, height: 1194, category: "Tablet" },
  { label: "Laptop", width: 1280, height: 800, category: "Desktop" },
  { label: "Desktop", width: 1440, height: 900, category: "Desktop" },
  { label: "Desktop XL", width: 1920, height: 1080, category: "Desktop" },
];

const ResponsiveQA: React.FC = () => {
  const [route, setRoute] = useState("/dashboard");
  const [appliedRoute, setAppliedRoute] = useState("/dashboard");
  const [fit, setFit] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const grouped = useMemo(() => {
    const g: Record<string, Viewport[]> = {};
    VIEWPORTS.forEach((v) => {
      g[v.category] = g[v.category] || [];
      g[v.category].push(v);
    });
    return g;
  }, []);

  const apply = () => {
    const r = route.trim() || "/";
    setAppliedRoute(r.startsWith("/") ? r : `/${r}`);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Responsive QA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preview any route across common device viewports at once. Tip: open this page in a new browser tab for the cleanest result.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border bg-card">
        <div className="flex-1 min-w-[240px]">
          <Label htmlFor="qa-route" className="text-xs">Route</Label>
          <Input
            id="qa-route"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="/dashboard"
          />
        </div>
        <Button onClick={apply}>Load</Button>
        <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> Reload all
        </Button>
        <div className="flex items-center gap-2 pl-2">
          <Switch id="qa-fit" checked={fit} onCheckedChange={setFit} />
          <Label htmlFor="qa-fit" className="text-sm">Fit to column</Label>
        </div>
      </div>

      <div ref={containerRef} className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{category}</h2>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {items.map((v) => {
                const url = `${origin}${appliedRoute}`;
                // We render the iframe at true viewport size, then optionally scale it down via CSS transform.
                // Card has a fixed max-height so the scrollbar belongs to the iframe, not the page.
                const cardWidth = fit ? "100%" : v.width + 2;
                const scale = fit ? Math.min(1, 380 / v.width) : 1;
                const scaledHeight = v.height * scale;
                return (
                  <div key={v.label} className="rounded-lg border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
                      <div className="text-xs font-medium">
                        {v.label}{" "}
                        <span className="text-muted-foreground">
                          {v.width} × {v.height}
                        </span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div
                      className="bg-background overflow-auto"
                      style={{
                        width: cardWidth,
                        height: scaledHeight + 4,
                      }}
                    >
                      <iframe
                        key={reloadKey}
                        title={`${v.label} preview`}
                        src={url}
                        style={{
                          width: v.width,
                          height: v.height,
                          border: 0,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveQA;
