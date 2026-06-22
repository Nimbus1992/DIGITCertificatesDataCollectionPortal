import { createFileRoute, Link, Navigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/citizen/AppHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { statusLabel, stageHasFee } from "@/lib/citizen/workflow";
import { computeDemandForStage } from "@/lib/citizen/fees";
import {
  downloadCertificate,
  downloadInvoice,
  downloadReceipt,
  downloadApplicationSummary,
  viewCertificate,
  viewInvoice,
  viewReceipt,
} from "@/lib/citizen/pdf";
import { DEMO_LABEL_OVERRIDES } from "@/lib/citizen/seed";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  Loader2,
  IndianRupee,
  FileText,
  Download,
  Check,
  Paperclip,
  Award,
  Receipt,
  Home,
  FilePlus2,
  ListChecks,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FormStep } from "@/config/types";
import type { CitizenApplication } from "@/context/ApplicationsContext";

export const Route = createFileRoute("/applications/$arn")({
  component: ApplicationDetail,
});

function ApplicationDetail() {
  const { arn } = useParams({ from: "/applications/$arn" });
  const { isAuthenticated, hydrated } = useAuth();
  const { getApp, isProcessing } = useApplications();
  const { getService } = useConfig();
  const [includeDocsList, setIncludeDocsList] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);

  if (!hydrated) return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  const app = getApp(arn);
  if (!app) return <Navigate to="/applications" />;
  const svc = getService(app.serviceId)!;
  const processing = isProcessing(app.id);
  const baseStatus = statusLabel(svc, app.currentStateId);
  const isPaid = app.payments.length > 0;
  const isIssued = !!app.licenseNo;
  const isPaymentDue = stageHasFee(svc, app.currentStateId) && !isPaid;
  const demand = computeDemandForStage(svc, app.currentStateId, app.values);
  const lastPayment = app.payments[app.payments.length - 1];

  let headerChip: { label: string; tone: "paid" | "pending" | "review" | "issued" | "processing" };
  if (processing) headerChip = { label: "Processing", tone: "processing" };
  else if (isIssued) headerChip = { label: "Issued", tone: "issued" };
  else if (isPaymentDue) headerChip = { label: "Payment Pending", tone: "pending" };
  else if (isPaid) headerChip = { label: "Paid", tone: "paid" };
  else headerChip = { label: baseStatus.label, tone: "review" };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <AppHeader
        crumbs={[
          { label: "Home", to: "/home" },
          { label: "My Applications", to: "/applications" },
          { label: "Detail" },
        ]}
        title="Application Details"
        action={<HeaderChip {...headerChip} />}
        rightSlot={
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Include in PDF
              </div>
              <button
                type="button"
                onClick={() => setIncludeDocsList((v) => !v)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-surface-muted"
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded border ${includeDocsList ? "border-brand-teal bg-brand-teal text-brand-teal-foreground" : "border-input"}`}
                >
                  {includeDocsList && <Check className="h-3 w-3" />}
                </span>
                Documents list
              </button>
              <button
                type="button"
                onClick={() => downloadApplicationSummary(svc, app, { includeDocsList })}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-brand-teal hover:bg-brand-teal/10"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </PopoverContent>
          </Popover>
        }
      />
      <main className="flex-1 px-4 pt-4 pb-8 space-y-4">
        {/* Payment summary card */}
        {demand && (
          <section
            className={`rounded-lg border ${
              isPaid ? "border-success/40 bg-success-soft/50" : isPaymentDue ? "border-warning/40 bg-warning-soft/40" : "border-border bg-card"
            }`}
          >
            <button
              type="button"
              onClick={() => setPaymentOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full ${isPaid ? "bg-success text-success-foreground" : "bg-brand-teal text-brand-teal-foreground"}`}>
                <IndianRupee className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold text-foreground">R {demand.total.toLocaleString("en-ZA")}</div>
                <div className="text-xs text-muted-foreground">Payment</div>
              </div>
              {isPaid ? (
                <span className="inline-flex items-center rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-success-foreground">Paid</span>
              ) : isPaymentDue ? (
                <span className="inline-flex items-center rounded-full bg-warning px-2.5 py-1 text-[11px] font-semibold text-warning-foreground">
                  Payment Pending
                </span>
              ) : null}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${paymentOpen ? "rotate-180" : ""}`} />
            </button>
            {paymentOpen && (
              <div className="border-t border-border/60 px-4 py-3">
                <ul className="divide-y divide-border text-sm">
                  {demand.items.map((i, idx) => (
                    <li key={idx} className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">{i.label}</span>
                      <span className="font-semibold text-foreground">R {i.amount.toLocaleString("en-ZA")}</span>
                    </li>
                  ))}
                  <li className="flex justify-between pt-2 text-sm">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-brand-teal-deep">R {demand.total.toLocaleString("en-ZA")}</span>
                  </li>
                </ul>
                {isPaymentDue && (
                  <Link
                    to="/pay/$arn"
                    params={{ arn: app.id }}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal-foreground"
                  >
                    <IndianRupee className="h-4 w-4" /> Pay Now
                  </Link>
                )}
              </div>
            )}
          </section>
        )}

        {processing && (
          <section className="rounded-lg border border-brand-teal/30 bg-card p-3">
            <div className="flex items-center gap-2 text-brand-teal">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-semibold text-foreground">Issuing licence…</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This page will update automatically in a few seconds.
            </p>
          </section>
        )}

        {/* Documents card */}
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <header className="px-4 pt-3 pb-1 text-sm font-bold text-foreground">Documents</header>
          <ul className="divide-y divide-border">
            <DocumentRow
              icon={<FileText className="h-5 w-5 text-warning" />}
              title="Demand Notice"
              subtitle={`Fee bill · ${formatDate(app.createdAt)}`}
              onView={() => viewInvoice(svc, app)}
              onDownload={() => downloadInvoice(svc, app)}
            />
            {lastPayment && (
              <DocumentRow
                icon={<Receipt className="h-5 w-5 text-success" />}
                title="Payment Invoice"
                subtitle={`Receipt · ${formatDate(lastPayment.paidAt)}`}
                onView={() => viewReceipt(svc, app)}
                onDownload={() => downloadReceipt(svc, app)}
              />
            )}
            {isIssued && (
              <DocumentRow
                icon={<Award className="h-5 w-5 text-brand-teal" />}
                title="Licence Certificate"
                subtitle={`Certificate · ${formatDate(app.updatedAt)}`}
                onView={() => viewCertificate(svc, app)}
                onDownload={() => downloadCertificate(svc, app)}
              />
            )}
            {app.documents.map((d) => (
              <DocumentRow
                key={d.fieldId}
                icon={<Paperclip className="h-5 w-5 text-muted-foreground" />}
                title={prettyFieldId(d.fieldId)}
                subtitle={`Uploaded · ${formatDate(d.uploadedAt)}`}
                onView={() => openDataUrl(d.dataUrl, d.name)}
              />
            ))}
          </ul>
        </section>

        {/* Application + form-driven detail sections */}
        <DetailsCard title="Application">
          <DetailRow label="App #" value={app.id} mono />
          <DetailRow label="Status" value={headerChip.label} />
        </DetailsCard>

        {svc.form.map((step) => (
          <DetailsCard key={step.id} title={sectionTitle(step)}>
            {step.fields.map((f) => {
              const raw = app.values?.[f.id];
              if (raw === undefined || raw === null || raw === "") return null;
              const override = DEMO_LABEL_OVERRIDES[f.id];
              let display: string;
              if (override) display = override;
              else if (f.options) display = f.options.find((o) => o.value === raw)?.label ?? String(raw);
              else if (f.type === "tel") display = String(raw);
              else display = String(raw);
              const label =
                f.id === "fullName" ? "Full Name" :
                f.id === "mobile" ? "Mobile Number" :
                f.id === "idType" ? "ID Type" :
                f.id === "idNumber" ? "ID Number" :
                f.label;
              return <DetailRow key={f.id} label={label} value={display} />;
            })}
          </DetailsCard>
        ))}

        {/* Workflow timeline */}
        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">Workflow timeline</header>
          <ol className="px-4 py-3">
            {svc.workflow.states
              .filter((s) => s.kind !== "end" || s.id === app.currentStateId || app.history.some((h) => h.stateId === s.id))
              .map((s) => {
                const reached = app.history.some((h) => h.stateId === s.id);
                const current = s.id === app.currentStateId;
                const entry = [...app.history].reverse().find((h) => h.stateId === s.id);
                return (
                  <li key={s.id} className="flex gap-3 py-2">
                    <span className="mt-0.5">
                      {current ? (
                        <Clock className="h-4 w-4 text-brand-teal" />
                      ) : reached ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <div className="flex-1 border-b border-dashed border-border pb-2 last:border-none">
                      <div className={`text-sm ${current ? "font-semibold text-foreground" : "text-foreground"}`}>{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {entry ? new Date(entry.at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : current ? "In progress" : "Pending"}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ol>
        </section>

        {/* What next? */}
        <section className="rounded-lg border border-brand-teal/30 bg-card p-4">
          <h3 className="text-sm font-bold text-brand-teal-deep">What would you like to do next?</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              <Home className="h-4 w-4" /> Go to Home
            </Link>
            <Link
              to="/applications"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              <ListChecks className="h-4 w-4" /> View My Applications
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal-foreground hover:bg-brand-teal-deep"
            >
              <FilePlus2 className="h-4 w-4" /> Start New Application
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeaderChip({ label, tone }: { label: string; tone: "paid" | "pending" | "review" | "issued" | "processing" }) {
  const styles: Record<typeof tone, string> = {
    paid: "bg-success-soft text-success border border-success/30",
    issued: "bg-success-soft text-success border border-success/30",
    pending: "bg-warning-soft text-warning-foreground border border-warning/40",
    review: "bg-info-soft text-brand-teal-deep border border-brand-teal/30",
    processing: "bg-info-soft text-brand-teal-deep border border-brand-teal/30",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${styles[tone]}`}>{label}</span>
  );
}

function DetailsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-brand-teal-deep">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className={`break-words text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function DocumentRow({
  icon,
  title,
  subtitle,
  onView,
  onDownload,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onView: () => void;
  onDownload?: () => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-muted">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>
      </div>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          aria-label="Download"
          className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={onView}
        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-surface-muted"
      >
        View
      </button>
    </li>
  );
}

function sectionTitle(step: FormStep): string {
  if (step.id === "applicant") return "Applicant Details";
  if (step.id === "business") return "Business Details";
  if (step.id === "location") return "Business Location";
  if (step.id === "operations") return "Operational Details";
  if (step.id === "documents") return "Documents";
  return step.shortLabel;
}

function formatDate(t: number): string {
  return new Date(t).toLocaleDateString("en-ZA", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function prettyFieldId(id: string): string {
  return id
    .replace(/^doc_/, "")
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function openDataUrl(dataUrl: string, filename: string) {
  try {
    const win = window.open();
    if (win) {
      win.document.title = filename;
      win.document.body.style.margin = "0";
      const img = win.document.createElement("img");
      img.src = dataUrl;
      img.style.cssText = "max-width:100%;height:auto;display:block;margin:auto";
      win.document.body.appendChild(img);
    }
  } catch {
    // fallback
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }
}
