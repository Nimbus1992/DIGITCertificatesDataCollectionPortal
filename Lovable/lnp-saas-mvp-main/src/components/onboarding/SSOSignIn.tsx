import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HelperText from "./HelperText";

const SSOSignIn: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Sign in to get started</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to sign in. This helps us keep your setup secure.
          </p>
        </div>

        <HelperText
          text="We use your account to save your progress and keep your organization's data safe."
          reassurance="You can always update your sign-in method later."
        />

        {/* Google SSO */}
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-accent/5 hover:border-accent/50 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or sign in with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email + Password */}
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
          <Button
            onClick={onComplete}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 gap-2"
          >
            <Mail className="h-4 w-4" /> Sign In
          </Button>
        </div>

        {/* Skip */}
        <div className="text-center">
          <button onClick={onComplete} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
            Skip for now
          </button>
        </div>

        {/* Back */}
        <div className="flex justify-start">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SSOSignIn;
