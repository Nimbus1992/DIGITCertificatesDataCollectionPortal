import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ApprovalLevel = "single" | "two-level" | "multi-level";
export type AvailabilityScope = "entire_state" | "cities" | "districts" | "departments" | "custom";
export type AuthMethod = "email" | "sso" | "otp";
export type ServiceStatus = "draft" | "published" | "live";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "approver";
}

export interface OnboardingState {
  currentStep: number;
  orgName: string;
  country: string;
  department: string;
  language: string;
  logoUrl: string;
  themeColor: string;
  selectedTemplateId: string;
  serviceName: string;
  approvalLevel: ApprovalLevel;
  serviceStatus: ServiceStatus;
  deployment: {
    availabilityScope: AvailabilityScope;
    selectedItems: string[];
  };
  teamMembers: TeamMember[];
  authMethod: AuthMethod;
  goLiveStep: number;
  isOnboardingComplete: boolean;
  isPublished: boolean;
  isLive: boolean;
}

const initialState: OnboardingState = {
  currentStep: 0,
  orgName: "",
  country: "",
  department: "",
  language: "English",
  logoUrl: "",
  themeColor: "",
  selectedTemplateId: "",
  serviceName: "",
  approvalLevel: "single",
  serviceStatus: "draft",
  deployment: {
    availabilityScope: "entire_state",
    selectedItems: [],
  },
  teamMembers: [],
  authMethod: "email",
  goLiveStep: 0,
  isOnboardingComplete: false,
  isPublished: false,
  isLive: false,
};

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "lnp-onboarding-state";

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  return (
    <OnboardingContext.Provider value={{ state, updateState, nextStep, prevStep, goToStep, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};
