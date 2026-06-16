import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Settings, Users, Eye, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";
import { TemplatePreviewPanel } from "./TemplatePreviewPanel";

interface Props {
  serviceId: string;
  serviceName: string;
  templateId: string;
  onAllComplete?: () => void;
}

const SETUP_STEPS = [
  {
    icon: Eye,
    title: "Review Your Service Template",
    description: "Understand the workflow stages, roles, and form sections included in your template.",
    cta: "Looks good, let's customise",
    skippable: false,
  },
  {
    icon: Settings,
    title: "Configure Your Service",
    description: "Customise form fields, workflow stages, fees, and notification templates.",
    cta: "Service configured, continue",
    skippable: false,
    action: "configure",
  },
  {
    icon: Users,
    title: "Add Your Team",
    description: "Invite team members and assign them service roles.",
    cta: "Team added, continue",
    skippable: true,
    action: "users",
  },
  {
    icon: Rocket,
    title: "Review & Go Live",
    description: "Review your service and publish it to staging for internal testing.",
    cta: "Publish to Staging",
    skippable: false,
    action: "golive",
  },
];

export function ServiceOwnerSetup({ serviceId, serviceName, templateId, onAllComplete }: Props) {
  const { state, completeServiceOwnerStep } = useOnboarding();
  const navigate = useNavigate();
  const completedSteps = state.serviceOwnerSetupProgress?.[serviceId] || [];
  const allDone = completedSteps.length >= 4;
  const [expanded, setExpanded] = useState(!allDone);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const activeStep = SETUP_STEPS.findIndex((_, i) => !completedSteps.includes(i));

  function completeStep(index: number) {
    completeServiceOwnerStep(serviceId, index);
    const nextRemaining = SETUP_STEPS.findIndex((_, i) => i > index && !completedSteps.includes(i));
    if (nextRemaining === -1 && !completedSteps.includes(index)) {
      onAllComplete?.();
    }
  }

  function handleStepAction(index: number, action?: string) {
    if (action === "configure") {
      navigate(`/service/${serviceId}/configure`);
    } else if (action === "users") {
      navigate(`/setup/users`);
    } else if (action === "golive") {
      navigate(`/go-live`);
    } else if (index === 0) {
      setShowTemplatePreview(true);
      return;
    }
    completeStep(index);
  }

  const completedCount = completedSteps.length;
  const progressPct = Math.round((completedCount / 4) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Getting Started — {serviceName}</span>
              {allDone ? (
                <Badge className="bg-success/15 text-success border-success/30 text-[10px] font-normal">Complete</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] font-normal">{completedCount}/4 steps</Badge>
              )}
            </div>
            {!allDone && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{progressPct}%</span>
              </div>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Steps */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {SETUP_STEPS.map((step, index) => {
            const isDone = completedSteps.includes(index);
            const isActive = index === activeStep;
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  isActive && "bg-primary/5",
                  !isDone && !isActive && "opacity-60",
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className={cn("text-sm font-medium", isDone && "line-through text-muted-foreground")}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  {isActive && !isDone && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleStepAction(index, step.action)}
                      >
                        {step.cta}
                      </Button>
                      {step.skippable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground"
                          onClick={() => completeStep(index)}
                        >
                          Skip for now
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TemplatePreviewPanel
        templateId={templateId}
        open={showTemplatePreview}
        onOpenChange={(v) => {
          setShowTemplatePreview(v);
          if (!v) completeStep(0);
        }}
      />
    </div>
  );
}
