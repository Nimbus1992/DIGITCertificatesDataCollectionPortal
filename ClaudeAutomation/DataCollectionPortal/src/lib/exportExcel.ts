import * as XLSX from "xlsx";
import type { AccountRecord } from "./supabase";
import type { ImplementationConfig } from "../types";

export function exportAccountToExcel(account: AccountRecord) {
  exportAccountsToExcel([account]);
}

export function exportAccountsToExcel(accounts: AccountRecord[]) {
  const rows = accounts.map((acc) => {
    const cfg = acc.config_data;
    return {
      "Org Name": acc.org_name,
      "Department": acc.department_name ?? "",
      "Country": acc.country ?? "",
      "Super User Email": acc.super_user_email ?? "",
      "Status": acc.status,
      "Step": acc.current_step,
      "Admin Verified": acc.admin_verified ? "Yes" : "No",
      "Admin Notes": acc.admin_notes ?? "",
      "Created At": acc.created_at ? new Date(acc.created_at).toLocaleString() : "",
      "Updated At": acc.updated_at ? new Date(acc.updated_at).toLocaleString() : "",
      // Account
      "State/Province": cfg?.account?.stateProvince ?? "",
      "Mobile Prefix": cfg?.account?.mobilePrefix ?? "",
      "Currency": cfg?.account?.currency ?? "",
      "Language": cfg?.account?.language ?? "",
      "Date Format": cfg?.account?.dateFormat ?? "",
      "Financial Year Start": cfg?.account?.financialYearStart ?? "",
      "Admin Email": cfg?.account?.adminEmail ?? "",
      "Admin Phone": cfg?.account?.adminPhone ?? "",
      "Domain Slug": cfg?.account?.domainSlug ?? "",
      // Branding
      "Portal Name": cfg?.branding?.portalName ?? "",
      "Portal Tagline": cfg?.branding?.portalTagline ?? "",
      "Primary Color": cfg?.branding?.primaryColor ?? "",
      // Deployment
      "Availability Scope": cfg?.deployment?.availabilityScope ?? "",
      "Deployment Areas": cfg?.deployment?.areas?.map((a) => a.city).filter(Boolean).join(", ") ?? "",
      // Form Config
      "ID Types": cfg?.formConfig?.idTypes?.join(", ") ?? "",
      "Trade Categories": cfg?.formConfig?.tradeCategories?.map((t) => t.type).join(", ") ?? "",
      // Fees
      "Application Fee": cfg?.fees?.applicationFee ?? "",
      "Hazard Surcharge": cfg?.fees?.hazardSurcharge ?? "",
      // Payments
      "Payment Gateway": cfg?.paymentsNotifications?.paymentGateway ?? "",
      "Notification Channels": [
        cfg?.paymentsNotifications?.notificationChannels?.email && "Email",
        cfg?.paymentsNotifications?.notificationChannels?.sms && "SMS",
        cfg?.paymentsNotifications?.notificationChannels?.push && "Push",
      ].filter(Boolean).join(", "),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Accounts");

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const date = new Date().toISOString().slice(0, 10);
  const label = accounts.length === 1
    ? accounts[0].org_name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)
    : "All_Accounts";
  XLSX.writeFile(wb, `LnP_${label}_${date}.xlsx`);
}

// ── Multi-sheet export from a single ImplementationConfig ────────────────────
function addSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto-width
  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

export function exportConfigToExcel(config: ImplementationConfig): void {
  const wb = XLSX.utils.book_new();
  const { account: a, branding: b, deployment: d, formConfig: f, roles, fees, workflow, paymentsNotifications: pn, integrations: integ, overall, notes, metadata } = config;

  // ── Overview ──────────────────────────────────────────────────────────────
  addSheet(wb, "Overview", [{
    "Organisation Name": a.organizationName,
    "Department":        a.departmentName,
    "Country":           a.country,
    "State / Province":  a.stateProvince,
    "Status":            metadata.status,
    "Last Step":         metadata.lastStep,
    "Created At":        metadata.createdAt ? new Date(metadata.createdAt).toLocaleString() : "",
    "Updated At":        metadata.updatedAt ? new Date(metadata.updatedAt).toLocaleString() : "",
    "Notes":             notes ?? "",
  }]);

  // ── Account Profile ────────────────────────────────────────────────────────
  addSheet(wb, "Account Profile", [{
    "Organisation Name":   a.organizationName,
    "Department":          a.departmentName,
    "Country":             a.country,
    "State / Province":    a.stateProvince,
    "Currency":            a.currency,
    "Currency Symbol":     a.currencySymbol,
    "Language":            a.language,
    "Mobile Prefix":       a.mobilePrefix,
    "Date Format":         a.dateFormat,
    "Financial Year Start":a.financialYearStart,
    "Admin Email":         a.adminEmail,
    "Admin Phone":         a.adminPhone,
    "Domain Slug":         a.domainSlug,
    "Has Logo":            a.logoDataUrl ? "Yes" : "No",
  }]);

  // ── Branding ───────────────────────────────────────────────────────────────
  addSheet(wb, "Branding", [{
    "Portal Name":    b.portalName,
    "Tagline":        b.portalTagline,
    "Primary Colour": b.primaryColor,
    "Copyright Text": b.copyrightText,
    "Logo URL":       b.logoUrl?.startsWith("data:") ? "(uploaded)" : (b.logoUrl ?? ""),
  }]);

  // ── Deployment / Boundary ──────────────────────────────────────────────────
  addSheet(wb, "Deployment", [{
    "Availability Scope":   d.availabilityScope,
    "Hierarchy Name":       d.hierarchyName,
    "Hierarchy Levels":     (d.hierarchyLevels ?? []).map((l) => l.name).join(", "),
    "Operating Level":      d.operatingLevel ?? "",
    "Upload Method":        d.uploadMethod,
    "Shapefile Name":       d.shapefileName,
  }]);

  if (d.areas?.length) {
    addSheet(wb, "Deployment Areas", d.areas
      .filter((ar) => ar.city.trim())
      .map((ar) => ({
        "City / Area": ar.city,
        "Zones":       ar.zones.filter(Boolean).join(", "),
      }))
    );
  }

  // ── Form Config — ID Types & Trade Categories ──────────────────────────────
  addSheet(wb, "Form ID Types", (f.idTypes ?? []).map((t) => ({ "ID Type": t })));

  const tradeRows: Record<string, unknown>[] = [];
  (f.tradeCategories ?? []).forEach((cat) => {
    if (!cat.subcategories?.length) {
      tradeRows.push({ "Category": cat.type, "Subcategory": "" });
    } else {
      cat.subcategories.forEach((sub) => tradeRows.push({ "Category": cat.type, "Subcategory": sub }));
    }
  });
  addSheet(wb, "Form Trade Categories", tradeRows);

  addSheet(wb, "Form Documents", (f.documents ?? []).map((doc) => ({
    "Document Name":          doc.name,
    "Required":               doc.required ? "Yes" : "No",
    "Accepted Formats":       doc.formats.join(", "),
    "Has Sub-type Dropdown":  doc.hasDocTypeDropdown ? "Yes" : "No",
    "Sub-types":              doc.docTypes?.join(", ") ?? "",
    "Recommended":            doc.isRecommended ? "Yes" : "No",
  })));

  addSheet(wb, "Form Custom Fields", (f.customFields ?? []).map((field) => ({
    "Section":          field.sectionId,
    "Subsection":       field.subsectionName,
    "Field Name":       field.name,
    "Type":             field.fieldType,
    "Mandatory":        field.mandatory ? "Yes" : "No",
    "Validation":       field.validation,
    "Dropdown Options": field.dropdownOptions?.join(", ") ?? "",
  })));

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleRows: Record<string, unknown>[] = [];
  (roles ?? []).forEach((role) => {
    if (!role.staffEmails?.length) {
      roleRows.push({ "Role ID": role.id, "Role Name": role.name, "Description": role.description, "Staff Email": "" });
    } else {
      role.staffEmails.forEach((email) =>
        roleRows.push({ "Role ID": role.id, "Role Name": role.name, "Description": role.description, "Staff Email": email })
      );
    }
  });
  addSheet(wb, "Roles", roleRows);

  // ── Fees ───────────────────────────────────────────────────────────────────
  addSheet(wb, "Fees Summary", [{
    "Currency":            fees.currency,
    "Currency Symbol":     fees.currencySymbol,
    "Fee Mode":            fees.feeMode,
    "Flat Fee Amount":     fees.feeMode === "flat" ? fees.flatFeeAmount : "",
    "Application Fee":     fees.applicationFee,
    "Inspection Fee Mode": fees.inspectionFeeMode,
    "Inspection Fee Flat": fees.inspectionFeeMode === "flat" ? fees.inspectionFeeFlat : "",
    "Inspection Slab Dim": fees.inspectionSlabDimension,
    "Hazard Surcharge":    fees.hazardSurcharge,
    "License Fee Mode":    fees.licenseFeeMode,
    "License Fee Flat":    fees.licenseFeeMode === "flat" ? fees.licenseFeeFlat : "",
    "License Rate/sq ft":  fees.licenseFeeRatePerSqFt,
    "License Slab Dim":    fees.licenseSlabDimension,
  }]);

  if (fees.inspectionFeeSlabs?.length) {
    addSheet(wb, "Inspection Fee Slabs", fees.inspectionFeeSlabs.map((s) => ({
      "Label": s.label, [`Amount (${fees.currencySymbol})`]: s.amount,
    })));
  }
  if (fees.licenseFeeSlabs?.length) {
    addSheet(wb, "License Fee Slabs", fees.licenseFeeSlabs.map((s) => ({
      "Label": s.label, [`Amount (${fees.currencySymbol})`]: s.amount,
    })));
  }
  if (fees.customFeeTable?.length) {
    addSheet(wb, "Custom Fee Table", fees.customFeeTable as Record<string, unknown>[]);
  }

  // ── Workflow ───────────────────────────────────────────────────────────────
  addSheet(wb, "Workflow Settings", [{
    "Approval Levels":         workflow.approvalLevels,
    "Processing SLA (days)":   workflow.processingSlaDays,
    "Auto Escalate":           workflow.autoEscalate ? "Yes" : "No",
    "Escalation After (days)": workflow.escalationAfterDays,
    "Renewal Reminder (days)": workflow.renewalReminderDays,
    "Citizen Withdrawal":      workflow.allowCitizenWithdrawal ? "Yes" : "No",
  }]);

  const stageRows: Record<string, unknown>[] = [];
  (workflow.stages ?? []).forEach((stage) => {
    stageRows.push({
      "Stage ID":   stage.id,
      "Stage Name": stage.name,
      "Actor":      stage.actor,
      "SLA Hours":  stage.slaHours,
      "Is Start":   stage.isStart ? "Yes" : "No",
      "Is End":     stage.isEnd ? "Yes" : "No",
      "Actions":    stage.actions?.map((ac) => ac.label).join(", ") ?? "",
    });
  });
  addSheet(wb, "Workflow Stages", stageRows);

  addSheet(wb, "Workflow Checklist", (workflow.checklistItems ?? []).map((item) => ({
    "Stage ID":   item.stageId,
    "Item Label": item.label,
    "Type":       item.fieldType,
    "Required":   item.required ? "Yes" : "No",
  })));

  // ── Payments & Notifications ───────────────────────────────────────────────
  addSheet(wb, "Payments & Notifications", [{
    "Payment Gateway":      pn.paymentGateway === "custom" ? pn.customGatewayName : pn.paymentGateway,
    "Counter Payments":     pn.counterPaymentsEnabled ? "Yes" : "No",
    "Admin Email":          pn.adminEmail,
    "SMS Sender ID":        pn.smsSenderId,
    "Email Notifications":  pn.notificationChannels.email ? "Yes" : "No",
    "SMS Notifications":    pn.notificationChannels.sms ? "Yes" : "No",
    "Push Notifications":   pn.notificationChannels.push ? "Yes" : "No",
    "USSD Notifications":   pn.notificationChannels.ussd ? "Yes" : "No",
  }]);

  addSheet(wb, "Notification Templates", (pn.notificationTemplates ?? []).map((t) => ({
    "Event":     t.event,
    "Channel":   t.channel,
    "Recipient": t.recipient,
    "Subject":   t.subject,
  })));

  // ── Integrations ───────────────────────────────────────────────────────────
  addSheet(wb, "Integrations", [{
    "eSign Enabled":          integ.eSignEnabled ? "Yes" : "No",
    "eSign Provider":         integ.eSignProvider,
    "DigiLocker Enabled":     integ.digiLockerEnabled ? "Yes" : "No",
    "GSTIN Verification":     integ.gstinVerificationEnabled ? "Yes" : "No",
    "Aadhaar OTP":            integ.aadhaarOtpEnabled ? "Yes" : "No",
    "Online Payment Enabled": integ.onlinePaymentEnabled ? "Yes" : "No",
    "Payment Gateway Pref":   integ.paymentGatewayPreference,
    "Payment Gateway Details":integ.paymentGatewayDetails,
    "Custom Integrations":    (integ.customIntegrations ?? []).map((ci) => `${ci.name}: ${ci.endpoint}`).join(" | "),
  }]);

  // ── Overall Config ─────────────────────────────────────────────────────────
  addSheet(wb, "Overall Config", [{
    "Renewal Enabled":          overall.renewalEnabled ? "Yes" : "No",
    "Renewal Approval Mode":    overall.renewalApprovalMode,
    "Renewal Trigger (days)":   overall.renewalTriggerDays,
    "Renewal Grace (days)":     overall.renewalGracePeriodDays,
    "Category Levels":          overall.categoryLevels,
    "Category Level Labels":    (overall.categoryLevelLabels ?? []).join(", "),
    "License Validity Mode":    overall.licenseValidityMode,
    "License Validity (months)":overall.licenseValidityMonths,
    "Allow Past Years":         overall.allowPastYears ? "Yes" : "No",
    "Past Years Allowed":       overall.pastYearsAllowed,
    "Issuance ID Format":       overall.issuanceIdFormat,
    "Renewal ID Format":        overall.renewalIdFormat,
    "License ID Format":        overall.licenseIdFormat,
    "License ID = Application": overall.licenseIdSameAsApplication ? "Yes" : "No",
  }]);

  if (overall.categories?.length) {
    addSheet(wb, "Overall Categories", overall.categories.map((cat) => ({
      "Level 1": cat.level1,
      "Level 2": cat.level2,
      "Level 3": cat.level3,
    })));
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (notes?.trim()) {
    addSheet(wb, "Notes", [{ "Notes": notes }]);
  }

  const date = new Date().toISOString().slice(0, 10);
  const org = (a.organizationName || "config").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
  XLSX.writeFile(wb, `LnP_${org}_Config_${date}.xlsx`);
}
