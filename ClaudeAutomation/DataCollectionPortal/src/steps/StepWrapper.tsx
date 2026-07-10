import { useState } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";

interface Props {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
  nextLabel?: string;
  isLastStep?: boolean;
}

export function StepWrapper({
  step, title, subtitle, children, onNext, onBack, onSaveDraft, nextLabel, isLastStep,
}: Props) {
  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [draftError, setDraftError] = useState("");

  const handleSaveDraft = async () => {
    setDraftState("saving");
    setDraftError("");
    try {
      await onSaveDraft();
      setDraftState("saved");
      setTimeout(() => setDraftState("idle"), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setDraftError(msg);
      setDraftState("error");
      setTimeout(() => { setDraftState("idle"); setDraftError(""); }, 6000);
    }
  };

  return (
    <div className="pb-8">
      {/* Step header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            Step {step} of 12
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="mb-8">{children}</div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={draftState === "saving"}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
              ${draftState === "saved"
                ? "border-green-300 bg-green-50 text-green-700"
                : draftState === "error"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"}
              disabled:opacity-60
            `}
          >
            {draftState === "saving" ? (
              <>
                <Save size={14} className="animate-pulse" />
                Saving…
              </>
            ) : draftState === "saved" ? (
              <>
                <CheckCircle2 size={14} />
                Draft saved
              </>
            ) : draftState === "error" ? (
              <>
                <Save size={14} />
                Save failed
              </>
            ) : (
              <>
                <Save size={14} />
                Save Draft
              </>
            )}
          </button>

          {/* Save & Continue */}
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {nextLabel ?? (isLastStep ? "Finish" : "Save & Continue")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Show actual error message below the buttons */}
      {draftState === "error" && draftError && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <strong>Save failed:</strong> {draftError}
        </p>
      )}
    </div>
  );
}
