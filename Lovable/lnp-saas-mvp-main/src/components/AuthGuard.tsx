import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";

/**
 * Guards all authenticated app routes.
 *
 * Decision tree:
 *   1. Auth loading          → spinner (avoid flash of wrong screen)
 *   2. No session            → /onboarding (sign in)
 *   3. Session + incomplete  → /onboarding (resume onboarding)
 *   4. Session + complete    → render children (dashboard / app)
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { state } = useOnboarding();

  // 1. Wait for Supabase to resolve the session before making routing decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  // 2. No authenticated session → onboarding / sign-in
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Authenticated but onboarding not yet completed → resume onboarding
  //    This catches new users who received an OAuth / email-verification redirect
  //    straight to a protected route before finishing setup.
  if (!state.isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // 4. Authenticated + onboarding done → allow through
  return <>{children}</>;
};

export default AuthGuard;
