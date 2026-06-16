import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import authSideImage from "@/assets/auth-side.jpg";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";

interface AuthShellProps {
  children: React.ReactNode;
  step?: string;
  showSidePanel?: boolean;
  contentMaxWidth?: string;
  sidePanelPosition?: "left" | "right";
}

const AuthShell: React.FC<AuthShellProps> = ({
  children,
  step,
  showSidePanel = false,
  contentMaxWidth = "max-w-[520px]",
  sidePanelPosition = "right",
}) => {
  const panel = showSidePanel ? (
    <aside
      className={cn(
        "hidden lg:flex flex-1 relative overflow-hidden bg-primary",
        sidePanelPosition === "right" ? "border-l border-border" : "border-r border-border"
      )}
    >
      <img
        src={authSideImage}
        alt=""
        loading="lazy"
        width={1024}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/70" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground) / 0.08) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
            Secure Access
          </span>
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            A unified platform for modern government services.
          </h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Manage licenses, permits, and citizen-facing workflows from one
            trusted, accessible workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] opacity-70">
          <span className="w-6 h-px bg-current" />
          Trusted by public institutions
        </div>
      </div>
    </aside>
  ) : null;

  const formArea = (
    <div
      className={cn(
        "flex-1 flex items-center justify-center px-6 py-10",
        showSidePanel && "lg:max-w-[60%]"
      )}
    >
      <div className={cn("w-full mx-auto animate-slide-up", contentMaxWidth)}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Top brand bar */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={cityOfCapeTownLogo}
              alt="City of Cape Town"
              className="w-7 h-7 object-contain"
            />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              City of Cape Town — Admin Console
            </span>
          </div>
          {step && (
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {step}
            </span>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex">
        {sidePanelPosition === "left" ? (
          <>
            {panel}
            {formArea}
          </>
        ) : (
          <>
            {formArea}
            {panel}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Secure government workspace</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthShell;
