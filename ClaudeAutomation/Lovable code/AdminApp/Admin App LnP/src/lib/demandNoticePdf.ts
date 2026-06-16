import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";
import { drawDashed, drawWrapped, finalizePageFooters, makePager } from "./pdfUtils";
import { drawHeaderLogo, hexToRgb, resolvePdfBranding } from "./pdfBranding";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function downloadDemandNoticePdf(app: PreviewApplication, serviceName: string) {
  if (!app.demand) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const branding = resolvePdfBranding();
  const [pr, pg, pb] = hexToRgb(branding.primaryColorHex);

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, W - 72, H - 72);

  const cx = W / 2;
  const drawTopChrome = (pager: { y: number }) => {
    let y = 70;
    drawHeaderLogo(doc, branding, cx - 22, y - 10, 44, 44);
    y += 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(branding.portalName.toUpperCase(), cx, y, { align: "center", charSpace: 1.2, maxWidth: W - 120 });
    y += 22;
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text("DEMAND NOTICE / FEE BILL", cx, y, { align: "center", charSpace: 1.2 });
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(1.2);
    doc.line(cx - 28, y + 6, cx + 28, y + 6);
    y += 26;
    pager.y = y;
  };

  const pager = makePager(doc, { marginTop: 60, marginBottom: 80, onNewPage: (_, p) => drawTopChrome(p) });
  drawTopChrome(pager);

  // Application reference (2-column)
  const labelLX = 70;
  const valueLX = 170;
  const labelRX = W / 2 + 10;
  const valueRX = W / 2 + 110;
  const colMaxW = (W / 2) - 110;

  const twoCol = (l: [string, string], r: [string, string] | null) => {
    pager.ensureSpace(22);
    const rowY = pager.y;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(l[0], labelLX, rowY);
    if (r) doc.text(r[0], labelRX, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    const ly = drawWrapped(doc, l[1], valueLX, rowY, { maxWidth: colMaxW, lineHeight: 14 });
    const ry = r ? drawWrapped(doc, r[1], valueRX, rowY, { maxWidth: colMaxW, lineHeight: 14 }) : rowY;
    pager.y = Math.max(ly, ry) + 4;
  };

  twoCol(
    ["Application ID", app.applicationNumber],
    ["Applicant", app.formData.fullName || app.formData.f1 || "—"],
  );
  twoCol(
    ["Issued On", fmtDate(app.demand.generatedAt)],
    ["Business", app.formData.businessName || app.formData.f5 || "—"],
  );
  twoCol(["Application", serviceName], null);
  pager.y += 6;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 18;

  // Fee table
  const itemX = 70;
  const amtX = W - 70;

  pager.ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("ITEM", itemX, pager.y, { charSpace: 1 });
  doc.text("AMOUNT", amtX, pager.y, { align: "right", charSpace: 1 });
  pager.y += 8;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 14;

  const rupee = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  const lines = app.demand.lines && app.demand.lines.length > 0
    ? app.demand.lines.map((l) => [l.name, rupee(l.amount)] as [string, string])
    : [
        ["Base Fee", rupee(app.demand.fee)],
        ["Tax / GST", rupee(app.demand.tax)],
      ] as [string, string][];

  doc.setFontSize(10);
  lines.forEach(([k, v]) => {
    pager.ensureSpace(18);
    const rowY = pager.y;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const ly = drawWrapped(doc, k, itemX, rowY, { maxWidth: W - itemX - 120, lineHeight: 14 });
    doc.text(v, amtX, rowY, { align: "right" });
    pager.y = Math.max(ly, rowY + 14) + 2;
  });

  pager.y += 4;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 22;

  pager.ensureSpace(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("TOTAL AMOUNT PAYABLE", itemX, pager.y, { charSpace: 1 });
  doc.setFontSize(14);
  doc.text(rupee(app.demand.total), amtX, pager.y, { align: "right" });
  pager.y += 14;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 24;

  pager.ensureSpace(20);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Please complete payment to proceed with license issuance.", cx, pager.y, { align: "center" });

  finalizePageFooters(doc, `Generated ${fmtDate(Date.now())}`);
  doc.save(`demand-notice-${app.applicationNumber}.pdf`);
}
