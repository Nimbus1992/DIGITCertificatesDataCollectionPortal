import React from "react";
import { ArrowLeft, Mail, KeyRound, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding, type AuthMethod } from "@/contexts/OnboardingContext";
import HelperText from "@/components/onboarding/HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const authOptions: { value: AuthMethod; label: string; description: string; icon: typeof Mail; isDefault?: boolean }[] = [
  { value: "email", label: "Email Login", description: "Team members sign in with their email and password", icon: Mail, isDefault: true },
  { value: "sso", label: "Single Sign-On (SSO)", description: "Use your organization's existing identity provider", icon: KeyRound },
  { value: "otp", label: "One-Time Password", description: "Sign in with a code sent to email or phone", icon: Smartphone },
];

const AuthSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const guidance = onboardingGuidance.authSetup;

  const handleSelect = (method: AuthMethod) => {
    updateState({ authMethod: method });
    setTimeout(onComplete, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full mx-auto animate-slide-up">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          How should your team sign in?
        </h2>
        <HelperText text={guidance.helperText} reassurance={guidance.reassurance} />

        <div className="mt-6 space-y-3">
          {authOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = state.authMethod === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-sm">{opt.label}</h3>
                    {opt.isDefault && (
                      <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-start pt-8">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthSetup;
