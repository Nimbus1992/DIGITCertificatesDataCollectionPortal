import { jsPDF } from "jspdf";
import type { PreviewApplication } from "@/components/preview/PreviewContext";
import { drawDashed, drawWrapped, finalizePageFooters, makePager } from "./pdfUtils";
import { drawHeaderLogo, hexToRgb, resolvePdfBranding } from "./pdfBranding";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function downloadInvoicePdf(app: PreviewApplication, serviceName: string) {
  if (!app.paymentDetails || !app.demand) return;
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
    doc.text("PAYMENT INVOICE", cx, y, { align: "center", charSpace: 1.2 });
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(1.2);
    doc.line(cx - 28, y + 6, cx + 28, y + 6);
    y += 26;
    pager.y = y;
  };

  const pager = makePager(doc, { marginTop: 60, marginBottom: 80, onNewPage: (_, p) => drawTopChrome(p) });
  drawTopChrome(pager);

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

  twoCol(["Invoice No", app.paymentDetails.invoiceNumber || "—"], ["Payment Date", fmtDate(app.paymentDetails.paidAt)]);
  twoCol(["Transaction ID", app.paymentDetails.txnId], ["Mode", "Online (Mock)"]);
  pager.y += 4;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 18;

  twoCol(
    ["Application ID", app.applicationNumber],
    ["Applicant", app.formData.fullName || app.formData.f1 || "—"],
  );
  twoCol(
    ["Application", serviceName],
    ["Business", app.formData.businessName || app.formData.f5 || "—"],
  );
  pager.y += 4;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 18;

  // Payment table
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
    pager.ensureSpace(16);
    const rowY = pager.y;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const ly = drawWrapped(doc, k, itemX, rowY, { maxWidth: W - itemX - 120, lineHeight: 14 });
    doc.text(v, amtX, rowY, { align: "right" });
    pager.y = Math.max(ly, rowY + 14) + 2;
  });

  pager.ensureSpace(24);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Paid", itemX, pager.y);
  doc.text(rupee(app.paymentDetails.amount), amtX, pager.y, { align: "right" });
  pager.y += 18;
  drawDashed(doc, pager.y, 60, W - 60);
  pager.y += 26;

  pager.ensureSpace(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(21, 128, 61);
  doc.text("PAYMENT SUCCESSFUL", cx, pager.y, { align: "center", charSpace: 1.5 });

  finalizePageFooters(doc, `Generated ${fmtDateTime(Date.now())}`);
  doc.save(`invoice-${app.paymentDetails.invoiceNumber || app.applicationNumber}.pdf`);
}
