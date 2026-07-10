import type { ImplementationConfig } from "../types";
import { StepWrapper } from "./StepWrapper";
import { FileText } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

export default function StepOthers({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const MAX = 2000;
  const notes = config.notes ?? "";
  const count = notes.length;

  const othersSummaryItems = [
    {
      label: "Additional Notes",
      value: notes.trim()
        ? `${notes.trim().length} characters provided`
        : "None provided",
    },
  ];

  return (
    <StepWrapper
      step={12}
      title="Other Information"
      subtitle="Anything else your eGov team should know before setting up your portal."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      summaryItems={othersSummaryItems}
      nextSectionLabel="Review & Export"
    >
      <div className="space-y-5">

        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <FileText size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Use this space for anything that doesn't fit the earlier sections — local rules, special fee exceptions,
            seasonal licensing periods, known integrations, or any process quirks specific to your department.
            Your eGov implementation team will review this before the portal goes live.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Any other specifics on your business license process that you'd like to provide?
          </label>
          <p className="text-xs text-slate-400">Optional — leave blank if nothing further to add.</p>
          <textarea
            rows={10}
            maxLength={MAX}
            value={notes}
            onChange={(e) => updateConfig("notes", e.target.value)}
            placeholder={
              "Examples:\n" +
              "• We run a 3-month amnesty window every April where late renewals are accepted without penalty.\n" +
              "• Hazard category applies to all food businesses with a kitchen area > 200 sq ft.\n" +
              "• Our State treasury portal (treasury.state.gov.in) must be used for payment — not Razorpay.\n" +
              "• Ward boundaries change annually; please flag this to the eGov team for boundary sync."
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
          />
          <div className="flex justify-end">
            <span className={`text-xs ${count > MAX * 0.9 ? "text-amber-600" : "text-slate-400"}`}>
              {count} / {MAX}
            </span>
          </div>
        </div>

      </div>
    </StepWrapper>
  );
}
