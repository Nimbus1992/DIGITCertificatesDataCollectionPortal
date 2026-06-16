import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getSession()) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
  component: IndexRedirect,
});

function IndexRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: getSession() ? "/dashboard" : "/login", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
