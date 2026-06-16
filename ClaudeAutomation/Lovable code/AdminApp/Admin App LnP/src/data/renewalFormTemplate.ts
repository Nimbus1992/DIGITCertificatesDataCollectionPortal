/**
 * Renewal form seed — initially identical to Issuance, but stored separately
 * so the user can edit/restructure independently.
 */
import type { WizardStep } from "./wizardForm";
import { cloneSteps } from "./wizardForm";
import {
  ISSUANCE_FORM_STEPS,
  buildIssuanceFormSteps,
  type FormSeedSetup,
} from "./issuanceFormTemplate";

export const buildRenewalFormSteps = (setup: FormSeedSetup = {}): WizardStep[] =>
  cloneSteps(buildIssuanceFormSteps(setup));

/** @deprecated Prefer `buildRenewalFormSteps(setup)`. */
export const RENEWAL_FORM_STEPS: WizardStep[] = cloneSteps(ISSUANCE_FORM_STEPS);