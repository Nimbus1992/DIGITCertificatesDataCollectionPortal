import type { } from "react";
import type { ImplementationConfig, FeesConfig, FeeSlabRow, FeeMode } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

const inputCls =
  "px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

function AmountInput({ value, onChange, sym, placeholder }: {
  value: number; onChange: (v: number) => void; sym: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">{sym}</span>
      <input
        type="number" min={0}
        className={`${inputCls} pl-7 w-full`}
        value={value || ""}
        placeholder={placeholder ?? "0"}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: FeeMode; onChange: (m: FeeMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
      {(["flat", "slab"] as FeeMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          {m === "flat" ? "Flat Fee" : "Slab Based"}
        </button>
      ))}
    </div>
  );
}

function SlabTable({ slabs, sym, dimension, onDimensionChange, onUpdateSlab, onAddSlab, onRemoveSlab }: {
  slabs: FeeSlabRow[];
  sym: string;
  dimension: string;
  onDimensionChange: (v: string) => void;
  onUpdateSlab: (idx: number, patch: Partial<FeeSlabRow>) => void;
  onAddSlab: () => void;
  onRemoveSlab: (idx: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          What is the slab based on? <span className="text-slate-400 font-normal">(e.g. Business Area in sq ft)</span>
        </label>
        <input
          type="text"
          className={`${inputCls} w-full`}
          placeholder="Business Area (sq ft)"
          value={dimension}
          onChange={(e) => onDimensionChange(e.target.value)}
        />
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] bg-slate-50 border-b border-slate-200">
          <span className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Slab Range</span>
          <span className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fee ({sym})</span>
          <span className="px-3 py-2.5" />
        </div>
        {slabs.map((slab, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_auto_auto] items-center border-b border-slate-100 last:border-b-0">
            <input
              type="text"
              className="px-4 py-2.5 text-sm border-r border-slate-100 focus:outline-none focus:bg-blue-50 bg-transparent"
              placeholder="e.g. 0–100 sq ft"
              value={slab.label}
              onChange={(e) => onUpdateSlab(idx, { label: e.target.value })}
            />
            <div className="relative px-2 py-1.5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
              <input
                type="number" min={0}
                className="w-28 pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={slab.amount || ""}
                placeholder="0"
                onChange={(e) => onUpdateSlab(idx, { amount: Number(e.target.value) })}
              />
            </div>
            <div className="px-3">
              {slabs.length > 1 ? (
                <button onClick={() => onRemoveSlab(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              ) : <span className="w-4 block" />}
            </div>
          </div>
        ))}
        <div className="px-4 py-2.5 border-t border-dashed border-slate-200">
          <button
            onClick={onAddSlab}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus size={12} /> Add slab
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step6Fees({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const f = config.fees;
  const set = (patch: Partial<FeesConfig>) => updateConfig("fees", { ...f, ...patch });

  // Pull currency from account overview; fall back to fees config
  const accountCurrency = config.account.currency;
  const accountSymbol   = config.account.currencySymbol;
  const hasCurrency     = !!(accountCurrency && accountSymbol);
  const sym             = hasCurrency ? accountSymbol : (f.currencySymbol || "₹");

  // Sync fees currency from account whenever account is filled
  if (hasCurrency && (f.currency !== accountCurrency || f.currencySymbol !== accountSymbol)) {
    set({ currency: accountCurrency, currencySymbol: accountSymbol });
  }

  const updateInspSlab = (idx: number, patch: Partial<FeeSlabRow>) =>
    set({ inspectionFeeSlabs: f.inspectionFeeSlabs.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  const addInspSlab    = () => set({ inspectionFeeSlabs: [...f.inspectionFeeSlabs, { label: "", amount: 0 }] });
  const removeInspSlab = (idx: number) => set({ inspectionFeeSlabs: f.inspectionFeeSlabs.filter((_, i) => i !== idx) });

  const updateLicSlab  = (idx: number, patch: Partial<FeeSlabRow>) =>
    set({ licenseFeeSlabs: f.licenseFeeSlabs.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  const addLicSlab     = () => set({ licenseFeeSlabs: [...f.licenseFeeSlabs, { label: "", amount: 0 }] });
  const removeLicSlab  = (idx: number) => set({ licenseFeeSlabs: f.licenseFeeSlabs.filter((_, i) => i !== idx) });

  return (
    <StepWrapper
      step={8}
      title="Fee Configuration"
      subtitle="Set how citizens are charged for their Business License application."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">

        {/* Currency source notice */}
        {!hasCurrency ? (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Currency not set.</strong> Go to <span className="font-semibold">Account Overview (Step 1)</span> and fill in the Currency field — fee amounts will then show the correct symbol and code.
              Showing <strong>₹ INR</strong> as a placeholder for now.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="text-base font-bold text-slate-700">{sym}</span>
            <span>All fees are in <strong>{accountCurrency}</strong>, pulled from your Account Overview.</span>
          </div>
        )}

        {/* Application Fee */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Application Fee</p>
              <p className="text-xs text-slate-500 mt-0.5">Flat fee paid when a citizen submits their application</p>
            </div>
            <span className="suggested-badge">Suggested</span>
          </div>
          <AmountInput sym={sym} value={f.applicationFee} onChange={(v) => set({ applicationFee: v })} placeholder="500" />
        </div>

        {/* Inspection Fee */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Inspection Fee</p>
              <p className="text-xs text-slate-500 mt-0.5">Fee for field inspection of the business premises</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="suggested-badge">Suggested</span>
              <ModeToggle mode={f.inspectionFeeMode} onChange={(m) => set({ inspectionFeeMode: m })} />
            </div>
          </div>

          {f.inspectionFeeMode === "flat" ? (
            <AmountInput sym={sym} value={f.inspectionFeeFlat} onChange={(v) => set({ inspectionFeeFlat: v })} placeholder="500" />
          ) : (
            <SlabTable
              slabs={f.inspectionFeeSlabs}
              sym={sym}
              dimension={f.inspectionSlabDimension}
              onDimensionChange={(v) => set({ inspectionSlabDimension: v })}
              onUpdateSlab={updateInspSlab}
              onAddSlab={addInspSlab}
              onRemoveSlab={removeInspSlab}
            />
          )}
        </div>

        {/* Hazard Surcharge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Hazard Surcharge</p>
              <p className="text-xs text-slate-500 mt-0.5">Extra flat fee if the business involves hazardous activity</p>
            </div>
            <span className="suggested-badge">Suggested</span>
          </div>
          <AmountInput sym={sym} value={f.hazardSurcharge} onChange={(v) => set({ hazardSurcharge: v })} placeholder="1500" />
        </div>

        {/* License Fee */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">License Fee</p>
              <p className="text-xs text-slate-500 mt-0.5">Fee charged upon license issuance</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="suggested-badge">Suggested</span>
              <ModeToggle mode={f.licenseFeeMode} onChange={(m) => set({ licenseFeeMode: m })} />
            </div>
          </div>

          {f.licenseFeeMode === "flat" ? (
            <AmountInput sym={sym} value={f.licenseFeeFlat} onChange={(v) => set({ licenseFeeFlat: v })} placeholder="1000" />
          ) : (
            <SlabTable
              slabs={f.licenseFeeSlabs}
              sym={sym}
              dimension={f.licenseSlabDimension}
              onDimensionChange={(v) => set({ licenseSlabDimension: v })}
              onUpdateSlab={updateLicSlab}
              onAddSlab={addLicSlab}
              onRemoveSlab={removeLicSlab}
            />
          )}
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Fee Summary</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Application Fee</span>
              <span className="font-medium">{sym}{f.applicationFee.toLocaleString()}</span>
            </div>
            {f.inspectionFeeMode === "flat" ? (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Inspection Fee (flat)</span>
                <span className="font-medium">{sym}{f.inspectionFeeFlat.toLocaleString()}</span>
              </div>
            ) : f.inspectionFeeSlabs.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">Inspection — {s.label || `Slab ${i + 1}`}</span>
                <span className="font-medium">{sym}{s.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Hazard Surcharge (if applicable)</span>
              <span className="font-medium">{sym}{f.hazardSurcharge.toLocaleString()}</span>
            </div>
            {f.licenseFeeMode === "flat" ? (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">License Fee (flat)</span>
                <span className="font-medium">{sym}{f.licenseFeeFlat.toLocaleString()}</span>
              </div>
            ) : f.licenseFeeSlabs.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">License Fee — {s.label || `Slab ${i + 1}`}</span>
                <span className="font-medium">{sym}{s.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </StepWrapper>
  );
}
