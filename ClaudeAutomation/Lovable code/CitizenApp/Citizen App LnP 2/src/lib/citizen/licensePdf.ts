import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import logoUrl from "@/assets/cape-town-logo.png";
import type { CitizenApplication } from "@/context/ApplicationsContext";
import type { ServiceConfig } from "@/config/types";

const VERIFY_BASE = "https://www.vc.digitcertificates.online/verify/";

function fmtDate(ts: number | string | undefined): string {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function labelFor(service: ServiceConfig, fieldId: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  for (const step of service.form) {
    const f = step.fields.find((x) => x.id === fieldId);
    if (f?.options) {
      const o = f.options.find((o) => o.value === value);
      if (o) return o.label;
    }
  }
  return String(value);
}

async function loadImageDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function generateLicensePdf(service: ServiceConfig, app: CitizenApplication): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const TEAL = "#0e6e6c";
  const TEAL_DEEP = "#0a4f4d";
  const TEXT = "#101524";
  const MUTED = "#5c6478";
  const BORDER = "#d4dae4";

  // Outer border
  doc.setDrawColor(BORDER);
  doc.setLineWidth(1);
  doc.rect(24, 24, W - 48, H - 48);

  // Header band
  doc.setFillColor(TEAL);
  doc.rect(24, 24, W - 48, 96, "F");

  // Logo
  try {
    const logo = await loadImageDataUrl(logoUrl);
    doc.addImage(logo, "PNG", 40, 36, 72, 72);
  } catch {
    // skip logo if it fails to load
  }

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("CITY OF CAPE TOWN", 128, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BUSINESS LICENSE", 128, 86);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Official Licence Certificate", 128, 104);

  // License number banner
  const licenseNo = app.licenseNo ?? "—";
  doc.setFillColor("#f5f7fb");
  doc.rect(24, 120, W - 48, 36, "F");
  doc.setTextColor(MUTED);
  doc.setFontSize(9);
  doc.text("LICENCE NUMBER", 40, 138);
  doc.setTextColor(TEAL_DEEP);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(licenseNo, 40, 152);

  // QR code (top-right) — draw vector modules directly into the PDF for reliability
  const verifyUrl = `${VERIFY_BASE}${encodeURIComponent(licenseNo)}`;
  const qrSize = 110;
  const qrX = W - 40 - qrSize;
  const qrY = 170;
  doc.setFillColor("#ffffff");
  doc.rect(qrX, qrY, qrSize, qrSize, "F");
  try {
    const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: "M" });
    const modules = qr.modules;
    const moduleCount = modules.size;
    const cell = qrSize / moduleCount;
    doc.setFillColor("#000000");
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (modules.get(row, col)) {
          doc.rect(qrX + col * cell, qrY + row * cell, cell + 0.2, cell + 0.2, "F");
        }
      }
    }
  } catch (e) {
    console.error("QR generation failed:", e);
    doc.setDrawColor(BORDER);
    doc.rect(qrX, qrY, qrSize, qrSize);
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text("QR unavailable", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(MUTED);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 12, { align: "center" });

  // Body details (left column)
  const v = (app.values ?? {}) as Record<string, unknown>;
  const addressParts = [v.addressLine1, v.addressLine2, labelFor(service, "city", v.city), v.postalCode]
    .map((x) => (x ? String(x) : ""))
    .filter(Boolean);
  const address = addressParts.join(", ");

  const issueAt = app.updatedAt ?? Date.now();
  const expiryAt = new Date(issueAt);
  expiryAt.setFullYear(expiryAt.getFullYear() + 1);

  const rows: Array<[string, string]> = [
    ["Business Name", String(v.businessName ?? "—")],
    ["Owner / Applicant", String(v.fullName ?? app.applicantName ?? "—")],
    ["Business Address", address || "—"],
    ["Business Category", labelFor(service, "businessCategory", v.businessCategory)],
    ["Issue Date", fmtDate(issueAt)],
    ["Expiry Date", fmtDate(expiryAt.getTime())],
  ];

  let y = 200;
  const colWidth = W - 80 - qrSize - 24; // leave room for QR
  rows.forEach(([k, val]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(k.toUpperCase(), 40, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(TEXT);
    const wrapped = doc.splitTextToSize(val, colWidth);
    doc.text(wrapped, 40, y + 16);
    y += 16 + wrapped.length * 14 + 12;
  });

  // Separator
  doc.setDrawColor(BORDER);
  doc.line(40, H - 180, W - 40, H - 180);

  // Authorised signatory
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(TEXT);
  doc.text("Authorised Signatory", 40, H - 100);
  doc.setDrawColor("#101524");
  doc.line(40, H - 110, 220, H - 110);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("For: City of Cape Town — Business Licensing Office", 40, H - 86);

  // Footer right
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text(`Issued on ${fmtDate(issueAt)}`, W - 40, H - 100, { align: "right" });
  doc.text("This is an electronically generated document.", W - 40, H - 86, { align: "right" });

  doc.save(`business-license-${licenseNo}.pdf`);
}