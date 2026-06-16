import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "@/components/onboarding/HelperText";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const SubdomainSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateService, getActiveService } = useOnboarding();
  const activeService = getActiveService();
  const [slug, setSlug] = useState(activeService?.subdomain || slugify(activeService?.name || ""));

  const valid = /^[a-z0-9][a-z0-9-]{1,39}$/.test(slug);

  const handleContinue = () => {
    if (activeService) updateService(activeService.id, { subdomain: slug });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-lg mx-auto animate-slide-up">
        <Button variant="ghost" onClick={onBack} className="gap-1 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to checklist
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Customize your subdomain</h2>
        </div>
        <HelperText text="This is the URL your users will navigate to access the app." />

        <div className="mt-6 space-y-3">
          <div className="flex items-stretch rounded-lg border border-border overflow-hidden bg-card">
            <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted/40 border-r border-border whitespace-nowrap">
              www.licenseandpermits.com/
            </span>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="your-application"
              className="border-0 rounded-none focus-visible:ring-0 text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use lowercase letters, numbers, and hyphens. Minimum 2 characters.
          </p>
          {slug && valid && (
            <p className="text-xs text-foreground">
              Preview: <span className="font-medium">www.licenseandpermits.com/{slug}</span>
            </p>
          )}
        </div>

        <div className="flex justify-between pt-8">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!valid}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubdomainSetup;
