import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/citizen/AppHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { statusLabel, stageHasFee } from "@/lib/citizen/workflow";
import { computeDemandForStage } from "@/lib/citizen/fees";
import { ChevronRight, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/applications")({
  component: ApplicationsPage,
});

const TABS = ["All", "In Progress", "Issued", "Rejected"] as const;

function ApplicationsPage() {
  const { apps } = useApplications();
  const { getService } = useConfig();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const filtered = apps.filter((a) => {
    const svc = getService(a.serviceId);
    if (!svc) return false;
    const st = statusLabel(svc, a.currentStateId);
    if (tab === "All") return true;
    if (tab === "Issued") return st.variant === "issued" || st.variant === "approved";
    if (tab === "Rejected") return st.variant === "rejected";
    return st.variant !== "issued" && st.variant !== "rejected" && st.variant !== "approved";
  });

  return (
    <>
      <AppHeader crumbs={[{ label: "Home", to: "/home" }, { label: "Applications" }]} title="My Applications" />
      <div className="bg-card border-b border-border">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                tab === t ? "bg-brand-navy text-brand-navy-foreground" : "bg-surface-muted text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <main className="px-4 pt-4 pb-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No applications in this view.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((a) => {
              const svc = getService(a.serviceId)!;
              const st = statusLabel(svc, a.currentStateId);
              const businessName = String(a.values?.businessName ?? svc.category);
              const needsPay = stageHasFee(svc, a.currentStateId) && a.payments.length === 0;
              const demand = needsPay ? computeDemandForStage(svc, a.currentStateId, a.values) : null;
              const isNew = Date.now() - a.createdAt < 7 * 24 * 3600 * 1000;
              return (
                <li key={a.id} className="overflow-hidden rounded-lg border border-border bg-card">
                  <Link
                    to="/applications/$arn"
                    params={{ arn: a.id }}
                    className="block p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 font-mono text-xs leading-snug text-brand-teal-deep break-all">
                        {a.id}
                      </div>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {isNew && (
                        <span className="rounded bg-info-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-teal-deep">
                          NEW
                        </span>
                      )}
                      <span className="text-base font-bold text-foreground">{businessName}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge label={st.label} variant={st.variant} />
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(a.updatedAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>
                  </Link>
                  {needsPay && demand && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: "/pay/$arn", params: { arn: a.id } });
                      }}
                      className="flex w-full items-center justify-center gap-2 bg-warning px-3 py-2.5 text-sm font-semibold text-warning-foreground hover:brightness-95"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay Now — R {demand.total.toLocaleString("en-ZA")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: ReturnType<typeof statusLabel>["variant"] }) {
  const styles: Record<typeof variant, string> = {
    submitted: "bg-info-soft text-brand-teal-deep",
    in_review: "bg-info-soft text-brand-teal-deep",
    payment_required: "bg-warning-soft text-warning-foreground border border-warning/40",
    approved: "bg-success-soft text-success",
    issued: "bg-success-soft text-success",
    rejected: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[variant]}`}>
      {variant === "payment_required" ? "Payment Pending" : label}
    </span>
  );
}