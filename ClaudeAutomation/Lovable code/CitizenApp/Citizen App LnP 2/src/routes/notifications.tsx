import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FlowHeader } from "@/components/citizen/FlowHeader";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const { items, markAllRead } = useNotifications();

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  if (!hydrated) return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <FlowHeader title="Notifications" />
      <main className="flex-1 px-4 pt-4 pb-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-semibold text-foreground">{n.title}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}