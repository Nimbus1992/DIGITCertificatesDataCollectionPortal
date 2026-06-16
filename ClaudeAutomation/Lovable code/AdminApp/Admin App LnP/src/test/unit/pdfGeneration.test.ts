import { vi, describe, it, expect, beforeEach } from "vitest";
import type { PreviewApplication } from "@/components/preview/PreviewContext";

// ---------------------------------------------------------------------------
// jsPDF mock — must be hoisted before any module imports that use jspdf
// ---------------------------------------------------------------------------

const mockSave = vi.fn();
const mockText = vi.fn();
const mockDoc = {
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  text: mockText,
  rect: vi.fn(),
  addImage: vi.fn(),
  save: mockSave,
  line: vi.fn(),
  setDrawColor: vi.fn(),
  setFillColor: vi.fn(),
  setLineWidth: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
  setTextColor: vi.fn(),
  getNumberOfPages: vi.fn().mockReturnValue(1),
  internal: {
    pageSize: {
      getWidth: vi.fn().mockReturnValue(595),
      getHeight: vi.fn().mockReturnValue(842),
    },
  },
};

vi.mock("jspdf", () => ({ jsPDF: vi.fn(() => mockDoc) }));

vi.mock("@/lib/pdfBranding", () => ({
  drawHeaderLogo: vi.fn(),
  hexToRgb: vi.fn().mockReturnValue([0, 112, 243]),
  resolvePdfBranding: vi.fn().mockReturnValue({
    primaryColorHex: "#0070f3",
    orgName: "Test Org",
    portalName: "Test Portal",
    logoDataUrl: null,
  }),
}));

vi.mock("@/lib/pdfUtils", () => ({
  drawDashed: vi.fn(),
  drawWrapped: vi.fn().mockReturnValue(50),
  finalizePageFooters: vi.fn(),
  makePager: vi.fn().mockReturnValue({
    y: 100,
    ensureSpace: vi.fn(),
    newPage: vi.fn(),
    setY: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import PDF functions and jsPDF AFTER mocks are registered
// ---------------------------------------------------------------------------

import { downloadLicensePdf } from "@/lib/licensePdf";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { downloadDemandNoticePdf } from "@/lib/demandNoticePdf";
import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Minimal PreviewApplication stub
// ---------------------------------------------------------------------------

function makeValidApp(): PreviewApplication {
  const now = Date.now();
  return {
    id: "app-001",
    applicationNumber: "TL-2024-001",
    type: "NEW",
    status: "License Issued",
    currentStateId: "s6",
    formData: {
      fullName: "Test Applicant",
      businessName: "Test Business",
      tradeType: "Retail Shop",
    },
    documents: [],
    checklists: {},
    demand: {
      fee: 1000,
      tax: 100,
      total: 1100,
      generatedAt: now,
      stage: "license",
      lines: [],
    },
    paymentStatus: "paid",
    paymentDetails: {
      paidAt: now,
      txnId: "TXN12345678",
      amount: 1100,
      invoiceNumber: "INV/2024/10001",
    },
    timeline: [],
    license: {
      number: "TL/2024/10001",
      issuedAt: now,
      validTill: now + 365 * 24 * 60 * 60 * 1000,
      qrSeed: "TL-2024-001",
    },
    createdAt: now,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GAP-001: PDF Generation Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply stable return values after clearAllMocks wipes mockReturnValue state
    vi.mocked(jsPDF).mockReturnValue(mockDoc as ReturnType<typeof jsPDF>);
    mockDoc.internal.pageSize.getWidth.mockReturnValue(595);
    mockDoc.internal.pageSize.getHeight.mockReturnValue(842);
    mockDoc.getNumberOfPages.mockReturnValue(1);
  });

  // Test 1: app.license = null does NOT call doc.save()
  it("downloadLicensePdf with app.license = null does NOT call doc.save()", () => {
    const app = makeValidApp();
    app.license = null;
    downloadLicensePdf(app, "Trade License");
    expect(mockSave).not.toHaveBeenCalled();
  });

  // Test 2: valid app (license present) calls doc.save() once
  it("downloadLicensePdf with valid app calls doc.save() once", () => {
    const app = makeValidApp();
    downloadLicensePdf(app, "Trade License");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  // Test 3: doc.text() was called at least once when license is present
  it("doc.text() is called at least once when license is present", () => {
    const app = makeValidApp();
    downloadLicensePdf(app, "Trade License");
    expect(mockText).toHaveBeenCalled();
  });

  // Test 4: downloadInvoicePdf with valid app calls doc.save()
  it("downloadInvoicePdf with valid app calls doc.save()", () => {
    const app = makeValidApp();
    downloadInvoicePdf(app, "Trade License");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  // Test 5: downloadInvoicePdf with null paymentDetails returns early (no save)
  it("downloadInvoicePdf with null paymentDetails does NOT call doc.save()", () => {
    const app = makeValidApp();
    app.paymentDetails = null;
    downloadInvoicePdf(app, "Trade License");
    expect(mockSave).not.toHaveBeenCalled();
  });

  // Test 6: downloadDemandNoticePdf with valid app calls doc.save()
  it("downloadDemandNoticePdf with valid app calls doc.save()", () => {
    const app = makeValidApp();
    downloadDemandNoticePdf(app, "Trade License");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  // Test 7: jsPDF constructor called with { unit: "pt", format: "a4" } when license is present
  it("jsPDF constructor is called with { unit: 'pt', format: 'a4' } when license is present", () => {
    const app = makeValidApp();
    downloadLicensePdf(app, "Trade License");
    expect(jsPDF).toHaveBeenCalledWith({ unit: "pt", format: "a4" });
  });

  // Test 8: downloadLicensePdf called twice creates two separate PDF documents
  it("downloadLicensePdf called twice creates two separate PDF documents (jsPDF constructor called twice)", () => {
    const app = makeValidApp();
    downloadLicensePdf(app, "Trade License");
    downloadLicensePdf(app, "Trade License");
    expect(jsPDF).toHaveBeenCalledTimes(2);
  });
});
