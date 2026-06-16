/**
 * Canonical, per-service-per-module form schema storage.
 * Both the FormBuilder and the citizen-facing Preview form read/write
 * through these helpers so changes propagate immediately.
 */
import { type WizardStep } from "@/data/wizardForm";
import { buildIssuanceFormSteps, type FormSeedSetup } from "@/data/issuanceFormTemplate";
import { buildRenewalFormSteps } from "@/data/renewalFormTemplate";

export const FORM_UPDATED_EVENT = "formbuilder:updated";

export const formStorageKey = (serviceId: string, moduleName: string) =>
  `formbuilder:${serviceId || "service"}:${moduleName}`;

export const seedFormSteps = (
  moduleName: string,
  setup: FormSeedSetup = {},
): WizardStep[] =>
  moduleName === "Renewal"
    ? buildRenewalFormSteps(setup)
    : buildIssuanceFormSteps(setup);

export const loadFormSteps = (
  serviceId: string,
  moduleName: string,
  setup: FormSeedSetup = {},
): WizardStep[] => {
  try {
    const raw = localStorage.getItem(formStorageKey(serviceId, moduleName));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as WizardStep[];
    }
  } catch { /* ignore */ }
  return seedFormSteps(moduleName, setup);
};

export const saveFormSteps = (
  serviceId: string,
  moduleName: string,
  steps: WizardStep[],
) => {
  try {
    const key = formStorageKey(serviceId, moduleName);
    localStorage.setItem(key, JSON.stringify(steps));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(FORM_UPDATED_EVENT, {
          detail: { serviceId, moduleName, key },
        }),
      );
    }
  } catch { /* ignore */ }
};
