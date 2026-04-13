import React, { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const setupSteps = [
  "Creating your organization",
  "Setting up your service",
  "Configuring forms and fields",
  "Building approval workflow",
  "Assigning default roles",
];

const AutoSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const guidance = onboardingGuidance.autoSetup;

  useEffect(() => {
    if (currentIndex >= setupSteps.length) {
      setTimeout(() => {
        updateState({ isOnboardingComplete: true, serviceStatus: "draft" });
        onComplete();
      }, 600);
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, 800 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete, updateState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto text-center animate-slide-up">
        <h2 className="text-2xl font-bold text-foreground mb-2">Setting things up for you</h2>
        <HelperText text={guidance.helperText} className="justify-center mb-8" />

        <div className="space-y-4 text-left mt-8">
          {setupSteps.map((step, i) => {
            const isComplete = completedSteps.includes(i);
            const isCurrent = i === currentIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isComplete ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${isComplete ? "bg-accent text-accent-foreground animate-check" : isCurrent ? "bg-accent/20" : "bg-secondary"}`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={`text-sm ${isComplete ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Setting up <span className="font-medium text-foreground">{state.serviceName}</span> for{" "}
          <span className="font-medium text-foreground">{state.orgName}</span>
        </p>
      </div>
    </div>
  );
};

export default AutoSetup;
