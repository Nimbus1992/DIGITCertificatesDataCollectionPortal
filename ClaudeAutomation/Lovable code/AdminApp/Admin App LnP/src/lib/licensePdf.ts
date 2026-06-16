import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";
import { drawDashed, drawWrapped, finalizePageFooters, makePager } from "./pdfUtils";
import { drawHeaderLogo, hexToRgb, resolvePdfBranding } from "./pdfBranding";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function downloadLicensePdf(app: PreviewApplication, serviceName: string) {
  if (!app.license) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const branding = resolvePdfBranding();
  const [pr, pg, pb] = hexToRgb(branding.primaryColorHex);

  // Frame
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, W - 72, H - 72);

  const cx = W / 2;
  let y = 70;

  // Logo (centered)
  drawHeaderLogo(doc, branding, cx - 22, y - 10, 44, 44);
  y += 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(branding.portalName.toUpperCase(), cx, y, { align: "center", charSpace: 1.2, maxWidth: W - 120 });
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text("BUSINESS LICENSE CERTIFICATE", cx, y, { align: "center", charSpace: 1.2 });
  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(1.2);
  doc.line(cx - 28, y + 6, cx + 28, y + 6);
  y += 32;

  // License number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("LICENSE NO.", cx - 6, y, { align: "right", charSpace: 1 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text(app.license.number, cx + 6, y, { align: "left" });
  y += 22;

  drawDashed(doc, y, 60, W - 60);
  y += 18;

  // Details + QR
  const labelX = 70;
  const valueX = 170;
  const valueMaxW = W - valueX - 160;
  const rowH = 20;

  const rows: [string, string][] = [
    ["Applicant", app.formData.fullName || app.formData.f1 || "—"],
    ["Business", app.formData.businessName || app.formData.f5 || "—"],
    ["Type", app.formData.tradeType || app.formData.f6 || "—"],
    ["Application", serviceName],
  ];

  doc.setFontSize(10);
  let detailsY = y;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(k, labelX, detailsY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    const endY = drawWrapped(doc, String(v), valueX, detailsY, { maxWidth: valueMaxW, lineHeight: 14 });
    detailsY = Math.max(detailsY + rowH, endY + 4);
  });

  // QR placeholder
  const qrSize = 70;
  const qrX = W - 60 - qrSize;
  const qrY = y - 10;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.8);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setFillColor(40, 40, 40);
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if ((i * 7 + j) % 3 === 0) {
        doc.rect(qrX + 6 + i * 10, qrY + 6 + j * 10, 6, 6, "F");
      }
    }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 12, { align: "center" });

  y = Math.max(detailsY, qrY + qrSize + 28);
  drawDashed(doc, y, 60, W - 60);
  y += 18;

  // Validity
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Issued", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(fmtDate(app.license.issuedAt), valueX, y);
  y += rowH;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Valid Till", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 128, 61);
  doc.text(fmtDate(app.license.validTill), valueX, y);
  y += 24;

  drawDashed(doc, y, 60, W - 60);
  y += 36;

  // Signature
  const sigRight = W - 70;
  const sigW = 160;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.6);
  doc.line(sigRight - sigW, y, sigRight, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Issuing Authority", sigRight, y + 14, { align: "right" });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("(Signature)", sigRight, y + 28, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text("DIGITALLY GENERATED", sigRight, y + 42, { align: "right", charSpace: 1 });

  // Footer
  const fy = H - 70;
  drawDashed(doc, fy - 14, 60, W - 60);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This is a system-generated certificate.", cx, fy, { align: "center" });
  doc.text("No physical signature required.", cx, fy + 12, { align: "center" });

  // Page numbers (multi-page only kicks in if the cert ever spans pages)
  finalizePageFooters(doc);
  doc.save(`${app.license.number.replace(/\//g, "-")}.pdf`);
}

// Surface pager helper to satisfy import even when unused — keeps tree-shaking honest.
void makePager;
