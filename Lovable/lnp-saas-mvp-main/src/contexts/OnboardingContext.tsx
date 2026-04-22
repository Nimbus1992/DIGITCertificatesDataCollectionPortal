import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { LoadedUserData } from "@/lib/api";

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

/** A service record stored in the services list on the dashboard. */
export interface ServiceRecord {
  id: string;
  name: string;
  templateId: string;
  status: ServiceStatus;
  /** Real application count from Supabase; 0 for brand-new services. */
  applicationsCount: number;
  pendingCount: number;
  /** 0–100 completion percentage for the config tiles. */
  configCompletion: number;
  lastUpdated: string;
}

export interface OnboardingState {
  currentStep: number;
  // Supabase record IDs (empty string = not yet persisted)
  organizationId: string;
  serviceId: string;
  // Org
  orgName: string;
  country: string;
  department: string;
  language: string;
  logoUrl: string;
  themeColor: string;
  // Current service being configured (single-service wizard state)
  selectedTemplateId: string;
  serviceName: string;
  approvalLevel: ApprovalLevel;
  serviceStatus: ServiceStatus;
  // Go-live
  deployment: {
    availabilityScope: AvailabilityScope;
    selectedItems: string[];
  };
  teamMembers: TeamMember[];
  authMethod: AuthMethod;
  goLiveStep: number;
  // All services for this org (shown on dashboard)
  services: ServiceRecord[];
  // Flags
  isOnboardingComplete: boolean;
  isPublished: boolean;
  isLive: boolean;
  /** True when the user is adding a second+ service to an existing org. */
  isAddingService: boolean;
}

const initialState: OnboardingState = {
  currentStep: 0,
  organizationId: "",
  serviceId: "",
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
  services: [],
  isOnboardingComplete: false,
  isPublished: false,
  isLive: false,
  isAddingService: false,
};

interface OnboardingContextType {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetOnboarding: () => void;
  /**
   * Start adding a second+ service to an existing org.
   * Preserves org identity, resets service wizard fields, jumps to
   * TemplateSelection (step 3) without touching auth or org setup.
   */
  startAddService: () => void;
  /** Hydrates local state from a Supabase data snapshot (called after login). */
  syncFromSupabase: (data: LoadedUserData) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = "lnp-onboarding-state";

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialState;
      const parsed = JSON.parse(saved);
      // Ensure new fields added after initial release are populated
      return { ...initialState, ...parsed };
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

  /**
   * Begin adding a new service without destroying the org identity.
   * - Preserves: organizationId, orgName, country, department, teamMembers,
   *              services[], isOnboardingComplete, themeColor, logoUrl
   * - Resets:    all service wizard fields
   * - Sets:      isAddingService = true, currentStep = 3 (TemplateSelection)
   */
  const startAddService = useCallback(() => {
    setState((prev) => ({
      ...prev,
      // Service wizard fields — cleared for the new service
      serviceId: "",
      selectedTemplateId: "",
      serviceName: "",
      approvalLevel: "single",
      serviceStatus: "draft",
      authMethod: "email",
      isPublished: false,
      isLive: false,
      goLiveStep: 0,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      // Jump straight to TemplateSelection (step 3)
      currentStep: 3,
      isAddingService: true,
      // Keep isOnboardingComplete true so AuthGuard doesn't redirect
      isOnboardingComplete: true,
    }));
  }, []);

  const syncFromSupabase = useCallback((data: LoadedUserData) => {
    const { org, services: allServices, teamMembers, deployment } = data;

    const updates: Partial<OnboardingState> = {
      organizationId: org.id,
      orgName: org.name,
      country: org.country ?? "",
      department: org.department ?? "",
      language: org.language ?? "English",
      logoUrl: org.logo_url ?? "",
      themeColor: org.theme_color ?? "",
      teamMembers: teamMembers.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role as TeamMember["role"],
      })),
    };

    if (allServices && allServices.length > 0) {
      // Populate the dashboard services list from ALL Supabase services
      updates.services = allServices.map((svc) => ({
        id: svc.id,
        name: svc.name,
        templateId: svc.template_id,
        status: svc.status as ServiceStatus,
        // Real application counts aren't loaded here yet — 0 until we add
        // a dedicated applications-count query.
        applicationsCount: 0,
        pendingCount: 0,
        configCompletion: svc.status === "live" ? 100 : svc.status === "published" ? 80 : 30,
        lastUpdated: new Date(svc.updated_at ?? svc.created_at ?? Date.now()).toLocaleDateString(),
      }));

      // Also populate the single-service wizard fields from the MOST RECENT service
      const latest = allServices[allServices.length - 1];
      updates.serviceId = latest.id;
      updates.serviceName = latest.name;
      updates.selectedTemplateId = latest.template_id;
      updates.approvalLevel = latest.approval_level as ApprovalLevel;
      updates.serviceStatus = latest.status as ServiceStatus;
      updates.authMethod = latest.auth_method as AuthMethod;
      updates.isOnboardingComplete = true;
      updates.isPublished = latest.status !== "draft";
      updates.isLive = latest.status === "live";
    }

    if (deployment) {
      updates.deployment = {
        availabilityScope: deployment.availability_scope as AvailabilityScope,
        selectedItems: deployment.selected_items ?? [],
      };
    }

    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ state, updateState, nextStep, prevStep, goToStep, resetOnboarding, startAddService, syncFromSupabase }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};
