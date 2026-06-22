import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, FileText, FolderOpen, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/services", label: "Services", icon: LayoutGrid },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomTabBar() {
  return (
    <nav className="sticky bottom-0 z-20 mx-auto w-full max-w-[420px] border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),0.25rem)]">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                activeProps={{ className: "text-brand-teal" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium"
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}