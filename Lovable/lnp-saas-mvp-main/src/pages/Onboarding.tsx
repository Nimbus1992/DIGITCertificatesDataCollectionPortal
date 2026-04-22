import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveOrganization, saveService, loadUserData } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import SSOSignIn from "@/components/onboarding/SSOSignIn";
import OrgSetup from "@/components/onboarding/OrgSetup";
import TemplateSelection from "@/components/onboarding/TemplateSelection";
import ServiceDetails from "@/components/onboarding/ServiceDetails";
import AutoSetup from "@/components/onboarding/AutoSetup";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Returns the authenticated user from context or directly from Supabase. */
async function getResolvedUser(contextUser: ReturnType<typeof useAuth>["user"]) {
  if (contextUser) return contextUser;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

// ── component ─────────────────────────────────────────────────────────────────

const Onboarding: React.FC = () => {
  const { state, updateState, syncFromSupabase } = useOnboarding();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // True once we've verified this user's Supabase state after sign-in.
  // The redirect to /dashboard is gated on this flag so a brand-new user
  // (who has no org yet) is never bounced past OrgSetup by stale localStorage.
  const [authChecked, setAuthChecked] = useState(false);

  // On every sign-in (user?.id changes), check Supabase:
  //   • Returning user with an org  → syncFromSupabase (sets isOnboardingComplete)
  //   • Brand-new user (no org yet) → wipe stale localStorage, go to OrgSetup
  useEffect(() => {
    if (!user) {
      setAuthChecked(false);
      return;
    }
    setAuthChecked(false);
    loadUserData(user.id)
      .then((data) => {
        if (data) {
          syncFromSupabase(data);
        } else {
          // New user — any state in localStorage belongs to a previous session.
          updateState({
            isOnboardingComplete: false,
            organizationId: "",
            serviceId: "",
            selectedTemplateId: "",
            serviceName: "",
            services: [],
            currentStep: 2,
          });
        }
      })
      .catch(() => { /* network error — proceed without sync */ })
      .finally(() => setAuthChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Redirect to dashboard only after authChecked is true, so a new user
  // whose localStorage incorrectly has isOnboardingComplete=true is never
  // skipped past OrgSetup. Also skip when the user is mid-add-service flow.
  useEffect(() => {
    if (!authChecked) return;
    if (user && state.isOnboardingComplete && !state.isAddingService) {
      navigate("/dashboard", { replace: true });
    }
  }, [authChecked, user, state.isOnboardingComplete, state.isAddingService, navigate]);

  // Safety net: if user signs out mid-flow (any step ≥ 2), go back to sign-in
  useEffect(() => {
    if (!loading && !user && state.currentStep >= 2) {
      updateState({ currentStep: 1 });
    }
  }, [loading, user, state.currentStep, updateState]);

  // ── Step handlers ────────────────────────────────────────────────────────

  /** Step 2 complete: save the org immediately while the user is fresh. */
  const handleOrgComplete = async () => {
    const resolvedUser = await getResolvedUser(user);

    if (resolvedUser) {
      try {
        const orgId = await saveOrganization(resolvedUser.id, {
          name: state.orgName,
          country: state.country,
          department: state.department,
          language: state.language,
          logoUrl: state.logoUrl,
          themeColor: state.themeColor,
        });
        updateState({ organizationId: orgId, currentStep: 3 });
        return;
      } catch (err) {
        console.error("Org save failed:", err);
        toast({
          title: "Couldn't save organisation",
          description: String(err instanceof Error ? err.message : err),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not signed in",
        description: "Sign in first so your organisation details can be saved.",
        variant: "destructive",
      });
    }

    // Advance even on failure so the user isn't stuck
    updateState({ currentStep: 3 });
  };

  /**
   * Step 3 complete: template selected.
   * Resolve (or create) the org, then INSERT the service as "draft" immediately.
   * This is the point where the org↔service link is written to the DB — not later.
   */
  const handleTemplateComplete = async () => {
    const resolvedUser = await getResolvedUser(user);

    if (!resolvedUser) {
      toast({ title: "Not signed in", description: "Sign in before selecting a service.", variant: "destructive" });
      updateState({ currentStep: 4 });
      return;
    }

    // Resolve org: prefer state value, fall back to a Supabase lookup,
    // finally create one if nothing exists yet.
    let orgId = state.organizationId;

    if (!orgId) {
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("user_id", resolvedUser.id)
        .maybeSingle();

      if (existingOrg) {
        orgId = existingOrg.id;
        updateState({ organizationId: orgId });
      } else {
        try {
          orgId = await saveOrganization(resolvedUser.id, {
            name: state.orgName || resolvedUser.email || "My Organisation",
            country: state.country,
            department: state.department,
            language: state.language,
            logoUrl: state.logoUrl,
            themeColor: state.themeColor,
          });
          updateState({ organizationId: orgId });
        } catch (err) {
          console.error("Org create failed:", err);
          toast({ title: "Couldn't save organisation", description: String(err instanceof Error ? err.message : err), variant: "destructive" });
        }
      }
    }

    if (!orgId) {
      // No org — can't link service. Still advance so user isn't stuck.
      updateState({ currentStep: 4 });
      return;
    }

    // INSERT the service as draft immediately — this is the DB write the
    // dashboard reads from. If serviceId is already set we update instead.
    try {
      const svcId = await saveService(
        orgId,
        {
          name: state.serviceName,
          templateId: state.selectedTemplateId,
          approvalLevel: state.approvalLevel,
          status: "draft",
          authMethod: state.authMethod,
        },
        state.serviceId || undefined
      );
      updateState({ serviceId: svcId, currentStep: 4 });
    } catch (err) {
      console.error("Service create failed:", err);
      toast({ title: "Couldn't save service", description: String(err instanceof Error ? err.message : err), variant: "destructive" });
      updateState({ currentStep: 4 });
    }
  };

  /**
   * Step 4 complete: service details (name / approval) may have changed.
   * Update the existing service record if one was already created.
   */
  const handleServiceDetailsComplete = async () => {
    if (state.serviceId && state.organizationId) {
      try {
        await saveService(
          state.organizationId,
          {
            name: state.serviceName,
            templateId: state.selectedTemplateId,
            approvalLevel: state.approvalLevel,
            status: "draft",
            authMethod: state.authMethod,
          },
          state.serviceId
        );
      } catch (err) {
        console.error("Service update failed:", err);
        // Non-fatal — name/approval can be changed later in ServiceConfig
      }
    }
    updateState({ currentStep: 5 });
  };

  /** Step 5 complete: service already saved to Supabase in step 4.
   *  Mark onboarding complete and navigate — Dashboard will re-fetch
   *  the services list from Supabase and show all services including the new one.
   */
  const handleAutoSetupComplete = () => {
    updateState({ isOnboardingComplete: true, isAddingService: false });
    navigate("/dashboard", { replace: true });
  };

  // ── Step map ─────────────────────────────────────────────────────────────

  const steps = [
    <WelcomeScreen key="welcome" onStart={() => updateState({ currentStep: 1 })} />,
    <SSOSignIn
      key="sso"
      onComplete={() => updateState({ currentStep: 2 })}
      onBack={() => updateState({ currentStep: 0 })}
    />,
    <OrgSetup
      key="org"
      onComplete={handleOrgComplete}
      onBack={() => updateState({ currentStep: 1 })}
    />,
    <TemplateSelection
      key="template"
      onComplete={handleTemplateComplete}
      onBack={() =>
        state.isAddingService
          ? navigate("/dashboard", { replace: true })
          : updateState({ currentStep: 2 })
      }
    />,
    <ServiceDetails
      key="details"
      onComplete={handleServiceDetailsComplete}
      onBack={() => updateState({ currentStep: 3 })}
    />,
    <AutoSetup key="setup" onComplete={handleAutoSetupComplete} />,
  ];

  const currentStep = steps[state.currentStep] || steps[0];
  const showAuthBar = user && state.currentStep >= 2;

  return (
    <div className="relative">
      {/* Auth status bar — shown from step 2 onwards when signed in */}
      {showAuthBar && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-card/95 backdrop-blur border-b border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Active
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOut();
              updateState({ currentStep: 1 });
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      )}
      {/* Push content down when bar is shown */}
      {showAuthBar && <div className="h-11" />}
      {currentStep}
    </div>
  );
};

export default Onboarding;
