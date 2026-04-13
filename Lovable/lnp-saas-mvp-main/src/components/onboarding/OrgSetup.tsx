import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Globe, Building, Languages, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import StepProgress from "./StepProgress";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const countries = ["United States", "India", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Saudi Arabia", "Singapore"];
const departments = ["Revenue", "Urban Development", "Public Works", "Health", "Education", "Transport", "Housing", "Environment"];
const languages = ["English", "Hindi", "Spanish", "French", "Arabic", "Chinese", "Portuguese", "German"];

const OrgSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const [subStep, setSubStep] = useState(0);

  const subSteps = [
    {
      key: "orgName" as const,
      icon: Building,
      question: "What's the name of your organization?",
      guidance: onboardingGuidance.orgName,
      type: "input" as const,
      placeholder: "e.g., City of Springfield",
      value: state.orgName,
      onChange: (v: string) => updateState({ orgName: v }),
    },
    {
      key: "country" as const,
      icon: Globe,
      question: "Which country is your organization based in?",
      guidance: onboardingGuidance.country,
      type: "select" as const,
      options: countries,
      value: state.country,
      onChange: (v: string) => updateState({ country: v }),
    },
    {
      key: "department" as const,
      icon: Briefcase,
      question: "Which department will use this platform?",
      guidance: onboardingGuidance.department,
      type: "select" as const,
      options: departments,
      value: state.department,
      onChange: (v: string) => updateState({ department: v }),
    },
    {
      key: "language" as const,
      icon: Languages,
      question: "What's your preferred language?",
      guidance: onboardingGuidance.language,
      type: "select" as const,
      options: languages,
      value: state.language,
      onChange: (v: string) => updateState({ language: v }),
    },
  ];

  const current = subSteps[subStep];
  const canProceed = current.value.trim().length > 0;
  const isSkippable = current.key === "country" || current.key === "department";

  const handleNext = () => {
    if (subStep < subSteps.length - 1) {
      setSubStep(subStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      onBack();
    }
  };

  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full mx-auto space-y-8">
        <StepProgress currentStep={subStep} totalSteps={subSteps.length} labels={["Organization", "Country", "Department", "Language"]} />

        <div className="animate-slide-up" key={subStep}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{current.question}</h2>
          </div>

          <HelperText text={current.guidance.helperText} reassurance={current.guidance.reassurance} />

          <div className="mt-6">
            {current.type === "input" ? (
              <Input
                value={current.value}
                onChange={(e) => current.onChange(e.target.value)}
                placeholder={current.placeholder}
                className="text-lg h-12"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {current.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      current.onChange(option);
                      setTimeout(handleNext, 200);
                    }}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left
                      ${current.value === option
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-accent/5"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={handleBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {current.type === "input" && (
            <Button onClick={handleNext} disabled={!canProceed} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {isSkippable && (
            <Button variant="ghost" onClick={handleNext} className="text-muted-foreground">
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgSetup;
