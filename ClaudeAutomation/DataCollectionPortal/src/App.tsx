import { useState, useEffect, useCallback } from "react";
import type { ImplementationConfig } from "./types";
import { DEFAULT_CONFIG, STORAGE_KEY, STEP_KEY } from "./defaults";
import { saveConfig, type AccountRecord } from "./lib/supabase";
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
import { CheckCircle2, Circle, ChevronRight, LogOut, Lock, PanelLeft } from "lucide-react";
import { isStepComplete } from "./lib/stepValidation";

type Screen = "login" | "admin" | "account-home" | "wizard";

const TOTAL_STEPS = 13;

// Flat map of stepId → label (used for mobile bar)
const STEP_LABEL: Record<number, string> = {
  1:  "Overview",
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
  13: "Review & Export",
};

// Grouped sidebar structure
const STEP_GROUPS = [
  {
    label: "Account Profile",
    steps: [
      { id: 1,  label: "Overview" },
      { id: 2,  label: "Branding" },
      { id: 3,  label: "Boundary" },
      { id: 4,  label: "Integrations" },
    ],
  },
  {
    label: "Application Details",
    steps: [
      { id: 5,  label: "Overall Configuration" },
      { id: 6,  label: "Application Form" },
      { id: 7,  label: "Roles" },
      { id: 8,  label: "Fees" },
      { id: 9,  label: "Workflow" },
      { id: 10, label: "Notifications" },
    ],
  },
  {
    label: "Users & Notes",
    steps: [
      { id: 11, label: "User Assignment" },
      { id: 12, label: "Other Information" },
    ],
  },
];

