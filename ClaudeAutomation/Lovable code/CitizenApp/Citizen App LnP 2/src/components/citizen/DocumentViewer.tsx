import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Download } from "lucide-react";
import logo from "@/assets/cape-town-logo.png";
import type { CitizenApplication } from "@/context/ApplicationsContext";
import type { ServiceConfig } from "@/config/types";
import { computeDemandForStage } from "@/lib/citizen/fees";
import { getState, statusLabel } from "@/lib/citizen/workflow";

export type DocType = "demand" | "receipt" | "certificate" | "summary";

export type DocumentRequest = {
  type: DocType;
  app: CitizenApplication;
  service: ServiceConfig;
  downloadSrc?: string;
  downloadFilename?: string;
};

type Ctx = { openDocument: (req: DocumentRequest) => void };
const DocCtx = createContext<Ctx | null>(null);

export function useDocumentViewer(): Ctx {
  const c = useContext(DocCtx);
  if (!c) throw new Error("useDocumentViewer must be used inside DocumentViewerProvider");
  return c;
}

// Module bridge so non-React helpers (pdf.ts) can call into the viewer.
let bridge: ((req: DocumentRequest) => void) | null = null;
export function openSampleDocument(req: DocumentRequest) {
  if (bridge) bridge(req);
}

const DOC_TITLES: Record<DocType, string> = {
  demand: "Demand Notice",
  receipt: "Payment Invoice",
  certificate: "Business Licence Certificate",
  summary: "Application Summary",
};

