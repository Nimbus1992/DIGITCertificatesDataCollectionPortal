import { useMemo } from "react";
import { useOnboarding, BrandingConfig } from "@/contexts/OnboardingContext";
import cityOfCapeTownLogo from "@/assets/city-of-cape-town-logo.png";

const DEFAULT_BRANDING: BrandingConfig = {
  presetId: "teal",
  primaryColor: "#0D9488",
  accentColor: "#0F766E",
  font: "Inter",
  buttonRadius: "0.5rem",
  cardRadius: "0.75rem",
  portalName: "City of Cape Town",
  logoDataUrl: cityOfCapeTownLogo,
  copyright: "© 2025 City of Cape Town",
};

function hexToHslTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function relLuminance(hex: string): number {
  const c = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastForeground(hex: string): string {
  return relLuminance(hex) > 0.45 ? "213 50% 15%" : "0 0% 100%";
}

export function useBranding(override?: BrandingConfig) {
  const { getActiveService, state } = useOnboarding();

  const branding = useMemo<BrandingConfig>(() => {
    if (override) return override;
    const svc = getActiveService();
    const legacy: Partial<BrandingConfig> = {
      portalName: state.orgName || undefined,
      logoDataUrl: state.logoUrl || undefined,
      primaryColor: state.themeColor || undefined,
    };
    // precedence: defaults < legacy < platform < service
    return {
      ...DEFAULT_BRANDING,
      ...Object.fromEntries(Object.entries(legacy).filter(([, v]) => v)),
      ...(state.platformBranding ?? {}),
      ...(svc?.branding ?? {}),
    } as BrandingConfig;
  }, [override, getActiveService, state.orgName, state.logoUrl, state.themeColor, state.platformBranding]);

  const cssVars = useMemo(() => {
    const primary = hexToHslTriplet(branding.primaryColor);
    const accent = branding.accentColor ? hexToHslTriplet(branding.accentColor) : primary;
    const radius = branding.cardRadius;
    // Derive sidebar shades from primary hue/sat
    const [pH, pS] = primary.split(" ");
    const sidebarBg = `${pH} ${pS} 18%`;
    const sidebarAccent = `${pH} ${pS} 26%`;
    const sidebarBorder = `${pH} ${pS} 30%`;
    return {
      "--primary": primary,
      "--primary-foreground": contrastForeground(branding.primaryColor),
      "--ring": primary,
      "--accent": accent,
      "--accent-foreground": contrastForeground(branding.accentColor || branding.primaryColor),
      "--sidebar-background": sidebarBg,
      "--sidebar-foreground": "0 0% 100%",
      "--sidebar-accent": sidebarAccent,
      "--sidebar-accent-foreground": "0 0% 100%",
      "--sidebar-border": sidebarBorder,
      "--sidebar-primary": primary,
      "--sidebar-primary-foreground": contrastForeground(branding.primaryColor),
      "--sidebar-ring": primary,
      "--radius": radius,
      "--button-radius": branding.buttonRadius,
    } as React.CSSProperties;
  }, [branding]);

  return { branding, cssVars, fontFamily: branding.font };
}

export { DEFAULT_BRANDING };
