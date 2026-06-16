import { useState, useRef } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Globe, Map, FileSpreadsheet, ArrowRight, ArrowLeft,
  Upload, AlertTriangle, Download, CheckCircle2, Search, Info,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOnboarding, type BoundaryHierarchy, type BoundaryLevel } from "@/contexts/OnboardingContext";
import { MOCK_LEVELS_BY_SOURCE, EXCEL_TEMPLATE_CSV } from "@/data/boundaryData";
import { MockMapPanel } from "./MockMapPanel";
import { cn } from "@/lib/utils";

type WizardPath = "preloaded" | "shapefile" | "excel" | null;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const EXCEL_LIMITATIONS = [
  "Maps will not be available in dashboards or reports for boundaries configured with this method.",
  "Citizens will select their boundary from a text-based dropdown rather than a map pin.",
  "If a citizen enters a location by map, the system cannot automatically assign it to a boundary — staff will need to assign it manually.",
];

function StepHeader({ step, total, title, description }: { step: number; total: number; title: string; description: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
        Step {step} of {total}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

export function BoundarySetupWizard({ open, onOpenChange }: Props) {
  const { state, addBoundaryHierarchy } = useOnboarding();
  const isServiceOwner = state.currentUserRole === "service_owner";
  const hasAdminHierarchies = (state.boundaryHierarchies || []).filter(
    (h) => h.status === "active" && h.createdBy === "admin"
  ).length > 0;

  // Wizard state
  const [path, setPath] = useState<WizardPath>(null);
  const [innerStep, setInnerStep] = useState(0);
  const [levels, setLevels] = useState<BoundaryLevel[]>([]);
  const [editedLabels, setEditedLabels] = useState<Record<string, string>>({});
  const [operationalLevelId, setOperationalLevelId] = useState("");
  const [hierarchyName, setHierarchyName] = useState("Administrative Hierarchy");
  const [levelSearch, setLevelSearch] = useState<Record<string, string>>({});
  const [excelAcks, setExcelAcks] = useState([false, false, false]);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedAdminHierarchy, setSelectedAdminHierarchy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Service Owner: select existing hierarchy flow
  const [soMode, setSoMode] = useState<"select" | "create" | null>(null);

  function resetWizard() {
    setPath(null);
    setInnerStep(0);
    setLevels([]);
    setEditedLabels({});
    setOperationalLevelId("");
    setHierarchyName("Administrative Hierarchy");
    setLevelSearch({});
    setExcelAcks([false, false, false]);
    setFileUploaded(null);
    setProcessing(false);
    setSelectedAdminHierarchy(null);
    setSoMode(null);
  }

  function handleClose() {
    resetWizard();
    onOpenChange(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploaded(file.name);
    if (path === "shapefile") {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        const parsed = MOCK_LEVELS_BY_SOURCE["shapefile"];
        setLevels(parsed);
        setOperationalLevelId(parsed[parsed.length - 1].id);
        setInnerStep(2); // go to data review
      }, 1500);
    }
  }

  function handleSelectPath(chosen: WizardPath) {
    setPath(chosen);
    if (chosen === "preloaded") {
      setLevels(MOCK_LEVELS_BY_SOURCE["preloaded"]);
      setOperationalLevelId(MOCK_LEVELS_BY_SOURCE["preloaded"][MOCK_LEVELS_BY_SOURCE["preloaded"].length - 1].id);
      setInnerStep(1); // jurisdiction confirmation
    } else if (chosen === "shapefile") {
      setInnerStep(1); // upload step
    } else if (chosen === "excel") {
      setInnerStep(1); // excel upload
    }
  }

  function handleJurisdictionConfirm() {
    setInnerStep(2); // data review
  }

  function handleExcelFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploaded(file.name);
    const parsed = MOCK_LEVELS_BY_SOURCE["excel"];
    setLevels(parsed);
    setOperationalLevelId(parsed[parsed.length - 1].id);
  }

  function downloadTemplate() {
    const blob = new Blob([EXCEL_TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "boundary_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function getLabelForLevel(level: BoundaryLevel) {
    return editedLabels[level.id] ?? level.label;
  }

  function handleSave() {
    if (!operationalLevelId && levels.length > 0) {
      toast({ title: "Select an operational level", variant: "destructive" });
      return;
    }

    const finalLevels = levels.map((l) => ({
      ...l,
      label: editedLabels[l.id] ?? l.label,
    }));

    // Service Owner: link to selected admin hierarchy
    if (isServiceOwner && soMode === "select" && selectedAdminHierarchy) {
      const target = (state.boundaryHierarchies || []).find((h) => h.id === selectedAdminHierarchy);
      if (target) {
        toast({ title: `Service linked to "${target.name}"` });
        handleClose();
        return;
      }
    }

    const newHierarchy: BoundaryHierarchy = {
      id: `bh_${Date.now()}`,
      name: hierarchyName.trim() || "Administrative Hierarchy",
      isDefault: false,
      status: "active",
      dataMode: path === "excel" ? "limited" : "geographic",
      source: path || "shapefile",
      levels: finalLevels,
      operationalLevelId,
      usedByServices: [],
      createdBy: isServiceOwner ? "service_owner" : "admin",
      createdAt: new Date().toISOString(),
    };

    addBoundaryHierarchy(newHierarchy);
    toast({ title: `"${newHierarchy.name}" saved`, description: "Hierarchy is now active." });
    handleClose();
  }

  // ── RENDER STEPS ──────────────────────────────────────────────

  // Service Owner: select from existing admin hierarchies
  function renderSOSelect() {
    const adminHierarchies = (state.boundaryHierarchies || []).filter(
      (h) => h.status === "active" && h.createdBy === "admin"
    );

    return (
      <div className="space-y-4">
        <StepHeader step={1} total={2} title="Select a boundary hierarchy" description="Choose a system-level hierarchy configured by your Administrator." />
        {adminHierarchies.length === 0 ? (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            No boundaries have been configured at the system level. Set up a boundary for this service — the Administrator can designate it as the system-wide default later.
          </div>
        ) : (
          <div className="space-y-2">
            {adminHierarchies.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedAdminHierarchy(h.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  selectedAdminHierarchy === h.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{h.name}</span>
                  {h.isDefault && <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Default</Badge>}
                  <Badge variant="outline" className="text-[10px] ml-auto">{h.dataMode === "geographic" ? "Geographic" : "Limited"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {h.levels.length} levels · Operational: {h.levels.find((l) => l.id === h.operationalLevelId)?.label}
                </p>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSoMode("create")} className="text-xs">
            Add a new hierarchy instead
          </Button>
          {selectedAdminHierarchy && (
            <Button onClick={() => setInnerStep(99)} className="ml-auto gap-2 text-xs">
              Confirm selection <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Step 0 — Source selection
  function renderSourceSelection() {
    const options = [
      ...(!isServiceOwner ? [{
        id: "preloaded" as WizardPath,
        icon: Globe,
        title: "Use pre-loaded data",
        description: "Review and confirm OSM-derived boundary data loaded at account provisioning. Includes map visualisation.",
        badge: "Geographic",
        badgeClass: "bg-success/10 text-success border-success/20",
      }] : []),
      {
        id: "shapefile" as WizardPath,
        icon: Map,
        title: "Upload a shapefile",
        description: "Upload an ESRI shapefile (.zip) with boundary polygons. Full geographic capabilities including maps.",
        badge: "Geographic",
        badgeClass: "bg-success/10 text-success border-success/20",
      },
      {
        id: "excel" as WizardPath,
        icon: FileSpreadsheet,
        title: "Upload an Excel / CSV file",
        description: "Upload a list of boundary names and hierarchy levels. No geographic data — limited mode.",
        badge: "Limited",
        badgeClass: "bg-warning/10 text-warning border-warning/20",
      },
    ];

    return (
      <div className="space-y-4">
        <StepHeader
          step={1}
          total={3}
          title="Choose a data source"
          description="Select how you want to load boundary data for this hierarchy."
        />
        {isServiceOwner && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-warning flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            No system-level boundaries configured. Set up boundaries for this service — the Administrator can promote it to the system default later.
          </div>
        )}
        <div className="space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectPath(opt.id)}
                className="w-full text-left rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 p-4 flex items-start gap-4 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{opt.title}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", opt.badgeClass)}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 1a — Jurisdiction confirmation (Path A)
  function renderJurisdictionConfirm() {
    return (
      <div className="space-y-4">
        <StepHeader step={2} total={3} title="Confirm your jurisdiction" description="Verify that the map shows the correct administrative area before reviewing boundary data." />
        <div className="grid grid-cols-2 gap-4">
          <MockMapPanel className="col-span-1" />
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Stored jurisdiction</div>
              <div className="text-sm font-medium">{state.country || "South Africa"}</div>
              <div className="text-xs text-muted-foreground">{state.orgName || "City of Cape Town"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex gap-1.5"><span className="font-medium text-foreground">Source:</span> Pre-loaded (OSM-derived)</div>
              <div className="flex gap-1.5"><span className="font-medium text-foreground">Loaded:</span> 5 days ago</div>
              <div className="flex gap-1.5"><span className="font-medium text-foreground">Admin level:</span> Municipal</div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5 border border-border">
              OSM data may be up to 12 months old. Cross-check against a national mapping source if recent administrative changes have occurred.
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setPath(null)} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button onClick={handleJurisdictionConfirm} className="gap-2 text-sm">
            Yes, proceed with this jurisdiction <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 1b — Shapefile upload (Path B1)
  function renderShapefileUpload() {
    return (
      <div className="space-y-4">
        <StepHeader step={2} total={3} title="Upload a shapefile" description="Upload an ESRI shapefile archive (.zip) containing boundary polygons and attributes." />
        {processing ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Parsing shapefile and validating geometry…</span>
            <span className="text-xs">{fileUploaded}</span>
          </div>
        ) : (
          <>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              {fileUploaded ? (
                <div className="text-center">
                  <div className="text-sm font-medium text-success flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />{fileUploaded}</div>
                  <div className="text-xs text-muted-foreground mt-1">Click to replace</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm font-medium">Drop your shapefile here or click to browse</div>
                  <div className="text-xs text-muted-foreground mt-1">Supported: .zip (ESRI shapefile archive)</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".zip,.shp" className="hidden" onChange={handleFileSelect} />
            </div>
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 border border-border space-y-1">
              <p className="font-medium text-foreground">Shapefile requirements</p>
              <p>· Include .shp, .dbf, and .prj files in a single .zip archive</p>
              <p>· Coordinate reference system (CRS) must be WGS84 (EPSG:4326) or a common projected CRS</p>
              <p>· Attribute table must include a column for boundary name and hierarchy level</p>
            </div>
          </>
        )}
        <div className="flex justify-start pt-2">
          <Button variant="ghost" size="sm" onClick={() => { setPath(null); setInnerStep(0); }} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </div>
      </div>
    );
  }

  // Step 1c — Excel upload (Path B2)
  function renderExcelUpload() {
    const allAcked = excelAcks.every(Boolean);

    return (
      <div className="space-y-4">
        <StepHeader step={2} total={3} title="Upload an Excel / CSV file" description="Upload a boundary list with names and hierarchy levels." />

        {/* Permanent amber warning */}
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warning">Geographic analysis will not be available</p>
              <p className="text-xs text-warning/80 mt-1 leading-relaxed">
                Choosing Excel upload means geographic analysis will not be available for boundaries configured with this method. This includes map-based location selection, geographic dashboards, and automatic location-to-boundary matching. You can upgrade to geographic mode at any time by uploading a shapefile.
              </p>
            </div>
          </div>
        </div>

        {/* CSV template */}
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2.5">
          <div>
            <div className="text-xs font-medium">Download CSV template</div>
            <div className="text-[11px] text-muted-foreground">boundary_name · hierarchy_level · parent_boundary_name</div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs h-8">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          {fileUploaded ? (
            <div className="text-center">
              <div className="text-sm font-medium text-success flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />{fileUploaded}</div>
              <div className="text-xs text-muted-foreground mt-1">Click to replace</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-sm font-medium">Upload your CSV or Excel file</div>
              <div className="text-xs text-muted-foreground mt-1">.csv, .xlsx</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleExcelFileSelect} />
        </div>

        {/* Acknowledgment checkboxes — only shown after file selected */}
        {fileUploaded && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Before proceeding, acknowledge the following limitations:</p>
            {EXCEL_LIMITATIONS.map((text, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={excelAcks[i]}
                  onCheckedChange={(v) => {
                    const next = [...excelAcks];
                    next[i] = !!v;
                    setExcelAcks(next);
                  }}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-snug">{text}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => { setPath(null); setInnerStep(0); }} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          {fileUploaded && (
            <Button
              disabled={!allAcked}
              onClick={() => setInnerStep(2)}
              className="gap-2 text-sm"
            >
              Review and confirm <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Step 2 — Data review (Paths A & B1 — with map; Excel — text only)
  function renderDataReview() {
    const isExcel = path === "excel";

    return (
      <div className="space-y-4">
        <StepHeader
          step={2}
          total={3}
          title={isExcel ? "Review hierarchy levels" : "Review boundary data"}
          description={isExcel
            ? "Confirm the hierarchy levels from your file and select the operational level."
            : "Review the hierarchy levels, rename labels to match your terminology, and select the operational level."}
        />

        <div className={cn("gap-4", isExcel ? "" : "grid grid-cols-2")}>
          {/* Map panel (geographic only) */}
          {!isExcel && (
            <MockMapPanel
              highlightedLevel={levels.find((l) => l.id === operationalLevelId)?.label}
            />
          )}

          {/* Data panel */}
          <div className="space-y-3">
            {levels.map((level) => {
              const currentLabel = getLabelForLevel(level);
              const isOp = level.id === operationalLevelId;
              const search = levelSearch[level.id] || "";
              const names = search
                ? level.sampleNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
                : level.sampleNames.slice(0, 5);

              return (
                <div
                  key={level.id}
                  className={cn(
                    "rounded-lg border p-3 space-y-2 cursor-pointer transition-colors",
                    isOp ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20",
                  )}
                  onClick={() => setOperationalLevelId(level.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="radio"
                        checked={isOp}
                        onChange={() => setOperationalLevelId(level.id)}
                        className="shrink-0 accent-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Input
                        value={currentLabel}
                        onChange={(e) => setEditedLabels((prev) => ({ ...prev, [level.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:bg-muted/40 rounded px-1"
                      />
                      {currentLabel !== level.originalLabel && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          (was: {level.originalLabel})
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-normal shrink-0">
                      {level.count.toLocaleString()}
                    </Badge>
                  </div>

                  {isOp && (
                    <>
                      <div className="flex items-center gap-1.5 text-[10px] text-primary bg-primary/10 rounded px-2 py-1">
                        <Info className="h-3 w-3 shrink-0" />
                        Applications will be filed at {currentLabel}. Staff will be assigned by {currentLabel}.
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={search}
                          onChange={(e) => setLevelSearch((prev) => ({ ...prev, [level.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={`Search ${currentLabel} names…`}
                          className="h-7 pl-6 text-xs"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {names.map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{n}</span>
                        ))}
                        {!search && level.sampleNames.length > 5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            +{level.sampleNames.length - 5} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {!isExcel && (
              <p className="text-xs text-muted-foreground">
                Click a level to select it as operational and rename its label. Renaming is optional.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInnerStep(path === "preloaded" ? 1 : 1)}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button
            disabled={!operationalLevelId}
            onClick={() => setInnerStep(3)}
            className="gap-2 text-sm"
          >
            Proceed with this data <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 3 — Name & Confirm
  function renderNameAndConfirm() {
    const opLevel = levels.find((l) => l.id === operationalLevelId);
    const opLevelLabel = opLevel ? (editedLabels[opLevel.id] ?? opLevel.label) : "—";

    return (
      <div className="space-y-4">
        <StepHeader step={3} total={3} title="Name and confirm" description="Give this hierarchy a name and review the configuration before saving." />

        <div className="space-y-2">
          <Label className="text-xs font-medium">Hierarchy name</Label>
          <Input
            value={hierarchyName}
            onChange={(e) => setHierarchyName(e.target.value)}
            placeholder="Administrative Hierarchy"
            className="h-10"
          />
          <p className="text-[11px] text-muted-foreground">This name appears on the Application Areas page and in service configuration.</p>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration summary</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Data mode</span>
              <span className="font-medium">{path === "excel" ? "Limited (no maps)" : "Geographic"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Source</span>
              <span className="font-medium capitalize">{path === "preloaded" ? "Pre-loaded (OSM)" : path}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Hierarchy levels</span>
              <span className="font-medium">{levels.length}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Operational level</span>
              <span className="font-medium">{opLevelLabel}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Applied to services</span>
              <span className="font-medium text-muted-foreground">None yet (assign from service config)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 border border-border">
          Boundary data can be corrected at any time after setup by uploading a shapefile — this does not need to be finalised today.
        </p>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setInnerStep(2)} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button onClick={handleSave} className="gap-2 text-sm">
            Confirm and save <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Service Owner — confirm selected admin hierarchy
  function renderSOConfirm() {
    const target = (state.boundaryHierarchies || []).find((h) => h.id === selectedAdminHierarchy);
    if (!target) return null;

    return (
      <div className="space-y-4">
        <StepHeader step={2} total={2} title="Confirm selection" description="This service will inherit the selected hierarchy." />
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Hierarchy</span><span className="font-medium">{target.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="font-medium">{target.dataMode === "geographic" ? "Geographic" : "Limited"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Operational level</span>
            <span className="font-medium">{target.levels.find((l) => l.id === target.operationalLevelId)?.label || "—"}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Future updates to this hierarchy by the Administrator will automatically apply to this service.</p>
        <div className="flex justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setInnerStep(0)} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button onClick={handleSave} className="gap-2 text-sm">
            Confirm <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────

  function renderContent() {
    // Service Owner flow: select existing or create
    if (isServiceOwner && soMode === null && hasAdminHierarchies) {
      return renderSOSelect();
    }
    if (isServiceOwner && soMode === null && !hasAdminHierarchies && path === null && innerStep === 0) {
      // No admin hierarchies — force create path
    }

    if (innerStep === 99) return renderSOConfirm();
    if (path === null) return renderSourceSelection();
    if (path === "preloaded" && innerStep === 1) return renderJurisdictionConfirm();
    if (path === "shapefile" && innerStep === 1) return renderShapefileUpload();
    if (path === "excel" && innerStep === 1) return renderExcelUpload();
    if (innerStep === 2) return renderDataReview();
    if (innerStep === 3) return renderNameAndConfirm();

    return renderSourceSelection();
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-5 border-b border-border shrink-0">
          <SheetTitle>Set up a boundary hierarchy</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
