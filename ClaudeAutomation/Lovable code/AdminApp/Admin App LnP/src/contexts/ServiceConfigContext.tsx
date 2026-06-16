import React, { createContext, useCallback, useContext, useMemo } from "react";
import {
  useOnboarding,
  type ServiceItem,
  type RenewalPolicy,
  type TemplateSetup,
  type WorkflowScope,
} from "@/contexts/OnboardingContext";

/**
 * ServiceConfigContext — single read/write surface for everything that
 * multiple configurators or the preview need to stay in sync about:
 *  - structure (categories / subcategories)
 *  - enabled modules
 *  - renewal policy
 *  - workflow scope (shared / by category / by subcategory)
 *
 * Per-module state (forms, fees, documents, etc.) still lives in
 * `useModuleState`, but the *key* it uses can now be category-aware via
 * `workflowKeySuffix()` so e.g. a different workflow can be authored per
 * category without rewriting every configurator.
 */

interface ServiceConfigValue {
  service: ServiceItem | undefined;
  serviceId: string;

  // Structure
  categories: string[];
  subcategories: { name: string; parent: string }[];
  hasCategories: boolean;
  hasSubcategories: boolean;

  // Modules
  enabledModules: string[];
  isModuleEnabled: (name: string) => boolean;

  // Renewal
  renewalPolicy: RenewalPolicy | undefined;
  renewalMonthsFor: (category?: string, subcategory?: string) => number;

  // Workflow scope
  workflowScope: WorkflowScope;
  workflowKeySuffix: (moduleName: string, category?: string) => string;

  // Mutations
  setStructure: (patch: Partial<TemplateSetup>) => void;
  setEnabledModules: (modules: string[]) => void;
  setRenewalPolicy: (policy: RenewalPolicy) => void;
  setWorkflowScope: (scope: WorkflowScope) => void;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategory: (name: string) => void;
}

const Ctx = createContext<ServiceConfigValue | undefined>(undefined);

export const ServiceConfigProvider: React.FC<{
  serviceId: string;
  children: React.ReactNode;
}> = ({ serviceId, children }) => {
  const { state, updateService } = useOnboarding();
  const service = state.services.find((s) => s.id === serviceId);

  const setup = service?.templateSetup;
  const categories = setup?.categoriesList ?? [];
  const subcategories = setup?.subcategoriesList ?? [];
  const renewalPolicy = service?.renewalPolicy;
  const workflowScope: WorkflowScope = service?.workflowScope ?? "shared";
  const enabledModules = service?.customModules ?? ["Issuance"];

  const setStructure = useCallback(
    (patch: Partial<TemplateSetup>) => {
      if (!service) return;
      updateService(service.id, {
        templateSetup: { ...(service.templateSetup ?? { hasCategories: false, hasSubcategories: false }), ...patch },
      });
    },
    [service, updateService],
  );

  const setEnabledModules = useCallback(
    (modules: string[]) => {
      if (!service) return;
      updateService(service.id, { customModules: modules });
    },
    [service, updateService],
  );

  const setRenewalPolicy = useCallback(
    (policy: RenewalPolicy) => {
      if (!service) return;
      updateService(service.id, { renewalPolicy: policy });
    },
    [service, updateService],
  );

  const setWorkflowScope = useCallback(
    (scope: WorkflowScope) => {
      if (!service) return;
      updateService(service.id, { workflowScope: scope });
    },
    [service, updateService],
  );

  const renameCategory = useCallback(
    (oldName: string, newName: string) => {
      if (!service || !oldName || !newName || oldName === newName) return;
      const setup = service.templateSetup;
      if (!setup) return;
      const nextCategories = (setup.categoriesList ?? []).map((c) => (c === oldName ? newName : c));
      const nextSubs = (setup.subcategoriesList ?? []).map((s) =>
        s.parent === oldName ? { ...s, parent: newName } : s,
      );
      const nextPolicy: RenewalPolicy | undefined = service.renewalPolicy
        ? {
            ...service.renewalPolicy,
            perCategory: Object.fromEntries(
              Object.entries(service.renewalPolicy.perCategory).map(([k, v]) => [k === oldName ? newName : k, v]),
            ),
          }
        : undefined;
      updateService(service.id, {
        templateSetup: { ...setup, categoriesList: nextCategories, subcategoriesList: nextSubs },
        renewalPolicy: nextPolicy,
      });
    },
    [service, updateService],
  );

  const removeCategory = useCallback(
    (name: string) => {
      if (!service) return;
      const setup = service.templateSetup;
      if (!setup) return;
      const nextCategories = (setup.categoriesList ?? []).filter((c) => c !== name);
      const nextSubs = (setup.subcategoriesList ?? []).filter((s) => s.parent !== name);
      let nextPolicy = service.renewalPolicy;
      if (nextPolicy) {
        const { [name]: _, ...rest } = nextPolicy.perCategory;
        nextPolicy = { ...nextPolicy, perCategory: rest };
      }
      updateService(service.id, {
        templateSetup: { ...setup, categoriesList: nextCategories, subcategoriesList: nextSubs },
        renewalPolicy: nextPolicy,
      });
    },
    [service, updateService],
  );

  const renewalMonthsFor = useCallback(
    (category?: string, subcategory?: string) => {
      const p = renewalPolicy;
      if (!p) return 12;
      if (p.mode === "by_subcategory" && subcategory && category) {
        const k = `${category}::${subcategory}`;
        return p.perSubcategory[k] ?? p.globalMonths;
      }
      if (p.mode === "by_category" && category) {
        return p.perCategory[category] ?? p.globalMonths;
      }
      return p.globalMonths;
    },
    [renewalPolicy],
  );

  const workflowKeySuffix = useCallback(
    (moduleName: string, category?: string) => {
      if (workflowScope === "by_category" && category) {
        return `${moduleName}::cat::${category}`;
      }
      return moduleName;
    },
    [workflowScope],
  );

  const value = useMemo<ServiceConfigValue>(
    () => ({
      service,
      serviceId,
      categories,
      subcategories,
      hasCategories: !!setup?.hasCategories,
      hasSubcategories: !!setup?.hasSubcategories,
      enabledModules,
      isModuleEnabled: (name: string) =>
        enabledModules.some((m) => m.toLowerCase() === name.toLowerCase()),
      renewalPolicy,
      renewalMonthsFor,
      workflowScope,
      workflowKeySuffix,
      setStructure,
      setEnabledModules,
      setRenewalPolicy,
      setWorkflowScope,
      renameCategory,
      removeCategory,
    }),
    [
      service, serviceId, categories, subcategories, setup, enabledModules,
      renewalPolicy, renewalMonthsFor, workflowScope, workflowKeySuffix,
      setStructure, setEnabledModules, setRenewalPolicy, setWorkflowScope,
      renameCategory, removeCategory,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useServiceConfig = (): ServiceConfigValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useServiceConfig must be used within ServiceConfigProvider");
  return v;
};

/** Safe variant — returns null if no provider above. Useful in shared
 *  components that may render outside a configured-service tree. */
export const useServiceConfigOptional = (): ServiceConfigValue | null => {
  return useContext(Ctx) ?? null;
};