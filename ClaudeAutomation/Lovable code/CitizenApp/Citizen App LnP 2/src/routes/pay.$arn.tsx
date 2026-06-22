import { createFileRoute, Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { FlowHeader } from "@/components/citizen/FlowHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { useAuth } from "@/context/AuthContext";
import { computeDemandForStage } from "@/lib/citizen/fees";
import { viewInvoice } from "@/lib/citizen/pdf";
import { ShieldCheck, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pay/$arn")({
  component: PayPage,
});

function PayPage() {
  const { arn } = useParams({ from: "/pay/$arn" });
  const navigate = useNavigate();
  const { isAuthenticated, hydrated } = useAuth();
  const { getApp, payApplication } = useApplications();
  const { getService } = useConfig();
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  const app = getApp(arn);
  if (!app) return <Navigate to="/applications" />;
  const svc = getService(app.serviceId)!;
  const demand = computeDemandForStage(svc, app.currentStateId, app.values);
  if (!demand) return <Navigate to="/applications/$arn" params={{ arn }} />;

  async function pay() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    const p = payApplication(arn);
    if (!p) {
      toast.error("Could not record payment");
      setBusy(false);
      return;
    }
    toast.success(`Paid R ${p.amount.toLocaleString("en-ZA")} · ${p.receiptId}`);
    navigate({ to: "/applications/$arn", params: { arn } });
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <FlowHeader title="City of Cape Town" />
      <main className="flex-1 px-4 pt-4 pb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Pay License Fee</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{app.id}</p>

        <section className="mt-4 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-brand-teal-deep">Fee Breakdown</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {demand.items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-2">
                <span className="text-foreground">{i.label}</span>
                <span className="font-semibold text-foreground">R {i.amount.toLocaleString("en-ZA")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-base">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-brand-teal-deep">R {demand.total.toLocaleString("en-ZA")}</span>
          </div>
        </section>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => viewInvoice(svc, app)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-teal hover:text-brand-teal-deep"
          >
            <FileText className="h-4 w-4" /> View Demand Notice
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg bg-surface-muted p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-teal" />
          Secure mock payment for preview demonstration.
        </div>
      </main>
      <div className="sticky bottom-0 z-20 mx-auto w-full max-w-[420px] border-t border-border bg-card px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <button
          onClick={pay}
          disabled={busy}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-teal text-sm font-semibold text-brand-teal-foreground hover:bg-brand-teal-deep disabled:opacity-60"
        >
          <CreditCard className="h-4 w-4" />
          {busy ? "Processing…" : `Pay R ${demand.total.toLocaleString("en-ZA")}`}
        </button>
      </div>
    </div>
  );
}