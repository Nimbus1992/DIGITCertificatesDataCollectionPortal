import { useState, useEffect, useRef } from "react";
import type { ImplementationConfig, OverallConfig, CategoryEntry } from "../types";
import { StepWrapper } from "./StepWrapper";
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Pencil, ArrowUpDown, ArrowUp, ArrowDown, Upload, Download, RotateCcw } from "lucide-react";
import { OVERALL_Q_INDEX_KEY, CATEGORIES_CLEARED_KEY, DEFAULT_CONFIG } from "../defaults";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

function uid() { return Math.random().toString(36).slice(2, 9); }
function capitalize(s: string) { return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1); }

function OptionCard({
  selected, onClick, label, description, locked,
}: {
  selected: boolean; onClick?: () => void; label: string; description?: string; locked?: boolean;
}) {
  return (
    <div
      onClick={locked ? undefined : onClick}
      className={`flex items-start justify-between gap-3 px-4 py-4 rounded-xl border transition-all ${
        locked
          ? "border-green-200 bg-green-50 cursor-default"
          : selected
          ? "border-blue-400 bg-blue-50 cursor-pointer"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${locked ? "text-green-800" : selected ? "text-blue-800" : "text-slate-800"}`}>
            {label}
          </p>
          {locked && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">
              Always On
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
        locked ? "border-green-400 bg-green-400" :
        selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
      }`}>
        {(selected || locked) && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  );
}

function NumberInput({
  value, onChange, min = 1, max = 999, suffix,
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-lg font-medium transition-colors"
      >−</button>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
          className="w-20 text-center text-2xl font-bold text-slate-900 border border-slate-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-lg font-medium transition-colors"
      >+</button>
    </div>
  );
}

// ── Questions ─────────────────────────────────────────────────────────────────

type QuestionId =
  | "modules"
  | "validity"
  | "renewal_settings"
  | "category_levels"
  | "category_labels"
  | "categories"
  | "id_format"
  | "summary";

function getFlow(oc: OverallConfig): QuestionId[] {
  const flow: QuestionId[] = ["modules", "validity"];
  if (oc.renewalEnabled) flow.push("renewal_settings");
  flow.push("category_levels", "category_labels", "categories", "id_format", "summary");
  return flow;
}

export default function StepOverallConfig({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const oc = config.overall;
  const [qIndex, setQIndex] = useState<number>(() => {
    const saved = localStorage.getItem(OVERALL_Q_INDEX_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [newRow, setNewRow] = useState<Omit<CategoryEntry, "id">>({ level1: "", level2: "", level3: "" });
  const [sortCol, setSortCol] = useState<0 | 1 | 2 | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [categoriesCleared, setCategoriesCleared] = useState(() =>
    localStorage.getItem(CATEGORIES_CLEARED_KEY) === "true"
  );
  const [duplicateError, setDuplicateError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(OVERALL_Q_INDEX_KEY, String(qIndex));
  }, [qIndex]);

  const flow = getFlow(oc);
  const currentQId = flow[qIndex];
  const isLast = qIndex === flow.length - 1;
  const isFirst = qIndex === 0;

  function update<K extends keyof OverallConfig>(key: K, value: OverallConfig[K]) {
    updateConfig("overall", { ...oc, [key]: value });
  }

  function updateLevelLabel(i: number, value: string) {
    const labels = [...oc.categoryLevelLabels];
    labels[i] = value;
    update("categoryLevelLabels", labels);
  }

  function setLevels(n: number) {
    const labels = Array.from({ length: n }, (_, i) => oc.categoryLevelLabels[i] ?? ["Category", "Sub-Category", "Type"][i] ?? `Level ${i + 1}`);
    updateConfig("overall", { ...oc, categoryLevels: n, categoryLevelLabels: labels });
  }

  function addCategory() {
    if (!newRow.level1.trim()) return;
    const keys = (["level1", "level2", "level3"] as const).slice(0, L);
    const isDuplicate = oc.categories.some((c) =>
      keys.every((k) => c[k].trim().toLowerCase() === newRow[k].trim().toLowerCase())
    );
    if (isDuplicate) { setDuplicateError(true); return; }
    setDuplicateError(false);
    update("categories", [...oc.categories, { id: uid(), ...newRow }]);
    setNewRow({ level1: "", level2: "", level3: "" });
  }

  function removeCategory(id: string) {
    update("categories", oc.categories.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  }

  function handleSortCol(col: 0 | 1 | 2) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  function downloadTemplate() {
    const headers = oc.categoryLevelLabels.slice(0, L).join(",");
    const blob = new Blob([headers + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean).slice(1); // skip header
      const newEntries: CategoryEntry[] = lines
        .map((line) => {
          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          return { id: uid(), level1: cols[0] ?? "", level2: cols[1] ?? "", level3: cols[2] ?? "" };
        })
        .filter((entry) => entry.level1);
      update("categories", [...oc.categories, ...newEntries]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const sortedCategories = [...oc.categories].sort((a, b) => {
    if (sortCol === null) return 0;
    const keys = ["level1", "level2", "level3"] as const;
    const av = a[keys[sortCol]] ?? "";
    const bv = b[keys[sortCol]] ?? "";
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  function goNext() {
    // Recalculate flow in case modules changed
    const fresh = getFlow(oc);
    if (qIndex < fresh.length - 1) setQIndex(qIndex + 1);
  }

  function goPrev() {
    if (qIndex > 0) setQIndex(qIndex - 1);
  }

  const L = oc.categoryLevels;

  // ── Question renderers ───────────────────────────────────────────────────────

  function renderQuestion() {
    switch (currentQId) {

      case "modules":
        return (
          <div className="space-y-3">
            <OptionCard
              selected locked
              label="Issuance — New Applications"
              description="Citizens apply for a new Business License. Always enabled."
            />
            <OptionCard
              selected={oc.renewalEnabled}
              onClick={() => update("renewalEnabled", !oc.renewalEnabled)}
              label="Renewal — Renew existing licences"
              description="Let citizens renew an active licence before or after it expires."
            />
          </div>
        );

      case "validity": {
        const mode = oc.licenseValidityMode ?? "fixed";
        return (
          <div className="space-y-5">
            <div className="flex flex-col gap-3">
              <OptionCard
                selected={mode === "fixed"}
                onClick={() => update("licenseValidityMode", "fixed")}
                label="Fixed duration"
                description="The licence is valid for a set number of months from the date of issue, regardless of when in the year it was issued."
              />
              <OptionCard
                selected={mode === "financial_year"}
                onClick={() => update("licenseValidityMode", "financial_year")}
                label="Valid for the financial year"
                description="The licence expires at the end of the current financial year, no matter when it was issued. All licences in a given year expire on the same date."
              />
            </div>

            {mode === "fixed" && (
              <div className="pt-1">
                <p className="text-sm text-slate-600 mb-3">
                  After this many months, the licence expires and the business must renew.
                </p>
                <NumberInput
                  value={oc.licenseValidityMonths}
                  onChange={(v) => update("licenseValidityMonths", v)}
                  min={1} max={120}
                  suffix={oc.licenseValidityMonths === 12 ? "months (1 year)" : oc.licenseValidityMonths % 12 === 0 ? `months (${oc.licenseValidityMonths / 12} years)` : "months"}
                />
              </div>
            )}

            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-blue-500 text-base shrink-0 mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Proration of fees is possible.</strong> If a business applies mid-year under the financial-year model, your eGov team can configure the platform to charge a prorated licence fee based on the remaining months in the year.
              </p>
            </div>
          </div>
        );
      }

      case "renewal_settings":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                How many days before expiry should we remind the citizen to renew?
              </p>
              <NumberInput
                value={oc.renewalTriggerDays}
                onChange={(v) => update("renewalTriggerDays", v)}
                min={1} max={365}
                suffix="days before expiry"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                How many days after expiry can they still submit a renewal? (Grace period)
              </p>
              <NumberInput
                value={oc.renewalGracePeriodDays}
                onChange={(v) => update("renewalGracePeriodDays", v)}
                min={0} max={365}
                suffix={oc.renewalGracePeriodDays === 0 ? "days (no grace period)" : "days after expiry"}
              />
            </div>

            {/* Renewal form — not configurable yet */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 text-base mt-0.5 shrink-0">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Renewal uses the same form as the application</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  When a citizen renews, the application form will be pre-filled with their existing licence data.
                  They can review and update any fields before submitting. A separate renewal form is not yet available.
                </p>
              </div>
            </div>

            {/* Renewal approval mode */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                How should renewals be approved?
              </p>
              <div className="space-y-3">
                <OptionCard
                  selected={oc.renewalApprovalMode === "auto_all"}
                  onClick={() => update("renewalApprovalMode", "auto_all")}
                  label="Auto-approve all renewals"
                  description="Every renewal is automatically approved without any review — no workflow runs at all. Useful when renewals are routine and risk is low."
                />
                <OptionCard
                  selected={oc.renewalApprovalMode === "auto_if_unchanged"}
                  onClick={() => update("renewalApprovalMode", "auto_if_unchanged")}
                  label="Auto-approve if nothing changed"
                  description="If the citizen submits with no changes to their details, the renewal is approved automatically. Any edits trigger the standard approval workflow."
                />
                <OptionCard
                  selected={oc.renewalApprovalMode === "always_workflow"}
                  onClick={() => update("renewalApprovalMode", "always_workflow")}
                  label="Always go through the approval workflow"
                  description="Every renewal — with or without changes — goes through the full review and approval process."
                />
              </div>
            </div>
          </div>
        );

      case "category_levels":
        return (
          <div className="space-y-5">
            {/* Applicant experience note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">How the applicant will see this</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                When filling in the application form, the applicant will be shown a separate
                dropdown for <strong>every level</strong> you configure — and they must select a
                value at each level before they can continue. The dropdowns are linked: choosing
                a value at the first level filters the options available at the next.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* 1 level */}
              <OptionCard
                selected={L === 1}
                onClick={() => setLevels(1)}
                label="1 level — just main categories"
                description='The applicant sees one dropdown, e.g. "What type of business?" → Retail Shop / Restaurant / Manufacturing. They must choose one to proceed.'
              />
              {/* 2 levels */}
              <OptionCard
                selected={L === 2}
                onClick={() => setLevels(2)}
                label="2 levels — category & sub-category"
                description='The applicant first picks a category (e.g. Retail Shop), then a sub-category narrows it down (e.g. Grocery). Both selections are required.'
              />
              {/* 3 levels */}
              <OptionCard
                selected={L === 3}
                onClick={() => setLevels(3)}
                label="3 levels — category, sub-category & type"
                description='The applicant makes three linked selections, e.g. Retail Shop → Grocery → Fresh Produce. All three are required before the form can be submitted.'
              />
            </div>
          </div>
        );

      case "category_labels":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              What do you call each level in your system? Use terms your staff will recognise.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                These labels will appear throughout the system — on the <strong>application form</strong>, <strong>staff dashboards</strong>, <strong>search filters</strong>, and <strong>reports</strong>. Choose names that both citizens and employees will understand.
              </p>
            </div>
            {Array.from({ length: L }, (_, i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Level {i + 1} name
                </label>
                <input
                  type="text"
                  value={oc.categoryLevelLabels[i] ?? ""}
                  onChange={(e) => updateLevelLabel(i, e.target.value)}
                  placeholder={["Category", "Sub-Category", "Type"][i] ?? `Level ${i + 1}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        );

      case "categories": {
        const colLabels = oc.categoryLevelLabels.slice(0, L);
        const colKeys = (["level1", "level2", "level3"] as const).slice(0, L);
        const gridClass = L === 1 ? "grid-cols-[1fr_auto]" : L === 2 ? "grid-cols-[1fr_1fr_auto]" : "grid-cols-[1fr_1fr_1fr_auto]";

        // Unique values for datalist autocomplete
        const uniqueL1 = [...new Set(oc.categories.map((c) => c.level1).filter(Boolean))];
        const uniqueL2 = [...new Set(
          oc.categories.filter((c) => !newRow.level1 || c.level1 === newRow.level1).map((c) => c.level2).filter(Boolean)
        )];
        const uniqueL3 = [...new Set(
          oc.categories.filter((c) => !newRow.level2 || c.level2 === newRow.level2).map((c) => c.level3).filter(Boolean)
        )];

        // Deduplicate by visible levels so L=1 doesn't show the same level1 multiple times
        const displayRows = (() => {
          const seen = new Set<string>();
          return sortedCategories.filter((cat) => {
            const key = colKeys.map((k) => cat[k].trim().toLowerCase()).join("\0");
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        })();

        return (
          <div className="space-y-4">
            {/* Recommended notice — hidden permanently once user clears */}
            {!categoriesCleared && <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-amber-800">Recommended categories pre-filled</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  We've added a starter list of common business types. Edit, add, or remove any to match your local context — you can always add new categories and sub-categories later.
                </p>
              </div>
              {oc.categories.length > 0 && (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  Clear all & start blank
                </button>
              )}
            </div>}

            {/* Clear all confirmation */}
            {confirmClearAll && (
              <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium">
                  Remove all {oc.categories.length} categories? This cannot be undone.
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      update("categories", []);
                      setConfirmClearAll(false);
                      setConfirmDeleteId(null);
                      setCategoriesCleared(true);
                      localStorage.setItem(CATEGORIES_CLEARED_KEY, "true");
                    }}
                    className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Yes, clear all
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reset to defaults confirmation */}
            {confirmReset && (
              <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800 font-medium">
                  Replace the current list with the recommended default categories?
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      const fresh = DEFAULT_CONFIG.overall.categories.map((c) => ({ ...c, id: uid() }));
                      update("categories", fresh);
                      setConfirmReset(false);
                      setConfirmDeleteId(null);
                      setCategoriesCleared(false);
                      localStorage.setItem(CATEGORIES_CLEARED_KEY, "false");
                    }}
                    className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Yes, reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => { setConfirmReset(true); setConfirmClearAll(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-xs text-amber-700 hover:bg-amber-50 transition-colors"
                title="Restore recommended default categories"
              >
                <RotateCcw size={12} /> Reset to defaults
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Download CSV template"
                >
                  <Download size={12} /> Template
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Upload CSV"
                >
                  <Upload size={12} /> Upload CSV
                </button>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
              </div>
            </div>

            {/* Datalists for autocomplete */}
            <datalist id="cat-l1">{uniqueL1.map((v) => <option key={v} value={v} />)}</datalist>
            <datalist id="cat-l2">{uniqueL2.map((v) => <option key={v} value={v} />)}</datalist>
            <datalist id="cat-l3">{uniqueL3.map((v) => <option key={v} value={v} />)}</datalist>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className={`grid ${gridClass} gap-0 bg-slate-50 border-b border-slate-200`}>
                {colLabels.map((label, ci) => (
                  <button
                    key={ci}
                    onClick={() => handleSortCol(ci as 0 | 1 | 2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-blue-600 transition-colors border-r border-slate-200 last:border-r-0"
                  >
                    {label || `Level ${ci + 1}`}
                    {sortCol === ci
                      ? sortDir === "asc"
                        ? <ArrowUp size={11} className="text-blue-500" />
                        : <ArrowDown size={11} className="text-blue-500" />
                      : <ArrowUpDown size={11} className="text-slate-300" />}
                  </button>
                ))}
                <div className="px-4 py-2.5" />
              </div>

              {/* Data rows */}
              {displayRows.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  No categories yet — add one below or upload a CSV.
                </div>
              )}
              {displayRows.map((cat) => (
                <div key={cat.id} className={`grid ${gridClass} gap-0 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors`}>
                  {colKeys.map((key, ci) => (
                    <span key={ci} className="px-4 py-2.5 text-sm text-slate-700 truncate border-r border-slate-100 last:border-r-0">
                      {cat[key]}
                    </span>
                  ))}
                  <div className="flex items-center justify-center px-3 py-2">
                    {confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button onClick={() => removeCategory(cat.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">Yes</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(cat.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add row — with datalist autocomplete */}
              <div className={`grid ${gridClass} gap-0 border-t-2 ${duplicateError ? "border-red-300 bg-red-50/40" : "border-blue-100 bg-blue-50/30"}`}>
                <input
                  list="cat-l1"
                  type="text"
                  value={newRow.level1}
                  onChange={(e) => { setDuplicateError(false); setNewRow({ ...newRow, level1: capitalize(e.target.value) }); }}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                  placeholder={colLabels[0] || "Category"}
                  className={`px-4 py-2.5 text-sm bg-transparent border-r focus:outline-none focus:bg-white placeholder-slate-300 ${duplicateError ? "border-red-200" : "border-blue-100"}`}
                />
                {L >= 2 && (
                  <input
                    list="cat-l2"
                    type="text"
                    value={newRow.level2}
                    onChange={(e) => { setDuplicateError(false); setNewRow({ ...newRow, level2: capitalize(e.target.value) }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                    placeholder={colLabels[1] || "Sub-Category"}
                    className={`px-4 py-2.5 text-sm bg-transparent border-r focus:outline-none focus:bg-white placeholder-slate-300 ${duplicateError ? "border-red-200" : "border-blue-100"}`}
                  />
                )}
                {L >= 3 && (
                  <input
                    list="cat-l3"
                    type="text"
                    value={newRow.level3}
                    onChange={(e) => { setDuplicateError(false); setNewRow({ ...newRow, level3: capitalize(e.target.value) }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
                    placeholder={colLabels[2] || "Type"}
                    className={`px-4 py-2.5 text-sm bg-transparent border-r focus:outline-none focus:bg-white placeholder-slate-300 ${duplicateError ? "border-red-200" : "border-blue-100"}`}
                  />
                )}
                <div className="flex items-center justify-center px-2 py-1.5">
                  <button
                    onClick={addCategory}
                    disabled={!newRow.level1.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 shadow-sm"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {duplicateError
                ? <p className="text-xs text-red-600 font-medium">This combination already exists — try a different value.</p>
                : <span />}
              {displayRows.length > 0 && (
                <p className="text-xs text-slate-400">{displayRows.length} categor{displayRows.length === 1 ? "y" : "ies"} shown{displayRows.length < oc.categories.length ? ` (${oc.categories.length} total entries)` : ""}</p>
              )}
            </div>
          </div>
        );
      }


      case "id_format":
        return (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              Use <code className="bg-slate-100 px-1 rounded text-xs">YYYY</code> for the year and{" "}
              <code className="bg-slate-100 px-1 rounded text-xs">NNNNNN</code> for a running number.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                New Application ID format
              </label>
              <input
                type="text"
                value={oc.issuanceIdFormat}
                onChange={(e) => update("issuanceIdFormat", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Example result: <span className="font-mono">{oc.issuanceIdFormat.replace("YYYY", new Date().getFullYear().toString()).replace("NNNNNN", "000042")}</span>
              </p>
            </div>
            {oc.renewalEnabled && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Renewal Application ID format
                </label>
                <input
                  type="text"
                  value={oc.renewalIdFormat}
                  onChange={(e) => update("renewalIdFormat", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Example result: <span className="font-mono">{oc.renewalIdFormat.replace("YYYY", new Date().getFullYear().toString()).replace("NNNNNN", "000042")}</span>
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Should the Licence ID match the Application ID?</p>
              <div className="flex gap-3">
                <OptionCard
                  selected={oc.licenseIdSameAsApplication}
                  onClick={() => update("licenseIdSameAsApplication", true)}
                  label="Yes — same ID"
                  description="The issued licence carries the same number as the application."
                />
                <OptionCard
                  selected={!oc.licenseIdSameAsApplication}
                  onClick={() => update("licenseIdSameAsApplication", false)}
                  label="No — separate IDs"
                  description="The licence gets its own ID after issuance."
                />
              </div>
            </div>
            {!oc.licenseIdSameAsApplication && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Licence ID format
                </label>
                <input
                  type="text"
                  value={oc.licenseIdFormat ?? "LIC-YYYY-NNNNNN"}
                  onChange={(e) => update("licenseIdFormat", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Example result: <span className="font-mono">{(oc.licenseIdFormat ?? "LIC-YYYY-NNNNNN").replace("YYYY", new Date().getFullYear().toString()).replace("NNNNNN", "000042")}</span>
                </p>
              </div>
            )}
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-2">Here's what you've configured. Click the pencil icon to edit any section.</p>
            {[
              {
                label: "Modules",
                value: ["Issuance", oc.renewalEnabled ? "Renewal" : null].filter(Boolean).join(", "),
                q: 0,
              },
              {
                label: "Licence Validity",
                value: (oc.licenseValidityMode ?? "fixed") === "financial_year"
                  ? "Valid for financial year"
                  : `${oc.licenseValidityMonths} month${oc.licenseValidityMonths !== 1 ? "s" : ""}`,
                q: 1,
              },
              oc.renewalEnabled && {
                label: "Renewal",
                value: `Reminder ${oc.renewalTriggerDays} days before · ${oc.renewalGracePeriodDays} day grace period · ${oc.renewalApprovalMode === "auto_all" ? "Auto-approve all" : oc.renewalApprovalMode === "auto_if_unchanged" ? "Auto-approve if unchanged" : "Always through workflow"}`,
                q: 2,
              },
              {
                label: "Category Levels",
                value: `${L} level${L > 1 ? "s" : ""}: ${oc.categoryLevelLabels.slice(0, L).join(" → ")}`,
                q: flow.indexOf("category_levels"),
              },
              {
                label: "Categories",
                value: (() => {
                  const uniqueL1 = new Set(oc.categories.map((c) => c.level1.trim()).filter(Boolean));
                  const uniqueL2 = new Set(oc.categories.map((c) => c.level2.trim()).filter(Boolean));
                  const parts = [`${uniqueL1.size} ${oc.categoryLevelLabels[0] || "categor"}${uniqueL1.size !== 1 ? "ies" : "y"}`];
                  if (L >= 2 && uniqueL2.size > 0) parts.push(`${uniqueL2.size} ${oc.categoryLevelLabels[1] || "sub-categor"}${uniqueL2.size !== 1 ? "ies" : "y"}`);
                  if (L >= 3) {
                    const uniqueL3 = new Set(oc.categories.map((c) => c.level3.trim()).filter(Boolean));
                    if (uniqueL3.size > 0) parts.push(`${uniqueL3.size} ${oc.categoryLevelLabels[2] || "type"}${uniqueL3.size !== 1 ? "s" : ""}`);
                  }
                  return parts.join(" · ");
                })(),
                q: flow.indexOf("categories"),
              },
              {
                label: "Application ID",
                value: oc.issuanceIdFormat,
                q: flow.indexOf("id_format"),
              },
              !oc.licenseIdSameAsApplication && {
                label: "Licence ID",
                value: oc.licenseIdFormat ?? "LIC-YYYY-NNNNNN",
                q: flow.indexOf("id_format"),
              },
              oc.renewalEnabled && {
                label: "Renewal ID",
                value: oc.renewalIdFormat,
                q: flow.indexOf("id_format"),
              },
            ].filter(Boolean).map((item, i) => {
              const { label, value, q } = item as { label: string; value: string; q: number };
              return (
                <div key={i} className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-slate-800 mt-0.5">{value}</p>
                  </div>
                  <button
                    onClick={() => setQIndex(q)}
                    className="text-slate-300 hover:text-blue-500 transition-colors shrink-0"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Question metadata ────────────────────────────────────────────────────────
  const QUESTION_COPY: Record<QuestionId, { heading: string; sub: string }> = {
    modules:          { heading: "Which modules will your Business License service offer?", sub: "Select all that apply." },
    validity:         { heading: "How long should a Business License be valid?", sub: "Choose a fixed duration or tie validity to the financial year." },
    renewal_settings: { heading: "How should renewal work?", sub: "Set reminders and deadlines for renewal." },
    category_levels:  { heading: "How many levels does your licence category structure have?", sub: "The applicant must select a value at every level — choose based on how your department classifies business types." },
    category_labels:  { heading: "What do you call each level?", sub: "These labels will appear in the application form, dashboards, and filters — choose names both citizens and employees will recognise." },
    categories:       { heading: "What are your licence categories?", sub: "Add all business types that can apply for a licence." },
    id_format:        { heading: "What format should application IDs follow?", sub: "This is the reference number citizens will use to track their application." },
    summary:          { heading: "Your Overall Configuration is ready", sub: "Review and edit any section before continuing." },
  };

  const { heading, sub } = QUESTION_COPY[currentQId];
  const freshFlow = getFlow(oc);
  const totalQ = freshFlow.length;
  const progressPct = Math.round(((qIndex + 1) / totalQ) * 100);

  return (
    <StepWrapper
      step={5}
      title="Overall Configuration"
      subtitle="We'll guide you through this one question at a time."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      canProceed={isLast}
    >
      <div className="space-y-6">

        {/* Internal Q&A progress */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Question {qIndex + 1} of {totalQ}</span>
            <span>{progressPct}% complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 leading-snug">{heading}</h3>
          <p className="text-sm text-slate-500 mt-1">{sub}</p>
        </div>

        {/* Answer area */}
        <div>{renderQuestion()}</div>

        {/* Q&A navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          {isLast ? (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 size={14} />
              All done — click "Save &amp; Continue" above to proceed
            </div>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Next
              <ChevronRight size={15} />
            </button>
          )}
        </div>

      </div>
    </StepWrapper>
  );
}
