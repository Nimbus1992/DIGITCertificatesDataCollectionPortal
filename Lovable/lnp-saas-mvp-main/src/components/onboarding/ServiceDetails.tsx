import React, { useState } from "react";
import { ArrowRight, ArrowLeft, UserCheck, Users, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding, type ApprovalLevel } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const approvalOptions: { value: ApprovalLevel; label: string; description: string; icon: typeof UserCheck }[] = [
  { value: "single", label: "Single Approval", description: "One person reviews and approves applications", icon: UserCheck },
  { value: "two-level", label: "Two-Level Approval", description: "Applications go through two stages of review", icon: Users },
  { value: "multi-level", label: "Multi-Level Approval", description: "Complex workflow with multiple approval stages", icon: GitBranch },
];

const ServiceDetails: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const [subStep, setSubStep] = useState(0);

  const nameGuidance = onboardingGuidance.serviceName;
  const approvalGuidance = onboardingGuidance.approvalLevels;

  if (subStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-lg w-full mx-auto animate-slide-up">
          <h2 className="text-xl font-semibold text-foreground mb-2">What would you like to call this service?</h2>
          <HelperText text={nameGuidance.helperText} reassurance={nameGuidance.reassurance} />

          <div className="mt-6">
            <Input
              value={state.serviceName}
              onChange={(e) => updateState({ serviceName: e.target.value })}
              placeholder="e.g., Business License"
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && state.serviceName.trim() && setSubStep(1)}
            />
          </div>

          <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={onBack} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setSubStep(1)}
              disabled={!state.serviceName.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full mx-auto animate-slide-up">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          How many levels of approval does this service need?
        </h2>
        <HelperText text={approvalGuidance.helperText} reassurance={approvalGuidance.reassurance} />

        <div className="mt-6 space-y-3">
          {approvalOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = state.approvalLevel === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  updateState({ approvalLevel: opt.value });
                  setTimeout(onComplete, 300);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4
                  ${isSelected
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-accent/40"
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                  ${isSelected ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{opt.label}</h3>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-start pt-8">
          <Button variant="ghost" onClick={() => setSubStep(0)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
