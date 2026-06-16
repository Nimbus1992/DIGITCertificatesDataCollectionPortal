import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { Application } from "./types";
import logoUrl from "@/assets/cape-town-logo.png";


const DAY = 86_400_000;

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadLicensePdf(app: Application) {
  const issuedAt = app.licenseIssuedAt ?? app.updatedAt;
  const expiresAt = issuedAt + 365 * DAY;
  const licenseNo = app.licenseNumber ?? `TL/PROV/${app.id}`;
  const verifyUrl = `https://employee.digitcertificates.online/verify/${encodeURIComponent(licenseNo)}`;

  const [logo, qr] = await Promise.all([
    urlToDataUrl(logoUrl).catch(() => null),
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 }),
  ]);


  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Header
  if (logo) doc.addImage(logo, "PNG", 40, 36, 60, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("City of Cape Town", 110, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Licenses & Permits — Business License", 110, 76);
  doc.setTextColor(0);

  // Divider
  doc.setDrawColor(200);
  doc.line(40, 110, W - 40, 110);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Business License", 40, 150);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110);
  doc.text(`License No. ${licenseNo}`, 40, 170);
  doc.setTextColor(0);

  // Validity block
  const fmt = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("VALIDITY", 40, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Issued: ${fmt(issuedAt)}`, 40, 228);
  doc.text(`Expires: ${fmt(expiresAt)}`, 40, 246);

  // Details
  const rows: [string, string][] = [
    ["Business Name", app.business?.name ?? "—"],
    ["Owner", app.applicantName],
    ["Address", app.business?.address ?? app.location?.line1 ?? "—"],
    ["Category", app.business?.category ?? app.business?.type ?? "—"],
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("LICENSE DETAILS", 40, 290);

  let y = 312;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(k.toUpperCase(), 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(v, W - 240);
    doc.text(lines, 40, y + 16);
    y += 16 + lines.length * 14 + 10;
  });

  // QR
  doc.addImage(qr, "PNG", W - 160, 200, 120, 120);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text("Scan to verify", W - 140, 332);
  doc.setTextColor(0);

  // Footer
  doc.setDrawColor(200);
  doc.line(40, 760, W - 40, 760);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text("This license is issued by the City of Cape Town under the Business Act. Display prominently at the licensed premises.", 40, 776);
  doc.text(`Verify: ${verifyUrl}`, 40, 790);

  doc.save(`license-${licenseNo.replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}
