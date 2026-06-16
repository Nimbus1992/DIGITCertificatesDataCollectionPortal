import React, { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";
import { BrandingConfig } from "@/contexts/OnboardingContext";

const FONT_HREFS: Record<string, string> = {
  "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  "Roboto Condensed": "https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap",
  "Public Sans": "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;700&display=swap",
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
  "Lato": "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  "Source Sans Pro": "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;700&display=swap",
};

interface Props {
  children: React.ReactNode;
  override?: BrandingConfig;
  className?: string;
  /** Also write CSS vars to <html> so portals (toasts, popovers, dropdowns) inherit. */
  applyToRoot?: boolean;
}

const BrandingScope: React.FC<Props> = ({ children, override, className, applyToRoot }) => {
  const { cssVars, fontFamily } = useBranding(override);

  useEffect(() => {
    const href = FONT_HREFS[fontFamily];
    if (!href) return;
    const id = `font-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [fontFamily]);

  useEffect(() => {
    if (!applyToRoot) return;
    const root = document.documentElement;
    const entries = Object.entries(cssVars as Record<string, string>);
    entries.forEach(([k, v]) => root.style.setProperty(k, String(v)));
    root.style.setProperty("font-family", `'${fontFamily}', system-ui, sans-serif`);
    return () => {
      entries.forEach(([k]) => root.style.removeProperty(k));
      root.style.removeProperty("font-family");
    };
  }, [applyToRoot, cssVars, fontFamily]);

  return (
    <div
      className={className ?? "min-h-screen w-full"}
      style={{ ...cssVars, fontFamily: `'${fontFamily}', system-ui, sans-serif` }}
      data-branding-scope
    >
      {children}
    </div>
  );
};

export default BrandingScope;
