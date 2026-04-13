import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Eye, LayoutDashboard, Plus, PartyPopper } from "lucide-react";

const GoLiveSuccess: React.FC = () => {
  const { state, resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="h-10 w-10 text-accent" />
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-3">
          🎉 Your service is now live!
        </h2>
        <p className="text-muted-foreground mb-8">
          <span className="font-medium text-foreground">{state.serviceName}</span> is now available and ready to receive applications.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-11"
          >
            <Eye className="h-4 w-4" /> View Service
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="gap-2 h-11"
          >
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetOnboarding();
              navigate("/onboarding");
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Create New Service
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoLiveSuccess;
