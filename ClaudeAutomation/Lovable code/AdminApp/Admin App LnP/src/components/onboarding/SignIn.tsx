import React, { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { MOCK_CREDENTIALS } from "@/data/mockCredentials";
import AuthShell from "./AuthShell";

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-muted text-foreground border-border",
  service_owner: "bg-accent/10 text-accent border-accent/20",
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  service_owner: "Service Owner",
};

const SignIn: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { state, updateState } = useOnboarding();
  const [email, setEmail] = useState(state.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHints, setShowHints] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const match = MOCK_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.tempPassword === password
    );

    if (!match) {
      setError("Invalid email or password. Use the credentials listed below.");
      return;
    }

    const alreadyReset = (state.usersWhoResetPassword || []).includes(match.email);

    updateState({
      email: match.email,
      orgName: state.orgName || "City of Cape Town",
      currentUserRole: match.role,
      isLoggedIn: true,
      isPasswordReset: alreadyReset,
    });
    onComplete();
  };

  function fillCredential(email: string, password: string) {
    setEmail(email);
    setPassword(password);
    setError("");
  }

  return (
    <AuthShell step="Step 1 of 3 · Sign in" showSidePanel sidePanelPosition="left">
      <Card className="border-border shadow-sm">
        <form onSubmit={handleSubmit} className="px-7 py-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Workspace Access
            </p>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-tight">
              Sign in to your workspace
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your work email and the temporary password shared by your platform team.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@organization.gov"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Temporary password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter temporary password"
                className="h-10"
              />
            </div>

            {error && (
              <div role="alert" className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Demo credentials hint */}
          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-medium">Demo credentials</span>
              {showHints ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showHints && (
              <div className="mt-3 space-y-2">
                {MOCK_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => fillCredential(c.email, c.tempPassword)}
                    className="w-full text-left rounded-md border border-border bg-muted/30 hover:bg-muted/60 px-3 py-2.5 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{c.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${ROLE_BADGE[c.role]}`}>
                        {ROLE_LABEL[c.role]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{c.email} · {c.tempPassword}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">{c.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      </Card>
    </AuthShell>
  );
};

export default SignIn;
