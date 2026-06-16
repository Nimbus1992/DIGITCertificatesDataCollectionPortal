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
          <h2 className="text-2xl font-bold text-foreground mb-2">License Key</h2>
          <HelperText text="You are required to have a license key to activate this application." />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license-key">Enter the license key here</Label>
            <Input
              id="license-key"
              placeholder="e.g. XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Don't have a key?</p>
            <p>Contact us:</p>
            <p className="mt-1">
              Email: <a href="mailto:support@licenseandpermits.com" className="text-accent hover:underline">support@licenseandpermits.com</a>
            </p>
            <p>
              Phone: <a href="tel:+18001234567" className="text-accent hover:underline">+1 (800) 123-4567</a>
            </p>
          </div>

          <Button
            onClick={onComplete}
            disabled={!licenseKey.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11"
          >
            Activate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LicenseKeySetup;
