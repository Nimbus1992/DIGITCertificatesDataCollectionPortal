import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Camera, Copy, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  countries,
  currencies,
  phoneCodes,
  getCountryDefaults,
} from "@/data/countryDefaults";
import { cn } from "@/lib/utils";
import AuthShell from "./AuthShell";

const departments = [
  "\n",
  "Urban Development",
  "Public Works",
  "Health",
  "Education",
  "Transport",
  "Housing",
  "Environment",
];

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ title, children, className, action }) => (
  <section className={cn("space-y-3", className)}>
    <div className="flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const ConfirmOrganization: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [highlightAuto, setHighlightAuto] = useState(false);
  const [regionalEditable, setRegionalEditable] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updates: Record<string, string> = {};
    if (!state.country) {
      updates.country = "United States";
      const d = getCountryDefaults("United States")!;
      updates.currency = d.currency;
      updates.currencySymbol = d.currencySymbol;
      updates.phoneCountryCode = d.phoneCode;
    }
    if (!state.department) updates.department = "\n";
    if (!state.language) updates.language = "English";
    if (Object.keys(updates).length) updateState(updates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!highlightAuto) return;
    const t = setTimeout(() => setHighlightAuto(false), 1400);
    return () => clearTimeout(t);
  }, [highlightAuto]);

  const handleCountryChange = (name: string) => {
    const d = getCountryDefaults(name);
    updateState({
      country: name,
      currency: d?.currency ?? state.currency,
      currencySymbol: d?.currencySymbol ?? state.currencySymbol,
      phoneCountryCode: d?.phoneCode ?? state.phoneCountryCode,
    });
    setHighlightAuto(true);
  };

  const handleCurrencyChange = (code: string) => {
    const c = currencies.find((x) => x.code === code);
    updateState({ currency: code, currencySymbol: c?.symbol ?? "" });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateState({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const initial = (state.orgName?.trim()?.[0] || "?").toUpperCase();
  const canContinue = !!state.country && !!state.department;

  const workspaceUrl = useMemo(() => {
    return `www.digit.org/lnp/goi`;
  }, [state.orgName]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(workspaceUrl);
      toast.success("Workspace URL copied");
    } catch {
      toast.error("Unable to copy");
    }
  };

  const handleBack = () => updateState({ isPasswordReset: false });

  const highlightRing =
    "transition-all rounded-md " +
    (highlightAuto ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-card" : "");

  return (
    <AuthShell step="Step 3 of 3 · Workspace setup" contentMaxWidth="max-w-[720px]">
      {/* Identity block */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors group shrink-0"
          aria-label="Upload organization logo"
        >
          {state.logoUrl ? (
            <img src={state.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">{initial}</span>
          )}
          <span className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-3.5 w-3.5 text-background" />
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogo}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground tracking-tight leading-tight">
              Welcome to Licenses and Permits Studio
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Confirm a few details to finish activating your workspace.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <div className="px-6 py-6 space-y-6">
          <Section
            title="Regional Settings"
            action={
              <button
                type="button"
                onClick={() => setRegionalEditable((v) => !v)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={regionalEditable ? "Lock regional settings" : "Edit regional settings"}
                title={regionalEditable ? "Done" : "Edit"}
              >
                {regionalEditable ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Save Changes
                  </>
                ) : (
                  <>
                    <Pencil className="h-3 w-3" /> Edit
                  </>
                )}
              </button>
            }
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Country</Label>
                <Select value={state.country} onValueChange={handleCountryChange} disabled={!regionalEditable}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Currency</Label>
                <div className={cn(highlightRing)}>
                  <Select value={state.currency} onValueChange={handleCurrencyChange} disabled={!regionalEditable}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="mr-1">{c.symbol}</span>{c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Country code</Label>
                <div className={cn(highlightRing)}>
                  <Select value={state.phoneCountryCode} onValueChange={(v) => updateState({ phoneCountryCode: v })} disabled={!regionalEditable}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select code" /></SelectTrigger>
                    <SelectContent>
                      {phoneCodes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Default language</Label>
                <Select value={state.language} onValueChange={(v) => updateState({ language: v })} disabled={!regionalEditable}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <div className="border-t border-border" />

          <Section title="Workspace Access">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Organization name</Label>
                <Input
                  readOnly
                  value="GOI"
                  className="h-10 bg-muted/40 text-foreground cursor-not-allowed focus-visible:ring-0 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Workspace URL</Label>
                <div className="relative">
                  <Input
                    readOnly
                    value={workspaceUrl}
                    className="h-10 pr-10 bg-muted/40 text-foreground cursor-not-allowed focus-visible:ring-0 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Copy workspace URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Applicants and employees will access services using this URL.
            </p>
          </Section>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              You can update these anytime from Workspace Settings.
            </p>
            <Button
              onClick={onComplete}
              disabled={!canContinue}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-5"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </AuthShell>
  );
};

export default ConfirmOrganization;
