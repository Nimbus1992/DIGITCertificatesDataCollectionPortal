/**
 * Wizard-form shared types used by Issuance and Renewal FormBuilder seeds.
 *
 * Mirrors the citizen-facing 5-step wizard in
 * `src/components/preview/citizen/ApplicationForm.tsx` (`SUB_SCREENS`).
 */

export type WizardFieldType =
  | "text"
  | "number"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "textarea"
  | "multiselect";

export interface WizardFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  pastDateOnly?: boolean;
}

export interface WizardField {
  id: string;
  type: WizardFieldType;
  label: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  options?: string[];
  validation?: WizardFieldValidation;
  showIf?: { field: string; equals: string };
  dependsOn?: string;
  dependsValueMap?: Record<string, string[]>;
}

export interface WizardSubScreen {
  id: string;
  title: string;
  subtitle?: string;
  optional?: boolean;
  isMap?: boolean;
  helperBanner?: string;
  fields: WizardField[];
}

export interface WizardStep {
  id: string;
  name: string;
  subScreens: WizardSubScreen[];
}

/** Deep-clone helper for seeding state without sharing references. */
export const cloneSteps = (steps: WizardStep[]): WizardStep[] =>
  steps.map((s) => ({
    ...s,
    subScreens: s.subScreens.map((sub) => ({
      ...sub,
      fields: sub.fields.map((f) => ({
        ...f,
        options: f.options ? [...f.options] : undefined,
        validation: f.validation ? { ...f.validation } : undefined,
        showIf: f.showIf ? { ...f.showIf } : undefined,
        dependsValueMap: f.dependsValueMap
          ? Object.fromEntries(
              Object.entries(f.dependsValueMap).map(([k, v]) => [k, [...v]]),
            )
          : undefined,
      })),
    })),
  }));