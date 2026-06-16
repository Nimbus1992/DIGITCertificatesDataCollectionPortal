import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, Upload, Palette, Type, FileText, Shield, ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { DEFAULT_BRANDING } from "@/hooks/useBranding";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemePreset {
  id: string;
  name: string;
  font: string;
  headingFont?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  buttonRadius: string;
  cardRadius: string;
  description: string;
}

const themePresets: ThemePreset[] = [
  {
    id: "digit",
    name: "DIGIT Theme",
    font: "Roboto",
    headingFont: "Roboto Condensed",
    primaryColor: "#C84C0E",
    secondaryColor: "#0B4B66",
    bgColor: "#F8FAFC",
    textColor: "#363636",
    mutedColor: "#787878",
    buttonRadius: "4px",
    cardRadius: "4px",
    description: "Roboto, warm orange & teal, minimal radius",
  },
  {
    id: "civic",
    name: "Civic Blue",
    font: "Public Sans",
    primaryColor: "#136DEC",
    secondaryColor: "#E2E8F0",
    bgColor: "#F8FAFC",
    textColor: "#1E293B",
    mutedColor: "#94A3B8",
    buttonRadius: "8px",
    cardRadius: "12px",
    description: "Public Sans, civic blue, soft rounded corners",
  },
  {
    id: "bold",
    name: "Bold Slate",
    font: "Inter",
    primaryColor: "#0F172A",
    accentColor: "#EC5B13",
    bgColor: "#F9FAFB",
    textColor: "#0F172A",
    mutedColor: "#6B7280",
    buttonRadius: "9999px",
    cardRadius: "12px",
    description: "Inter, dark slate + orange accent, pill buttons",
  },
  {
    id: "teal",
    name: "Teal Modern",
    font: "DM Sans",
    primaryColor: "#0D9488",
    bgColor: "#F9FAFB",
    textColor: "#1F2937",
    mutedColor: "#9CA3AF",
    buttonRadius: "9999px",
    cardRadius: "12px",
    description: "DM Sans, teal primary, pill buttons",
  },
];

const colorSwatches = [
  "#C84C0E", "#0B4B66", "#136DEC", "#0F172A", "#EC5B13",
  "#0D9488", "#7C3AED", "#B91900", "#0057BD", "#00703C",
];

const fontOptions = [
  "Roboto", "Public Sans", "Inter", "DM Sans", "Lato", "Source Sans Pro",
];

function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastText(hex: string): string {
  return getRelativeLuminance(hex) > 0.3 ? "#1E293B" : "#FFFFFF";
}

