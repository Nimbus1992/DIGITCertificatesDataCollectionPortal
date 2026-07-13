import type { ImplementationConfig } from "../types";

export function exportAsJson(config: ImplementationConfig): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${config.account.organizationName || "business-license"}-config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAsPdf(config: ImplementationConfig): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW  = 210;
  const margin = 20;
  const cW     = pageW - margin * 2;
  let y = 20;

  const checkPage = (needed = 10) => {
    if (y + needed > 275) { doc.addPage(); y = 20; }
  };

  const addSection = (title: string) => {
    checkPage(14);
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, cW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    y += 12;
  };

  const addSubSection = (title: string) => {
    checkPage(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(title.toUpperCase(), margin, y);
    doc.setTextColor(0, 0, 0);
    y += 5;
  };

  const addRow = (label: string, value: string) => {
    checkPage(8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "—", cW - 52);
    doc.text(lines, margin + 52, y);
    y += 6 * lines.length + 1;
  };

  const addBool = (label: string, value: boolean) => {
    addRow(label, value ? "Enabled" : "Disabled");
  };

  // Mini-table helper
  const addTable = (cols: string[], rows: string[][], colWidths?: number[]) => {
    if (!rows.length) return;
    checkPage(10);
    const widths = colWidths ?? cols.map(() => Math.floor(cW / cols.length));
    const rowH = 6;

    // Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, cW, rowH, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    let cx = margin;
    cols.forEach((col, i) => {
      doc.text(col, cx + 1, y + 4.5);
      cx += widths[i];
    });
    doc.setTextColor(0, 0, 0);
    y += rowH;

    rows.forEach((row, ri) => {
      checkPage(rowH + 2);
      if (ri % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, cW, rowH, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      cx = margin;
      row.forEach((cell, ci) => {
        const truncated = doc.splitTextToSize(String(cell ?? "—"), widths[ci] - 2)[0] as string;
        doc.text(truncated, cx + 1, y + 4.5);
        cx += widths[ci];
      });
      y += rowH;
    });
    y += 3;
  };

  const { account: a, branding: b, deployment: d, formConfig: f, roles, fees, paymentsNotifications: pn, integrations: integ, overall: oc, workflow: wf } = config;
  const sym = fees.currencySymbol || a.currencySymbol || "₹";

  // ── Header bar ───────────────────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageW, 30, "F");

  // Try to render logo
  if (b.logoUrl && b.logoUrl.startsWith("data:") && b.logoUrl.length > 50) {
    try {
      const imgFormat = b.logoUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(b.logoUrl, imgFormat, margin, 5, 20, 20);
    } catch {
      // logo render failed — skip silently
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Business License — Implementation Configuration", margin + (b.logoUrl?.startsWith("data:") ? 24 : 0), 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Organisation: ${a.organizationName || "—"}  |  Generated: ${new Date().toLocaleDateString()}  |  Status: ${config.metadata.status.toUpperCase()}`,
    margin + (b.logoUrl?.startsWith("data:") ? 24 : 0),
    20
  );
  doc.setTextColor(0, 0, 0);
  y = 38;

  // ── 1. Account Profile ───────────────────────────────────────────────────────
  addSection("1. Account Settings");
  addRow("Organisation Name", a.organizationName);
  addRow("Department",        a.departmentName);
  addRow("Country",           `${a.country}${a.stateProvince ? `, ${a.stateProvince}` : ""}`);
  addRow("Currency",          `${a.currency} (${sym})`);
  addRow("Language",          a.language);
  addRow("Date Format",       a.dateFormat);
  addRow("Financial Year Start", a.financialYearStart);
  addRow("Mobile Prefix",     a.mobilePrefix);
  addRow("Admin Email",       a.adminEmail);
  if (a.adminPhone) addRow("Admin Phone", `${a.mobilePrefix} ${a.adminPhone}`);
  if (a.domainSlug) addRow("Domain",     `www.digitcertificates.com/${a.domainSlug}`);

  // ── 2. Branding ──────────────────────────────────────────────────────────────
  addSection("2. Branding");
  addRow("Portal Name",   b.portalName);
  addRow("Tagline",       b.portalTagline);
  addRow("Primary Color", b.primaryColor);
  if (b.copyrightText) addRow("Copyright", b.copyrightText);

  // ── 3. Boundary ──────────────────────────────────────────────────────────────
  addSection("3. Boundary");
  addRow("Hierarchy Name",    d.hierarchyName || "—");
  addRow("Hierarchy Levels",
    d.hierarchyLevels.map((l, i) => `L${i + 1}: ${l.name}`).join(", ") || "—");
  if (d.shapefileName) addRow("Shapefile", d.shapefileName);
  if (d.boundaryRows.length > 0) addRow("Boundary Rows", `${d.boundaryRows.length} rows loaded`);

  // ── 4. Integrations ──────────────────────────────────────────────────────────
  addSection("4. Integrations");
  addSubSection("Always-On Platform Services");
  addRow("Messaging & Notifications", "Enabled via mSeva (Email, SMS, Push)");
  addRow("Verifiable Credentials",    "Enabled via DIVOC");

  addSubSection("Configured");
  addBool("eSign",              integ.eSignEnabled);
  if (integ.eSignEnabled && integ.eSignProvider) addRow("eSign Provider", integ.eSignProvider);
  addBool("DigiLocker",         integ.digiLockerEnabled);
  addBool("GSTIN Verification", integ.gstinVerificationEnabled);
  addBool("Aadhaar OTP",        integ.aadhaarOtpEnabled);
  addBool("Online Payment",     integ.onlinePaymentEnabled);
  if (integ.onlinePaymentEnabled && integ.paymentGatewayDetails) {
    addRow("Gateway Details", integ.paymentGatewayDetails);
  }
  if (integ.customIntegrations.length > 0) {
    addSubSection("Custom Integrations");
    addTable(
      ["Name", "Endpoint"],
      integ.customIntegrations.map((ci) => [ci.name, ci.endpoint])
    );
  }

  // ── 5. Overall Configuration ─────────────────────────────────────────────────
  addSection("5. Overall Configuration");
  addSubSection("License Validity");
  addRow("Validity Mode",     oc.licenseValidityMode === "fixed" ? "Fixed duration" : "Financial year");
  if (oc.licenseValidityMode === "fixed")
    addRow("Duration",        `${oc.licenseValidityMonths} month${oc.licenseValidityMonths !== 1 ? "s" : ""}`);
  addBool("Allow Past Years", oc.allowPastYears);
  if (oc.allowPastYears) addRow("Past Years Allowed", String(oc.pastYearsAllowed));

  addSubSection("ID Formats");
  addRow("Issuance ID",   oc.issuanceIdFormat);
  addRow("Renewal ID",    oc.renewalIdFormat);
  if (!oc.licenseIdSameAsApplication) addRow("License ID", oc.licenseIdFormat);

  addSubSection("Renewal Settings");
  addBool("Renewal Enabled", oc.renewalEnabled);
  if (oc.renewalEnabled) {
    const modeLabel =
      oc.renewalApprovalMode === "auto_all"
        ? "Auto-approve all"
        : oc.renewalApprovalMode === "auto_if_unchanged"
        ? "Auto-approve if no changes"
        : "Always run full workflow";
    addRow("Approval Mode",          modeLabel);
    addRow("Trigger Before Expiry",  `${oc.renewalTriggerDays} days`);
    addRow("Grace Period",           `${oc.renewalGracePeriodDays} days`);
  }

  addSubSection("Category Hierarchy");
  addRow("Levels",       String(oc.categoryLevels));
  addRow("Level Labels", oc.categoryLevelLabels.slice(0, oc.categoryLevels).join(" › "));

  const visibleLevels = oc.categoryLevels ?? 2;
  const seen = new Set<string>();
  const uniqueCategories = oc.categories.filter((c) => {
    const key = [c.level1, c.level2, c.level3].slice(0, visibleLevels).map((v) => v.trim().toLowerCase()).join("\0");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueCategories.length > 0) {
    addTable(
      oc.categoryLevelLabels.slice(0, visibleLevels),
      uniqueCategories.map((c) => [c.level1, c.level2, c.level3].slice(0, visibleLevels))
    );
  }

  // ── 6. Application Form ──────────────────────────────────────────────────────
  addSection("6. Application Form");
  addRow("Accepted ID Types",    f.idTypes.join(", ") || "—");
  addBool("Declaration OTP (Mobile)", f.declarationMobileOtpEnabled);

  if (f.documents.length > 0) {
    addSubSection("Documents");
    addTable(
      ["Document", "Required", "Formats"],
      f.documents.map((docItem) => [docItem.name, docItem.required ? "Yes" : "No", docItem.formats.join(", ")])
    );
  }

  if (f.customFields.length > 0) {
    addSubSection("Custom Fields");
    addTable(
      ["Field", "Section", "Type", "Required"],
      f.customFields.map((cf) => [cf.name, cf.subsectionName || cf.sectionId, cf.fieldType, cf.mandatory ? "Yes" : "No"])
    );
  }

  // ── 7. Roles & Staff ─────────────────────────────────────────────────────────
  addSection("7. Roles & Staff");
  roles.forEach((role) => {
    const members = role.staffMembers ?? [];
    const emails  = role.staffEmails ?? [];
    if (role.id === "citizen") {
      addRow(role.name, "Public (self-registration)");
    } else if (members.length > 0) {
      addRow(role.name, members.map((m) => `${m.name} (${m.email})`).join(", "));
    } else if (emails.length > 0) {
      addRow(role.name, emails.join(", "));
    } else {
      addRow(role.name, "No staff assigned");
    }
  });

  // ── 8. Fees ──────────────────────────────────────────────────────────────────
  addSection("8. Fee Configuration");
  addRow("Currency", `${fees.currency} (${sym})`);

  addSubSection("Application Fee");
  addRow("Fee Mode", fees.feeMode === "flat" ? "Flat" : "Custom logic");
  if (fees.feeMode === "flat") {
    addRow("Amount", `${sym}${(fees.flatFeeAmount ?? 0).toLocaleString()}`);
  } else {
    addRow("Fee Fields", fees.customFeeFields.join(", ") || "—");
    if (fees.customFeeTable.length > 0) {
      const cols = Object.keys(fees.customFeeTable[0]);
      addTable(cols, fees.customFeeTable.map((row) => cols.map((c) => String(row[c] ?? ""))));
    }
  }
  if (fees.additionalFeeComponents.length > 0) {
    addTable(
      ["Label", "Type", "Value"],
      fees.additionalFeeComponents.map((ac) => [ac.label, ac.type, ac.type === "percentage" ? `${ac.value}%` : `${sym}${ac.value}`])
    );
  }

  if (oc.renewalEnabled) {
    addSubSection("Renewal Fee");
    addRow("Fee Mode", fees.renewalFeeMode === "flat" ? "Flat" : "Custom logic");
    if (fees.renewalFeeMode === "flat") {
      addRow("Amount", `${sym}${(fees.renewalFlatFeeAmount ?? 0).toLocaleString()}`);
    } else {
      addRow("Fee Fields", fees.renewalCustomFeeFields.join(", ") || "—");
    }
    if (fees.renewalAdditionalFeeComponents.length > 0) {
      addTable(
        ["Label", "Type", "Value"],
        fees.renewalAdditionalFeeComponents.map((ac) => [ac.label, ac.type, ac.type === "percentage" ? `${ac.value}%` : `${sym}${ac.value}`])
      );
    }
  }

  // ── 9. Workflow ──────────────────────────────────────────────────────────────
  addSection("9. Workflow");
  addSubSection("Issuance Stages");
  if (wf.stages.length > 0) {
    addTable(
      ["Stage", "Actor", "Actions", "SLA (hrs)"],
      wf.stages.map((s) => [
        s.name + (s.isStart ? " [Start]" : s.isEnd ? " [End]" : ""),
        s.actor,
        s.actions.map((ac) => ac.label).join(", ") || "—",
        s.slaHours === 0 ? "—" : String(s.slaHours),
      ])
    );
  }

  const checklists = wf.checklists ?? [];
  if (checklists.length > 0) {
    addSubSection("Checklists");
    checklists.forEach((cl) => {
      const stage = wf.stages.find((s) => s.id === cl.stageId);
      checkPage(8);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${cl.name}${stage ? ` (${stage.name})` : ""}`, margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      cl.questions.forEach((q, qi) => {
        checkPage(5);
        doc.text(`  ${qi + 1}. ${q.label} [${q.fieldType}]${q.required ? " *" : ""}`, margin, y);
        y += 4;
      });
      y += 2;
    });
  } else if (wf.checklistItems.length > 0) {
    addSubSection("Checklist Items");
    addTable(
      ["Stage", "Item", "Type", "Required"],
      wf.checklistItems.map((ci) => {
        const stage = wf.stages.find((s) => s.id === ci.stageId);
        return [stage?.name ?? ci.stageId, ci.label, ci.fieldType, ci.required ? "Yes" : "No"];
      })
    );
  }

  if (oc.renewalEnabled && (wf.renewalStages ?? []).length > 0) {
    addSubSection("Renewal Stages");
    addTable(
      ["Stage", "Actor", "Actions", "SLA (hrs)"],
      (wf.renewalStages ?? []).map((s) => [
        s.name,
        s.actor,
        s.actions.map((ac) => ac.label).join(", ") || "—",
        s.slaHours === 0 ? "—" : String(s.slaHours),
      ])
    );
  }

  // ── 10. Notifications ────────────────────────────────────────────────────────
  addSection("10. Notifications");
  addRow("Payment Gateway",
    pn.paymentGateway === "custom" ? pn.customGatewayName : pn.paymentGateway);
  addBool("Counter Payments", pn.counterPaymentsEnabled);
  if (pn.adminEmail) addRow("Admin Email", pn.adminEmail);
  if (pn.smsSenderId) addRow("SMS Sender ID", pn.smsSenderId);
  const channels = Object.entries(pn.notificationChannels)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase())
    .join(", ");
  addRow("Notification Channels", channels || "None");

  if (pn.notificationTemplates.length > 0) {
    addSubSection("Notification Templates");
    addTable(
      ["Event", "Channel", "Recipient", "Subject"],
      pn.notificationTemplates.map((t) => [t.event, t.channel.toUpperCase(), t.recipient, t.subject])
    );
  }

  // Workflow notifications
  const wfNotifs = wf.stages.flatMap((stage) =>
    stage.notifications.map((n) => [stage.name, n.channel.toUpperCase(), n.recipient, n.subject])
  );
  if (wfNotifs.length > 0) {
    addSubSection("Workflow Notifications");
    addTable(
      ["Stage", "Channel", "Recipient", "Message"],
      wfNotifs
    );
  }

  // Footer
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `Generated by Business License Implementation Portal  |  Page ${i} of ${totalPages}`,
      margin,
      290
    );
  }

  doc.save(`${config.account.organizationName || "business-license"}-config.pdf`);
}
