import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { loadUserData } from "@/lib/api";

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { syncFromSupabase } = useOnboarding();

  // On every authenticated mount (including after returning from /onboarding),
  // re-hydrate state from Supabase so organizationId and services are always
  // authoritative — not dependent on localStorage surviving across sessions.
  useEffect(() => {
    if (!user) return;
    loadUserData(user.id)
      .then((data) => { if (data) syncFromSupabase(data); })
      .catch((err) => console.error("[AppLayout] loadUserData:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-2">
            <SidebarTrigger className="ml-1" />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