const BrandingTheme: React.FC = () => {
  const navigate = useNavigate();
  const { getActiveService, updateActiveServiceBranding, updatePlatformBranding, state } = useOnboarding();
  const activeService = getActiveService();
  const [scope, setScope] = useState<"service" | "platform">(activeService ? "service" : "platform");
  const saved = scope === "service" ? activeService?.branding : state.platformBranding;

  const [selectedPreset, setSelectedPreset] = useState<string>(saved?.presetId ?? DEFAULT_BRANDING.presetId ?? "teal");
  const [primaryColor, setPrimaryColor] = useState(saved?.primaryColor ?? DEFAULT_BRANDING.primaryColor);
  const [selectedFont, setSelectedFont] = useState(saved?.font ?? DEFAULT_BRANDING.font);
  const [buttonRadius, setButtonRadius] = useState(saved?.buttonRadius ?? DEFAULT_BRANDING.buttonRadius);
  const [cardRadius, setCardRadius] = useState(saved?.cardRadius ?? DEFAULT_BRANDING.cardRadius);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(saved?.logoDataUrl ?? state.logoUrl ?? DEFAULT_BRANDING.logoDataUrl ?? "");
  const [guidelinesFile, setGuidelinesFile] = useState<File | null>(null);
  const [copyright, setCopyright] = useState(saved?.copyright ?? DEFAULT_BRANDING.copyright);
  const [portalName, setPortalName] = useState(saved?.portalName ?? state.orgName ?? DEFAULT_BRANDING.portalName);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuidelinesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuidelinesFile(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const removeGuidelines = () => {
    setGuidelinesFile(null);
  };

  const applyPreset = (preset: ThemePreset) => {
    setSelectedPreset(preset.id);
    setPrimaryColor(preset.primaryColor);
    setSelectedFont(preset.font);
    setButtonRadius(preset.buttonRadius);
    setCardRadius(preset.cardRadius);
  };

  const contrastText = getContrastText(primaryColor);
  const activePreset = themePresets.find((p) => p.id === selectedPreset);

  const applyTheme = () => {
    const payload = {
      presetId: selectedPreset || undefined,
      primaryColor,
      accentColor: activePreset?.accentColor,
      font: selectedFont,
      buttonRadius,
      cardRadius,
      logoDataUrl: logoPreview || undefined,
      portalName,
      copyright,
    };
    if (scope === "service" && activeService) {
      updateActiveServiceBranding(payload);
      toast.success("Theme applied to this service");
    } else {
      updatePlatformBranding(payload);
      toast.success("Platform-wide theme applied");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Branding & Theme</h1>
            <p className="text-sm text-muted-foreground">
              Customize the look and feel of your citizen-facing portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeService && (
            <Tabs value={scope} onValueChange={(v) => setScope(v as "service" | "platform")}>
              <TabsList>
                <TabsTrigger value="service">This service</TabsTrigger>
                <TabsTrigger value="platform">Platform default</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button
          onClick={applyTheme}
          style={{ backgroundColor: primaryColor, color: contrastText, borderRadius: buttonRadius }}
        >
          Apply Theme
          </Button>
        </div>
      </div>

      {/* 2-Column Layout: Config Left, Preview Right */}
      <div className="flex gap-6" style={{ height: "calc(100vh - 180px)" }}>
        {/* Left Panel — Theme Config */}
        <div className="w-[380px] shrink-0 overflow-y-auto border-r pr-6 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Theme Properties</h2>

          {/* Theme Presets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Theme Presets</Label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {themePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`relative text-left p-3 rounded-lg border-2 transition-all ${
                    selectedPreset === preset.id
                      ? "border-accent ring-1 ring-accent/30"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {selectedPreset === preset.id && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: preset.primaryColor }}>
                      <Check className="h-3 w-3" style={{ color: getContrastText(preset.primaryColor) }} />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-2">
                    <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.primaryColor }} />
                    {preset.secondaryColor && (
                      <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.secondaryColor }} />
                    )}
                    {preset.accentColor && (
                      <div className="h-4 w-4 rounded-sm" style={{ backgroundColor: preset.accentColor }} />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{preset.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Family */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Font Family</Label>
            </div>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Primary Colour */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Primary Colour</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">10 curated government-friendly colours</p>
            <div className="grid grid-cols-5 gap-2.5">
              {colorSwatches.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setPrimaryColor(c);
                    setSelectedPreset("");
                  }}
                  className={`h-9 w-full rounded-lg border-2 transition-all flex items-center justify-center ${
                    primaryColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {primaryColor === c && <Check className="h-4 w-4" style={{ color: getContrastText(c) }} />}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Logo Upload */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Logo</Label>
            </div>
            {logoFile ? (
              <div className="border rounded-lg p-4 space-y-3">
                {logoPreview && (
                  <div className="flex justify-center">
                    <img src={logoPreview} alt="Logo preview" className="max-h-20 object-contain rounded" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{logoFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={removeLogo} className="h-7 px-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground hover:border-muted-foreground/40 transition-colors cursor-pointer block">
                <input type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                <Upload className="h-5 w-5 mx-auto mb-2" />
                <p className="text-xs font-medium">Click to upload logo</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">PNG, SVG, JPG up to 5 MB</p>
              </label>
            )}
          </div>

          <Separator />

          {/* Brand Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Brand Guidelines</Label>
            </div>
            {guidelinesFile ? (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{guidelinesFile.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeGuidelines} className="h-7 px-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground hover:border-muted-foreground/40 transition-colors cursor-pointer block">
                <input type="file" accept=".pdf,.png,.svg" className="hidden" onChange={handleGuidelinesUpload} />
                <Upload className="h-5 w-5 mx-auto mb-2" />
                <p className="text-xs font-medium">Click to upload guidelines</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">PDF, PNG, SVG up to 10 MB</p>
              </label>
            )}
          </div>

          <Separator />

          {/* Name on the Header */}
          <div>
            <Label className="text-sm font-semibold">Name on the Header</Label>
            <Input className="mt-2" value={portalName} onChange={(e) => setPortalName(e.target.value)} placeholder="e.g. City A Corporation" />
          </div>

          <Separator />

          {/* Footer Copyright */}
          <div>
            <Label className="text-sm font-semibold">Footer Copyright</Label>
            <Input className="mt-2" value={copyright} onChange={(e) => setCopyright(e.target.value)} />
          </div>

          {/* Apply Button */}
          <Button
            className="w-full"
            onClick={applyTheme}
            style={{ backgroundColor: primaryColor, color: contrastText, borderRadius: buttonRadius }}
          >
            Apply Theme
          </Button>
        </div>

        {/* Right Panel — Live Preview */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <Card className="overflow-hidden h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b text-xs text-muted-foreground">
              <span className="font-medium">Preview</span>
              <span className="ml-auto">Citizen Portal</span>
            </div>
            <CardContent className="p-4">
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  fontFamily: `'${selectedFont}', system-ui, sans-serif`,
                  backgroundColor: activePreset?.bgColor || "#F9FAFB",
                  color: activePreset?.textColor || "#1E293B",
                }}
              >
                {/* Portal Header */}
                <div className="flex items-center gap-3 px-6 py-3.5" style={{ backgroundColor: primaryColor }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-8 w-8 object-contain rounded" />
                  ) : (
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", color: contrastText }}
                    >
                      D
                    </div>
                  )}
                  <span className="font-semibold text-sm" style={{ color: contrastText }}>
                    {portalName}
                  </span>
                  <div className="ml-auto flex gap-5 text-xs" style={{ color: contrastText + "CC" }}>
                    <span>Home</span>
                    <span>Applications</span>
                    <span>Help</span>
                  </div>
                </div>

                {/* Welcome */}
                <div className="px-6 pt-6 pb-4">
                  <h2 className="text-lg font-bold">Welcome back, Alexander</h2>
                  <p className="text-sm mt-1" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                    Your governance dashboard — manage applications and services.
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="px-6 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white shadow-sm" style={{ borderRadius: cardRadius }}>
                    <p className="text-xs" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      Active Applications
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>12</p>
                    <p className="text-xs mt-1" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      3 pending review
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow-sm" style={{ borderRadius: cardRadius }}>
                    <p className="text-xs" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      Property Tax
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>$1,240</p>
                    <p className="text-xs mt-1" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      Due by Jan 31
                    </p>
                  </div>
                  <div className="p-4 bg-white shadow-sm" style={{ borderRadius: cardRadius }}>
                    <p className="text-xs" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      Complaints
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>5</p>
                    <p className="text-xs mt-1" style={{ color: activePreset?.mutedColor || "#6B7280" }}>
                      2 resolved this week
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="px-6 mt-5">
                  <div className="flex gap-3">
                    <button
                      className="text-xs px-5 py-2.5 font-medium"
                      style={{
                        backgroundColor: primaryColor,
                        color: contrastText,
                        borderRadius: buttonRadius,
                      }}
                    >
                      New Application
                    </button>
                    <button
                      className="text-xs px-5 py-2.5 font-medium border"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                        borderRadius: buttonRadius,
                        backgroundColor: "transparent",
                      }}
                    >
                      Pay Dues
                    </button>
                  </div>
                </div>

                {/* Recent Documents */}
                <div className="px-6 mt-5 pb-5">
                  <h3 className="text-sm font-semibold mb-2">Recent Documents</h3>
                  <div className="space-y-2">
                    {["Building_Permit_2025.pdf", "Trade_License_Renewal.pdf"].map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center gap-2.5 p-3 bg-white shadow-sm"
                        style={{ borderRadius: cardRadius }}
                      >
                        <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                        <span className="text-xs font-medium">{doc}</span>
                        <span className="ml-auto text-xs" style={{ color: activePreset?.mutedColor || "#9CA3AF" }}>
                          2 days ago
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t text-center">
                  <p className="text-xs" style={{ color: activePreset?.mutedColor || "#9CA3AF" }}>
                    {copyright}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandingTheme;
