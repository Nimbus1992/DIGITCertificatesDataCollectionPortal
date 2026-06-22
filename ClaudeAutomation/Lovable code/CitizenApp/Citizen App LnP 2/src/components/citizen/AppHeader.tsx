import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/cape-town-logo.png";

type Crumb = { label: string; to?: string };

type Props = {
  crumbs?: Crumb[];
  title?: string;
  action?: ReactNode;
  /** Optional element rendered to the right of the breadcrumbs (e.g. a Download popover). */
  rightSlot?: ReactNode;
};

export function AppHeader({ crumbs, title, action, rightSlot }: Props) {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-brand-teal-deep text-brand-teal-foreground">
        <div className="flex items-center gap-2 px-4 py-3">
          <img src={logo} alt="" width={24} height={24} loading="lazy" className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-wide">City of Cape Town</span>
          <span className="text-xs text-white/60">| Citizen Services</span>
        </div>
      </div>
      <div className="bg-card border-b border-border px-4 pt-3 pb-3">
        {crumbs && crumbs.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  {c.to ? (
                    <Link to={c.to} className="hover:text-brand-teal">{c.label}</Link>
                  ) : (
                    <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : ""}>{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span>/</span>}
                </span>
              ))}
            </nav>
            {rightSlot}
          </div>
        )}
        {title && (
          <div className="mt-2 flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {action}
          </div>
        )}
      </div>
    </header>
  );
}