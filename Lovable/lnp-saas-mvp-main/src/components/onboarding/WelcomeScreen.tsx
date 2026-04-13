import React from "react";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onboardingGuidance } from "@/data/onboardingGuidance";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const guidance = onboardingGuidance.welcome;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full mx-auto px-6 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-accent" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Let's launch your first service
        </h1>

        <p className="text-muted-foreground mb-2 text-lg">
          Set up licenses and permits for your organization in just a few steps.
        </p>

        <p className="text-sm text-muted-foreground/80 mb-8">
          {guidance.helperText}
        </p>

        <Button
          onClick={onStart}
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base px-8"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <span>✓ Free to start</span>
          <span>✓ No credit card</span>
          <span>✓ Setup in minutes</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
