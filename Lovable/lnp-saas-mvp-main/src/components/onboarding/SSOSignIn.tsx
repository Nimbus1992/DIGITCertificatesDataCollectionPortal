import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle, LogOut, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { loadUserData } from "@/lib/api";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";

type Mode = "signin" | "signup";

const SSOSignIn: React.FC<{ onComplete: () => void; onBack: () => void }> = ({
  onComplete,
  onBack,
}) => {
  const { user, signOut } = useAuth();
  const { syncFromSupabase } = useOnboarding();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  // No auto-advance — we show the "already signed in" screen instead
  // so the user always knows their auth state and can sign out if needed.

  const handleContinueAsUser = async () => {
    if (!user) return;
    setContinuing(true);
    try {
      const data = await loadUserData(user.id);
      if (data) syncFromSupabase(data);
      onComplete();
    } finally {
      setContinuing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // stay on this screen — user will now see the normal sign-in form
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/onboarding" },
    });
    if (error) {
      if (error.message.toLowerCase().includes("provider") || error.message.toLowerCase().includes("not enabled")) {
        setError("Google sign-in is not configured yet. Please use email/password below, or check the Supabase dashboard.");
      } else {
        setError(error.message);
      }
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login") || error.message.toLowerCase().includes("invalid credentials")) {
            setError("Incorrect email or password. Try again or switch to Sign Up.");
          } else if (error.message.toLowerCase().includes("email not confirmed")) {
            setError("Please confirm your email first — check your inbox for the confirmation link.");
          } else {
            setError(error.message);
          }
        }
        // If no error, onAuthStateChange fires → useEffect above calls onComplete
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        // session is null when email confirmation is required
        if (data.user && !data.session) {
          setConfirmationSent(true);
        }
        // If session exists (email confirmation disabled), onAuthStateChange fires automatically
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Already signed in screen ─────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full mx-auto space-y-6 animate-slide-up">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">You're signed in</h1>
            <p className="text-muted-foreground text-sm">
              Continue your setup with this account, or sign out to use a different one.
            </p>
          </div>

          {/* Account card */}
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-accent font-semibold text-sm">
                {(user.email ?? "U")[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Authenticated</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinueAsUser}
              disabled={continuing}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 gap-2"
            >
              {continuing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {continuing ? "Loading your data…" : "Continue as this account"}
            </Button>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-11 gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out and use a different account
            </Button>
          </div>

          <div className="flex justify-start">
            <Button variant="ghost" onClick={onBack} className="gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirmation sent screen ──────────────────────────────
  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full mx-auto text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            <p className="text-muted-foreground">
              We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
              Click it to verify your account, then come back here and sign in.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => { setConfirmationSent(false); setMode("signin"); }}
            className="w-full"
          >
            Back to Sign In
          </Button>
          <p className="text-xs text-muted-foreground">
            No email? Check your spam folder, or{" "}
            <button
              onClick={() => setConfirmationSent(false)}
              className="text-accent hover:underline"
            >
              try a different address
            </button>.
          </p>
        </div>
      </div>
    );
  }

  // ── Main sign-in / sign-up form ───────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto space-y-8 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Sign in to get started" : "Create your account"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "signin"
              ? "Choose how you'd like to sign in. This helps us keep your setup secure."
              : "Set up your account to save your progress and org data."}
          </p>
        </div>

        <HelperText
          text="We use your account to save your progress and keep your organization's data safe."
          reassurance="You can always update your sign-in method later."
        />

        {/* Google SSO */}
        <button
          onClick={handleGoogle}
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
          <span className="text-sm text-muted-foreground">
            or {mode === "signin" ? "sign in" : "sign up"} with email
          </span>
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
            onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
          />
          <Input
            type="password"
            placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
          />

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            onClick={handleEmailSubmit}
            disabled={loading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </div>

        {/* Mode toggle */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(""); }}
                className="text-accent hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("signin"); setError(""); }}
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
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
