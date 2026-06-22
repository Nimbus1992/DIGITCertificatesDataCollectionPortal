import { ArrowLeft, ArrowRight } from "lucide-react";

type Props = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  canBack?: boolean;
  canNext?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  submitting?: boolean;
};

export function WizardFooter({
  onBack,
  onNext,
  nextLabel = "Next",
  backLabel = "Back",
  canBack = true,
  canNext = true,
  showSkip = false,
  onSkip,
  submitting = false,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 mx-auto w-full max-w-[420px] border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-3">
      {showSkip && (
        <div className="mb-2 text-center">
          <button type="button" onClick={onSkip} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 px-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-card text-sm font-semibold text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || submitting}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-brand-orange text-sm font-semibold text-brand-orange-foreground disabled:opacity-50"
        >
          {submitting ? "Submitting…" : nextLabel} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">© {new Date().getFullYear()} City of Cape Town</p>
    </div>
  );
}