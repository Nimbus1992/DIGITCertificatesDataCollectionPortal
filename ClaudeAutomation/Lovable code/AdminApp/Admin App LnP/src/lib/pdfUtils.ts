import type { jsPDF } from "jspdf";

/**
 * Shared helpers for jsPDF generators in this project:
 *   - Pager: tracks `y`, adds a new page when the next block would overflow.
 *   - drawWrapped: draws text wrapped to a max width and returns the new y.
 *   - drawDashed: dashed divider line helper.
 *   - finalizePageFooters: adds "Page X of Y" to every page after all content
 *     has been drawn.
 */

export interface Pager {
  /** Current vertical cursor (top is 0). */
  y: number;
  /** Reserve `needed` pt of vertical space; add a page if not available. */
  ensureSpace: (needed: number) => void;
  /** Force a new page. */
  newPage: () => void;
  /** Reset cursor to a specific y. */
  setY: (y: number) => void;
}

export interface PagerOptions {
  /** Top margin used on every page. */
  marginTop?: number;
  /** Bottom margin reserved for footer. */
  marginBottom?: number;
  /** Called after a new page is added — use to redraw header decoration. */
  onNewPage?: (doc: jsPDF, p: Pager) => void;
}

export function makePager(doc: jsPDF, opts: PagerOptions = {}): Pager {
  const marginTop = opts.marginTop ?? 40;
  const marginBottom = opts.marginBottom ?? 60;
  const H = doc.internal.pageSize.getHeight();

  const pager: Pager = {
    y: marginTop,
    ensureSpace(needed: number) {
      if (this.y + needed > H - marginBottom) {
        this.newPage();
      }
    },
    newPage() {
      doc.addPage();
      this.y = marginTop;
      opts.onNewPage?.(doc, this);
    },
    setY(y: number) {
      this.y = y;
    },
  };
  return pager;
}

export interface DrawWrappedOptions {
  maxWidth: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  pager?: Pager;
}

/**
 * Draws text wrapped to `maxWidth`. Returns the y position immediately after
 * the last line. If a pager is supplied, each line reserves space and the
 * pager advances; otherwise the caller is responsible for tracking y.
 */
export function drawWrapped(
  doc: jsPDF,
  text: string | undefined | null,
  x: number,
  y: number,
  options: DrawWrappedOptions
): number {
  const { maxWidth, lineHeight = 14, align = "left", pager } = options;
  const safe = String(text ?? "—");
  const lines = doc.splitTextToSize(safe, maxWidth) as string[];
  let cursor = y;
  lines.forEach((line) => {
    if (pager) {
      pager.ensureSpace(lineHeight);
      cursor = pager.y;
    }
    doc.text(line, x, cursor, { align });
    cursor += lineHeight;
    if (pager) pager.y = cursor;
  });
  return cursor;
}

/** Dashed horizontal divider between x1 and x2. */
export function drawDashed(doc: jsPDF, y: number, x1: number, x2: number) {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  const dash = 3;
  const gap = 3;
  let x = x1;
  while (x < x2) {
    doc.line(x, y, Math.min(x + dash, x2), y);
    x += dash + gap;
  }
}

/** Add "Page X of Y" to every page. Call after all content is drawn. */
export function finalizePageFooters(doc: jsPDF, extra?: string) {
  const total = doc.getNumberOfPages();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    const label = `Page ${i} of ${total}${extra ? ` • ${extra}` : ""}`;
    doc.text(label, W / 2, H - 24, { align: "center" });
  }
}
