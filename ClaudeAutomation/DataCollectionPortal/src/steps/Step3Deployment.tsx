import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import type { ImplementationConfig, DeploymentConfig, BoundaryLevel } from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  Plus, Trash2, Download, Upload, FileSpreadsheet,
  Map, CheckCircle2, AlertCircle, Info, Star,
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

const LEVEL_PLACEHOLDERS = ["District", "Block / Taluka", "Village / Ward", "Sub-Ward"];

export default function Step3Deployment({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const d = config.deployment;
  const [stepError, setStepError] = useState("");
  const [shapefileError, setShapefileError] = useState("");
  const [parseError, setParseError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const shapefileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<DeploymentConfig>) =>
    updateConfig("deployment", { ...d, ...patch });

  const levels: BoundaryLevel[] = d.hierarchyLevels ?? [];
  const rows: Record<string, string>[] = d.boundaryRows ?? [];
  const uploadMethod = d.uploadMethod ?? "";
  const shapefileName = d.shapefileName ?? "";
  const operatingLevel = d.operatingLevel ?? 0;

  // ── Hierarchy level helpers ───────────────────────────────────────────────
  const addLevel = () => set({ hierarchyLevels: [...levels, { id: uid(), name: "" }] });
  const removeLevel = (id: string) => set({ hierarchyLevels: levels.filter((l) => l.id !== id) });
  const updateLevel = (id: string, name: string) =>
    set({ hierarchyLevels: levels.map((l) => l.id === id ? { ...l, name } : l) });

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
    set({ shapefileName: file.name, boundaryRows: [], uploadMethod: "shapefile" });
  };

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
          // Validate top-level always filled
          if (levelNames[0] && !(row[levelNames[0]] ?? "").toString().trim()) {
            errors.push({ row: i + 2, message: `Row ${i + 2}: "${levelNames[0]}" (top level) cannot be empty` });
          }
        });

        if (errors.length > 0) { setValidationErrors(errors); return; }

        set({ boundaryRows: parsed, uploadMethod: "excel",
          operatingLevel: Math.max(0, levels.length - 1) });
      } catch {
        setParseError("Could not read the file. Make sure it is a valid .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Validate step ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (levels.length === 0) { setStepError("Add at least one hierarchy level."); return; }
    if (levels.some((l) => !l.name.trim())) { setStepError("All hierarchy levels must have a name."); return; }
    setStepError("");
    onNext();
  };

  const extraCols = rows.length > 0
    ? Object.keys(rows[0]).filter((k) => !levels.some((l) => l.name === k))
    : [];
  const levelsReady = levels.length > 0 && levels.every((l) => l.name.trim());

  return (
    <StepWrapper
      step={3}
      title="Boundary Configuration"
      subtitle="Define your geographic hierarchy and upload boundary data."
      onNext={handleNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">

        {/* ── Info note ────────────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            The boundary hierarchy you configure here will appear as <strong>address fields in the Application Form</strong> and as <strong>filters in the Admin Dashboard</strong>. Once set, boundary fields in the form are locked and cannot be edited there.
          </p>
        </div>

        {/* ── 1. Hierarchy definition ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">1. Define Boundary Hierarchy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Name your hierarchy and add levels from largest to smallest</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Hierarchy Name</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g., Punjab Administrative Boundary"
                value={d.hierarchyName ?? ""}
                onChange={(e) => set({ hierarchyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Hierarchy Levels</label>
              <div className="space-y-2">
                {levels.map((level, idx) => (
                  <div key={level.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium w-14 shrink-0 text-right">Level {idx + 1}</span>
                    <input
                      type="text"
                      className={`${inputCls} flex-1`}
                      placeholder={`e.g., ${LEVEL_PLACEHOLDERS[idx] ?? "Level name"}`}
                      value={level.name}
                      onChange={(e) => updateLevel(level.id, e.target.value)}
                    />
                    <button onClick={() => removeLevel(level.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {levels.length === 0 && (
                  <p className="text-xs text-slate-400 italic px-1">No levels added yet — add at least one.</p>
                )}
              </div>
              <button
                onClick={addLevel}
                className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={13} /> Add Level
              </button>
            </div>

            {levels.length > 0 && (
              <div className="bg-slate-50 rounded-lg px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
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
        </div>

        {/* ── 2. Upload method ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">2. Upload Boundary Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose how to provide your boundary data</p>
          </div>
          <div className="p-5 space-y-4">

            {/* Method cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shapefile — recommended */}
              <button
                type="button"
                onClick={() => { set({ uploadMethod: "shapefile" }); setShapefileError(""); }}
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
                    <p className="text-xs text-slate-500 mt-0.5">Best for accurate geographic boundaries — upload a .shp or .zip from a GIS tool</p>
                  </div>
                </div>
              </button>

              {/* Excel */}
              <button
                type="button"
                onClick={() => set({ uploadMethod: "excel" })}
                className={`rounded-xl border-2 p-4 text-left transition-all ${uploadMethod === "excel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Upload via Excel</p>
                    <p className="text-xs text-slate-500 mt-0.5">Download template, fill in boundary values row by row, and upload</p>
                  </div>
                </div>
              </button>
            </div>

            {/* ── Shapefile panel ── */}
            {uploadMethod === "shapefile" && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${shapefileError ? "border-red-300 bg-red-50" : shapefileName ? "border-emerald-300 bg-emerald-50/40" : "border-slate-300 bg-slate-50/50 hover:border-blue-400"}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleShapefileUpload(f); }}
                >
                  {shapefileName && !shapefileError ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">{shapefileName}</span>
                      <button onClick={() => { set({ shapefileName: "" }); setShapefileError(""); }} className="text-slate-400 hover:text-red-500 text-xs transition-colors">Remove</button>
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

                <input ref={shapefileInputRef} type="file" accept=".shp,.zip" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleShapefileUpload(e.target.files[0]); e.target.value = ""; }} />
                <button
                  onClick={() => shapefileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-white transition-colors"
                >
                  <Upload size={14} /> {shapefileName ? "Replace file" : "Browse files"}
                </button>

                {/* Post-upload: confirm levels + select operating level */}
                {shapefileName && !shapefileError && levelsReady && (
                  <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Confirm Hierarchy Level Names</p>
                      <p className="text-xs text-slate-500 mb-3">These should match the column names in your shapefile's attribute table. Rename if needed.</p>
                      <div className="space-y-2">
                        {levels.map((level, idx) => (
                          <div key={level.id} className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 w-14 shrink-0 text-right">Level {idx + 1}</span>
                            <input
                              type="text"
                              className={`${inputCls} flex-1`}
                              value={level.name}
                              onChange={(e) => updateLevel(level.id, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <OperatingLevelSelector levels={levels} operatingLevel={operatingLevel} onChange={(v) => set({ operatingLevel: v })} />
                  </div>
                )}
              </div>
            )}

            {/* ── Excel panel ── */}
            {uploadMethod === "excel" && (
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <StepBadge n={1} color="emerald" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Download the template</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-2.5">
                      {levelsReady
                        ? <>Columns: <span className="font-medium text-slate-700">{levels.map((l) => l.name).join(", ")}</span></>
                        : "Name all hierarchy levels above first, then download."}
                    </p>
                    <button
                      onClick={downloadTemplate}
                      disabled={!levelsReady}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download size={13} /> Download Template (.xlsx)
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 border border-slate-200 rounded-xl p-4">
                  <StepBadge n={2} color="blue" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Upload filled template</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-2.5">
                      Each row = one boundary entry. Every row must have a value for the top-level hierarchy; sub-levels cannot be filled if the parent level is empty.
                    </p>

                    <div className={`border border-dashed rounded-lg p-4 text-center mb-2 ${rows.length > 0 ? "border-emerald-300 bg-emerald-50/50" : validationErrors.length > 0 ? "border-red-300 bg-red-50/50" : "border-slate-300 bg-slate-50/50"}`}>
                      {rows.length > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-500" />
                          <span className="text-sm font-medium text-slate-700">{rows.length} rows loaded successfully</span>
                          <button onClick={() => { set({ boundaryRows: [] }); setValidationErrors([]); }} className="text-slate-400 hover:text-red-500 text-xs ml-1 transition-colors">Clear</button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No file uploaded yet</p>
                      )}
                      {parseError && <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-red-600"><AlertCircle size={13} /> {parseError}</div>}
                    </div>

                    {/* Validation errors */}
                    {validationErrors.length > 0 && (
                      <div className="mb-2 border border-red-200 rounded-lg bg-red-50 p-3 space-y-1">
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

                    <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleExcelUpload(e.target.files[0]); e.target.value = ""; }} />
                    <button
                      onClick={() => excelInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Upload size={13} /> {rows.length > 0 ? "Replace file" : "Browse files"} (.xlsx / .csv)
                    </button>
                  </div>
                </div>

                {/* Operating level — shown after successful upload */}
                {rows.length > 0 && levelsReady && (
                  <div className="border border-slate-200 rounded-xl p-4">
                    <OperatingLevelSelector levels={levels} operatingLevel={operatingLevel} onChange={(v) => set({ operatingLevel: v })} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Uploaded data tile ─────────────────────────────────────────── */}
        {(rows.length > 0 || (uploadMethod === "shapefile" && shapefileName && !shapefileError)) && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">3. Boundary Data</h3>
                {rows.length > 0 && <p className="text-xs text-slate-500 mt-0.5">{rows.length} row{rows.length !== 1 ? "s" : ""}{rows.length > 50 ? " — showing first 50" : ""}</p>}
              </div>
              {/* Summary chips */}
              <div className="flex items-center gap-2">
                {levelsReady && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {levels.length} level{levels.length !== 1 ? "s" : ""}
                  </span>
                )}
                {uploadMethod === "shapefile" && shapefileName ? (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Shapefile</span>
                ) : rows.length > 0 ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{rows.length} rows</span>
                ) : null}
                {levelsReady && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    Operating: {levels[operatingLevel]?.name ?? levels[levels.length - 1]?.name}
                  </span>
                )}
              </div>
            </div>

            {/* Shapefile — no row preview available */}
            {uploadMethod === "shapefile" && rows.length === 0 && (
              <div className="px-5 py-6 flex items-center gap-3 text-sm text-slate-500">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="font-medium text-slate-700">{shapefileName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Geometry will be processed on submission. Row-level preview is not available for shapefiles.</p>
                </div>
              </div>
            )}

            {/* Excel — row preview */}
            {rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 w-10">#</th>
                      {levels.map((l) => (
                        <th key={l.id} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {l.name}
                          {levels.indexOf(l) === operatingLevel && (
                            <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded normal-case font-medium">operating</span>
                          )}
                        </th>
                      ))}
                      {extraCols.map((k) => (
                        <th key={k} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-slate-300">{i + 1}</td>
                        {levels.map((l) => (
                          <td key={l.id} className={`px-4 py-2.5 text-xs ${levels.indexOf(l) === operatingLevel ? "font-medium text-slate-800" : "text-slate-600"}`}>
                            {row[l.name] || <span className="text-slate-300 italic">—</span>}
                          </td>
                        ))}
                        {extraCols.map((k) => (
                          <td key={k} className="px-4 py-2.5 text-xs text-slate-400">{row[k]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <p className="px-4 py-2.5 text-xs text-slate-400 italic border-t border-slate-100">Showing 50 of {rows.length} rows</p>
                )}
              </div>
            )}
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

function StepBadge({ n, color }: { n: number; color: "emerald" | "blue" }) {
  const cls = color === "emerald"
    ? "bg-emerald-600 text-white"
    : "bg-blue-600 text-white";
  return (
    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${cls}`}>
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
