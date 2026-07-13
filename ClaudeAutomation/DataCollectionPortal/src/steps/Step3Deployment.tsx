import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import type { ImplementationConfig, DeploymentConfig, BoundaryLevel } from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  Download, Upload, FileSpreadsheet,
  Map, CheckCircle2, AlertCircle, Info, Star, Loader2, Play,
} from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

interface ValidationError { row: number; message: string }

function uid() { return Math.random().toString(36).slice(2, 9); }

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

// Strip extension from a filename to get the stem
function fileStem(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

// Generate mock level names from a shapefile stem
function mockLevels(stem: string): BoundaryLevel[] {
  const base = stem.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  return [
    { id: uid(), name: `${base} — Level 1` },
    { id: uid(), name: `${base} — Level 2` },
    { id: uid(), name: `${base} — Level 3` },
  ];
}

export default function Step3Deployment({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const d = config.deployment;
  const [stepError, setStepError] = useState("");
  const [shapefileError, setShapefileError] = useState("");
  const [parseError, setParseError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // Derived from config so it survives navigation and login/logout cycles
  const isProcessed = d.boundaryProcessed ?? false;
  // Local boundary name state (mirrors config.deployment.hierarchyName for the top-level input)
  const [localHierarchyName, setLocalHierarchyName] = useState(d.hierarchyName ?? "");
  const shapefileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Excel sub-step: how many levels the user wants before generating template
  const [excelLevelCount, setExcelLevelCount] = useState(
    d.hierarchyLevels?.length > 0 ? d.hierarchyLevels.length : 2
  );
  // Local draft level names used in the Excel "define hierarchy" sub-step.
  // We initialise from saved state if it exists.
  const [excelLevelDraft, setExcelLevelDraft] = useState<string[]>(() => {
    if (d.uploadMethod === "excel" && d.hierarchyLevels?.length > 0) {
      return d.hierarchyLevels.map((l) => l.name);
    }
    return Array(2).fill("");
  });

  const set = (patch: Partial<DeploymentConfig>) =>
    updateConfig("deployment", { ...d, ...patch });

  const levels: BoundaryLevel[] = d.hierarchyLevels ?? [];
  const rows: Record<string, string>[] = d.boundaryRows ?? [];
  const uploadMethod = d.uploadMethod ?? "";
  const shapefileName = d.shapefileName ?? "";
  const operatingLevel = d.operatingLevel ?? 0;

  const levelsReady = levels.length > 0 && levels.every((l) => l.name.trim());

  // ── Shapefile upload ──────────────────────────────────────────────────────
  const handleShapefileUpload = (file: File) => {
    setShapefileError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["shp", "zip"].includes(ext ?? "")) {
      setShapefileError(`Invalid file type ".${ext}". Please upload a .shp or .zip shapefile.`);
      return;
    }
    if (file.size === 0) {
      setShapefileError("The file appears to be empty.");
      return;
    }
    const stem = fileStem(file.name);
    const autoLevels = mockLevels(stem);

    // Apply the sync fields immediately so the UI shows the uploaded file
    const syncPatch: Partial<DeploymentConfig> = {
      shapefileName: file.name,
      hierarchyName: localHierarchyName || stem,
      hierarchyLevels: autoLevels,
      boundaryRows: [],
      uploadMethod: "shapefile",
      operatingLevel: autoLevels.length - 1,
      boundaryProcessed: false,
    };
    set(syncPatch);

    // The reader.onload callback closes over the OLD `d`, so spreading it alone
    // would overwrite the sync patch above. Re-apply syncPatch + shapefileDataUrl
    // together so both updates share the same base without conflicts.
    const reader = new FileReader();
    reader.onload = (ev) => {
      set({ ...syncPatch, shapefileDataUrl: ev.target?.result as string });
    };
    reader.onerror = () => {
      setShapefileError("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const updateLevel = (id: string, name: string) =>
    set({ hierarchyLevels: levels.map((l) => l.id === id ? { ...l, name } : l) });

  // ── Excel: sync draft level count/names into config ───────────────────────
  const syncExcelLevels = (names: string[]) => {
    const lvls: BoundaryLevel[] = names.map((name, i) => ({
      id: levels[i]?.id ?? uid(),
      name,
    }));
    set({ hierarchyLevels: lvls, uploadMethod: "excel", boundaryRows: [] });
    setValidationErrors([]);
  };

  const handleExcelLevelCountChange = (n: number) => {
    const clamped = Math.min(5, Math.max(1, n));
    const updated = Array.from({ length: clamped }, (_, i) => excelLevelDraft[i] ?? "");
    setExcelLevelDraft(updated);
    setExcelLevelCount(clamped);
    syncExcelLevels(updated);
  };

  const handleExcelLevelNameChange = (idx: number, value: string) => {
    const updated = excelLevelDraft.map((v, i) => (i === idx ? value : v));
    setExcelLevelDraft(updated);
    syncExcelLevels(updated);
  };

  const excelLevelsReady = excelLevelDraft
    .slice(0, excelLevelCount)
    .every((n) => n.trim().length > 0);

  // ── Excel template download ───────────────────────────────────────────────
  const downloadTemplate = () => {
    const headers = levels.map((l, i) => l.name.trim() || `Level ${i + 1}`);
    const example = headers.map((h) => `Example ${h}`);
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    ws["!cols"] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Boundary");
    XLSX.writeFile(wb, `boundary_template.xlsx`);
  };

  // ── Excel upload + validation ─────────────────────────────────────────────
  const handleExcelUpload = (file: File) => {
    setParseError("");
    setValidationErrors([]);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext ?? "")) {
      setParseError(`Invalid file type ".${ext}". Please upload a .xlsx or .xls file.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });

        if (parsed.length === 0) { setParseError("The file has no data rows."); return; }

        // Validate: no missing parent when child is filled
        const levelNames = levels.map((l) => l.name);
        const errors: ValidationError[] = [];
        parsed.forEach((row, i) => {
          for (let li = 1; li < levelNames.length; li++) {
            const child = (row[levelNames[li]] ?? "").toString().trim();
            const parent = (row[levelNames[li - 1]] ?? "").toString().trim();
            if (child && !parent) {
              errors.push({
                row: i + 2,
                message: `Row ${i + 2}: "${levelNames[li]}" has a value but "${levelNames[li - 1]}" is empty`,
              });
            }
          }
          if (levelNames[0] && !(row[levelNames[0]] ?? "").toString().trim()) {
            errors.push({ row: i + 2, message: `Row ${i + 2}: "${levelNames[0]}" (top level) cannot be empty` });
          }
        });

        if (errors.length > 0) { setValidationErrors(errors); return; }

        set({
          boundaryRows: parsed,
          uploadMethod: "excel",
          operatingLevel: Math.max(0, levels.length - 1),
          boundaryProcessed: false,
        });
      } catch {
        setParseError("Could not read the file. Make sure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Validate step ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!localHierarchyName.trim()) { setStepError("Please enter a boundary name."); return; }
    if (!uploadMethod) { setStepError("Please select an upload method."); return; }
    if (levels.length === 0) { setStepError("Add at least one hierarchy level."); return; }
    if (levels.some((l) => !l.name.trim())) { setStepError("All hierarchy levels must have a name."); return; }
    setStepError("");
    onNext();
  };

  const extraCols = rows.length > 0
    ? Object.keys(rows[0]).filter((k) => !levels.some((l) => l.name === k))
    : [];

  // Mock boundary preview rows for shapefile (5 rows using the detected level names)
  const mockShapefileRows = levels.length > 0
    ? [
        levels.reduce<Record<string, string>>((acc, l, i) => {
          const sampleValues = [
            ["Abuja", "Municipal Area Council", "Garki", "Ward 1", "Plot 12"],
            ["Lagos", "Ikeja", "Alausa", "Block A", "Unit 3"],
            ["Kano", "Kano Municipal", "Fagge", "Zone 2", "House 7"],
            ["Enugu", "Enugu North", "Independence Layout", "Sector B", "Plot 5"],
            ["Port Harcourt", "Obio-Akpor", "Rumuola", "Cell 3", "No. 9"],
          ];
          acc[l.name] = sampleValues[0][i] ?? `${l.name} Value`;
          return acc;
        }, {}),
        levels.reduce<Record<string, string>>((acc, l, i) => {
          const sampleValues = [["Lagos", "Ikeja", "Alausa", "Block A", "Unit 3"]];
          acc[l.name] = sampleValues[0][i] ?? `${l.name} Value`;
          return acc;
        }, {}),
        levels.reduce<Record<string, string>>((acc, l, i) => {
          const sampleValues = [["Kano", "Kano Municipal", "Fagge", "Zone 2", "House 7"]];
          acc[l.name] = sampleValues[0][i] ?? `${l.name} Value`;
          return acc;
        }, {}),
        levels.reduce<Record<string, string>>((acc, l, i) => {
          const sampleValues = [["Enugu", "Enugu North", "Independence Layout", "Sector B", "Plot 5"]];
          acc[l.name] = sampleValues[0][i] ?? `${l.name} Value`;
          return acc;
        }, {}),
        levels.reduce<Record<string, string>>((acc, l, i) => {
          const sampleValues = [["Port Harcourt", "Obio-Akpor", "Rumuola", "Cell 3", "No. 9"]];
          acc[l.name] = sampleValues[0][i] ?? `${l.name} Value`;
          return acc;
        }, {}),
      ]
    : [];

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (uploadMethod === "shapefile") {
        // Persist mock preview rows into config so the review page has data to display
        set({ boundaryProcessed: true, boundaryRows: mockShapefileRows });
      } else {
        set({ boundaryProcessed: true });
      }
    }, 1500);
  };

  // Build summary items from current deployment config
  const boundarySummaryItems = [
    { label: "Boundary Name", value: d.hierarchyName || "—" },
    { label: "Upload Method", value: d.uploadMethod === "shapefile" ? "Shapefile (.shp / .zip)" : d.uploadMethod === "excel" ? "Excel (.xlsx)" : "—" },
    {
      label: "Hierarchy Levels",
      value: levels.length > 0 ? levels.map((l) => l.name).filter(Boolean) : [] as string[],
    },
    {
      label: "Operating Level",
      value: levels.length > 0 && operatingLevel < levels.length
        ? levels[operatingLevel]?.name || "—"
        : "—",
    },
    {
      label: "Data",
      value: d.uploadMethod === "excel" && rows.length > 0
        ? `${rows.length} boundary rows`
        : d.uploadMethod === "shapefile" && d.shapefileName
        ? d.shapefileName
        : "—",
    },
    {
      label: "Status",
      value: isProcessed ? "Processed & ready" : "Not yet processed",
    },
  ];

  return (
    <StepWrapper
      step={3}
      title="Boundary Configuration"
      subtitle="Upload your geographic boundary data and define its hierarchy."
      onNext={handleNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      summaryItems={boundarySummaryItems}
      nextSectionLabel="Integration Setup"
    >
      <div className="space-y-5">

        {/* ── Info note ────────────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            The boundary hierarchy you configure here will appear as <strong>address fields in the Application Form</strong> and as <strong>filters in the Admin Dashboard</strong>. Once set, boundary fields in the form are locked and cannot be edited there.
          </p>
        </div>

        {/* ── Section 1: Boundary Name (must fill before upload options appear) ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">1. Boundary Name</h3>
            <p className="text-xs text-slate-500 mt-0.5">Give your boundary dataset a name before uploading</p>
          </div>
          <div className="p-5">
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Nigeria Administrative Boundaries"
              value={localHierarchyName}
              onChange={(e) => {
                setLocalHierarchyName(e.target.value);
                set({ hierarchyName: e.target.value, ...(isProcessed ? { boundaryProcessed: false } : {}) });
              }}
            />
            {!localHierarchyName.trim() && (
              <p className="text-xs text-slate-400 mt-2">Enter a boundary name to reveal the upload options below.</p>
            )}
          </div>
        </div>

        {/* ── Section 2: Choose upload method (only shown after boundary name is set) ── */}
        {localHierarchyName.trim() && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">2. Choose Upload Method</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select how you want to provide boundary data — you can change this at any time</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shapefile — recommended */}
              <button
                type="button"
                onClick={() => {
                  setShapefileError("");
                  setParseError("");
                  setValidationErrors([]);
                  // Only reset if switching away from current method
                  if (uploadMethod !== "shapefile") {
                    set({ uploadMethod: "shapefile", shapefileName: "", hierarchyLevels: [], hierarchyName: localHierarchyName, boundaryRows: [], operatingLevel: 0, boundaryProcessed: false });
                  }
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all relative ${uploadMethod === "shapefile" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <span className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                  <Star size={10} className="fill-amber-500 text-amber-500" /> Recommended
                </span>
                <div className="flex items-start gap-3 pr-24">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Map size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload Shapefile</p>
                    <p className="text-xs text-slate-500 mt-0.5">Best for accurate geographic boundaries — upload a .shp or .zip from a GIS tool. Hierarchy levels are auto-populated.</p>
                  </div>
                </div>
              </button>

              {/* Excel */}
              <button
                type="button"
                onClick={() => {
                  setShapefileError("");
                  setParseError("");
                  setValidationErrors([]);
                  if (uploadMethod !== "excel") {
                    set({ uploadMethod: "excel", shapefileName: "", hierarchyLevels: [], hierarchyName: localHierarchyName, boundaryRows: [], operatingLevel: 0, boundaryProcessed: false });
                    setExcelLevelDraft(Array(excelLevelCount).fill(""));
                  }
                }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${uploadMethod === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload via Excel</p>
                    <p className="text-xs text-slate-500 mt-0.5">Define your hierarchy levels, download a template, fill in boundary values, and upload.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ── Section 3: Shapefile flow ─────────────────────────────────────── */}
        {localHierarchyName.trim() && uploadMethod === "shapefile" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">3. Upload Shapefile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hierarchy levels and name will be auto-populated from the file — you can edit them after upload</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Dropzone */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  shapefileError
                    ? "border-red-300 bg-red-50"
                    : shapefileName
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-300 bg-slate-50/50 hover:border-blue-400"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) handleShapefileUpload(f);
                }}
                onClick={() => shapefileInputRef.current?.click()}
              >
                {shapefileName && !shapefileError ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">{shapefileName}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        set({ shapefileName: "", hierarchyLevels: [], hierarchyName: "", operatingLevel: 0, boundaryRows: [], boundaryProcessed: false });
                        setShapefileError("");
                      }}
                      className="text-slate-400 hover:text-red-500 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Map size={28} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">Drop shapefile here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">Accepted: .shp · .zip (containing shapefile)</p>
                  </>
                )}
                {shapefileError && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-red-600">
                    <AlertCircle size={13} /> {shapefileError}
                  </div>
                )}
              </div>

              <input
                ref={shapefileInputRef}
                type="file"
                accept=".shp,.zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleShapefileUpload(e.target.files[0]);
                  e.target.value = "";
                }}
              />

              {/* Post-upload: auto-populated hierarchy name + levels */}
              {shapefileName && !shapefileError && (
                <div className="border border-slate-200 rounded-xl p-4 space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Hierarchy Name</p>
                    <p className="text-xs text-slate-500 mb-2">Auto-populated from filename — edit if needed.</p>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g., Punjab Administrative Boundary"
                      value={d.hierarchyName ?? ""}
                      onChange={(e) => set({ hierarchyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Level Names</p>
                    <p className="text-xs text-slate-500 mb-3">
                      Detected from shapefile attributes. Edit names to match your actual attribute columns.
                    </p>
                    <div className="space-y-2">
                      {levels.map((level, idx) => (
                        <div key={level.id} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium w-14 shrink-0 text-right">Level {idx + 1}</span>
                          <input
                            type="text"
                            className={`${inputCls} flex-1`}
                            value={level.name}
                            onChange={(e) => updateLevel(level.id, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    {levels.length > 0 && (
                      <div className="bg-slate-50 rounded-lg px-4 py-2.5 flex items-center gap-1.5 flex-wrap mt-3">
                        {levels.map((l, i) => (
                          <span key={l.id} className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${l.name.trim() ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-400 italic"}`}>
                              {l.name.trim() || `Level ${i + 1}`}
                            </span>
                            {i < levels.length - 1 && <span className="text-slate-400 text-xs">→</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <OperatingLevelSelector
                    levels={levels}
                    operatingLevel={operatingLevel}
                    onChange={(v) => set({ operatingLevel: v })}
                  />
                </div>
              )}

              {/* Process button + preview — shapefile uploaded */}
              {shapefileName && !shapefileError && (
                <div className="space-y-4">
                  {!isProcessed ? (
                    <button
                      type="button"
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <Play size={15} className="fill-white" />
                          Process Boundary Data
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      {/* Data preview */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                          <p className="text-sm font-semibold text-slate-800">Boundary data preview</p>
                          <span className="ml-auto text-xs text-slate-400">5 sample rows</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 w-8">#</th>
                                {levels.map((l, li) => (
                                  <th
                                    key={l.id}
                                    className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                                      li === operatingLevel ? "text-purple-700 bg-purple-50" : "text-slate-500"
                                    }`}
                                  >
                                    {l.name}
                                    {li === operatingLevel && (
                                      <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded normal-case font-medium">operating</span>
                                    )}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {mockShapefileRows.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-3 py-2 text-xs text-slate-300">{i + 1}</td>
                                  {levels.map((l, li) => (
                                    <td
                                      key={l.id}
                                      className={`px-3 py-2 text-xs ${
                                        li === operatingLevel
                                          ? "font-medium text-slate-800 bg-purple-50/40"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {row[l.name] ?? "—"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Confirmation tile */}
                      <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-5 py-4 flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{localHierarchyName || shapefileName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Boundary data processed successfully. The <strong>operating level</strong> you selected will appear as an address field in the Application Form and as a filter in the Admin Dashboard.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Section 3: Excel flow ─────────────────────────────────────────── */}
        {localHierarchyName.trim() && uploadMethod === "excel" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">3. Define Hierarchy &amp; Upload Data</h3>
              <p className="text-xs text-slate-500 mt-0.5">Follow the steps below to generate a template and upload your boundary data</p>
            </div>
            <div className="p-5 space-y-3">

              {/* Step 1 — Define hierarchy */}
              <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <StepBadge n={1} />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Define hierarchy</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose how many levels your boundary has (e.g. State → District → City = 3 levels), then name each one.
                    </p>
                  </div>

                  {/* Level count */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 shrink-0">Number of levels</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={excelLevelCount}
                      onChange={(e) => handleExcelLevelCountChange(parseInt(e.target.value, 10) || 1)}
                      className="w-20 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <span className="text-xs text-slate-400">(1–5)</span>
                  </div>

                  {/* Level names */}
                  <div className="space-y-2">
                    {Array.from({ length: excelLevelCount }, (_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium w-14 shrink-0 text-right">Level {i + 1}</span>
                        <input
                          type="text"
                          className={`${inputCls} flex-1`}
                          placeholder={["State", "District", "City", "Block", "Village"][i] ?? `Level ${i + 1}`}
                          value={excelLevelDraft[i] ?? ""}
                          onChange={(e) => handleExcelLevelNameChange(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Level breadcrumb preview */}
                  {excelLevelDraft.slice(0, excelLevelCount).some((n) => n.trim()) && (
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
                      {excelLevelDraft.slice(0, excelLevelCount).map((name, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${name.trim() ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-400 italic"}`}>
                            {name.trim() || `Level ${i + 1}`}
                          </span>
                          {i < excelLevelCount - 1 && <span className="text-slate-400 text-xs">→</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Generate template */}
                  <button
                    onClick={downloadTemplate}
                    disabled={!excelLevelsReady}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download size={14} /> Generate Template
                  </button>
                  {!excelLevelsReady && (
                    <p className="text-xs text-slate-400">Name all levels to enable the Generate Template button.</p>
                  )}
                </div>
              </div>

              {/* Step 2 — Upload filled template */}
              <div className="flex items-start gap-4 border border-slate-200 rounded-xl p-4">
                <StepBadge n={2} />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload filled template</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Each row = one boundary entry. Every row must have a value for the top-level; sub-levels cannot be filled if the parent is empty.
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      rows.length > 0
                        ? "border-emerald-300 bg-emerald-50/50"
                        : validationErrors.length > 0
                        ? "border-red-300 bg-red-50/50"
                        : "border-slate-300 bg-slate-50/50 hover:border-blue-300"
                    }`}
                    onClick={() => excelInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleExcelUpload(f);
                    }}
                  >
                    {rows.length > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700">{rows.length} rows loaded successfully</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            set({ boundaryRows: [], boundaryProcessed: false });
                            setValidationErrors([]);
                          }}
                          className="text-slate-400 hover:text-red-500 text-xs ml-1 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileSpreadsheet size={24} className="text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-0.5">Accepted: .xlsx · .xls</p>
                      </>
                    )}
                    {parseError && (
                      <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-red-600">
                        <AlertCircle size={13} /> {parseError}
                      </div>
                    )}
                  </div>

                  {/* Validation errors */}
                  {validationErrors.length > 0 && (
                    <div className="border border-red-200 rounded-lg bg-red-50 p-3 space-y-1">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        <AlertCircle size={12} className="inline mr-1" />
                        {validationErrors.length} validation error{validationErrors.length > 1 ? "s" : ""} — fix these in the file and re-upload
                      </p>
                      {validationErrors.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-xs text-red-600">• {e.message}</p>
                      ))}
                      {validationErrors.length > 5 && (
                        <p className="text-xs text-red-400 italic">…and {validationErrors.length - 5} more</p>
                      )}
                    </div>
                  )}

                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleExcelUpload(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => excelInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Upload size={13} /> {rows.length > 0 ? "Replace file" : "Browse files"} (.xlsx / .xls)
                  </button>

                  {/* Process button — shown after successful upload */}
                  {rows.length > 0 && levelsReady && !isProcessed && (
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing…
                          </>
                        ) : (
                          <>
                            <Play size={15} className="fill-white" />
                            Process Boundary Data
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 — Data preview + operating level + confirmation (after processing) */}
              {rows.length > 0 && levelsReady && isProcessed && (
                <div className="flex items-start gap-4 border border-slate-200 rounded-xl p-4">
                  <StepBadge n={3} />
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Data preview</p>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        First 5 rows. The <span className="text-purple-700 font-medium">operating level</span> column is highlighted.
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 w-8">#</th>
                              {levels.map((l, li) => (
                                <th
                                  key={l.id}
                                  className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider ${
                                    li === operatingLevel ? "text-purple-700 bg-purple-50" : "text-slate-500"
                                  }`}
                                >
                                  {l.name}
                                  {li === operatingLevel && (
                                    <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded normal-case font-medium">operating</span>
                                  )}
                                </th>
                              ))}
                              {extraCols.map((k) => (
                                <th key={k} className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.slice(0, 5).map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2 text-xs text-slate-300">{i + 1}</td>
                                {levels.map((l, li) => (
                                  <td
                                    key={l.id}
                                    className={`px-3 py-2 text-xs ${
                                      li === operatingLevel
                                        ? "font-medium text-slate-800 bg-purple-50/40"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {row[l.name] || <span className="text-slate-300 italic">—</span>}
                                  </td>
                                ))}
                                {extraCols.map((k) => (
                                  <td key={k} className="px-3 py-2 text-xs text-slate-400">{row[k]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {rows.length > 5 && (
                          <p className="px-3 py-2 text-xs text-slate-400 italic border-t border-slate-100">Showing 5 of {rows.length} rows</p>
                        )}
                      </div>
                    </div>

                    {/* Operating level selector below preview */}
                    <OperatingLevelSelector
                      levels={levels}
                      operatingLevel={operatingLevel}
                      onChange={(v) => set({ operatingLevel: v })}
                    />

                    {/* Confirmation tile */}
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-5 py-4 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{localHierarchyName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {rows.length} rows processed successfully. The <strong>operating level</strong> you selected will appear as an address field in the Application Form and as a filter in the Admin Dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {stepError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} className="shrink-0" /> {stepError}
          </div>
        )}
      </div>
    </StepWrapper>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 bg-blue-600 text-white">
      {n}
    </div>
  );
}

function OperatingLevelSelector({
  levels, operatingLevel, onChange,
}: {
  levels: BoundaryLevel[];
  operatingLevel: number;
  onChange: (i: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Select Operating Level</p>
      <p className="text-xs text-slate-500 mb-3">
        This is the hierarchy level that will appear as a selectable field in the Application Form and as a filter in the Admin Dashboard.
      </p>
      <div className="flex flex-wrap gap-2">
        {levels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              operatingLevel === i
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-slate-600 border-slate-300 hover:border-purple-400"
            }`}
          >
            {l.name || `Level ${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}
