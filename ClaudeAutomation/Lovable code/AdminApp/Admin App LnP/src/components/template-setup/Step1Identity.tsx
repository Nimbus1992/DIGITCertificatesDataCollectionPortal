import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  templateName: string;
  value: string;
  onChange: (v: string) => void;
  duplicate: boolean;
  onContinue: () => void;
}

const Step1Identity: React.FC<Props> = ({ templateName, value, onChange, duplicate, onContinue }) => {
  const trimmed = value.trim();
  const invalid = trimmed.length === 0 || duplicate;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Set up your application
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Let's start by defining the basic identity of your application.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="svc-name" className="text-sm">Application name</Label>
        <Input
          id="svc-name"
          value={value}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          placeholder={templateName}
          className="h-12 text-base"
        />
        {duplicate ? (
          <p className="text-xs text-destructive">An application with this name already exists.</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Prefilled from the {templateName} template. You can rename it any time.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={invalid} size="lg" className="gap-1.5">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step1Identity;