import type { ImplementationConfig } from "../types";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isStepComplete(stepId: number, config: ImplementationConfig): boolean {
  switch (stepId) {
    // ── Account Profile ──────────────────────────────────────────────────────
    case 1: {
      const a = config.account;
      return !!(a.organizationName.trim() && a.adminEmail.trim() && isEmail(a.adminEmail));
    }
    case 2:
      return !!config.branding.portalName.trim();
    case 3: {
      const d = config.deployment;
      if (!d.availabilityScope) return false;
      if (d.availabilityScope === "entire_state") return true;
      return d.areas.some((a) => a.city.trim());
    }
    case 4:
      return true; // Integrations — all optional

    // ── Application Details ──────────────────────────────────────────────────
    case 5: {
      const oc = config.overall;
      return oc.licenseValidityMonths > 0 && oc.categories.length > 0;
    }
    case 6:
      return (
        config.formConfig.idTypes.length > 0 &&
        config.formConfig.tradeCategories.length > 0
      );
    case 7:
      return config.roles.length > 0;
    case 8:
      return config.fees.applicationFee > 0;
    case 9: {
      const wf = config.workflow;
      return wf.approvalLevels >= 1 && wf.processingSlaDays > 0;
    }
    case 10: {
      const pn = config.paymentsNotifications;
      return !!(pn.notificationChannels.email || pn.notificationChannels.sms || pn.notificationChannels.ussd);
    }

    // ── Users ────────────────────────────────────────────────────────────────
    case 11:
      return config.roles
        .filter((r) => r.id !== "citizen")
        .some((r) => (r.staffMembers?.length ?? 0) > 0 || r.staffEmails.length > 0);

    // ── Others ───────────────────────────────────────────────────────────────
    case 12:
      return true; // always complete — optional free text

    // ── Review & Export ──────────────────────────────────────────────────────
    case 13:
      return config.metadata.status === "submitted";

    default:
      return false;
  }
}
