import { useState, useMemo } from "react";
import type {
  ImplementationConfig,
  FeesConfig,
  FeesTopLevelMode,
  CustomFeeSlabEntry,
} from "../types";
import { StepWrapper } from "./StepWrapper";
import {
  AlertCircle,
  Info,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

// ── Recommended fields available for fee calculation ─────────────────────────

interface AvailableFeeField {
  id: string;
  name: string;
  fieldType: "text" | "number" | "date" | "dropdown" | string;
  source: "recommended" | "custom";
}

// These are the recommended form fields that commonly drive fee calculations
const RECOMMENDED_FEE_FIELDS: AvailableFeeField[] = [
  { id: "rec__business_area",       name: "Business Area",       fieldType: "number",   source: "recommended" },
  { id: "rec__num_employees",       name: "Number of Employees", fieldType: "number",   source: "recommended" },
  { id: "rec__trade_category",      name: "Trade Category",      fieldType: "dropdown", source: "recommended" },
  { id: "rec__is_hazardous",        name: "Is Business Hazardous?", fieldType: "dropdown", source: "recommended" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

function fieldTypeLabel(ft: string): string {
  const map: Record<string, string> = {
    text: "Text", number: "Number", date: "Date", year: "Year",
    dropdown: "Dropdown", phone: "Phone", email: "Email",
    textarea: "Textarea", checkbox: "Checkbox", file: "File",
  };
  return map[ft] ?? ft;
}

/** Whether a field supports slabs (numeric/text input types) */
function supportsSlab(fieldType: string): boolean {
  return fieldType === "number" || fieldType === "text";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

// ── Sub-step types ────────────────────────────────────────────────────────────

type CustomSubStep = "field-select" | "slab-config" | "fee-table" | "confirm";

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step6Fees({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const f = config.fees;
  const set = (patch: Partial<FeesConfig>) => updateConfig("fees", { ...f, ...patch });

  // Currency
  const accountSymbol = config.account.currencySymbol;
  const accountCurrency = config.account.currency;
  const hasCurrency = !!(accountCurrency && accountSymbol);
  const sym = hasCurrency ? accountSymbol : (f.currencySymbol || "₹");

  // Sync currency from account
  if (hasCurrency && (f.currency !== accountCurrency || f.currencySymbol !== accountSymbol)) {
    set({ currency: accountCurrency, currencySymbol: accountSymbol });
  }

  // Custom logic wizard sub-step state (local — not persisted; resets on navigation)
  const [customSubStep, setCustomSubStep] = useState<CustomSubStep>("field-select");
  // Per-field slab toggle (whether user chose "Yes" to create slabs for that field)
  const [slabEnabled, setSlabEnabled] = useState<Record<string, boolean>>({});

  // ── Build the combined list of available fields ─────────────────────────────

  const availableFields = useMemo((): AvailableFeeField[] => {
    // Start with recommended fields
    const list: AvailableFeeField[] = [...RECOMMENDED_FEE_FIELDS];
    // Add any custom fields from the form config
    for (const cf of config.formConfig.customFields) {
      list.push({
        id: cf.id,
        name: cf.name,
        fieldType: cf.fieldType,
        source: "custom",
      });
    }
    return list;
  }, [config.formConfig.customFields]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function toggleFieldSelection(fieldId: string) {
    const current = f.customFeeFields;
    if (current.includes(fieldId)) {
      set({ customFeeFields: current.filter((id) => id !== fieldId) });
    } else {
      set({ customFeeFields: [...current, fieldId] });
    }
  }

  function setSlabEntries(fieldId: string, slabs: CustomFeeSlabEntry[]) {
    set({ customFeeSlabs: { ...f.customFeeSlabs, [fieldId]: slabs } });
  }

  function addSlabEntry(fieldId: string) {
    const current = f.customFeeSlabs[fieldId] ?? [];
    setSlabEntries(fieldId, [...current, { label: "", upperBound: 0, amount: 0 }]);
  }

  function updateSlabEntry(fieldId: string, idx: number, patch: Partial<CustomFeeSlabEntry>) {
    const current = f.customFeeSlabs[fieldId] ?? [];
    setSlabEntries(fieldId, current.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }

  function removeSlabEntry(fieldId: string, idx: number) {
    const current = f.customFeeSlabs[fieldId] ?? [];
    setSlabEntries(fieldId, current.filter((_, i) => i !== idx));
  }

  // ── Generate fee table rows from selected fields ─────────────────────────────

  function generateFeeTable() {
    // Build dimension arrays for each selected field
    const dims: Array<{ fieldId: string; values: string[] }> = [];

    for (const fieldId of f.customFeeFields) {
      const field = availableFields.find((af) => af.id === fieldId);
      if (!field) continue;

      if (supportsSlab(field.fieldType) && slabEnabled[fieldId]) {
        const slabs = f.customFeeSlabs[fieldId] ?? [];
        const values = slabs.map((s) => s.label || `Slab ${slabs.indexOf(s) + 1}`);
        if (values.length > 0) dims.push({ fieldId, values });
      } else if (field.fieldType === "dropdown") {
        // Use dropdown options if available (custom field), else use placeholder rows
        const cf = config.formConfig.customFields.find((x) => x.id === fieldId);
        const opts = cf?.dropdownOptions ?? [];
        if (opts.length > 0) {
          dims.push({ fieldId, values: opts });
        } else {
          dims.push({ fieldId, values: [`${field.name} Option 1`, `${field.name} Option 2`] });
        }
      } else {
        // Non-slab numeric or text: create a single "Default" row
        dims.push({ fieldId, values: [field.name] });
      }
    }

    if (dims.length === 0) return;

    // Cartesian product of all dimension values
    let rows: Array<Record<string, string | number>> = [{}];
    for (const dim of dims) {
      const expanded: Array<Record<string, string | number>> = [];
      for (const row of rows) {
        for (const val of dim.values) {
          expanded.push({ ...row, [dim.fieldId]: val });
        }
      }
      rows = expanded;
    }

    // Preserve existing fee amounts where the row key combination matches
    const existingMap = new Map<string, number>();
    for (const row of f.customFeeTable) {
      const key = Object.entries(row)
        .filter(([k]) => k !== "__fee")
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join("|");
      existingMap.set(key, Number(row.__fee ?? 0));
    }

    const newRows = rows.map((row) => {
      const key = Object.entries(row)
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join("|");
      return { ...row, __fee: existingMap.get(key) ?? 0 };
    });

    set({ customFeeTable: newRows });
    setCustomSubStep("fee-table");
  }

  function updateTableRowFee(rowIdx: number, amount: number) {
    const newTable = f.customFeeTable.map((row, i) =>
      i === rowIdx ? { ...row, __fee: amount } : row
    );
    set({ customFeeTable: newTable });
  }

  // ── Mode selector ────────────────────────────────────────────────────────────

  const selectedFields = availableFields.filter((af) => f.customFeeFields.includes(af.id));

  return (
    <StepWrapper
      step={8}
      title="Fee Configuration"
      subtitle="Define how citizens are charged for their Business License application."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">

        {/* Currency notice */}
        {!hasCurrency ? (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Currency not set.</strong> Go to <span className="font-semibold">Account Overview (Step 1)</span> and fill in the Currency field.
              Showing <strong>₹ INR</strong> as a placeholder for now.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="text-base font-bold text-slate-700">{sym}</span>
            <span>All fees are in <strong>{accountCurrency}</strong>, pulled from Account Overview.</span>
          </div>
        )}

        {/* Mode selector */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">How should the fee be calculated?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ModeCard
              active={f.feeMode === "flat"}
              title="Flat Fee"
              description="One fee for all applications regardless of details"
              onClick={() => set({ feeMode: "flat" as FeesTopLevelMode })}
            />
            <ModeCard
              active={f.feeMode === "custom"}
              title="Custom Logic"
              description="Fee calculated based on application fields — define slabs and a fee matrix"
              onClick={() => { set({ feeMode: "custom" as FeesTopLevelMode }); setCustomSubStep("field-select"); }}
            />
          </div>
        </div>

        {/* ── Flat Fee ── */}
        {f.feeMode === "flat" && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Total Fee Amount</p>
              <p className="text-xs text-slate-500 mt-0.5">Single fee charged to all applicants upon submission</p>
            </div>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">{sym}</span>
              <input
                type="number"
                min={0}
                className={`${inputCls} pl-8 w-full`}
                value={f.flatFeeAmount || ""}
                placeholder="0"
                onChange={(e) => set({ flatFeeAmount: Number(e.target.value) })}
              />
            </div>
            {f.flatFeeAmount > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} />
                <span>Fee set to <strong>{sym}{f.flatFeeAmount.toLocaleString()}</strong> — applies to every application.</span>
              </div>
            )}
          </div>
        )}

        {/* ── Custom Logic Wizard ── */}
        {f.feeMode === "custom" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Wizard progress header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <WizardProgress currentSubStep={customSubStep} />
            </div>

            <div className="p-5">
              {/* Step A — Field Selection */}
              {customSubStep === "field-select" && (
                <FieldSelectionStep
                  availableFields={availableFields}
                  selectedFieldIds={f.customFeeFields}
                  onToggleField={toggleFieldSelection}
                  onNext={() => {
                    if (f.customFeeFields.length > 0) setCustomSubStep("slab-config");
                  }}
                />
              )}

              {/* Step B — Slab Configuration */}
              {customSubStep === "slab-config" && (
                <SlabConfigStep
                  selectedFields={selectedFields}
                  slabEnabled={slabEnabled}
                  slabs={f.customFeeSlabs}
                  sym={sym}
                  onToggleSlabEnabled={(id, val) => setSlabEnabled({ ...slabEnabled, [id]: val })}
                  onAddSlab={addSlabEntry}
                  onUpdateSlab={updateSlabEntry}
                  onRemoveSlab={removeSlabEntry}
                  onBack={() => setCustomSubStep("field-select")}
                  onNext={generateFeeTable}
                />
              )}

              {/* Step C — Fee Table */}
              {customSubStep === "fee-table" && (
                <FeeTableStep
                  tableRows={f.customFeeTable}
                  selectedFields={selectedFields}
                  sym={sym}
                  onUpdateRowFee={updateTableRowFee}
                  onBack={() => setCustomSubStep("slab-config")}
                  onNext={() => setCustomSubStep("confirm")}
                />
              )}

              {/* Step D — Confirmation */}
              {customSubStep === "confirm" && (
                <ConfirmStep
                  tableRows={f.customFeeTable}
                  selectedFields={selectedFields}
                  sym={sym}
                  onBack={() => setCustomSubStep("fee-table")}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </StepWrapper>
  );
}

// ── Mode Card ─────────────────────────────────────────────────────────────────

function ModeCard({ active, title, description, onClick }: {
  active: boolean; title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-4 rounded-xl border-2 transition-all
        ${active
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"}`}>
          {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
        </div>
        <div>
          <p className={`text-sm font-semibold ${active ? "text-blue-800" : "text-slate-800"}`}>{title}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${active ? "text-blue-600" : "text-slate-500"}`}>{description}</p>
        </div>
      </div>
    </button>
  );
}

// ── Wizard Progress ───────────────────────────────────────────────────────────

const WIZARD_STEPS: Array<{ id: CustomSubStep; label: string }> = [
  { id: "field-select", label: "Select Fields" },
  { id: "slab-config",  label: "Configure Slabs" },
  { id: "fee-table",    label: "Fee Matrix" },
  { id: "confirm",      label: "Confirm" },
];

function WizardProgress({ currentSubStep }: { currentSubStep: CustomSubStep }) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === currentSubStep);
  return (
    <div className="flex items-center gap-1">
      {WIZARD_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.id} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-1.5 ${active ? "opacity-100" : done ? "opacity-100" : "opacity-40"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {done ? <CheckCircle2 size={12} /> : idx + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline truncate ${active ? "text-blue-700" : done ? "text-green-700" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded ${done ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step A: Field Selection ───────────────────────────────────────────────────

function FieldSelectionStep({ availableFields, selectedFieldIds, onToggleField, onNext }: {
  availableFields: AvailableFeeField[];
  selectedFieldIds: string[];
  onToggleField: (id: string) => void;
  onNext: () => void;
}) {
  const canContinue = selectedFieldIds.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Which fields should the fee calculation depend on?</p>
        <p className="text-xs text-slate-500 mt-1">Select one or more fields. The system will build a fee matrix based on your selection.</p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          If a field you need is not listed below, add it first in{" "}
          <strong>Application Configuration &rarr; Form</strong>, then return here.
        </p>
      </div>

      {/* Recommended fields */}
      {availableFields.filter((f) => f.source === "recommended").length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Fields</p>
          <div className="space-y-2">
            {availableFields
              .filter((af) => af.source === "recommended")
              .map((af) => (
                <FieldCheckRow
                  key={af.id}
                  field={af}
                  checked={selectedFieldIds.includes(af.id)}
                  onToggle={() => onToggleField(af.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Custom fields */}
      {availableFields.filter((f) => f.source === "custom").length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Fields (from Application Form)</p>
          <div className="space-y-2">
            {availableFields
              .filter((af) => af.source === "custom")
              .map((af) => (
                <FieldCheckRow
                  key={af.id}
                  field={af}
                  checked={selectedFieldIds.includes(af.id)}
                  onToggle={() => onToggleField(af.id)}
                />
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          {selectedFieldIds.length === 0
            ? "Select at least one field to continue"
            : `${selectedFieldIds.length} field${selectedFieldIds.length > 1 ? "s" : ""} selected`}
        </span>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            canContinue
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Configure selected fields
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function FieldCheckRow({ field, checked, onToggle }: {
  field: AvailableFeeField; checked: boolean; onToggle: () => void;
}) {
  return (
    <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="w-4 h-4 accent-blue-600 shrink-0"
      />
      <div className="flex-1">
        <span className={`text-sm font-medium ${checked ? "text-blue-800" : "text-slate-800"}`}>{field.name}</span>
      </div>
      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium capitalize">{fieldTypeLabel(field.fieldType)}</span>
      {field.source === "recommended" && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Suggested</span>
      )}
    </label>
  );
}

// ── Step B: Slab Configuration ────────────────────────────────────────────────

function SlabConfigStep({ selectedFields, slabEnabled, slabs, sym, onToggleSlabEnabled, onAddSlab, onUpdateSlab, onRemoveSlab, onBack, onNext }: {
  selectedFields: AvailableFeeField[];
  slabEnabled: Record<string, boolean>;
  slabs: Record<string, CustomFeeSlabEntry[]>;
  sym: string;
  onToggleSlabEnabled: (id: string, val: boolean) => void;
  onAddSlab: (id: string) => void;
  onUpdateSlab: (id: string, idx: number, patch: Partial<CustomFeeSlabEntry>) => void;
  onRemoveSlab: (id: string, idx: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">Configure slab ranges for each selected field</p>
        <p className="text-xs text-slate-500 mt-1">For numeric and text fields, you can define fee slabs. For dropdown fields, each option will become a dimension in the fee matrix.</p>
      </div>

      {selectedFields.map((field) => (
        <div key={field.id} className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Field header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{field.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600 capitalize">{fieldTypeLabel(field.fieldType)}</span>
            </div>

            {supportsSlab(field.fieldType) && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-600">Create fee slabs?</span>
                <button
                  onClick={() => onToggleSlabEnabled(field.id, !slabEnabled[field.id])}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${slabEnabled[field.id] ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${slabEnabled[field.id] ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-xs font-medium text-slate-600 w-6">{slabEnabled[field.id] ? "Yes" : "No"}</span>
              </div>
            )}

            {!supportsSlab(field.fieldType) && (
              <span className="text-xs text-slate-500 italic">
                {field.fieldType === "dropdown"
                  ? "Each dropdown option will be a fee dimension"
                  : "Used as a category dimension"}
              </span>
            )}
          </div>

          {/* Slab builder */}
          {supportsSlab(field.fieldType) && slabEnabled[field.id] && (
            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-500">Add rows for each slab range. The system will create fee matrix columns for each slab.</p>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_140px_120px_32px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span className="px-3 py-2">Range Label</span>
                <span className="px-3 py-2">Upper Bound</span>
                <span className="px-3 py-2">Fee ({sym})</span>
                <span className="px-3 py-2" />
              </div>

              {(slabs[field.id] ?? []).map((slab, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_140px_120px_32px] items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    className="px-3 py-2.5 text-sm border-r border-slate-100 focus:outline-none focus:bg-blue-50 bg-transparent"
                    placeholder={`e.g. 0–${(idx + 1) * 100} sq ft`}
                    value={slab.label}
                    onChange={(e) => onUpdateSlab(field.id, idx, { label: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    className="px-3 py-2.5 text-sm border-r border-slate-100 focus:outline-none focus:bg-blue-50 bg-transparent"
                    placeholder="100"
                    value={slab.upperBound || ""}
                    onChange={(e) => onUpdateSlab(field.id, idx, { upperBound: Number(e.target.value) })}
                  />
                  <div className="relative px-2 py-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                    <input
                      type="number"
                      min={0}
                      className="w-full pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      placeholder="0"
                      value={slab.amount || ""}
                      onChange={(e) => onUpdateSlab(field.id, idx, { amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    {(slabs[field.id] ?? []).length > 1 ? (
                      <button onClick={() => onRemoveSlab(field.id, idx)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={13} />
                      </button>
                    ) : <span className="w-6 block" />}
                  </div>
                </div>
              ))}

              <button
                onClick={() => onAddSlab(field.id)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                <Plus size={12} /> Add slab
              </button>
            </div>
          )}

          {supportsSlab(field.fieldType) && !slabEnabled[field.id] && (
            <div className="px-4 py-3">
              <p className="text-xs text-slate-500 italic">This field will be used as a flat category dimension in the fee matrix (no slab ranges).</p>
            </div>
          )}

          {!supportsSlab(field.fieldType) && field.fieldType === "dropdown" && (
            <div className="px-4 py-3">
              <p className="text-xs text-slate-500">
                The fee matrix will have a row for each dropdown option. You can set fees per option in the next step.
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Generate fee table <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Step C: Fee Table ─────────────────────────────────────────────────────────

function FeeTableStep({ tableRows, selectedFields, sym, onUpdateRowFee, onBack, onNext }: {
  tableRows: Array<Record<string, number | string>>;
  selectedFields: AvailableFeeField[];
  sym: string;
  onUpdateRowFee: (rowIdx: number, amount: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const fieldCols = selectedFields;

  if (tableRows.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
          No rows to display. Go back and ensure your selected fields have at least one slab or dropdown option defined.
        </div>
        <button onClick={onBack} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Enter the fee for each combination</p>
        <p className="text-xs text-slate-500 mt-1">The system generated {tableRows.length} combination{tableRows.length > 1 ? "s" : ""}. Enter the fee amount for each row.</p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {fieldCols.map((f) => (
                <th key={f.id} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {f.name}
                </th>
              ))}
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Fee ({sym})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableRows.map((row, ridx) => (
              <tr key={ridx} className="hover:bg-slate-50/50 transition-colors">
                {fieldCols.map((f) => (
                  <td key={f.id} className="px-4 py-2.5 text-sm text-slate-700 whitespace-nowrap">
                    {String(row[f.id] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                    <input
                      type="number"
                      min={0}
                      className="w-full pl-7 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={Number(row.__fee) || ""}
                      placeholder="0"
                      onChange={(e) => onUpdateRowFee(ridx, Number(e.target.value))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Running total */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-600">Unique fee combinations</span>
        <span className="text-sm font-semibold text-slate-800">{tableRows.length} rows</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button onClick={onBack} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={onNext} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          Review & Confirm <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Step D: Confirmation ──────────────────────────────────────────────────────

function ConfirmStep({ tableRows, selectedFields, sym, onBack }: {
  tableRows: Array<Record<string, number | string>>;
  selectedFields: AvailableFeeField[];
  sym: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Fee structure configured</p>
          <p className="text-xs text-green-700 mt-0.5">
            Your custom fee matrix is ready. Click <strong>Save &amp; Continue</strong> to proceed.
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800 mb-3">Fee Matrix Summary</p>
        {tableRows.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No rows defined.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {selectedFields.map((f) => (
                    <th key={f.id} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {f.name}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    Fee ({sym})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row, ridx) => (
                  <tr key={ridx} className={ridx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    {selectedFields.map((f) => (
                      <td key={f.id} className="px-4 py-2.5 text-sm text-slate-700 whitespace-nowrap">
                        {String(row[f.id] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 whitespace-nowrap">
                      {sym}{Number(row.__fee || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button onClick={onBack} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={14} /> Edit Table
        </button>
        <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 size={13} />
          Looks good — use the <strong>Save &amp; Continue</strong> button below to proceed.
        </div>
      </div>
    </div>
  );
}
