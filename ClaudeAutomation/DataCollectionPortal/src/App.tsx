import { useState, useEffect, useCallback } from "react";
import type { ImplementationConfig } from "./types";
import { DEFAULT_CONFIG, STORAGE_KEY, STEP_KEY } from "./defaults";
import { saveConfig, type AccountRecord } from "./lib/supabase";

// Persists which steps have been completed (user clicked Next/Save past them)
const COMPLETED_STEPS_KEY = "blp_completed_steps";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountHome from "./pages/AccountHome";
import Step1AccountProfile from "./steps/Step1AccountProfile";
import Step2Branding from "./steps/Step2Branding";
import Step3Deployment from "./steps/Step3Deployment";
import Step4FormConfig from "./steps/Step4FormConfig";
import Step5RolesStaff from "./steps/Step5RolesStaff";
import Step6Fees from "./steps/Step6Fees";
import StepIntegrations from "./steps/StepIntegrations";
import StepOverallConfig from "./steps/StepOverallConfig";
import StepWorkflow from "./steps/StepWorkflow";
import StepUsers from "./steps/StepUsers";
import Step7PaymentsNotifications from "./steps/Step7PaymentsNotifications";
import Step8ReviewExport from "./steps/Step8ReviewExport";
import StepOthers from "./steps/StepOthers";
import { CheckCircle2, Circle, ChevronRight, LogOut, Lock, PanelLeft, ChevronDown } from "lucide-react";

type Screen = "login" | "admin" | "account-home" | "wizard";

const TOTAL_STEPS = 13;

// ── Step ID constants ─────────────────────────────────────────────────────────
// Free-navigation top-level sections
const STEP_ACCOUNT    = 1;   // Account Settings  → Step1AccountProfile
const STEP_BOUNDARY   = 3;   // Boundary          → Step3Deployment
const STEP_BRANDING   = 2;   // Branding          → Step2Branding
const STEP_OTHER_INFO = 12;  // Other Information → StepOthers
const STEP_REVIEW     = 13;  // Review            → Step8ReviewExport

// Application Configuration sub-steps (must be completed in order)
const APP_CONFIG_STEPS = [
  { id: 5,  label: "Overall Configuration" },
  { id: 6,  label: "Application Form" },
  { id: 7,  label: "Roles" },
  { id: 9,  label: "Workflow" },
  { id: 8,  label: "Fees" },
  { id: 10, label: "Notifications" },
] as const;

// Users section — locked until all App Config sub-steps are complete
const STEP_USERS = 11;

// All App Config step IDs in order
const APP_CONFIG_STEP_IDS: readonly number[] = APP_CONFIG_STEPS.map((s) => s.id);

const STEP_INTEGRATIONS = 4;

// Ordered list of all steps matching sidebar top-to-bottom layout
const ORDERED_STEPS: number[] = [
  STEP_ACCOUNT,
  STEP_BOUNDARY,
  STEP_BRANDING,
  STEP_INTEGRATIONS,
  ...APP_CONFIG_STEP_IDS,
  STEP_USERS,
  STEP_OTHER_INFO,
  STEP_REVIEW,
];

// Human-readable labels for toast messages
const STEP_LABEL: Record<number, string> = {
  1:  "Account Settings",
  2:  "Branding",
  3:  "Boundary",
  4:  "Integrations",
  5:  "Overall Configuration",
  6:  "Application Form",
  7:  "Roles",
  8:  "Fees",
  9:  "Workflow",
  10: "Notifications",
  11: "Users",
  12: "Other Information",
  13: "Review",
};

// Free-navigation step IDs (can always be clicked)
const FREE_NAV_STEPS: number[] = [STEP_ACCOUNT, STEP_BOUNDARY, STEP_BRANDING, STEP_INTEGRATIONS, STEP_OTHER_INFO, STEP_REVIEW];

