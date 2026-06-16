import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SetupShell, { type SetupStepKey } from "@/components/template-setup/SetupShell";
import Step1Identity from "@/components/template-setup/Step1Identity";
import Step2Modules from "@/components/template-setup/Step2Modules";
import Step3Structure from "@/components/template-setup/Step3Structure";
import Step4RenewalPolicy, {
  type RenewalPolicyState,
} from "@/components/template-setup/Step4RenewalPolicy";
import Step5WorkflowScope from "@/components/template-setup/Step5WorkflowScope";
import Step4Initializing from "@/components/template-setup/Step4Initializing";
import { allTemplates } from "@/data/serviceTemplates";
import { useOnboarding, type ServiceItem, type WorkflowScope } from "@/contexts/OnboardingContext";

const TemplateSetup: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { state, addService } = useOnboarding();

  const template = useMemo(
    () => allTemplates.find((t) => t.id === templateId),
    [templateId],
  );

  useEffect(() => {
    if (!template || template.comingSoon) {
      navigate("/services", { replace: true });
    }
  }, [template, navigate]);

  const [step, setStep] = useState<SetupStepKey>("identity");
  const [name, setName] = useState(template?.name ?? "");
  const [renewalEnabled, setRenewalEnabled] = useState(true);
  const [hasCategories, setHasCategories] = useState<boolean | null>(null);
  const [categoriesFile, setCategoriesFile] = useState<File | null>(null);
  const [hasSubcategories, setHasSubcategories] = useState<boolean | null>(null);
  const [subcategoriesFile, setSubcategoriesFile] = useState<File | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<
    { name: string; parent: string }[]
  >([]);
  const [renewalPolicy, setRenewalPolicy] = useState<RenewalPolicyState>({
    mode: "global",
    globalMonths: 12,
    perCategory: {},
    perSubcategory: {},
  });
  const [workflowScope, setWorkflowScope] = useState<WorkflowScope>("shared");

  if (!template) return null;

  const trimmed = name.trim();
  const duplicate = state.services.some(
    (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  const visibleSteps: SetupStepKey[] = useMemo(() => {
    const base: SetupStepKey[] = ["identity", "structure", "modules"];
    if (renewalEnabled) base.push("renewal");
    if (hasCategories === true) base.push("workflow_scope");
    base.push("initialize");
    return base;
  }, [renewalEnabled, hasCategories]);

  const handleBack = () => {
    if (step === "identity") navigate("/services");
    else if (step === "structure") setStep("identity");
    else if (step === "modules") setStep("structure");
    else if (step === "renewal") setStep("modules");
    else if (step === "workflow_scope") setStep(renewalEnabled ? "renewal" : "modules");
    // initializing has no back
  };

  const goAfterModules = () => {
    if (renewalEnabled) setStep("renewal");
    else if (hasCategories === true) setStep("workflow_scope");
    else setStep("initialize");
  };

  const goAfterRenewal = () => {
    if (hasCategories === true) setStep("workflow_scope");
    else setStep("initialize");
  };

  const finalize = () => {
    const customModules = ["Issuance", ...(renewalEnabled ? ["Renewal"] : [])];
    const newService: ServiceItem = {
      id: `${template.id}-${Date.now().toString(36)}`,
      name: trimmed,
      templateId: template.id,
      status: "draft",
      customModules,
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      templateSetup: {
        hasCategories: hasCategories === true,
        hasSubcategories: hasSubcategories === true,
        categoriesFileName: categoriesFile?.name,
        subcategoriesFileName: subcategoriesFile?.name,
        categoriesList,
        subcategoriesList,
      },
      renewalPolicy: renewalEnabled ? renewalPolicy : undefined,
      workflowScope: hasCategories === true ? workflowScope : "shared",
    };
    addService(newService);
    navigate(`/service/${newService.id}/configure`, { state: { mode: "overview" } });
  };

  return (
    <SetupShell
      current={step}
      onBack={step === "initialize" ? undefined : handleBack}
      backLabel={step === "identity" ? "Back to templates" : "Back"}
      visibleSteps={visibleSteps}
    >
      {step === "identity" && (
        <Step1Identity
          templateName={template.name}
          value={name}
          onChange={setName}
          duplicate={duplicate}
          onContinue={() => setStep("structure")}
        />
      )}
      {step === "structure" && (
        <Step3Structure
          hasCategories={hasCategories}
          setHasCategories={setHasCategories}
          categoriesFile={categoriesFile}
          setCategoriesFile={setCategoriesFile}
          hasSubcategories={hasSubcategories}
          setHasSubcategories={setHasSubcategories}
          subcategoriesFile={subcategoriesFile}
          setSubcategoriesFile={setSubcategoriesFile}
          setCategoriesList={setCategoriesList}
          setSubcategoriesList={setSubcategoriesList}
          onContinue={() => setStep("modules")}
        />
      )}
      {step === "modules" && (
        <Step2Modules
          renewalEnabled={renewalEnabled}
          onRenewalChange={setRenewalEnabled}
          onContinue={goAfterModules}
        />
      )}
      {step === "renewal" && (
        <Step4RenewalPolicy
          categories={categoriesList}
          subcategories={subcategoriesList}
          policy={renewalPolicy}
          setPolicy={setRenewalPolicy}
          onContinue={goAfterRenewal}
        />
      )}
      {step === "workflow_scope" && (
        <Step5WorkflowScope
          value={workflowScope}
          onChange={setWorkflowScope}
          categoryCount={categoriesList.length}
          onContinue={() => setStep("initialize")}
        />
      )}
      {step === "initialize" && (
        <Step4Initializing
          serviceName={trimmed}
          renewalEnabled={renewalEnabled}
          hasCategories={hasCategories === true}
          onComplete={finalize}
        />
      )}
    </SetupShell>
  );
};

export default TemplateSetup;