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

  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 3, y + 5.5);
    doc.setTextColor(0, 0, 0);
    y += 12;
  };

  const addRow = (label: string, value: string) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "—", contentW - 50);
    doc.text(lines, margin + 55, y);
    y += 6 * lines.length + 2;
  };

  // Header
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Business License — Implementation Configuration", margin, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Status: ${config.metadata.status.toUpperCase()}`, margin, 22);
  doc.setTextColor(0, 0, 0);
  y = 38;

  // Account Profile
  addSection("1. Account Profile");
  addRow("Account Name", config.account.organizationName);
  addRow("Department", config.account.departmentName);
  addRow("Country", config.account.country);
  addRow("State / Province", config.account.stateProvince);
  addRow("Currency", `${config.account.currency} (${config.account.currencySymbol})`);
  addRow("Language", config.account.language);
  addRow("Mobile Prefix", config.account.mobilePrefix);
  addRow("Admin Email", config.account.adminEmail);
  addRow("Admin Phone", config.account.adminPhone ? `${config.account.mobilePrefix} ${config.account.adminPhone}` : "");
  addRow("Domain", config.account.domainSlug ? `www.digitcertificates.com/${config.account.domainSlug}` : "");

  // Branding
  addSection("2. Branding");
  addRow("Portal Name", config.branding.portalName);
  addRow("Tagline", config.branding.portalTagline);
  addRow("Primary Color", config.branding.primaryColor);
  addRow("Copyright", config.branding.copyrightText);

  // Deployment
  addSection("3. Deployment");
  addRow("Availability Scope", config.deployment.availabilityScope.replace("_", " "));
  config.deployment.areas.forEach((area, i) => {
    addRow(`Area ${i + 1}`, `${area.city} — Zones: ${area.zones.filter(Boolean).join(", ") || "—"}`);
  });

  // Form Config
  addSection("4. Application Form Configuration");
  addRow("Accepted ID Types", config.formConfig.idTypes.join(", "));
  addRow(
    "Trade Categories",
    config.formConfig.tradeCategories
      .map((c) => `${c.type}: ${c.subcategories.join(", ")}`)
      .join(" | ")
  );
  addRow(
    "Required Documents",
    config.formConfig.documents
      .filter((d) => d.required)
      .map((d) => d.name)
      .join(", ")
  );

  // Roles & Staff
  addSection("5. Roles & Staff Assignment");
  config.roles.forEach((role) => {
    addRow(role.name, role.staffEmails.length > 0 ? role.staffEmails.join(", ") : "No staff assigned yet");
  });

  // Fees
  addSection("6. Fee Configuration");
  const sym = config.fees.currencySymbol;
  addRow("Application Fee", `${sym}${config.fees.applicationFee}`);
  config.fees.inspectionFeeSlabs.forEach((slab) => {
    addRow(`Inspection (${slab.label})`, `${sym}${slab.amount}`);
  });
  addRow("Hazard Surcharge", `${sym}${config.fees.hazardSurcharge}`);
  addRow("License Fee Rate", `${sym}${config.fees.licenseFeeRatePerSqFt} per sq ft`);

  // Payments & Notifications
  addSection("7. Payments & Notifications");
  addRow("Payment Gateway", config.paymentsNotifications.paymentGateway === "custom"
    ? config.paymentsNotifications.customGatewayName
    : config.paymentsNotifications.paymentGateway);
  addRow("Counter Payments", config.paymentsNotifications.counterPaymentsEnabled ? "Enabled" : "Disabled");
  addRow("Admin Email", config.paymentsNotifications.adminEmail);
  const channels = Object.entries(config.paymentsNotifications.notificationChannels)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase())
    .join(", ");
  addRow("Notification Channels", channels || "None");

  // Footer on last page
  if (y < 260) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Business License Implementation Portal", margin, 287);
  }

  doc.save(`${config.account.organizationName || "business-license"}-config.pdf`);
}
