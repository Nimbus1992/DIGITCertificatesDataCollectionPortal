import { useState } from "react";
import { ArrowRight, Eye, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useOnboarding, type ServiceItem } from "@/contexts/OnboardingContext";
import { allTemplates } from "@/data/serviceTemplates";
import { TemplatePreviewPanel } from "./TemplatePreviewPanel";
import AuthShell from "./AuthShell";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function SelectTemplateStep({ onComplete, onSkip }: Props) {
  const { addService } = useOnboarding();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSelect(templateId: string) {
    const template = allTemplates.find((t) => t.id === templateId);
    if (!template || template.comingSoon) return;

    const service: ServiceItem = {
      id: `svc-${Date.now()}`,
      name: template.name,
      templateId: template.id,
      status: "draft",
      customModules: template.modules || [],
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
    };
    addService(service);
    setSelectedId(templateId);
    onComplete();
  }

  return (
    <AuthShell step="Step 5 of 6 · Choose a template" contentMaxWidth="max-w-[760px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Choose a service template</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a ready-made template to create your first service. You can add more services later from the dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {allTemplates.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedId === t.id;
          return (
            <Card
              key={t.id}
              className={cn(
                "relative overflow-hidden flex flex-col transition-all",
                t.comingSoon ? "opacity-60" : "hover:border-primary/40 hover:shadow-md cursor-pointer",
                isSelected && "border-primary ring-2 ring-primary/20",
              )}
            >
              {t.comingSoon && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Clock className="h-3 w-3" /> Coming soon
                  </Badge>
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="p-5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-semibold mb-1">{t.name}</div>
                <p className="text-xs text-muted-foreground line-clamp-3">{t.description}</p>
                {!t.comingSoon && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.modules.slice(0, 2).map((m) => (
                      <Badge key={m} variant="secondary" className="text-[10px] font-normal">{m}</Badge>
                    ))}
                  </div>
                )}
              </div>
              {!t.comingSoon && (
                <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1"
                    onClick={(e) => { e.stopPropagation(); setPreviewId(t.id); }}
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1"
                    onClick={() => handleSelect(t.id)}
                  >
                    Select <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">You can add more services after setup.</p>
        <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
          Skip for now
        </Button>
      </div>

      <TemplatePreviewPanel
        templateId={previewId}
        open={!!previewId}
        onOpenChange={(v) => !v && setPreviewId(null)}
      />
    </AuthShell>
  );
}