// Steps that require a previous step to be completed first
const STEP_PREREQUISITES: Record<number, number> = {
  6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [isAdmin, setIsAdmin] = useState(false);
  const [openedFromAdmin, setOpenedFromAdmin] = useState(false);
  const [superUserAccount, setSuperUserAccount] = useState<AccountRecord | null>(null);
  const [sidebarLockedMsg, setSidebarLockedMsg] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [config, setConfig] = useState<ImplementationConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ImplementationConfig;
        if (!parsed.workflow)     parsed.workflow     = DEFAULT_CONFIG.workflow;
        if (!parsed.integrations) parsed.integrations = DEFAULT_CONFIG.integrations;
        if (!parsed.overall)      parsed.overall      = DEFAULT_CONFIG.overall;
        // Migrate formConfig to new shape
        if (!parsed.formConfig.documents)         parsed.formConfig.documents         = DEFAULT_CONFIG.formConfig.documents;
        if (!parsed.formConfig.customSubsections) parsed.formConfig.customSubsections = [];
        if (!parsed.formConfig.customFields)      parsed.formConfig.customFields      = [];
        if (parsed.formConfig.declarationMobileOtpEnabled === undefined) parsed.formConfig.declarationMobileOtpEnabled = false;
        // Migrate deployment to new boundary shape
        if (parsed.deployment.hierarchyName === undefined)   parsed.deployment.hierarchyName   = "";
        if (!parsed.deployment.hierarchyLevels)              parsed.deployment.hierarchyLevels = [];
        if (!parsed.deployment.boundaryRows)                 parsed.deployment.boundaryRows    = [];
        if (parsed.deployment.uploadMethod === undefined)    parsed.deployment.uploadMethod    = "";
        if (parsed.deployment.shapefileName === undefined)   parsed.deployment.shapefileName   = "";
        if (parsed.deployment.operatingLevel === undefined)  parsed.deployment.operatingLevel  = 0;
        // Migrate fees to new shape
        if (!parsed.fees.inspectionFeeMode)   { parsed.fees.inspectionFeeMode = "slab"; parsed.fees.inspectionFeeFlat = 500; parsed.fees.inspectionSlabDimension = "Business Area (sq ft)"; }
        if (!parsed.fees.licenseFeeMode)      { parsed.fees.licenseFeeMode = "slab"; parsed.fees.licenseFeeFlat = 1000; parsed.fees.licenseFeeSlabs = DEFAULT_CONFIG.fees.licenseFeeSlabs; parsed.fees.licenseSlabDimension = "Business Area (sq ft)"; }
        // Migrate workflow stages
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

  function handleSuperUserLogin(account: AccountRecord) {
    setIsAdmin(false);
    setOpenedFromAdmin(false);
    setSuperUserAccount(account);
    const loaded = account.config_data ?? DEFAULT_CONFIG;
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
    if (!loaded.workflow.stages)         loaded.workflow.stages       = DEFAULT_CONFIG.workflow.stages;
    if (!loaded.workflow.checklistItems) loaded.workflow.checklistItems = DEFAULT_CONFIG.workflow.checklistItems;
    if (loaded.notes === undefined)      loaded.notes                 = "";
    if (!loaded.overall.licenseValidityMode) loaded.overall.licenseValidityMode = "fixed";
    if (!loaded.overall.licenseIdFormat)     loaded.overall.licenseIdFormat     = "LIC-YYYY-NNNNNN";
    if (loaded.paymentsNotifications.notificationChannels.ussd === undefined) loaded.paymentsNotifications.notificationChannels.ussd = false;
    if (!loaded.paymentsNotifications.notificationTemplates) loaded.paymentsNotifications.notificationTemplates = DEFAULT_CONFIG.paymentsNotifications.notificationTemplates;
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
    const loaded = account.config_data ?? DEFAULT_CONFIG;
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
    if (!loaded.workflow.stages)         loaded.workflow.stages       = DEFAULT_CONFIG.workflow.stages;
    if (!loaded.workflow.checklistItems) loaded.workflow.checklistItems = DEFAULT_CONFIG.workflow.checklistItems;
    if (loaded.notes === undefined)      loaded.notes                 = "";
    if (!loaded.overall.licenseValidityMode) loaded.overall.licenseValidityMode = "fixed";
    if (!loaded.overall.licenseIdFormat)     loaded.overall.licenseIdFormat     = "LIC-YYYY-NNNNNN";
    if (loaded.paymentsNotifications.notificationChannels.ussd === undefined) loaded.paymentsNotifications.notificationChannels.ussd = false;
    if (!loaded.paymentsNotifications.notificationTemplates) loaded.paymentsNotifications.notificationTemplates = DEFAULT_CONFIG.paymentsNotifications.notificationTemplates;
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
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goPrev = () => {
    if (currentStep === 1) {
      if (isAdmin || openedFromAdmin) handleBackToAdmin();
      else handleBackToAccountHome();
    } else {
      setCurrentStep((s) => Math.max(s - 1, 1));
    }
  };
  const goToStep = (s: number) => { if (s >= 1 && s <= TOTAL_STEPS) setCurrentStep(s); };

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
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={sidebarOpen ? "Hide checklist" : "Show checklist"}
          >
            <PanelLeft size={17} />
          </button>
          {/* eGov Foundation attribution */}
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
            Step {currentStep} of {TOTAL_STEPS}
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
        <aside className={`
          flex-col w-64 bg-white border-r border-slate-200 py-6 px-4 overflow-y-auto
          fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-30
          lg:sticky lg:z-auto lg:top-14 lg:h-[calc(100vh-3.5rem)]
          transition-transform duration-200
          ${sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full"}
        `}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Setup Checklist
          </p>

          {sidebarLockedMsg && (
            <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <Lock size={11} className="shrink-0 mt-0.5 text-amber-500" />
              <span>{sidebarLockedMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {STEP_GROUPS.map((group, gi) => (
              <div key={gi}>
                <p className="text-xs font-semibold text-slate-500 px-2 mb-1.5 uppercase tracking-wide">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.steps.map((step) => {
                    const complete = isStepComplete(step.id, config);
                    const active = step.id === currentStep;
                    const prereqId = STEP_PREREQUISITES[step.id];
                    const locked = !!(prereqId && !isStepComplete(prereqId, config));
                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          if (locked) {
                            setSidebarLockedMsg(`Complete "${STEP_LABEL[prereqId]}" before accessing this step.`);
                            setTimeout(() => setSidebarLockedMsg(null), 3500);
                          } else {
                            goToStep(step.id);
                          }
                        }}
                        className={`
                          flex items-center gap-2.5 pl-5 pr-3 py-2 rounded-lg text-sm transition-all text-left
                          ${locked ? "text-slate-400 cursor-default" : active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}
                        `}
                      >
                        {locked
                          ? <Lock size={13} className="text-slate-300 shrink-0" />
                          : complete
                          ? <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                          : active
                          ? <ChevronRight size={15} className="text-blue-600 shrink-0" />
                          : <Circle size={15} className="text-slate-300 shrink-0" />}
                        <span className="truncate">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Review & Export — top-level peer of group headers */}
            {(() => {
              const complete = isStepComplete(13, config);
              const active = currentStep === 13;
              return (
                <button
                  onClick={() => goToStep(13)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left w-full ${
                    active ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {complete
                    ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                    : active
                    ? <ChevronRight size={13} className="text-blue-600 shrink-0" />
                    : <Circle size={13} className="text-slate-300 shrink-0" />}
                  <span className="text-xs font-semibold uppercase tracking-wide truncate">
                    Review & Export
                  </span>
                </button>
              );
            })()}
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
              <span>{STEP_LABEL[currentStep]}</span>
              <span>{currentStep}/{TOTAL_STEPS}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {currentStep === 1  && <Step1AccountProfile {...stepProps} />}
          {currentStep === 2  && <Step2Branding {...stepProps} />}
          {currentStep === 3  && <Step3Deployment {...stepProps} />}
          {currentStep === 4  && <StepIntegrations {...stepProps} />}
          {currentStep === 5  && <StepOverallConfig {...stepProps} />}
          {currentStep === 6  && <Step4FormConfig {...stepProps} />}
          {currentStep === 7  && <Step5RolesStaff {...stepProps} />}
          {currentStep === 8  && <Step6Fees {...stepProps} />}
          {currentStep === 9  && <StepWorkflow {...stepProps} />}
          {currentStep === 10 && <Step7PaymentsNotifications {...stepProps} />}
          {currentStep === 11 && <StepUsers {...stepProps} />}
          {currentStep === 12 && <StepOthers {...stepProps} />}
          {currentStep === 13 && (
            <Step8ReviewExport config={config} onBack={goPrev} onGoToStep={goToStep} updateConfig={updateConfig} />
          )}
        </main>
      </div>
    </div>
  );
}
