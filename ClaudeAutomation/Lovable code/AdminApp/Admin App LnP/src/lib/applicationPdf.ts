import { jsPDF } from "jspdf";
import type { PreviewApplication, FormSectionConfig, WorkflowStateConfig } from "@/components/preview/PreviewContext";
import { makePager, drawWrapped, finalizePageFooters } from "./pdfUtils";
import { resolvePdfBranding, drawHeaderLogo, hexToRgb } from "./pdfBranding";

const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

interface DownloadOptions {
  includeDocuments?: boolean;
  includeChecklists?: boolean;
}

export function downloadApplicationPdf(
  app: PreviewApplication,
  serviceName: string,
  formSections: FormSectionConfig[],
  workflowStates: WorkflowStateConfig[],
  options: DownloadOptions = {}
) {
  const { includeDocuments = false, includeChecklists = false } = options;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  const branding = resolvePdfBranding();
  const [pr, pg, pb] = hexToRgb(branding.primaryColorHex);

  const drawHeader = () => {
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, W, 70, "F");
    drawHeaderLogo(doc, branding, M, 14, 42, 42);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`${serviceName} — Application`, M + 54, 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(app.applicationNumber, M + 54, 50);
    doc.text(`Status: ${app.status}`, W - M, 50, { align: "right" });
    doc.setTextColor(20, 20, 20);
  };

  const pager = makePager(doc, {
    marginTop: 90,
    marginBottom: 60,
    onNewPage: () => drawHeader(),
  });
  drawHeader();

  // ── Quick info ───────────────────────────────────────
  const meta: [string, string][] = [
    ["Type", app.type === "RENEWAL" ? "Renewal" : "New Application"],
    ["Submitted", fmtDateTime(app.createdAt)],
  ];
  if (app.demand) meta.push(["Total Fee", `Rs. ${app.demand.total.toLocaleString()}`]);
  if (app.paymentStatus) meta.push(["Payment", app.paymentStatus === "paid" ? "Paid" : "Pending"]);
  if (app.license) meta.push(["License No.", app.license.number]);

  doc.setFontSize(10);
  meta.forEach(([k, v]) => {
    pager.ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.text(k, M, pager.y);
    doc.setFont("helvetica", "normal");
    drawWrapped(doc, String(v), M + 110, pager.y, { maxWidth: W - M - 110, lineHeight: 14, pager });
    // Trailing micro-gap between rows
    pager.y += 4;
  });
  pager.y += 4;

  const sectionHeader = (label: string) => {
    pager.ensureSpace(30);
    doc.setFillColor(240, 248, 250);
    doc.rect(M, pager.y - 12, W - M * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(11);
    doc.text(label.toUpperCase(), M + 8, pager.y + 3);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(10);
    pager.y += 22;
  };

  // ── Form sections ────────────────────────────────────
  formSections.forEach((section) => {
    const fields = section.fields.filter((f) => app.formData[f.id]);
    if (fields.length === 0) return;
    sectionHeader(section.name);
    fields.forEach((f) => {
      pager.ensureSpace(16);
      const rowStartY = pager.y;
      doc.setFont("helvetica", "bold");
      doc.text(f.label, M + 8, rowStartY, { maxWidth: 160 });
      doc.setFont("helvetica", "normal");
      drawWrapped(doc, String(app.formData[f.id]), M + 180, rowStartY, {
        maxWidth: W - M - 200, lineHeight: 14, pager,
      });
      pager.y += 4;
    });
    pager.y += 6;
  });

  // ── Documents ────────────────────────────────────────
  if (includeDocuments && app.documents.length > 0) {
    sectionHeader("Documents");
    pager.ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.text("Type", M + 8, pager.y);
    doc.text("File", M + 160, pager.y);
    doc.text("Status", W - M - 80, pager.y);
    pager.y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(M, pager.y, W - M, pager.y);
    pager.y += 12;
    doc.setFont("helvetica", "normal");

    app.documents.forEach((d) => {
      pager.ensureSpace(16);
      const rowY = pager.y;
      drawWrapped(doc, d.type, M + 8, rowY, { maxWidth: 140, lineHeight: 14 });
      drawWrapped(doc, d.name, M + 160, rowY, { maxWidth: 200, lineHeight: 14 });
      doc.text(d.status + (d.reused ? " (Reused)" : ""), W - M - 80, rowY);
      // Advance based on the tallest column
      const lines = Math.max(
        (doc.splitTextToSize(d.type, 140) as string[]).length,
        (doc.splitTextToSize(d.name, 200) as string[]).length,
        1,
      );
      pager.y = rowY + lines * 14 + 2;
    });
    pager.y += 10;
  }

  // ── Checklists ───────────────────────────────────────
  if (includeChecklists && Object.keys(app.checklists).length > 0) {
    sectionHeader("Checklists");
    Object.entries(app.checklists).forEach(([stateId, items]) => {
      const stateName = workflowStates.find((s) => s.id === stateId)?.name ?? stateId;
      pager.ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.text(stateName, M + 8, pager.y);
      pager.y += 14;
      doc.setFont("helvetica", "normal");
      items.forEach((it) => {
        drawWrapped(doc, `${it.checked ? "[x]" : "[ ]"}  ${it.text}`, M + 16, pager.y, {
          maxWidth: W - M - 24, lineHeight: 14, pager,
        });
        pager.y += 2;
      });
      pager.y += 6;
    });
  }

  // ── Timeline ─────────────────────────────────────────
  if (app.timeline.length > 0) {
    sectionHeader("Timeline");
    app.timeline.forEach((t) => {
      pager.ensureSpace(18);
      const rowY = pager.y;
      doc.setFont("helvetica", "bold");
      doc.text(t.state, M + 8, rowY, { maxWidth: 160 });
      doc.setFont("helvetica", "normal");
      drawWrapped(doc, `${t.actor} • ${fmtDateTime(t.at)}`, M + 180, rowY, {
        maxWidth: W - M - 200, lineHeight: 14, pager,
      });
      pager.y += 2;
      if (t.note) {
        doc.setTextColor(110, 110, 110);
        drawWrapped(doc, t.note, M + 16, pager.y, {
          maxWidth: W - M - 24, lineHeight: 14, pager,
        });
        doc.setTextColor(20, 20, 20);
        pager.y += 2;
      }
    });
  }

  finalizePageFooters(doc, `Generated ${fmtDateTime(Date.now())}`);
  doc.save(`${app.applicationNumber}.pdf`);
}