function loadCompletedSteps(): Set<number> {
  try {
    const raw = localStorage.getItem(COMPLETED_STEPS_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as number[];
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch { /* ignore */ }
  return new Set<number>();
}

function saveCompletedSteps(steps: Set<number>) {
  localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify([...steps]));
}

function allAppConfigDone(done: Set<number>): boolean {
  return APP_CONFIG_STEP_IDS.every((id) => done.has(id));
}

function isStepAccessible(stepId: number, done: Set<number>): boolean {
  if (FREE_NAV_STEPS.includes(stepId)) return true;
  if (stepId === STEP_USERS) return allAppConfigDone(done);
  const idx = APP_CONFIG_STEP_IDS.indexOf(stepId);
  if (idx === -1) return true;   // unknown — allow
  if (idx === 0)  return true;   // first App Config step always accessible
  return APP_CONFIG_STEP_IDS.slice(0, idx).every((id) => done.has(id));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [isAdmin, setIsAdmin] = useState(false);
  const [openedFromAdmin, setOpenedFromAdmin] = useState(false);
  const [superUserAccount, setSuperUserAccount] = useState<AccountRecord | null>(null);
  const [sidebarLockedMsg, setSidebarLockedMsg] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(loadCompletedSteps);

  const [config, setConfig] = useState<ImplementationConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ImplementationConfig;
        if (!parsed.workflow)     parsed.workflow     = DEFAULT_CONFIG.workflow;
        if (!parsed.integrations) parsed.integrations = DEFAULT_CONFIG.integrations;
        if (!parsed.overall)      parsed.overall      = DEFAULT_CONFIG.overall;
        if (!parsed.formConfig.documents)         parsed.formConfig.documents         = DEFAULT_CONFIG.formConfig.documents;
        if (!parsed.formConfig.customSubsections) parsed.formConfig.customSubsections = [];
        if (!parsed.formConfig.customFields)      parsed.formConfig.customFields      = [];
        if (parsed.formConfig.declarationMobileOtpEnabled === undefined) parsed.formConfig.declarationMobileOtpEnabled = false;
        if (parsed.deployment.hierarchyName === undefined)   parsed.deployment.hierarchyName   = "";
        if (!parsed.deployment.hierarchyLevels)              parsed.deployment.hierarchyLevels = [];
        if (!parsed.deployment.boundaryRows)                 parsed.deployment.boundaryRows    = [];
        if (parsed.deployment.uploadMethod === undefined)    parsed.deployment.uploadMethod    = "";
        if (parsed.deployment.shapefileName === undefined)   parsed.deployment.shapefileName   = "";
        if (parsed.deployment.operatingLevel === undefined)  parsed.deployment.operatingLevel  = 0;
        if (!parsed.fees.inspectionFeeMode)   { parsed.fees.inspectionFeeMode = "slab"; parsed.fees.inspectionFeeFlat = 500; parsed.fees.inspectionSlabDimension = "Business Area (sq ft)"; }
        if (!parsed.fees.licenseFeeMode)      { parsed.fees.licenseFeeMode = "slab"; parsed.fees.licenseFeeFlat = 1000; parsed.fees.licenseFeeSlabs = DEFAULT_CONFIG.fees.licenseFeeSlabs; parsed.fees.licenseSlabDimension = "Business Area (sq ft)"; }
        // Migrate fees to Issue #5 shape
        if (parsed.fees.feeMode === undefined)       parsed.fees.feeMode        = "flat";
        if (parsed.fees.flatFeeAmount === undefined) parsed.fees.flatFeeAmount  = 0;
        if (!parsed.fees.customFeeFields)            parsed.fees.customFeeFields = [];
        if (!parsed.fees.customFeeSlabs)             parsed.fees.customFeeSlabs  = {};
        if (!parsed.fees.customFeeTable)             parsed.fees.customFeeTable  = [];
        if (!parsed.workflow.stages)         parsed.workflow.stages         = DEFAULT_CONFIG.workflow.stages;
        if (!parsed.workflow.checklistItems) parsed.workflow.checklistItems = DEFAULT_CONFIG.workflow.checklistItems;
        if (parsed.notes === undefined)      parsed.notes = "";
        if (parsed.paymentsNotifications.notificationChannels.ussd === undefined) parsed.paymentsNotifications.notificationChannels.ussd = false;
        if (!parsed.paymentsNotifications.notificationTemplates) parsed.paymentsNotifications.notificationTemplates = DEFAULT_CONFIG.paymentsNotifications.notificationTemplates;
        return parsed;
      } catch { /* fall through */ }
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem(STEP_KEY, String(currentStep)); }, [currentStep]);

  const updateConfig = useCallback(<K extends keyof ImplementationConfig>(
    key: K, value: ImplementationConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
      metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const saveDraft = useCallback(async () => {
    const draftConfig: ImplementationConfig = {
      ...config,
      metadata: { ...config.metadata, status: "draft", lastStep: currentStep },
    };
    const { error } = await saveConfig(draftConfig, currentStep);
    if (error) throw new Error(error);
    setConfig(draftConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftConfig));
  }, [config, currentStep]);

  // ── Auth handlers ───────────────────────────────────────────────────────────
  function handleAdminLogin() {
    setIsAdmin(true);
    setOpenedFromAdmin(false);
    setSuperUserAccount(null);
    setScreen("admin");
  }

  function applyMigrations(loaded: ImplementationConfig): ImplementationConfig {
    if (!loaded.workflow)     loaded.workflow     = DEFAULT_CONFIG.workflow;
    if (!loaded.integrations) loaded.integrations = DEFAULT_CONFIG.integrations;
    if (loaded.integrations.onlinePaymentEnabled === undefined) loaded.integrations.onlinePaymentEnabled = false;
    if (!loaded.integrations.paymentGatewayPreference) loaded.integrations.paymentGatewayPreference = "";
    if (loaded.integrations.paymentGatewayDetails === undefined) loaded.integrations.paymentGatewayDetails = "";
    if (!loaded.overall)      loaded.overall      = DEFAULT_CONFIG.overall;
    if (!loaded.formConfig.documents)         loaded.formConfig.documents         = DEFAULT_CONFIG.formConfig.documents;
    if (!loaded.formConfig.customSubsections) loaded.formConfig.customSubsections = [];
    if (!loaded.formConfig.customFields)           loaded.formConfig.customFields           = [];
    if (loaded.formConfig.declarationMobileOtpEnabled === undefined) loaded.formConfig.declarationMobileOtpEnabled = false;
    if (!loaded.formConfig.deletedRecommendedFields) loaded.formConfig.deletedRecommendedFields = [];
    if (!loaded.formConfig.editedRecommendedFields)  loaded.formConfig.editedRecommendedFields  = {};
    if (loaded.deployment.hierarchyName === undefined)   loaded.deployment.hierarchyName   = "";
    if (!loaded.deployment.hierarchyLevels)              loaded.deployment.hierarchyLevels = [];
    if (!loaded.deployment.boundaryRows)                 loaded.deployment.boundaryRows    = [];
    if (loaded.deployment.uploadMethod === undefined)    loaded.deployment.uploadMethod    = "";
    if (loaded.deployment.shapefileName === undefined)   loaded.deployment.shapefileName   = "";
    if (loaded.deployment.operatingLevel === undefined)  loaded.deployment.operatingLevel  = 0;
    if (!loaded.fees.inspectionFeeMode)   { loaded.fees.inspectionFeeMode = "slab"; loaded.fees.inspectionFeeFlat = 500; loaded.fees.inspectionSlabDimension = "Business Area (sq ft)"; }
    if (!loaded.fees.licenseFeeMode)      { loaded.fees.licenseFeeMode = "slab"; loaded.fees.licenseFeeFlat = 1000; loaded.fees.licenseFeeSlabs = DEFAULT_CONFIG.fees.licenseFeeSlabs; loaded.fees.licenseSlabDimension = "Business Area (sq ft)"; }
    // Migrate fees to Issue #5 shape
    if (loaded.fees.feeMode === undefined)       loaded.fees.feeMode        = "flat";
    if (loaded.fees.flatFeeAmount === undefined) loaded.fees.flatFeeAmount  = 0;
    if (!loaded.fees.customFeeFields)            loaded.fees.customFeeFields = [];
    if (!loaded.fees.customFeeSlabs)             loaded.fees.customFeeSlabs  = {};
    if (!loaded.fees.customFeeTable)             loaded.fees.customFeeTable  = [];
    if (!loaded.workflow.stages)         loaded.workflow.stages       = DEFAULT_CONFIG.workflow.stages;
    if (!loaded.workflow.checklistItems) loaded.workflow.checklistItems = DEFAULT_CONFIG.workflow.checklistItems;
    if (loaded.notes === undefined)      loaded.notes                 = "";
    if (!loaded.overall.licenseValidityMode) loaded.overall.licenseValidityMode = "fixed";
    if (!loaded.overall.licenseIdFormat)     loaded.overall.licenseIdFormat     = "LIC-YYYY-NNNNNN";
    if (loaded.paymentsNotifications.notificationChannels.ussd === undefined) loaded.paymentsNotifications.notificationChannels.ussd = false;
    if (!loaded.paymentsNotifications.notificationTemplates) loaded.paymentsNotifications.notificationTemplates = DEFAULT_CONFIG.paymentsNotifications.notificationTemplates;
    return loaded;
  }

  function handleSuperUserLogin(account: AccountRecord) {
    setIsAdmin(false);
    setOpenedFromAdmin(false);
    setSuperUserAccount(account);
    const loaded = applyMigrations(account.config_data ?? DEFAULT_CONFIG);
    setConfig(loaded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    const step = Math.max(1, Math.min(account.current_step ?? 1, TOTAL_STEPS));
    setCurrentStep(step);
    localStorage.setItem(STEP_KEY, String(step));
    setScreen("account-home");
  }

  function handleOpenAccountFromAdmin(account: AccountRecord) {
    setIsAdmin(false);
    setOpenedFromAdmin(true);
    setSuperUserAccount(account);
    const loaded = applyMigrations(account.config_data ?? DEFAULT_CONFIG);
    setConfig(loaded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    const step = Math.max(1, Math.min(account.current_step ?? 1, TOTAL_STEPS));
    setCurrentStep(step);
    setScreen("wizard");
  }

  function handleEnterWizard(step: number) {
    setCurrentStep(step);
    setScreen("wizard");
  }

  function handleBackToAccountHome() {
    setScreen("account-home");
  }

  function handleLogout() {
    setScreen("login");
    setIsAdmin(false);
    setOpenedFromAdmin(false);
    setSuperUserAccount(null);
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(1);
  }

  function handleBackToAdmin() {
    setScreen("admin");
    setIsAdmin(true);
    setOpenedFromAdmin(false);
    setSuperUserAccount(null);
  }

  // ── Wizard navigation ───────────────────────────────────────────────────────

  /** Mark a step as completed and persist to localStorage */
  const markComplete = useCallback((stepId: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepId);
      saveCompletedSteps(next);
      return next;
    });
  }, []);

  /**
   * Advance to the next step in ORDERED_STEPS, marking current step done.
   */
  const goNext = useCallback(() => {
    markComplete(currentStep);
    const idx = ORDERED_STEPS.indexOf(currentStep);
    if (idx !== -1 && idx < ORDERED_STEPS.length - 1) {
      setCurrentStep(ORDERED_STEPS[idx + 1]);
    }
    // If somehow currentStep is not in ORDERED_STEPS, do nothing special
  }, [currentStep, markComplete]);

  const goPrev = useCallback(() => {
    const idx = ORDERED_STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(ORDERED_STEPS[idx - 1]);
    } else {
      if (isAdmin || openedFromAdmin) handleBackToAdmin();
      else handleBackToAccountHome();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isAdmin, openedFromAdmin]);

  const goToStep = useCallback((s: number) => {
    if (s >= 1 && s <= TOTAL_STEPS) setCurrentStep(s);
  }, []);

  const stepProps = { config, updateConfig, onNext: goNext, onBack: goPrev, onSaveDraft: saveDraft };

  // ── Screens ─────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return <LoginPage onAdminLogin={handleAdminLogin} onSuperUserLogin={handleSuperUserLogin} />;
  }

  if (screen === "admin") {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        onOpenAccount={handleOpenAccountFromAdmin}
      />
    );
  }

  if (screen === "account-home") {
    return (
      <AccountHome
        orgName={superUserAccount?.org_name ?? config.account.organizationName ?? "Your Account"}
        config={config}
        onEnter={handleEnterWizard}
        onLogout={handleLogout}
      />
    );
  }

  // ── Sidebar helpers (defined inside render for access to state closures) ────

  const appConfigActive = APP_CONFIG_STEP_IDS.includes(currentStep);
  const appConfigAllDone = allAppConfigDone(completedSteps);

  function getLockReason(stepId: number): string {
    if (stepId === STEP_USERS) {
      const missing = APP_CONFIG_STEPS.find((s) => !completedSteps.has(s.id));
      return missing
        ? `Complete "${missing.label}" in Application Configuration first.`
        : "Complete all Application Configuration steps first.";
    }
    const idx = APP_CONFIG_STEP_IDS.indexOf(stepId);
    if (idx > 0) {
      const prevId = APP_CONFIG_STEP_IDS[idx - 1];
      return `Complete "${STEP_LABEL[prevId]}" first.`;
    }
    return "Complete the previous step first.";
  }

  function handleSidebarClick(stepId: number) {
    if (!isStepAccessible(stepId, completedSteps)) {
      setSidebarLockedMsg(getLockReason(stepId));
      setTimeout(() => setSidebarLockedMsg(null), 3500);
    } else {
      goToStep(stepId);
    }
  }

  function SidebarItem({
    stepId,
    label,
    indented = false,
  }: {
    stepId: number;
    label: string;
    indented?: boolean;
  }) {
    const accessible = isStepAccessible(stepId, completedSteps);
    const active = stepId === currentStep;
    const completed = completedSteps.has(stepId);

    return (
      <button
        onClick={() => handleSidebarClick(stepId)}
        className={[
          "flex items-center gap-2.5 py-2 rounded-lg text-sm transition-all text-left w-full",
          indented ? "pl-8 pr-3" : "pl-3 pr-3",
          !accessible
            ? "text-slate-400 cursor-default"
            : active
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-slate-600 hover:bg-slate-50",
        ].join(" ")}
      >
        {!accessible
          ? <Lock size={13} className="text-slate-300 shrink-0" />
          : completed
          ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          : active
          ? <ChevronRight size={14} className="text-blue-600 shrink-0" />
          : <Circle size={14} className="text-slate-300 shrink-0" />}
        <span className={`truncate ${!accessible ? "line-through decoration-slate-300" : ""}`}>
          {label}
        </span>
      </button>
    );
  }

  // Wizard screen
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {superUserAccount?.org_name ?? "Business License Setup"}
            </p>
            <p className="text-xs text-slate-500">Implementation Configuration Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={sidebarOpen ? "Hide checklist" : "Show checklist"}
          >
            <PanelLeft size={17} />
          </button>
          <a href="https://egov.org.in" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <img
              src="https://egov.org.in/favicon.ico"
              alt="eGov"
              className="w-4 h-4 rounded-sm"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span>Powered by eGov</span>
          </a>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {STEP_LABEL[currentStep]}
          </div>
          {(isAdmin || openedFromAdmin) && (
            <button
              onClick={handleBackToAdmin}
              className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
            >
              ← Admin Dashboard
            </button>
          )}
          {!isAdmin && !openedFromAdmin && (
            <button
              onClick={handleBackToAccountHome}
              className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
            >
              ← Overview
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={[
          "flex-col w-64 bg-white border-r border-slate-200 py-6 px-3 overflow-y-auto",
          "fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-30",
          "lg:sticky lg:z-auto lg:top-14 lg:h-[calc(100vh-3.5rem)]",
          "transition-transform duration-200",
          sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full",
        ].join(" ")}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Setup Checklist
          </p>

          {sidebarLockedMsg && (
            <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <Lock size={11} className="shrink-0 mt-0.5 text-amber-500" />
              <span>{sidebarLockedMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-0.5">

            {/* 1. Account Settings — free nav */}
            <SidebarItem stepId={STEP_ACCOUNT} label="Account Settings" />

            {/* 2. Boundary — free nav */}
            <SidebarItem stepId={STEP_BOUNDARY} label="Boundary" />

            {/* 3. Branding — free nav */}
            <SidebarItem stepId={STEP_BRANDING} label="Branding" />

            {/* 4. Integrations — free nav, after Branding (Issue #8) */}
            <SidebarItem stepId={STEP_INTEGRATIONS} label="Integrations" />

            {/* 5. Application Configuration — sequential sub-steps, always expanded */}
            <div className="mt-2">
              <button
                onClick={() => {
                  // Navigate to first accessible App Config sub-step
                  const first = APP_CONFIG_STEPS.find((s) =>
                    isStepAccessible(s.id, completedSteps)
                  );
                  if (first) goToStep(first.id);
                }}
                className={[
                  "flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left transition-colors",
                  appConfigActive
                    ? "text-blue-700 bg-blue-50/50"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  {appConfigAllDone
                    ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    : appConfigActive
                    ? <ChevronRight size={14} className="text-blue-600 shrink-0" />
                    : <Circle size={14} className="text-slate-300 shrink-0" />}
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Application Config
                  </span>
                </div>
                <ChevronDown size={13} className="text-slate-400 shrink-0" />
              </button>

              <div className="flex flex-col gap-0.5 mt-0.5">
                {APP_CONFIG_STEPS.map((s) => (
                  <SidebarItem
                    key={s.id}
                    stepId={s.id}
                    label={s.label}
                    indented
                  />
                ))}
              </div>
            </div>

            {/* 5. Users — locked until all App Config done */}
            <div className="mt-2">
              <SidebarItem stepId={STEP_USERS} label="Users" />
            </div>

            {/* 6. Other Information — free nav */}
            <SidebarItem stepId={STEP_OTHER_INFO} label="Other Information" />

            {/* 7. Review — free nav, visually separated */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <SidebarItem stepId={STEP_REVIEW} label="Review & Export" />
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 px-2">Progress saved automatically</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
          {/* Mobile progress bar */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">{STEP_LABEL[currentStep]}</span>
              <span>{completedSteps.size}/{ORDERED_STEPS.length} sections done</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.size / ORDERED_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step components — unchanged */}
          {currentStep === STEP_ACCOUNT    && <Step1AccountProfile {...stepProps} />}
          {currentStep === STEP_BRANDING   && <Step2Branding {...stepProps} />}
          {currentStep === STEP_BOUNDARY   && <Step3Deployment {...stepProps} />}
          {currentStep === 4               && <StepIntegrations {...stepProps} />}
          {currentStep === 5               && <StepOverallConfig {...stepProps} />}
          {currentStep === 6               && <Step4FormConfig {...stepProps} />}
          {currentStep === 7               && <Step5RolesStaff {...stepProps} />}
          {currentStep === 8               && <Step6Fees {...stepProps} />}
          {currentStep === 9               && <StepWorkflow {...stepProps} />}
          {currentStep === 10              && <Step7PaymentsNotifications {...stepProps} />}
          {currentStep === STEP_USERS      && <StepUsers {...stepProps} />}
          {currentStep === STEP_OTHER_INFO && <StepOthers {...stepProps} />}
          {currentStep === STEP_REVIEW     && (
            <Step8ReviewExport config={config} onBack={goPrev} onGoToStep={goToStep} updateConfig={updateConfig} />
          )}
        </main>
      </div>
    </div>
  );
}
