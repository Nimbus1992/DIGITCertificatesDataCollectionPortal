import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/reports/KpiCard";
import { Heatmap } from "@/components/reports/Heatmap";
import { StagePipeline } from "@/components/reports/StagePipeline";
import { ApplicantDetailSheet } from "@/components/reports/ApplicantDetailSheet";
import {
  APPLICATIONS, CATEGORIES, ISSUANCE_HEATMAP, PROC_KPIS, STAGE_EMPLOYEE, ZONE_NAMES,
  fmtNum, type AppRecord,
} from "@/lib/reportsMock";
import { WARDS } from "@/lib/capeTownGeo";
import { useDashboardFilter } from "@/lib/reportsFilter";
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";

type SortKey = "applicant" | "category" | "ward" | "stage" | "assignedTo" | "ageDays";

export function ProcessEfficiency() {
  const { filter } = useDashboardFilter();
  const [selected, setSelected] = useState<AppRecord | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>({ key: "ageDays", dir: "desc" });

  const wardName = filter.wardId ? WARDS.find((w) => w.id === filter.wardId)?.name : null;

  const filtered = useMemo(() => {
    const base = APPLICATIONS.filter((a) => {
      if (filter.stage && a.stage !== filter.stage) return false;
      if (filter.category && a.business.category !== filter.category) return false;
      if (filter.zoneId && a.location.zoneId !== filter.zoneId) return false;
      if (wardName && a.location.ward !== wardName) return false;
      if (a.stage === "License Issued") return false;
      return true;
    });
    if (!sort) return base;
    const dir = sort.dir === "asc" ? 1 : -1;
    const get = (a: AppRecord): string | number => {
      switch (sort.key) {
        case "applicant":  return a.applicant;
        case "category":   return a.business.category;
        case "ward":       return a.location.ward;
        case "stage":      return a.stage;
        case "assignedTo": return STAGE_EMPLOYEE[a.stage].name;
        case "ageDays":    return a.ageDays;
      }
    };
    return [...base].sort((a, b) => {
      const va = get(a), vb = get(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filter, wardName, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const sortIcon = (key: SortKey) => {
    if (!sort || sort.key !== key) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const rows = filtered.map((a) => ({
      "App #": a.id,
      "Applicant": a.applicant,
      "Phone": a.contact.phone,
      "Email": a.contact.email,
      "ID Type": a.idType,
      "ID Number": a.idNumber,
      "Business Name": a.business.name,
      "Business Category": a.business.category,
      "Ownership": a.business.ownership,
      "Business Start Date": a.business.startDate,
      "Shop Area (sq ft)": a.business.shopAreaSqFt,
      "Hazardous": a.business.hazardous ? "Yes" : "No",
      "Address": a.location.line1,
      "Ward": a.location.ward,
      "Zone": a.location.zoneId,
      "Postcode": a.location.postcode,
      "Stage": a.stage,
      "Status": a.status,
      "Channel": a.channel,
      "Assigned To": STAGE_EMPLOYEE[a.stage].name,
      "Assigned Role": STAGE_EMPLOYEE[a.stage].role,
      "Assigned Email": STAGE_EMPLOYEE[a.stage].email,
      "Submitted At": new Date(a.submittedAt).toISOString(),
      "Age (days)": a.ageDays,
      "Fee (ZAR)": a.feeZAR,
      "Inspector": a.inspection?.inspector ?? "",
      "Inspection Scheduled": a.inspection?.scheduledAt ? new Date(a.inspection.scheduledAt).toISOString() : "",
      "Inspection Findings": a.inspection?.findings ?? "",
      "Inspection Recommendation": a.inspection?.recommendation ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Applications");
    XLSX.writeFile(wb, `pending-applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const SortHeader = ({ k, label, align }: { k: SortKey; label: string; align?: "right" }) => (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${align === "right" ? "ml-auto" : ""}`}
      >
        {label} {sortIcon(k)}
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard size="lg" accent="primary" label="Avg. Issuance Time"
                 value={`${PROC_KPIS.avgIssuanceDays}d`}
                 delta={{ value: PROC_KPIS.avgIssuanceDays - PROC_KPIS.avgIssuanceDaysLast,
                          suffix: "d", positiveIsGood: false,
                          note: `vs ${PROC_KPIS.avgIssuanceDaysLast}d last FY` }} />
        <KpiCard size="lg" accent="danger" label="SLA Compliance"
                 value={`${PROC_KPIS.slaCompliance}%`}
                 delta={{ value: PROC_KPIS.slaCompliance - PROC_KPIS.slaComplianceLast,
                          suffix: " pts",
                          note: `vs ${PROC_KPIS.slaComplianceLast}% last FY` }} />
        <KpiCard size="lg" accent="warning" label="Pending Applications"
                 value={fmtNum(PROC_KPIS.pendingApplications)} />
        <KpiCard size="lg" accent="info" label="Oldest Pending"
                 value={`${PROC_KPIS.oldestPendingDays}d`} />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">Issuance Time Heatmap — Category × Zone</h3>
        <p className="text-xs text-muted-foreground mb-3">Avg. days · Green ≤ 7d · Amber ≤ 14d · Red &gt; 14d</p>
        <Heatmap
          rows={ZONE_NAMES}
          cols={CATEGORIES}
          data={ISSUANCE_HEATMAP as Record<string, Partial<Record<typeof CATEGORIES[number], number>>>}
          ramp="red"
          unit="d"
        />
      </Card>


      <StagePipeline />

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between gap-3">
          <h3 className="font-semibold">
            Pending Applications
            {filter.stage && <span className="ml-2 text-xs font-normal text-muted-foreground">· {filter.stage}</span>}
            {filter.category && <span className="ml-2 text-xs font-normal text-muted-foreground">· {filter.category}</span>}
            {wardName && <span className="ml-2 text-xs font-normal text-muted-foreground">· {wardName}</span>}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{filtered.length} applications</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportXlsx} disabled={filtered.length === 0}>
              <Download className="h-3 w-3 mr-1" /> Export to Excel
            </Button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No applications match the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App #</TableHead>
                <SortHeader k="applicant" label="Applicant" />
                <SortHeader k="category" label="Category" />
                <SortHeader k="ward" label="Ward" />
                <SortHeader k="stage" label="Stage" />
                <SortHeader k="assignedTo" label="Assigned To" />
                <SortHeader k="ageDays" label="Age" align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.applicant}</TableCell>
                  <TableCell>{a.business.category}</TableCell>
                  <TableCell>{a.location.ward}</TableCell>
                  <TableCell className="text-xs">{a.stage}</TableCell>
                  <TableCell className="text-xs">{STAGE_EMPLOYEE[a.stage].name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={a.ageDays > 14 ? "destructive" : "secondary"}>
                      {a.ageDays}d
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ApplicantDetailSheet app={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
