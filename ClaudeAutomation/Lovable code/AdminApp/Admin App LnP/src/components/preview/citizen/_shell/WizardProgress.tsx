import React from "react";

interface Props {
  step: number;     // 1-based current step
  total: number;
  stepName: string;
}

const WizardProgress: React.FC<Props> = ({ step, total, stepName }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#6B7280" }}>
        Step {step} of {total}
      </span>
      <span className="text-[11px] font-semibold" style={{ color: "#1D3557" }}>
        {stepName}
      </span>
    </div>
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isComplete = idx < step;
        const isCurrent = idx === step;
        const bg = isCurrent ? "#F4A261" : isComplete ? "#1D3557" : "#E0E0E0";
        return <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: bg }} />;
      })}
    </div>
  </div>
);

export default WizardProgress;
