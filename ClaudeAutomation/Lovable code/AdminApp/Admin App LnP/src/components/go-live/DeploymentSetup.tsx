import React, { useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Building2, Map, Layers, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding, type AvailabilityScope } from "@/contexts/OnboardingContext";
import HelperText from "@/components/onboarding/HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const scopeOptions: { value: AvailabilityScope; label: string; description: string; icon: typeof MapPin }[] = [
  { value: "entire_state", label: "Entire State", description: "Your application will be available across the entire state", icon: Map },
  { value: "cities", label: "Selected Cities", description: "Choose specific cities where this application will be available", icon: Building2 },
  { value: "districts", label: "Selected Districts", description: "Choose specific districts for this application", icon: MapPin },
  { value: "custom", label: "Custom Selection", description: "Define a custom combination of jurisdictions", icon: Layers },
];

const sampleItems: Record<string, string[]> = {
  cities: ["Springfield", "Shelbyville", "Capital City", "Ogdenville", "North Haverbrook", "Brockway"],
  districts: ["North District", "South District", "East District", "West District", "Central District"],
  
  custom: ["Zone A - Downtown", "Zone B - Industrial", "Zone C - Residential", "Zone D - Commercial"],
};

const DeploymentSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const [step, setStep] = useState(0);
  const guidance = onboardingGuidance.deploymentSetup;

  const handleScopeSelect = (scope: AvailabilityScope) => {
    updateState({ deployment: { ...state.deployment, availabilityScope: scope, selectedItems: [] } });
    if (scope === "entire_state") {
      setTimeout(onComplete, 300);
    } else {
      setStep(1);
    }
  };

  const toggleItem = (item: string) => {
    const current = state.deployment.selectedItems;
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateState({ deployment: { ...state.deployment, selectedItems: updated } });
  };

  if (step === 1) {
    const items = sampleItems[state.deployment.availabilityScope] || [];
    const scopeLabel = scopeOptions.find((s) => s.value === state.deployment.availabilityScope)?.label || "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-lg w-full mx-auto animate-slide-up">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Which {scopeLabel.toLowerCase()} should have access?
          </h2>
          <HelperText
            text="Select all that apply. You can add or remove these later."
            reassurance="This can be expanded anytime from your application settings."
          />

          <div className="mt-6 space-y-2">
            {items.map((item) => {
              const isSelected = state.deployment.selectedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`w-full px-4 py-3 rounded-lg border text-left text-sm font-medium transition-all flex items-center justify-between
                    ${isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-card text-foreground hover:border-accent/50"
                    }`}
                >
                  {item}
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={() => setStep(0)} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={onComplete}
              disabled={state.deployment.selectedItems.length === 0}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
            >
              Confirm <ArrowRight className="h-4 w-4" />
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
          Where would you like to launch this service?
        </h2>
        <HelperText text={guidance.helperText} reassurance={guidance.reassurance} />

        <div className="mt-6 space-y-3">
          {scopeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = state.deployment.availabilityScope === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleScopeSelect(opt.value)}
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

        <p className="text-xs text-muted-foreground mt-4 italic">
          This determines which jurisdictions can access this service. You can expand this later.
        </p>

        <div className="flex justify-start pt-6">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentSetup;
