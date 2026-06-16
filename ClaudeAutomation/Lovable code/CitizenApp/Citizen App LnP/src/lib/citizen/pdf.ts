import type { CitizenApplication } from "@/context/ApplicationsContext";
import type { ServiceConfig } from "@/config/types";
import { openSampleDocument } from "@/components/citizen/DocumentViewer";
import { generateLicensePdf } from "@/lib/citizen/licensePdf";

const SAMPLES = {
  demand: "/samples/demand-notice.pdf",
  receipt: "/samples/payment-invoice.pdf",
  certificate: "/samples/certificate.pdf",
  summary: "/samples/application-summary.pdf",
} as const;

function triggerDownload(src: string, filename: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Demand Notice
export async function viewInvoice(service: ServiceConfig, app: CitizenApplication) {
  openSampleDocument({ type: "demand", app, service, downloadSrc: SAMPLES.demand, downloadFilename: "demand-notice.pdf" });
}
export async function downloadInvoice(_service: ServiceConfig, _app: CitizenApplication) {
  triggerDownload(SAMPLES.demand, "demand-notice.pdf");
}

// Certificate
export async function viewCertificate(service: ServiceConfig, app: CitizenApplication) {
  openSampleDocument({ type: "certificate", app, service, downloadSrc: SAMPLES.certificate, downloadFilename: "business-licence-certificate.pdf" });
}
export async function downloadCertificate(service: ServiceConfig, app: CitizenApplication) {
  await generateLicensePdf(service, app);
}

// Receipt / Payment Invoice
export async function viewReceipt(service: ServiceConfig, app: CitizenApplication) {
  openSampleDocument({ type: "receipt", app, service, downloadSrc: SAMPLES.receipt, downloadFilename: "payment-invoice.pdf" });
}
export async function downloadReceipt(_service: ServiceConfig, _app: CitizenApplication) {
  triggerDownload(SAMPLES.receipt, "payment-invoice.pdf");
}

// Application Summary
export async function viewApplicationSummary(
  service: ServiceConfig,
  app: CitizenApplication,
  _opts: { includeDocsList?: boolean } = {}
) {
  openSampleDocument({ type: "summary", app, service, downloadSrc: SAMPLES.summary, downloadFilename: "application-summary.pdf" });
}
export async function downloadApplicationSummary(
  _service: ServiceConfig,
  _app: CitizenApplication,
  _opts: { includeDocsList?: boolean } = {}
) {
  triggerDownload(SAMPLES.summary, "application-summary.pdf");
}