import React from "react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps, labels }) => {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progress}% complete</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {labels && labels[currentStep] && (
        <p className="text-xs text-center text-muted-foreground font-medium">
          {labels[currentStep]}
        </p>
      )}
    </div>
  );
};

export default StepProgress;
