import type { jsPDF } from "jspdf";

/**
 * Resolves portal branding for use inside jsPDF generators. Reads directly
 * from localStorage (same source the onboarding context persists to) so
 * generators don't have to subscribe to React state.
 *
 * If a logo data URL is available, drawHeaderLogo() renders it via
 * doc.addImage(). Otherwise it draws a dashed "Upload logo" placeholder so
 * the gap is visibly intentional rather than an empty space.
 */

export interface PdfBranding {
  portalName: string;
  primaryColorHex: string;
  logoDataUrl?: string;
}

const DEFAULT_BRANDING: PdfBranding = {
  portalName: "City of Cape Town",
  primaryColorHex: "#0B4F6C",
};

const STORAGE_KEY = "lnp-onboarding-state";

function pickActiveService(state: any): any | undefined {
  if (!state || !Array.isArray(state.services)) return undefined;
  return state.services.find((s: any) => s.id === state.activeServiceId) ?? state.services[0];
}

export function resolvePdfBranding(): PdfBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const state = JSON.parse(raw);
    const svc = pickActiveService(state);
    const merged = {
      ...DEFAULT_BRANDING,
      portalName: state?.orgName || DEFAULT_BRANDING.portalName,
      primaryColorHex: state?.themeColor || DEFAULT_BRANDING.primaryColorHex,
      logoDataUrl: state?.logoUrl || undefined,
      ...(state?.platformBranding ?? {}),
      ...(svc?.branding ?? {}),
    };
    return {
      portalName: merged.portalName,
      primaryColorHex: merged.primaryColor ?? merged.primaryColorHex ?? DEFAULT_BRANDING.primaryColorHex,
      // The branding form stores logos as data URLs; only those render in jsPDF.
      logoDataUrl:
        typeof merged.logoDataUrl === "string" && merged.logoDataUrl.startsWith("data:")
          ? merged.logoDataUrl
          : undefined,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

/** Convert a #RRGGBB string to an [r,g,b] triplet (0-255). */
export function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  if (c.length !== 6) return [11, 79, 108];
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}

/**
 * Draws the portal logo within the given box, or a dashed placeholder when
 * no logo is configured. The placeholder reads "Upload logo" so users know
 * exactly what to do in Branding & Theme.
 */
export function drawHeaderLogo(
  doc: jsPDF,
  branding: PdfBranding,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (branding.logoDataUrl) {
    try {
      // jsPDF picks the format from the data URL prefix.
      doc.addImage(branding.logoDataUrl, "PNG", x, y, w, h, undefined, "FAST");
      return;
    } catch {
      // Fall through to placeholder
    }
  }
  // Dashed rounded rect placeholder
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.8);
  const dash = 3;
  const gap = 3;
  // top + bottom
  for (let px = x; px < x + w; px += dash + gap) {
    doc.line(px, y, Math.min(px + dash, x + w), y);
    doc.line(px, y + h, Math.min(px + dash, x + w), y + h);
  }
  // left + right
  for (let py = y; py < y + h; py += dash + gap) {
    doc.line(x, py, x, Math.min(py + dash, y + h));
    doc.line(x + w, py, x + w, Math.min(py + dash, y + h));
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("Upload logo", x + w / 2, y + h / 2 + 2, { align: "center" });
}
