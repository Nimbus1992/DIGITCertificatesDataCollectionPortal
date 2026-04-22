import React, { createContext, useContext, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────
export interface ThemeConfig {
  id: string;
  name: string;
  accentHex: string;       // primary action colour (maps to --accent)
  sidebarHex: string;      // sidebar background colour
  font: string;
  borderRadius: string;    // e.g. "0.75rem"
  isCustom?: boolean;
}

interface ThemeContextValue {
  activeThemeId: string;
  logoDataUrl: string;
  portalName: string;
  customThemes: ThemeConfig[];
  applyTheme: (theme: ThemeConfig) => void;
  setLogo: (dataUrl: string) => void;
  setPortalName: (name: string) => void;
  saveCustomTheme: (theme: ThemeConfig) => void;
  deleteCustomTheme: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Darken a hex colour by `amount` (0–1) */
function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 255 * amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 255 * amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 255 * amount);
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns "0 0% 100%" (white) or "0 0% 0%" (black) depending on background luminance */
function foregroundFor(hex: string): string {
  return getRelativeLuminance(hex) > 0.3 ? "220 20% 10%" : "0 0% 100%";
}

function injectGoogleFont(font: string) {
  const id = `gfont-${font.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function applyCSSVars(theme: ThemeConfig) {
  const root = document.documentElement;
  const accentHsl = hexToHsl(theme.accentHex);
  const sidebarHsl = hexToHsl(theme.sidebarHex);
  const sidebarDark = hexToHsl(darken(theme.sidebarHex, 0.06));
  const sidebarAccent = hexToHsl(darken(theme.sidebarHex, 0.12));
  const accentFg = foregroundFor(theme.accentHex);
  const sidebarFg = foregroundFor(theme.sidebarHex);

  root.style.setProperty("--accent", accentHsl);
  root.style.setProperty("--accent-foreground", accentFg);
  root.style.setProperty("--ring", accentHsl);
  root.style.setProperty("--primary", sidebarHsl);
  root.style.setProperty("--primary-foreground", sidebarFg);
  root.style.setProperty("--sidebar-background", sidebarHsl);
  root.style.setProperty("--sidebar-foreground", sidebarFg);
  root.style.setProperty("--sidebar-primary", accentHsl);
  root.style.setProperty("--sidebar-primary-foreground", accentFg);
  root.style.setProperty("--sidebar-accent", sidebarDark);
  root.style.setProperty("--sidebar-accent-foreground", sidebarFg);
  root.style.setProperty("--sidebar-border", sidebarAccent);
  root.style.setProperty("--sidebar-ring", accentHsl);

  // --radius drives cards, inputs, and general components.
  // Cap it at 1rem so pill presets (9999px) don't deform icon containers.
  // --radius-button gets the full value (pill buttons are intentional).
  const buttonRadius = theme.borderRadius;
  const cardRadius =
    theme.borderRadius === "9999px" ? "0.75rem" : theme.borderRadius;
  root.style.setProperty("--radius", cardRadius);
  root.style.setProperty("--radius-button", buttonRadius);

  // Font
  injectGoogleFont(theme.font);
  document.body.style.fontFamily = `'${theme.font}', system-ui, -apple-system, sans-serif`;
}

// ─── Built-in presets ─────────────────────────────────────────
export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: "digit",
    name: "DIGIT",
    accentHex: "#C84C0E",
    sidebarHex: "#0B4B66",
    font: "Roboto",
    borderRadius: "0.25rem",
  },
  {
    id: "civic",
    name: "Civic Blue",
    accentHex: "#136DEC",
    sidebarHex: "#1E3A5F",
    font: "Public Sans",
    borderRadius: "0.5rem",
  },
  {
    id: "bold",
    name: "Bold Slate",
    accentHex: "#EC5B13",
    sidebarHex: "#0F172A",
    font: "Inter",
    borderRadius: "9999px",
  },
  {
    id: "teal",
    name: "Teal Modern",
    accentHex: "#0D9488",
    sidebarHex: "#134E4A",
    font: "DM Sans",
    borderRadius: "9999px",
  },
  {
    id: "purple",
    name: "Purple Gov",
    accentHex: "#7C3AED",
    sidebarHex: "#2E1065",
    font: "Inter",
    borderRadius: "0.5rem",
  },
  {
    id: "green",
    name: "Forest Green",
    accentHex: "#16A34A",
    sidebarHex: "#14532D",
    font: "Source Sans Pro",
    borderRadius: "0.375rem",
  },
];

// ─── Context ──────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "lnp-theme";
const LOGO_KEY = "lnp-logo";
const PORTAL_NAME_KEY = "lnp-portal-name";
const CUSTOM_THEMES_KEY = "lnp-custom-themes";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeId, setActiveThemeId] = useState<string>("digit");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [portalName, setPortalNameState] = useState<string>("LnP Platform");
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([]);

  // Restore persisted theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedLogo = localStorage.getItem(LOGO_KEY) ?? "";
    const savedName = localStorage.getItem(PORTAL_NAME_KEY) ?? "LnP Platform";
    const savedCustom = localStorage.getItem(CUSTOM_THEMES_KEY);

    setLogoDataUrl(savedLogo);
    setPortalNameState(savedName);
    if (savedCustom) setCustomThemes(JSON.parse(savedCustom));

    if (saved) {
      const theme: ThemeConfig = JSON.parse(saved);
      setActiveThemeId(theme.id);
      applyCSSVars(theme);
    } else {
      // Apply default
      const def = PRESET_THEMES[0];
      applyCSSVars(def);
    }
  }, []);

  const applyTheme = (theme: ThemeConfig) => {
    applyCSSVars(theme);
    setActiveThemeId(theme.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  };

  const setLogo = (dataUrl: string) => {
    setLogoDataUrl(dataUrl);
    localStorage.setItem(LOGO_KEY, dataUrl);
  };

  const setPortalName = (name: string) => {
    setPortalNameState(name);
    localStorage.setItem(PORTAL_NAME_KEY, name);
  };

  const saveCustomTheme = (theme: ThemeConfig) => {
    setCustomThemes((prev) => {
      const updated = [...prev.filter((t) => t.id !== theme.id), theme];
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCustomTheme = (id: string) => {
    setCustomThemes((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ThemeContext.Provider value={{
      activeThemeId,
      logoDataUrl,
      portalName,
      customThemes,
      applyTheme,
      setLogo,
      setPortalName,
      saveCustomTheme,
      deleteCustomTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
