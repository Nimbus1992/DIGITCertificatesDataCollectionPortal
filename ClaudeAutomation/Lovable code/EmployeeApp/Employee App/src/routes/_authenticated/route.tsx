import { createFileRoute, Outlet, redirect, Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  Inbox,
  Search,
  ClipboardCheck,
  FileCheck2,
  BarChart3,
  UserRound,
  LogOut,
  Loader2,
} from "lucide-react";
import { CapeTownLogo } from "@/components/brand/CapeTownLogo";

import { useMemo, useState } from "react";
import { getSession, logout, useSession, useStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { RoleId } from "@/lib/types";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getSession()) throw redirect({ to: "/login" });
  },
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useStore((s) => s.notifications);

  const unread = useMemo(
    () =>
      session
        ? notifications.filter((n) => (n.audience as string) === session.roleId && !n.read).length
        : 0,
    [notifications, session],
  );

  const nav = useMemo(() => (session ? buildNav(session.roleId) : []), [session]);

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-sm">
        <div className="h-14 px-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-semibold">
            <CapeTownLogo variant="compact" className="text-primary-foreground" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-[0.16em] opacity-80">City of Cape Town</div>
              <div className="text-sm font-semibold -mt-0.5">Employee Console</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative size-9 grid place-items-center rounded-md hover:bg-white/10 transition-colors">
                  <Bell className="size-4" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-danger-foreground text-[10px] font-semibold grid place-items-center">
                      {unread}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b text-sm font-semibold">Notifications</div>
                <div className="max-h-96 overflow-auto">
                  {notifications.filter((n) => (n.audience as string) === session.roleId).length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
                  ) : (
                    notifications
                      .filter((n) => (n.audience as string) === session.roleId)
                      .slice(0, 12)
                      .map((n) => (
                        <div key={n.id} className="p-3 border-b last:border-0 hover:bg-surface-muted">
                          <div className="text-sm font-medium">{n.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
                            {new Date(n.at).toLocaleString()}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 h-9 rounded-md hover:bg-white/10 transition-colors">
                  <div className="size-7 rounded-full bg-white/15 grid place-items-center text-xs font-semibold">
                    {initials(session.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-medium leading-none">{session.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{ROLE_LABELS[session.roleId]}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm">{session.name}</div>
                  <div className="text-xs text-muted-foreground">{session.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <UserRound className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="border-r bg-surface min-h-[calc(100vh-3.5rem)] p-3 sticky top-14 self-start">
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-colors " +
                    (active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-surface-muted")
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page */}
        <main className="p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildNav(role: RoleId) {
  const base = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/inbox", label: "Inbox", icon: Inbox },
    { to: "/search", label: "Search", icon: Search },
  ];
  if (role === "field_inspector") base.push({ to: "/inspections", label: "Inspections", icon: ClipboardCheck });
  if (role === "approver") base.push({ to: "/approvals", label: "Approvals", icon: FileCheck2 });
  base.push({ to: "/reports", label: "Reports", icon: BarChart3 });
  base.push({ to: "/profile", label: "Profile", icon: UserRound });
  return base;
}
