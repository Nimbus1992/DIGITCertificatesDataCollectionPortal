import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { BottomTabBar } from "@/components/citizen/BottomTabBar";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { hydrated, isAuthenticated } = useAuth();
  if (!hydrated) {
    return (
      <div className="grid min-h-svh place-items-center bg-surface text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <div className="flex-1">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}