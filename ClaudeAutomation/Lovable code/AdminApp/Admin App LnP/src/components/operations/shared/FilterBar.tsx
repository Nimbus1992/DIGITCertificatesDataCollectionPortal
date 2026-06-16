import React from "react";
import { Calendar, Filter, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OperationsMetadata } from "../useOperationsMetadata";

export interface OpsFilters {
  range: "7d" | "30d" | "90d" | "12m" | "ytd";
  stage: string;
  category: string;
  zone: string;
  role: string;
  status: string;
}

export const DEFAULT_FILTERS: OpsFilters = {
  range: "30d",
  stage: "all",
  category: "all",
  zone: "all",
  role: "all",
  status: "all",
};

interface Props {
  filters: OpsFilters;
  onChange: (next: OpsFilters) => void;
  meta: OperationsMetadata;
  lastSynced?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

const SEL_CLS = "h-8 text-xs bg-card border-border";

export const OperationsFilterBar: React.FC<Props> = ({
  filters,
  onChange,
  meta,
  lastSynced,
  onRefresh,
  onExport,
  className,
}) => {
  const set = <K extends keyof OpsFilters>(k: K, v: OpsFilters[K]) => onChange({ ...filters, [k]: v });

  return (
    <div className={cn("border-b bg-muted/30 px-4 py-2.5 flex items-center gap-2 flex-wrap", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
        <Calendar className="h-3.5 w-3.5" />
        <span className="uppercase tracking-wider font-medium">Range</span>
      </div>
      <Select value={filters.range} onValueChange={(v) => set("range", v as OpsFilters["range"])}>
        <SelectTrigger className={cn(SEL_CLS, "w-[110px]")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="12m">Last 12 months</SelectItem>
          <SelectItem value="ytd">Year to date</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-border mx-1" />

      <Select value={filters.stage} onValueChange={(v) => set("stage", v)}>
        <SelectTrigger className={cn(SEL_CLS, "w-[150px]")}>
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {meta.workflowStages.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {meta.hasCategories && (
        <Select value={filters.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger className={cn(SEL_CLS, "w-[150px]")}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {meta.categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {meta.hasGeography && (
        <Select value={filters.zone} onValueChange={(v) => set("zone", v)}>
          <SelectTrigger className={cn(SEL_CLS, "w-[130px]")}>
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All zones</SelectItem>
            {meta.zones.map((z) => (
              <SelectItem key={z} value={z}>{z}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={filters.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className={cn(SEL_CLS, "w-[130px]")}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="returned">Sent back</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs text-muted-foreground"
        onClick={() => onChange(DEFAULT_FILTERS)}
      >
        <Filter className="h-3.5 w-3.5 mr-1" /> Reset
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {lastSynced && (
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            Last synced <span className="text-foreground font-medium">{lastSynced}</span>
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        {onExport && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        )}
      </div>
    </div>
  );
};
