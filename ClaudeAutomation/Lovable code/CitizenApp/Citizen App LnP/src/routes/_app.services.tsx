import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/citizen/AppHeader";
import { useConfig } from "@/context/ConfigContext";
import { Store, Building2, Flame, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/services")({
  component: ServicesPage,
});

const ICONS: Record<string, typeof Store> = { Store, Building2, Flame };

function ServicesPage() {
  const { services } = useConfig();
  return (
    <>
      <AppHeader crumbs={[{ label: "Home", to: "/home" }, { label: "Services" }]} title="All Services" />
      <main className="px-4 pt-4 pb-6">
        <ul className="space-y-2">
          {services.map((s) => {
            const Icon = ICONS[s.icon] ?? Store;
            const cardBody = (
              <>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-teal/10 text-brand-teal">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                    {s.comingSoon && (
                      <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal-deep">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{s.category} · {s.summary}</div>
                </div>
                {!s.comingSoon && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </>
            );
            return (
              <li key={s.id}>
                {s.comingSoon ? (
                  <div
                    aria-disabled
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-border bg-card p-3 opacity-60"
                  >
                    {cardBody}
                  </div>
                ) : (
                  <Link
                    to="/apply/$serviceId"
                    params={{ serviceId: s.id }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    {cardBody}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}