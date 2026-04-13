import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound } from "lucide-react";
import HelperText from "@/components/onboarding/HelperText";

interface LicenseKeySetupProps {
  onComplete: () => void;
  onBack: () => void;
}

const LicenseKeySetup: React.FC<LicenseKeySetupProps> = ({ onComplete, onBack }) => {
  const [licenseKey, setLicenseKey] = useState("");

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="gap-1 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to checklist
        </Button>

        <div className="text-center mb-8 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Enter your license key</h2>
          <HelperText text="Your license key was provided when you registered your organization. Enter it below to activate your service." />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              placeholder="e.g. XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
          </div>

          <Button
            onClick={onComplete}
            disabled={!licenseKey.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11"
          >
            Authenticate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LicenseKeySetup;
