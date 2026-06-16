import React from "react";
import { ArrowRight, Lock, FileCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  renewalEnabled: boolean;
  onRenewalChange: (v: boolean) => void;
  onContinue: () => void;
}

const Step2Modules: React.FC<Props> = ({ renewalEnabled, onRenewalChange, onContinue }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Choose operational capabilities
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Select the capabilities your application will support.
        </p>
      </div>

      <div className="space-y-3">
        {/* Issuance — locked */}
        <Card className="p-5 bg-muted/40 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Issuance</h3>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-background border px-1.5 py-0.5 rounded text-muted-foreground">
                  <Lock className="h-3 w-3" /> Default
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Accept applications, review, approve, and issue new licenses.
              </p>
            </div>
          </div>
        </Card>

        {/* Renewal — toggleable */}
        <Card
          className={cn(
            "p-5 cursor-pointer transition-all",
            renewalEnabled
              ? "border-accent bg-accent/5"
              : "hover:border-accent/40 hover:bg-muted/20",
          )}
          onClick={() => onRenewalChange(!renewalEnabled)}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
                renewalEnabled
                  ? "bg-accent/10 border-accent/15 text-accent"
                  : "bg-muted text-muted-foreground border-transparent",
              )}
            >
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">Renewal</h3>
                <Switch
                  checked={renewalEnabled}
                  onCheckedChange={onRenewalChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Allow citizens to renew existing licenses before expiry.
              </p>
              {renewalEnabled && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Renewal policies can later be configured separately for categories and subcategories.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onContinue} size="lg" className="gap-1.5">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Modules;