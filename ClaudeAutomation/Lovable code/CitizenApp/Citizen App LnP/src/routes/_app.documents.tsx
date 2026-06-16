import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/citizen/AppHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { downloadCertificate, downloadReceipt } from "@/lib/citizen/pdf";
import { Download, FileText, Receipt } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { apps } = useApplications();
  const { getService } = useConfig();

  const certs = apps.filter((a) => a.licenseNo);
  const receipts = apps.flatMap((a) => a.payments.map((p) => ({ p, a })));

  return (
    <>
      <AppHeader crumbs={[{ label: "Home", to: "/home" }, { label: "Documents" }]} title="My Documents" />
      <main className="px-4 pt-4 pb-6">
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Certificates</h2>
          {certs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
              Approved certificates will appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {certs.map((a) => {
                const svc = getService(a.serviceId)!;
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-success-soft text-success">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{svc.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{a.licenseNo}</div>
                    </div>
                    <button
                      onClick={() => downloadCertificate(svc, a)}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-navy px-2.5 py-1.5 text-xs font-semibold text-brand-navy-foreground"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Receipts</h2>
          {receipts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
              Payment receipts appear after you pay any fee.
            </p>
          ) : (
            <ul className="space-y-2">
              {receipts.map(({ p, a }) => {
                const svc = getService(a.serviceId)!;
                return (
                  <li key={p.receiptId} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-info-soft text-brand-navy">
                      <Receipt className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">R {p.amount.toLocaleString("en-ZA")} · {svc.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{p.receiptId} · {new Date(p.paidAt).toLocaleDateString("en-ZA")}</div>
                    </div>
                    <button
                      onClick={() => downloadReceipt(svc, a)}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-navy px-2.5 py-1.5 text-xs font-semibold text-brand-navy-foreground"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}