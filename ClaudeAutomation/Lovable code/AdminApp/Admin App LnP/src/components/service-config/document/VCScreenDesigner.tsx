import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BadgeCheck, Shield, Smartphone } from "lucide-react";

const DYNAMIC_VARS = [
  { value: "businessName", label: "Business Name" },
  { value: "licenseNumber", label: "License Number" },
  { value: "applicantName", label: "Applicant Name" },
  { value: "approvalDate", label: "Approval Date" },
  { value: "expiryDate", label: "Expiry Date" },
  { value: "applicationNumber", label: "Application Number" },
  { value: "wardNumber", label: "Ward Number" },
  { value: "businessCategory", label: "Business Category" },
  { value: "subCategory", label: "Sub Category" },
  { value: "tradeType", label: "Trade Type (legacy)" },
  { value: "inspectorName", label: "Inspector Name" },
];

export interface ScanScreenConfig {
  headerText: string;
  showLogo: boolean;
  visibleFields: string[];
  accentColor: string;
  badgeStyle: "checkmark" | "shield" | "minimal";
  footerText: string;
}

export const defaultScanScreenConfig: ScanScreenConfig = {
  headerText: "Credential Verified",
  showLogo: true,
  visibleFields: ["businessName", "licenseNumber", "applicantName", "approvalDate", "expiryDate"],
  accentColor: "#16a34a",
  badgeStyle: "checkmark",
  footerText: "Verified by DIGIT Platform",
};

interface VCScreenDesignerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ScanScreenConfig;
  onSave: (config: ScanScreenConfig) => void;
}

const BADGE_STYLES = [
  { value: "checkmark" as const, label: "Checkmark", icon: BadgeCheck },
  { value: "shield" as const, label: "Shield", icon: Shield },
  { value: "minimal" as const, label: "Minimal", icon: BadgeCheck },
];

const VCScreenDesigner: React.FC<VCScreenDesignerProps> = ({
  open, onOpenChange, config, onSave,
}) => {
  const [draft, setDraft] = useState<ScanScreenConfig>(config);

  const update = (field: keyof ScanScreenConfig, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const toggleField = (fieldValue: string) => {
    setDraft((prev) => ({
      ...prev,
      visibleFields: prev.visibleFields.includes(fieldValue)
        ? prev.visibleFields.filter((f) => f !== fieldValue)
        : [...prev.visibleFields, fieldValue],
    }));
  };

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Design Verification Screen</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6 min-h-[500px]">
          {/* Config Panel */}
          <ScrollArea className="w-[280px] shrink-0">
            <div className="space-y-4 pr-4">
              <div>
                <Label className="text-xs">Header Text</Label>
                <Input
                  value={draft.headerText}
                  onChange={(e) => update("headerText", e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Logo</Label>
                <Switch checked={draft.showLogo} onCheckedChange={(v) => update("showLogo", v)} />
              </div>
              <div>
                <Label className="text-xs">Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={draft.accentColor}
                    onChange={(e) => update("accentColor", e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={draft.accentColor}
                    onChange={(e) => update("accentColor", e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Badge Style</Label>
                <Select value={draft.badgeStyle} onValueChange={(v) => update("badgeStyle", v)}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BADGE_STYLES.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Visible Fields</Label>
                <div className="space-y-2">
                  {DYNAMIC_VARS.map((v) => (
                    <div key={v.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={draft.visibleFields.includes(v.value)}
                        onCheckedChange={() => toggleField(v.value)}
                        id={`vc-field-${v.value}`}
                      />
                      <label htmlFor={`vc-field-${v.value}`} className="text-xs cursor-pointer">
                        {v.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Footer Text</Label>
                <Input
                  value={draft.footerText}
                  onChange={(e) => update("footerText", e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Live Preview — Mobile Mockup */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[500px] bg-white rounded-[32px] border-[3px] border-foreground/20 shadow-xl overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="h-6 bg-foreground/5 flex items-center justify-center">
                  <div className="w-16 h-1 bg-foreground/20 rounded-full" />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
                  {/* Badge */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mt-4 mb-3"
                    style={{ backgroundColor: draft.accentColor + "20" }}
                  >
                    {draft.badgeStyle === "shield" ? (
                      <Shield className="h-8 w-8" style={{ color: draft.accentColor }} />
                    ) : (
                      <BadgeCheck className="h-8 w-8" style={{ color: draft.accentColor }} />
                    )}
                  </div>
                  {/* Header */}
                  <h3 className="text-sm font-bold text-foreground text-center">{draft.headerText}</h3>
                  {draft.showLogo && (
                    <div className="w-12 h-6 bg-muted rounded mt-2 flex items-center justify-center">
                      <Smartphone className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {/* Fields */}
                  <div className="w-full mt-4 space-y-2">
                    {draft.visibleFields.map((fieldKey) => {
                      const field = DYNAMIC_VARS.find((v) => v.value === fieldKey);
                      if (!field) return null;
                      return (
                        <div key={fieldKey} className="flex justify-between items-center py-1.5 px-2 bg-muted/30 rounded text-[10px]">
                          <span className="text-muted-foreground">{field.label}</span>
                          <span className="font-medium text-foreground">{`{${fieldKey}}`}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Footer */}
                  <div className="mt-auto pt-4">
                    <p className="text-[9px] text-muted-foreground text-center">{draft.footerText}</p>
                  </div>
                </div>
                {/* Bottom bar */}
                <div className="h-5 flex items-center justify-center">
                  <div className="w-20 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Design</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VCScreenDesigner;
