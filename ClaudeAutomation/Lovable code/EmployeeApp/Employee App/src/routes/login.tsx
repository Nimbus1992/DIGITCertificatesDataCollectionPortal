import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CapeTownLogo } from "@/components/brand/CapeTownLogo";
import { DEMO_USERS, ROLE_LABELS } from "@/lib/users";
import { login, useSession } from "@/lib/store";


export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session && typeof window !== "undefined") {
    queueMicrotask(() => navigate({ to: "/dashboard" }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    setTimeout(() => {
      if (!user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      login({ email: user.email, name: user.name, roleId: user.roleId, loggedInAt: Date.now() });
      navigate({ to: "/dashboard" });
    }, 350);
  }

  function fill(u: (typeof DEMO_USERS)[number]) {
    setEmail(u.email);
    setPassword(u.password);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="flex items-center gap-3 text-primary-foreground">
          <CapeTownLogo variant="full" className="text-primary-foreground" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight max-w-md">
            The Employee Console for the City of Cape Town.
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Process Business License applications end-to-end — document verification, field inspection and approval — across all Cape Town wards.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} City of Cape Town · Employee Console
        </div>
        <div className="absolute -right-32 -bottom-32 size-[420px] rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-12 top-20 size-[280px] rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-surface-muted">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2 text-primary font-semibold">
            <CapeTownLogo variant="compact" className="text-primary" />
            <span>City of Cape Town · Employee Console</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Access the operations console with your work credentials.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <Card className="mt-8 p-4 bg-surface border-border">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <KeyRound className="size-3.5" />
              Sign in as
            </div>
            <div className="mt-3 space-y-1.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fill(u)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-surface-muted transition-colors flex items-center justify-between gap-3 group"
                >
                  <div>
                    <div className="text-sm font-medium">{ROLE_LABELS[u.roleId]}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary">
                    Use →
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
