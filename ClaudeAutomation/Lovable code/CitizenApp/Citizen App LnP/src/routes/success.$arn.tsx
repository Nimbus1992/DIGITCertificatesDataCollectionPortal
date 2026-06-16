import { createFileRoute, useNavigate, useParams, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlowHeader } from "@/components/citizen/FlowHeader";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/success/$arn")({
  component: SuccessPage,
});

function SuccessPage() {
  const { arn } = useParams({ from: "/success/$arn" });
  const navigate = useNavigate();
  const { getApp, hydrated, fastForwardToPayment } = useApplications();
  const { getService } = useConfig();
  const [secondsLeft, setSecondsLeft] = useState(8);

  useEffect(() => {
    if (!hydrated) return;
    fastForwardToPayment(arn);
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const t = setTimeout(() => {
      navigate({ to: "/pay/$arn", params: { arn } });
    }, 8000);
    return () => {
      clearInterval(tick);
      clearTimeout(t);
    };
  }, [arn, hydrated, fastForwardToPayment, navigate]);

  if (!hydrated) return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>;
  const app = getApp(arn);
  if (!app) return <Navigate to="/applications" />;
  const svc = getService(app.serviceId)!;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <FlowHeader title="City of Cape Town" showBack={false} />
      <main className="flex-1 px-5 pt-8 pb-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">Application Submitted</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your {svc.name} application has been received.</p>

        <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-card p-4 text-left">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Application Number</div>
          <div className="mt-1 text-base font-bold tracking-tight text-brand-teal-deep">{app.id}</div>
          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Applicant</div>
          <div className="text-sm text-foreground">{app.applicantName}</div>
        </div>

        <div className="mx-auto mt-6 max-w-sm rounded-lg border border-brand-teal/30 bg-card p-4">
          <div className="flex items-center justify-center gap-2 text-brand-teal">
            <Loader2 className="h-5 w-5 animate-spin" />
            <FileText className="h-5 w-5" />
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">Generating demand notice…</div>
          <p className="mt-1 text-xs text-muted-foreground">
            We're calculating your fees and preparing the payment notice. Redirecting in {secondsLeft}s.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-progress-track">
            <div
              className="h-full rounded-full bg-brand-teal transition-[width] duration-1000 ease-linear"
              style={{ width: `${((8 - secondsLeft) / 8) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-5 text-xs text-muted-foreground">
          Skip to:{" "}
          <Link to="/home" className="font-semibold text-brand-teal hover:text-brand-teal-deep">Home</Link>
          <span className="px-1">·</span>
          <Link to="/applications" className="font-semibold text-brand-teal hover:text-brand-teal-deep">My Applications</Link>
        </div>
      </main>
    </div>
  );
}