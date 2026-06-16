import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/citizen/AppHeader";
import { StatusChip } from "@/components/citizen/StatusChip";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationsContext";
import { useConfig } from "@/context/ConfigContext";
import { useNotifications } from "@/context/NotificationsContext";
import { statusLabel } from "@/lib/citizen/workflow";
import { Store, Building2, Flame, Bell, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const ICONS: Record<string, typeof Store> = { Store, Building2, Flame };

function HomePage() {
  const { session } = useAuth();
  const { apps } = useApplications();
  const { services, getService } = useConfig();
  const { unreadCount } = useNotifications();
  const recent = apps.slice(0, 3);

  return (
    <>
      <AppHeader
        crumbs={[{ label: "Home" }]}
        title={`Hi, ${session?.name ?? "Citizen"}`}
        action={
          <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-full bg-surface-muted">
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Link>
        }
      />
      <main className="px-4 pt-4 pb-6">
        <section className="rounded-lg bg-gradient-to-br from-brand-navy to-brand-teal p-4 text-brand-navy-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Citizen Services</div>
          <div className="mt-1 text-lg font-semibold leading-snug">Apply, pay and track government services from your phone.</div>
          <Link
            to="/services"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
          >
            Browse services <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Popular services</h2>
            <Link to="/services" className="text-xs font-semibold text-brand-teal">See all</Link>
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {services.map((s) => {
              const Icon = ICONS[s.icon] ?? Store;
              const inner = (
                <>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-teal/10 text-brand-teal">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-foreground">{s.name}</span>
                  {s.comingSoon && (
                    <span className="rounded-full bg-brand-teal/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-teal-deep">
                      Soon
                    </span>
                  )}
                </>
              );
              return (
                <li key={s.id}>
                  {s.comingSoon ? (
                    <div
                      aria-disabled
                      className="flex h-24 cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-card p-2 text-center opacity-60"
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      to="/apply/$serviceId"
                      params={{ serviceId: s.id }}
                      className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-card p-2 text-center"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6">
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-sm font-semibold tracking-tight">My recent applications</h2>
            <Link to="/applications" className="text-xs font-semibold text-brand-teal">See all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center text-sm text-muted-foreground">
              No applications yet. Start with a service above.
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => {
                const svc = getService(a.serviceId);
                if (!svc) return null;
                const st = statusLabel(svc, a.currentStateId);
                return (
                  <li key={a.id}>
                    <Link
                      to="/applications/$arn"
                      params={{ arn: a.id }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{svc.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{a.id}</div>
                      </div>
                      <StatusChip label={st.label} variant={st.variant} />
                    </Link>
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