function fmtZAR(n: number): string {
  return `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(ts: number | string | undefined): string {
  if (!ts) return "—";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function triggerDownload(src: string, filename: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function DocumentViewerProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<DocumentRequest | null>(null);
  const open = useCallback((r: DocumentRequest) => setReq(r), []);
  if (bridge !== open) bridge = open;
  const close = useCallback(() => setReq(null), []);

  // Esc closes; lock body scroll while open
  useEffect(() => {
    if (!req) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [req, close]);

  return (
    <DocCtx.Provider value={{ openDocument: open }}>
      {children}
      {req && <ViewerOverlay req={req} onClose={close} />}
    </DocCtx.Provider>
  );
}

function ViewerOverlay({ req, onClose }: { req: DocumentRequest; onClose: () => void }) {
  const title = DOC_TITLES[req.type];
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-surface-muted shadow-2xl sm:h-[90vh] sm:max-h-[860px] sm:w-[420px] sm:rounded-2xl">
        {/* Brand bar */}
        <header className="flex items-center gap-2 bg-brand-teal px-4 pt-3 pb-3 text-brand-teal-foreground">
          <img src={logo} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-full bg-white/15 p-0.5" />
          <span className="text-base font-semibold">City of Cape Town</span>
        </header>
        {/* Back bar */}
        <div className="flex items-center justify-between bg-card px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-teal-deep"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {req.downloadSrc && (
            <button
              type="button"
              onClick={() => triggerDownload(req.downloadSrc!, req.downloadFilename ?? "document.pdf")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          )}
        </div>
        {/* Scrollable document */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <DocHeader title={title} />
            <DocBody req={req} />
            <DocFooter />
          </article>
        </div>
      </div>
    </div>
  );
}

function DocHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={logo} alt="City of Cape Town" width={64} height={64} loading="lazy" className="h-16 w-16" />
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
        City of Cape Town
      </div>
      <div className="text-xs text-muted-foreground">Citizen Services</div>
      <div className="mt-4 text-base font-bold uppercase tracking-[0.18em] text-foreground">{title}</div>
      <div className="mt-1.5 h-[2px] w-16 bg-brand-teal" />
    </div>
  );
}

function DocFooter() {
  return (
    <p className="mt-6 border-t border-dashed border-border pt-3 text-center text-[10px] text-muted-foreground">
      This is a system-generated document from the City of Cape Town · Citizen Services.
    </p>
  );
}

function MetaGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-sm">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 font-semibold text-foreground break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ItemTable({ items, total }: { items: Array<{ label: string; amount: number }>; total: number }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <span>Item</span>
        <span>Amount</span>
      </div>
      {items.map((it) => (
        <div key={it.label} className="flex justify-between border-b border-border/60 py-2.5 text-sm">
          <span className="text-foreground">{it.label}</span>
          <span className="font-semibold tabular-nums text-foreground">{fmtZAR(it.amount)}</span>
        </div>
      ))}
      <div className="mt-3 flex justify-between rounded-md bg-surface-muted px-3 py-2.5">
        <span className="text-sm font-bold uppercase tracking-wide text-foreground">Total</span>
        <span className="text-base font-bold tabular-nums text-brand-teal">{fmtZAR(total)}</span>
      </div>
    </div>
  );
}

function DocBody({ req }: { req: DocumentRequest }) {
  switch (req.type) {
    case "demand":
      return <DemandNoticeDoc app={req.app} service={req.service} />;
    case "receipt":
      return <PaymentInvoiceDoc app={req.app} service={req.service} />;
    case "certificate":
      return <CertificateDoc app={req.app} service={req.service} />;
    case "summary":
      return <ApplicationSummaryDoc app={req.app} service={req.service} />;
  }
}

/* ---------------- Templates ---------------- */

function applicantName(app: CitizenApplication): string {
  return (app.values?.fullName as string) || app.applicantName || "—";
}
function businessName(app: CitizenApplication): string {
  return (app.values?.businessName as string) || "—";
}
function businessAddress(app: CitizenApplication): string {
  const v = app.values ?? {};
  return [v.addressLine1, v.addressLine2, v.city, v.postalCode]
    .filter((x) => x && String(x).trim().length)
    .join(", ") || "—";
}

function DemandNoticeDoc({ app, service }: { app: CitizenApplication; service: ServiceConfig }) {
  // Use fee for current stage if any, otherwise the first stage with fees.
  const stageId = app.currentStateId;
  const demand =
    computeDemandForStage(service, stageId, app.values) ??
    (service.fees[0] ? computeDemandForStage(service, service.fees[0].stageId, app.values) : null);
  const items = demand?.items.map(({ label, amount }) => ({ label, amount })) ?? [];
  const total = demand?.total ?? 0;
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  return (
    <>
      <MetaGrid
        rows={[
          ["Notice No", `DN/${app.id.slice(-6)}`],
          ["Issue Date", fmtDate(Date.now())],
          ["Application ID", app.id],
          ["Due By", fmtDate(due.getTime())],
          ["Applicant", applicantName(app)],
          ["Business", businessName(app)],
          ["Service", service.name],
          ["Stage", getState(service, stageId)?.label ?? "—"],
        ]}
      />
      <ItemTable items={items} total={total} />
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Please settle the amount above by the due date to proceed with the issuance of your licence.
        Payments can be made online via the Citizen Services portal.
      </p>
    </>
  );
}

function PaymentInvoiceDoc({ app, service }: { app: CitizenApplication; service: ServiceConfig }) {
  const payment = app.payments[app.payments.length - 1];
  const paidAt = payment?.paidAt ?? Date.now();
  const amount = payment?.amount ?? 0;
  const receiptId = payment?.receiptId ?? `RCPT-${Date.now()}`;
  const txnId = `TXN${String(paidAt).slice(-8)}`;
  return (
    <>
      <MetaGrid
        rows={[
          ["Invoice No", `INV/${app.id.slice(-6)}`],
          ["Payment Date", fmtDate(paidAt)],
          ["Transaction ID", txnId],
          ["Mode", "Online (Mock)"],
          ["Receipt No", receiptId],
          ["Application ID", app.id],
          ["Applicant", applicantName(app)],
          ["Business", businessName(app)],
        ]}
      />
      <ItemTable
        items={[
          { label: `${service.name} — Fee`, amount },
        ]}
        total={amount}
      />
      <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
        Payment received. Thank you.
      </div>
    </>
  );
}

function CertificateDoc({ app, service }: { app: CitizenApplication; service: ServiceConfig }) {
  const issuedEntry = [...app.history].reverse().find((h) => getState(service, h.stateId)?.endStatus === "issued");
  const issuedAt = issuedEntry?.at ?? app.updatedAt;
  const validUntil = new Date(issuedAt);
  validUntil.setFullYear(validUntil.getFullYear() + 1);
  return (
    <>
      <MetaGrid
        rows={[
          ["Licence No", app.licenseNo ?? "—"],
          ["Issue Date", fmtDate(issuedAt)],
          ["Valid Until", fmtDate(validUntil.getTime())],
          ["Application ID", app.id],
          ["Holder", applicantName(app)],
          ["Business", businessName(app)],
        ]}
      />
      <div className="mt-5 space-y-2 text-sm">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Business Address</div>
          <div className="font-semibold text-foreground">{businessAddress(app)}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Service</div>
          <div className="font-semibold text-foreground">{service.name}</div>
        </div>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        This certifies that the holder named above is authorised to operate the listed business in
        accordance with the by-laws of the City of Cape Town.
      </p>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="h-10 w-32 border-b border-foreground/40" />
          <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Authorised Signatory</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Issued by</div>
          <div className="text-xs font-semibold text-foreground">City of Cape Town</div>
        </div>
      </div>
    </>
  );
}

function ApplicationSummaryDoc({ app, service }: { app: CitizenApplication; service: ServiceConfig }) {
  const status = statusLabel(service, app.currentStateId);
  return (
    <>
      <MetaGrid
        rows={[
          ["Application ID", app.id],
          ["Status", status.label],
          ["Submitted", fmtDate(app.createdAt)],
          ["Updated", fmtDate(app.updatedAt)],
          ["Applicant", applicantName(app)],
          ["Phone", app.phone || "—"],
          ["Business", businessName(app)],
          ["Service", service.name],
        ]}
      />
      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Business Address</div>
        <div className="mt-1 text-sm font-semibold text-foreground">{businessAddress(app)}</div>
      </div>
      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Stage History</div>
        <ol className="mt-2 space-y-2">
          {app.history.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-teal" />
              <div className="flex-1">
                <div className="font-semibold text-foreground">
                  {getState(service, h.stateId)?.label ?? h.stateId}
                </div>
                <div className="text-xs text-muted-foreground">{fmtDate(h.at)}{h.note ? ` · ${h.note}` : ""}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {app.documents.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Documents</div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {app.documents.map((d) => (
              <li key={d.fieldId} className="flex justify-between gap-3">
                <span className="truncate text-foreground">{d.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(d.uploadedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}