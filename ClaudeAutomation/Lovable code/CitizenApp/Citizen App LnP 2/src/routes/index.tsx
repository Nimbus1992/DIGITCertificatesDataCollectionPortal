import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { hydrated, isAuthenticated } = useAuth();
  if (!hydrated) {
    return (
      <div className="grid min-h-svh place-items-center bg-surface text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <Navigate to={isAuthenticated ? "/home" : "/auth"} />;
}
