import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { saveDeployment, saveTeamMembers, updateServiceStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Lock, Palette, Plug, Languages, Rocket, Check, KeyRound, Loader2 } from "lucide-react";
import DeploymentSetup from "@/components/go-live/DeploymentSetup";
import AddUsers from "@/components/go-live/AddUsers";
import AuthSetup from "@/components/go-live/AuthSetup";
import LicenseKeySetup from "@/components/go-live/LicenseKeySetup";
import GoLiveSuccess from "@/components/go-live/GoLiveSuccess";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof MapPin;
  required: boolean;
  component: React.FC<{ onComplete: () => void; onBack: () => void }>;
}

const GoLive: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const checklist: ChecklistItem[] = [
    {
      id: "deployment",
      label: "Deployment Setup",
      description: "Configure where your service will be available",
      icon: MapPin,
      required: true,
      component: DeploymentSetup,
    },
    {
      id: "users",
      label: "Add users for this service",
      description: "Invite people to manage this service",
      icon: Users,
      required: true,
      component: AddUsers,
    },
    {
      id: "auth",
      label: "Authentication",
      description: "Configure how your team signs in",
      icon: Lock,
      required: true,
      component: AuthSetup,
    },
    {
      id: "license",
      label: "License Key",
      description: "Enter your service license key to activate",
      icon: KeyRound,
      required: true,
      component: LicenseKeySetup,
    },
  ];

  const requiredComplete = checklist
    .filter((item) => item.required)
    .every((item) => completedItems.includes(item.id));

  const handleItemComplete = (id: string) => {
    setCompletedItems((prev) => [...prev, id]);
    setActiveStep(null);
  };

  const handleGoLive = async () => {
    setSaving(true);
    try {
      if (state.serviceId) {
        await saveDeployment(state.serviceId, state.deployment);

        if (state.organizationId && state.teamMembers.length > 0) {
          await saveTeamMembers(state.organizationId, state.teamMembers);
        }

        await updateServiceStatus(state.serviceId, "live");
      }
    } catch (err) {
      console.error("Failed to save go-live data:", err);
      // Continue anyway — status is also tracked in localStorage
    } finally {
      setSaving(false);
    }

    updateState({ isLive: true, serviceStatus: "live" });
    setShowSuccess(true);
  };

  if (showSuccess) {
    return <GoLiveSuccess />;
  }

  if (activeStep) {
    const item = checklist.find((c) => c.id === activeStep);
    if (item) {
      const Comp = item.component;
      return <Comp onComplete={() => handleItemComplete(item.id)} onBack={() => setActiveStep(null)} />;
    }
  }

  return (
    <div className="bg-background px-4 py-12">
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-8 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Rocket className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ready to go live?</h2>
          <p className="text-sm text-muted-foreground">
            Complete the required steps below, then launch your service. You can configure additional settings anytime.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required</p>
          {checklist.filter((c) => c.required).map((item) => {
            const Icon = item.icon;
            const isComplete = completedItems.includes(item.id);
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${isComplete ? "border-accent/30 bg-accent/5" : ""}`}
                onClick={() => !isComplete && setActiveStep(item.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                      ${isComplete ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isComplete ? "text-accent" : "text-foreground"}`}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {isComplete ? (
                    <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">Done</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4">Optional</p>
          {[
            { icon: Palette, label: "Customize Theme", description: "Brand colors and appearance" },
            { icon: Plug, label: "Integrations", description: "Connect external services" },
            { icon: Languages, label: "Additional Languages", description: "Add more language support" },
          ].map((item) => (
            <Card key={item.label} className="opacity-70 cursor-pointer hover:opacity-100 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">Optional</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGoLive}
            disabled={!requiredComplete || saving}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 text-base"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Rocket className="h-5 w-5" />
            )}
            {saving ? "Saving…" : "Go Live"}
          </Button>
          {!requiredComplete && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Complete all required steps to enable Go Live
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoLive;
