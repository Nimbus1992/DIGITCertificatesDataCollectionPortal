import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useOnboarding, type InvitedAdmin } from "@/contexts/OnboardingContext";
import SignIn from "@/components/onboarding/SignIn";
import ResetPassword from "@/components/onboarding/ResetPassword";
import ConfirmOrganization from "@/components/onboarding/ConfirmOrganization";
import AddAdmins from "@/components/onboarding/AddAdmins";
import SelectTemplateStep from "@/components/onboarding/SelectTemplateStep";
import AddServiceOwners from "@/components/onboarding/AddServiceOwners";

const Onboarding: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();

  // Already finished org setup, or non-super-admin who has reset their password → dashboard
  if (
    state.isOnboardingComplete ||
    (state.isPasswordReset && state.currentUserRole !== "super_admin")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // Step 1: Sign in
  if (!state.isLoggedIn) {
    return <SignIn onComplete={() => updateState({ isLoggedIn: true })} />;
  }

  // Step 2: Password reset (all roles do this once)
  if (!state.isPasswordReset) {
    return (
      <ResetPassword
        onComplete={() => updateState({ isPasswordReset: true, isActivated: true, currentStep: 1 })}
      />
    );
  }

  // Steps below are Super Admin only

  // Step 3: Confirm organisation details
  if (state.onboardingStep === 0) {
    return (
      <ConfirmOrganization
        onComplete={() => updateState({ onboardingStep: 3 })}
      />
    );
  }

  // Step 4: Add admins (optional)
  if (state.onboardingStep === 3) {
    return (
      <AddAdmins
        onComplete={(admins: InvitedAdmin[]) => updateState({ onboardingStep: 4, invitedAdmins: admins })}
        onSkip={() => updateState({ onboardingStep: 4 })}
      />
    );
  }

  // Step 5: Select a service template
  if (state.onboardingStep === 4) {
    return (
      <SelectTemplateStep
        onComplete={() => updateState({ onboardingStep: 5 })}
        onSkip={() => {
          updateState({ isOnboardingComplete: true });
          navigate("/dashboard");
        }}
      />
    );
  }

  // Step 6: Add service owners (optional)
  if (state.onboardingStep === 5) {
    return (
      <AddServiceOwners
        onComplete={() => {
          updateState({ isOnboardingComplete: true });
          navigate("/dashboard");
        }}
        onSkip={() => {
          updateState({ isOnboardingComplete: true });
          navigate("/dashboard");
        }}
      />
    );
  }

  return null;
};

export default Onboarding;
