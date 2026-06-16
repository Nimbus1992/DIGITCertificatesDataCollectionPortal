import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";
import AuthShell from "./AuthShell";

import { MOCK_CREDENTIALS } from "@/data/mockCredentials";

const ResetPassword: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const TEMP_PASSWORD = MOCK_CREDENTIALS.find((c) => c.email === state.email)?.tempPassword || "Temp@1234";
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentValid = current === TEMP_PASSWORD;
  const nextValid = next.length >= 8 && next !== current;
  const matches = next === confirm && confirm.length > 0;
  const canContinue = currentValid && nextValid && matches;

  let error = "";
  if (submitted || current) {
    if (current && !currentValid) error = "Current password is incorrect.";
    else if (next && next.length < 8) error = "New password must be at least 8 characters.";
    else if (next && next === current) error = "New password must be different from your current password.";
    else if (confirm && !matches) error = "Passwords do not match.";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canContinue) return;
    const already = state.usersWhoResetPassword || [];
    if (state.email && !already.includes(state.email)) {
      updateState({ usersWhoResetPassword: [...already, state.email] });
    }
    onComplete();
  };

  const handleBack = () => updateState({ isLoggedIn: false });

  return (
    <AuthShell step="Step 2 of 3 · Reset password" showSidePanel sidePanelPosition="left">
      <Card className="border-border shadow-sm">
        <form onSubmit={handleSubmit} className="px-7 py-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Secure Password Reset
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight">
              Set a new password
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For security, replace your temporary password before accessing your workspace.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current" className="text-xs font-medium text-foreground">
                Current password
              </Label>
              <Input
                id="current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter temporary password"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new" className="text-xs font-medium text-foreground">
                New password
              </Label>
              <Input
                id="new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="At least 8 characters"
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                At least 8 characters. Use a mix of letters and numbers.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-medium text-foreground">
                Confirm new password
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="h-10"
              />
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canContinue}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
};

export default ResetPassword;
