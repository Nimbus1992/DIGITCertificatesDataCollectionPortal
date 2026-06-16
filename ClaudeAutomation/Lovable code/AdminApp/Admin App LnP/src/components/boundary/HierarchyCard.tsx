import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Map, FileSpreadsheet, Globe, AlertTriangle } from "lucide-react";
import type { BoundaryHierarchy } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<BoundaryHierarchy["source"], string> = {
  preloaded: "Pre-loaded data",
  shapefile: "Shapefile upload",
  excel: "Excel upload",
};

const SOURCE_ICONS: Record<BoundaryHierarchy["source"], typeof Map> = {
  preloaded: Globe,
  shapefile: Map,
  excel: FileSpreadsheet,
};

interface Props {
  hierarchy: BoundaryHierarchy;
  onMakeDefault: () => void;
  onToggleStatus: () => void;
}

export function HierarchyCard({ hierarchy, onMakeDefault, onToggleStatus }: Props) {
  const SourceIcon = SOURCE_ICONS[hierarchy.source];
  const isActive = hierarchy.status === "active";
  const visibleServices = hierarchy.usedByServices.slice(0, 2);
  const extraServices = hierarchy.usedByServices.length - visibleServices.length;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card flex flex-col gap-0 overflow-hidden transition-colors",
        isActive ? "border-border hover:border-foreground/20" : "border-border/60 opacity-70",
      )}
    >
      {/* Top stripe for default */}
      {hierarchy.isDefault && (
        <div className="h-0.5 bg-primary w-full" />
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold truncate">{hierarchy.name}</span>
              {hierarchy.isDefault && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-medium gap-1">
                  <Star className="h-2.5 w-2.5" /> Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {/* Status dot */}
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px]",
                isActive ? "text-success" : "text-muted-foreground",
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-success" : "bg-muted-foreground")} />
                {isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-border text-xs">·</span>
              {/* Data mode */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-normal",
                  hierarchy.dataMode === "limited" && "border-warning/50 text-warning bg-warning/5",
                )}
              >
                {hierarchy.dataMode === "geographic" ? "Geographic" : "Limited"}
              </Badge>
            </div>
          </div>
          {/* Source chip */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 bg-muted/40 rounded-md px-2 py-1 border border-border">
            <SourceIcon className="h-3 w-3" />
            {SOURCE_LABELS[hierarchy.source]}
          </div>
        </div>

        {/* Operational level */}
        {(() => {
          const opLevel = hierarchy.levels.find((l) => l.id === hierarchy.operationalLevelId);
          return opLevel ? (
            <div className="text-xs text-muted-foreground">
              Operational level: <span className="font-medium text-foreground">{opLevel.label}</span>
              <span className="ml-1 text-muted-foreground/60">({opLevel.count.toLocaleString()} boundaries)</span>
            </div>
          ) : null;
        })()}

        {/* Used by services */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[22px]">
          {hierarchy.usedByServices.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/60">Not yet used by any service</span>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">Used by:</span>
              {visibleServices.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
              ))}
              {extraServices > 0 && (
                <Badge variant="secondary" className="text-[10px] font-normal">+{extraServices}</Badge>
              )}
            </>
          )}
        </div>

        {/* Limited mode warning */}
        {hierarchy.dataMode === "limited" && isActive && (
          <div className="flex items-start gap-1.5 text-[11px] text-warning bg-warning/5 border border-warning/20 rounded-md px-2.5 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Running in limited boundary mode. Upload a shapefile to enable map-based features.
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-t border-border bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          disabled={hierarchy.isDefault || !isActive}
          onClick={onMakeDefault}
        >
          Make default
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs h-7 ml-auto",
            isActive ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-success hover:text-success hover:bg-success/10",
          )}
          onClick={onToggleStatus}
        >
          {isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
