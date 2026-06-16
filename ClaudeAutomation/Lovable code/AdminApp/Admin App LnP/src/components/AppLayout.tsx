import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BrandingScope from "@/components/BrandingScope";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AppLayout: React.FC = () => {
  const { signOut } = useOnboarding();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/onboarding");
  }

  return (
    <BrandingScope applyToRoot>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center justify-between border-b bg-card px-2">
              <SidebarTrigger className="ml-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="mr-2 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Sign out</span>
              </Button>
            </header>
            <main className="flex-1 overflow-auto" aria-label="Main content">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BrandingScope>
  );
};

export default AppLayout;
