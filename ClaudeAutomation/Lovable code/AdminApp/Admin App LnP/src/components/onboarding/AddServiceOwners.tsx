import { useState } from "react";
import { ArrowRight, Mail, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "@/contexts/OnboardingContext";
import AuthShell from "./AuthShell";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function AddServiceOwners({ onComplete, onSkip }: Props) {
  const { state } = useOnboarding();
  const services = state.services;
  const [ownerEmails, setOwnerEmails] = useState<Record<string, string>>({});

  function setEmail(serviceId: string, email: string) {
    setOwnerEmails((prev) => ({ ...prev, [serviceId]: email }));
  }

  function validateEmails() {
    for (const [, email] of Object.entries(ownerEmails)) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return false;
      }
    }
    return true;
  }

  function handleContinue() {
    if (!validateEmails()) {
      toast({ title: "Please check email addresses", variant: "destructive" });
      return;
    }
    const inviteCount = Object.values(ownerEmails).filter(Boolean).length;
    if (inviteCount > 0) {
      toast({ title: `${inviteCount} service owner${inviteCount > 1 ? "s" : ""} invited` });
    }
    onComplete();
  }

  if (services.length === 0) {
    return (
      <AuthShell step="Step 6 of 6 · Service owners">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Assign service owners</h1>
          <p className="text-sm text-muted-foreground mt-1">No services were selected. You can assign service owners later from the dashboard.</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onComplete} className="gap-2 h-10 px-5">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell step="Step 6 of 6 · Service owners" contentMaxWidth="max-w-[620px]">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Assign service owners</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Service Owners configure and manage their assigned service and its team.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
          Each Service Owner will receive an email invite. They can only see and manage their assigned service — not other services or org-level settings.
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          {services.map((service) => (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{service.name}</span>
                <Badge variant="secondary" className="text-[10px] font-normal">Draft</Badge>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={ownerEmails[service.id] || ""}
                    onChange={(e) => setEmail(service.id, e.target.value)}
                    placeholder="serviceowner@organisation.gov"
                    className="pl-8 h-10 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/30">
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
            Skip for now
          </Button>
          <Button onClick={handleContinue} className="gap-2 h-10 px-5">
            Finish setup <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
}
