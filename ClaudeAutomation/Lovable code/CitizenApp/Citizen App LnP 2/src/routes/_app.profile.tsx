import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/citizen/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationsContext";
import { LogOut, User, Phone, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { apps } = useApplications();

  return (
    <>
      <AppHeader crumbs={[{ label: "Home", to: "/home" }, { label: "Profile" }]} title="My Profile" />
      <main className="px-4 pt-4 pb-6">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-teal/15 text-brand-teal">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground">{session?.name ?? "Citizen"}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> +27 {session?.phone}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-bold text-brand-navy">{apps.length}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Applications</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-2xl font-bold text-success">{apps.filter((a) => a.licenseNo).length}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Issued</div>
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-border bg-card">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground"
            onClick={() => navigate({ to: "/applications" })}
          >
            <FileText className="h-4 w-4 text-brand-teal" /> View all applications
          </button>
          <div className="border-t border-border" />
          <button
            type="button"
            onClick={() => {
              logout();
              navigate({ to: "/auth" });
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </section>
      </main>
    </>
  );
}