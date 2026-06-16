import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExecutiveSummary } from "@/components/reports/tabs/ExecutiveSummary";
import { BusinessLandscape } from "@/components/reports/tabs/BusinessLandscape";
import { ApplicationsRenewals } from "@/components/reports/tabs/ApplicationsRenewals";
import { Revenue } from "@/components/reports/tabs/Revenue";
import { ProcessEfficiency } from "@/components/reports/tabs/ProcessEfficiency";
import { DashboardFilterProvider, useDashboardFilter } from "@/lib/reportsFilter";
import { WARDS, ZONE_BY_ID } from "@/lib/capeTownGeo";
import { CapeTownLogo } from "@/components/brand/CapeTownLogo";

function CapeTownLogoMark() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-1.5">
      <CapeTownLogo variant="compact" className="text-primary h-6" />
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">City of</div>
        <div className="text-xs font-semibold">Cape Town</div>
      </div>
    </div>
  );
}


export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ActiveFilterBar() {
  const { filter, setZone, setWard, setCategory, setStage, reset, hasAny } = useDashboardFilter();
  if (!hasAny) return null;
  const chips: { label: string; clear: () => void }[] = [];
  if (filter.zoneId) chips.push({ label: `Zone: ${ZONE_BY_ID[filter.zoneId].name}`, clear: () => setZone(null) });
  if (filter.wardId) {
    const w = WARDS.find((w) => w.id === filter.wardId);
    if (w) chips.push({ label: `Ward: ${w.name}`, clear: () => setWard(null) });
  }
  if (filter.category) chips.push({ label: `Category: ${filter.category}`, clear: () => setCategory(null) });
  if (filter.stage)    chips.push({ label: `Stage: ${filter.stage}`,       clear: () => setStage(null) });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active filters</span>
      {chips.map((c) => (
        <Badge key={c.label} variant="secondary" className="gap-1.5 pr-1.5">
          {c.label}
          <button onClick={c.clear} className="rounded hover:bg-background/60 p-0.5">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto" onClick={reset}>Clear all</Button>
    </div>
  );
}

function ReportsPage() {
  return (
    <DashboardFilterProvider>
      <div className="space-y-5 report-page">
        <div className="flex items-center justify-between gap-4 report-header">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operational Dashboard</h1>
            <p className="text-sm text-muted-foreground">City of Cape Town · Business License System · FY 24-25 · ZAR</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-primary report-brand">
            <CapeTownLogoMark />
          </div>
        </div>


        <ActiveFilterBar />

        <Tabs defaultValue="exec" className="w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="exec">Executive Summary</TabsTrigger>
            <TabsTrigger value="landscape">Business Landscape</TabsTrigger>
            <TabsTrigger value="apps">Applications & Renewals</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="process">Process Efficiency</TabsTrigger>
          </TabsList>
          <TabsContent value="exec" className="mt-5"><ExecutiveSummary /></TabsContent>
          <TabsContent value="landscape" className="mt-5"><BusinessLandscape /></TabsContent>
          <TabsContent value="apps" className="mt-5"><ApplicationsRenewals /></TabsContent>
          <TabsContent value="revenue" className="mt-5"><Revenue /></TabsContent>
          <TabsContent value="process" className="mt-5"><ProcessEfficiency /></TabsContent>
        </Tabs>
      </div>
    </DashboardFilterProvider>
  );
}
