import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Plus, Save, Rocket, Type, Variable, Image, Table, QrCode, PenTool,
  Trash2, Copy, Edit3, FileText, FileBadge, FileCheck, ClipboardList, Info,
  AlignLeft, AlignCenter, AlignRight, Bold, Upload, ChevronUp, ChevronDown,
  Undo2, Redo2, Layers, Move, Eye, RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DraggableElement from "./document/DraggableElement";
import InlineTextEditor from "./document/InlineTextEditor";
import ImageUploadDialog, { InlineImageUpload } from "./document/ImageUploadDialog";
import SignatureDialog from "./document/SignatureDialog";
import VCScreenDesigner, { type ScanScreenConfig, defaultScanScreenConfig } from "./document/VCScreenDesigner";
import { loadFormSteps, FORM_UPDATED_EVENT } from "@/lib/formStorage";
import type { WizardStep } from "@/data/wizardForm";

// ── Types ──────────────────────────────────────────────

interface ElementStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  alignment: string;
  color: string;
}

interface DocumentElement {
  id: string;
  type: "text" | "dynamic" | "image" | "table" | "qrcode" | "signature";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: ElementStyle;
  sourceMapping?: string;
}

interface DesignDocument {
  id: string;
  name: string;
  type: "certificate" | "application_pdf" | "acknowledgement" | "inspection_report" | "custom";
  elements: DocumentElement[];
  generateWhen: string;
  /** True once the Application PDF has been auto-populated from the live form. */
  syncedFromForm?: boolean;
  verifiableCredential: {
    enabled: boolean;
    credentialType: string;
    idMapping: string;
    includeQR?: boolean;
    mappedQrElementId?: string | null;
    scanScreenConfig?: ScanScreenConfig;
  };
}

// ── Helpers ────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<string, string> = {
  certificate: "Certificate",
  application_pdf: "Application PDF",
  acknowledgement: "Acknowledgement",
  inspection_report: "Inspection Report",
  custom: "Custom",
};

const DOC_TYPE_ICONS: Record<string, React.ElementType> = {
  certificate: FileBadge,
  application_pdf: FileText,
  acknowledgement: FileCheck,
  inspection_report: ClipboardList,
  custom: FileText,
};


import { TRADE_STATE_NAMES } from "@/data/tradeLicenseTemplate";
import { RENEWAL_STATE_NAMES, isRenewalModule } from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";

const CREDENTIAL_ID_OPTIONS = ["License Number", "Application Number", "Custom Field"];

const defaultStyle: ElementStyle = {
  fontFamily: "Roboto",
  fontSize: 14,
  fontWeight: "normal",
  alignment: "left",
  color: "#1a1a1a",
};

let elCounter = 100;
const uid = () => `el-${++elCounter}`;

const CANVAS_WIDTH = 560;
const CANVAS_HEIGHT = 792;

// ── Form-field catalog & Application PDF generator ────

const SYSTEM_VARS: { value: string; label: string }[] = [
  { value: "applicationNumber", label: "Application Number" },
  { value: "applicationStatus", label: "Application Status" },
  { value: "submittedOn", label: "Submitted On" },
  { value: "approvalDate", label: "Approval Date" },
  { value: "expiryDate", label: "Expiry Date" },
  { value: "licenseNumber", label: "License Number" },
  { value: "inspectorName", label: "Inspector Name" },
];

interface VarOption { value: string; label: string }
interface VarGroup { group: string; options: VarOption[] }

const buildVarCatalog = (steps: WizardStep[]): VarGroup[] => {
  const groups: VarGroup[] = [];
  steps.forEach((step) => {
    step.subScreens.forEach((sub) => {
      const options = sub.fields
        .filter((f) => f.type !== "file")
        .map((f) => ({ value: f.id, label: f.label || f.id }));
      if (options.length === 0) return;
      groups.push({ group: `${step.name} › ${sub.title}`, options });
    });
  });
  groups.push({ group: "System Variables", options: SYSTEM_VARS });
  return groups;
};

const findVarLabel = (catalog: VarGroup[], value?: string): string | null => {
  if (!value) return null;
  for (const g of catalog) {
    const hit = g.options.find((o) => o.value === value);
    if (hit) return hit.label;
  }
  return null;
};

/** Generate a stacked Application PDF layout from the live form schema.
 *  Auto-paginates so no element straddles a page boundary — when the next
 *  row would cross `CANVAS_HEIGHT - PAGE_BOTTOM`, y jumps to the top of the
 *  next page and a "Page N" header is inserted. */
const buildApplicationPdfElements = (
  steps: WizardStep[],
  docTitle = "Application Form",
): DocumentElement[] => {
  const els: DocumentElement[] = [];
  const left = 60;
  const labelW = 200;
  const valueX = 280;
  const valueW = 220;
  const pageW = 440;
  const PAGE_TOP = 40;
  const PAGE_BOTTOM = 40; // reserved footer/margin
  const usableBottom = CANVAS_HEIGHT - PAGE_BOTTOM;
  let pageIndex = 0;
  let y = PAGE_TOP;
  let n = 0;
  const nid = () => `app-${Date.now().toString(36)}-${++n}`;

  // Absolute Y for a given (pageIndex, localY) so each page is stacked
  // vertically in the canvas — DraggableElement uses absolute coords.
  const absY = (local: number) => pageIndex * CANVAS_HEIGHT + local;

  const newPage = () => {
    pageIndex += 1;
    y = PAGE_TOP;
    els.push({
      id: nid(), type: "text", content: `${docTitle} — Page ${pageIndex + 1}`,
      x: left, y: absY(y), width: pageW, height: 20,
      style: { ...defaultStyle, fontSize: 11, fontWeight: "bold", color: "#6b7280", alignment: "right" },
    });
    y += 26;
  };

  const ensureSpace = (rowH: number) => {
    if (y + rowH > usableBottom) newPage();
  };

  // Title (page 1)
  els.push({
    id: nid(), type: "text", content: docTitle,
    x: left, y: absY(y), width: pageW, height: 32,
    style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" },
  });
  y += 44;
  els.push({
    id: nid(), type: "dynamic", content: "{applicationNumber}",
    x: left, y: absY(y), width: labelW, height: 20,
    style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicationNumber",
  });
  els.push({
    id: nid(), type: "dynamic", content: "{submittedOn}",
    x: valueX, y: absY(y), width: valueW, height: 20,
    style: { ...defaultStyle, alignment: "right" }, sourceMapping: "submittedOn",
  });
  y += 32;

  steps.forEach((step) => {
    ensureSpace(26);
    els.push({
      id: nid(), type: "text", content: step.name,
      x: left, y: absY(y), width: pageW, height: 22,
      style: { ...defaultStyle, fontSize: 14, fontWeight: "bold", color: "#0b4f6c" },
    });
    y += 26;
    step.subScreens.forEach((sub) => {
      const fields = sub.fields.filter((f) => f.type !== "file");
      if (fields.length === 0) return;
      if (sub.title && step.subScreens.length > 1) {
        ensureSpace(22);
        els.push({
          id: nid(), type: "text", content: sub.title,
          x: left, y: absY(y), width: pageW, height: 18,
          style: { ...defaultStyle, fontSize: 11, fontWeight: "bold", color: "#6b7280" },
        });
        y += 22;
      }
      fields.forEach((f) => {
        ensureSpace(22);
        els.push({
          id: nid(), type: "text", content: `${f.label || f.id}:`,
          x: left, y: absY(y), width: labelW, height: 18,
          style: { ...defaultStyle, fontSize: 11, color: "#374151" },
        });
        els.push({
          id: nid(), type: "dynamic", content: `{${f.id}}`,
          x: valueX, y: absY(y), width: valueW, height: 18,
          style: { ...defaultStyle, fontSize: 11 }, sourceMapping: f.id,
        });
        y += 22;
      });
      y += 4;
    });
    y += 4;
  });

  ensureSpace(40);
  els.push({
    id: nid(), type: "text",
    content: "Declaration: I hereby declare that the information provided is true and correct.",
    x: left, y: absY(y), width: pageW, height: 30,
    style: { ...defaultStyle, fontSize: 10, color: "#6b7280" },
  });
  y += 40;
  ensureSpace(60);
  els.push({
    id: nid(), type: "signature", content: "Applicant Signature",
    x: left, y: absY(y), width: 200, height: 60, style: { ...defaultStyle },
  });

  return els;
};




const createTemplateDocuments = (): DesignDocument[] => [
  {
    id: "doc-1",
    name: "License Certificate",
    type: "certificate",
    generateWhen: "License Issued",
    verifiableCredential: { enabled: true, credentialType: "TradeCredential", idMapping: "License Number", includeQR: true },
    elements: [
      { id: "e1", type: "image", content: "Government Logo", x: 220, y: 20, width: 120, height: 60, style: { ...defaultStyle, alignment: "center" } },
      { id: "e2", type: "text", content: "Business License Certificate", x: 60, y: 100, width: 440, height: 36, style: { ...defaultStyle, fontSize: 24, fontWeight: "bold", alignment: "center" } },
      { id: "e3", type: "text", content: "Department of Trade & Commerce", x: 60, y: 140, width: 440, height: 20, style: { ...defaultStyle, fontSize: 12, alignment: "center", color: "#6b7280" } },
      { id: "e4", type: "text", content: "─────────────────────────────────────────", x: 60, y: 170, width: 440, height: 16, style: { ...defaultStyle, alignment: "center", color: "#d1d5db" } },
      { id: "e5", type: "dynamic", content: "{businessName}", x: 60, y: 210, width: 440, height: 24, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" }, sourceMapping: "businessName" },
      { id: "e6", type: "dynamic", content: "{licenseNumber}", x: 60, y: 250, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "licenseNumber" },
      { id: "e7", type: "dynamic", content: "{applicantName}", x: 60, y: 280, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "e8", type: "dynamic", content: "{approvalDate}", x: 300, y: 250, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "approvalDate" },
      { id: "e9", type: "dynamic", content: "{expiryDate}", x: 300, y: 280, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "expiryDate" },
      { id: "e10", type: "qrcode", content: "QR Verification", x: 220, y: 340, width: 80, height: 80, style: { ...defaultStyle, alignment: "center" } },
      { id: "e11", type: "text", content: "This certificate is digitally verifiable.", x: 60, y: 440, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#9ca3af" } },
    ],
  },
  {
    id: "doc-2",
    name: "Application PDF",
    type: "application_pdf",
    generateWhen: "Submitted",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e20", type: "text", content: "Business License Application", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "e21", type: "text", content: "Applicant Details", x: 60, y: 100, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "e22", type: "dynamic", content: "{applicantName}", x: 60, y: 130, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "e23", type: "dynamic", content: "{applicationNumber}", x: 300, y: 130, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "applicationNumber" },
      { id: "e24", type: "text", content: "Trade Details", x: 60, y: 180, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "e25", type: "dynamic", content: "{tradeType}", x: 60, y: 210, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "tradeType" },
      { id: "e26", type: "dynamic", content: "{wardNumber}", x: 300, y: 210, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "wardNumber" },
      { id: "e27", type: "text", content: "Declaration: I hereby declare that the information provided is true and correct.", x: 60, y: 280, width: 440, height: 40, style: { ...defaultStyle, fontSize: 11, color: "#6b7280" } },
      { id: "e28", type: "signature", content: "Applicant Signature", x: 60, y: 360, width: 200, height: 60, style: { ...defaultStyle } },
    ],
  },
  {
    id: "doc-3",
    name: "Acknowledgement",
    type: "acknowledgement",
    generateWhen: "Submitted",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e30", type: "text", content: "Application Acknowledgement", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "e31", type: "text", content: "Your application has been successfully submitted.", x: 60, y: 90, width: 440, height: 20, style: { ...defaultStyle, alignment: "center", color: "#6b7280" } },
      { id: "e32", type: "dynamic", content: "{applicationNumber}", x: 60, y: 140, width: 440, height: 24, style: { ...defaultStyle, fontSize: 18, fontWeight: "bold", alignment: "center" }, sourceMapping: "applicationNumber" },
      { id: "e33", type: "text", content: "Next Steps:", x: 60, y: 200, width: 440, height: 20, style: { ...defaultStyle, fontWeight: "bold" } },
      { id: "e34", type: "text", content: "1. Your application will be reviewed by the concerned authority.\n2. You will receive updates via SMS and email.\n3. Track your application using the reference number above.", x: 60, y: 230, width: 440, height: 60, style: { ...defaultStyle, fontSize: 12, color: "#6b7280" } },
    ],
  },
  {
    id: "doc-4",
    name: "Inspection Report",
    type: "inspection_report",
    generateWhen: "Inspection Pending",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e40", type: "text", content: "Inspection Report", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "e41", type: "dynamic", content: "{businessName}", x: 60, y: 100, width: 220, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "businessName" },
      { id: "e42", type: "dynamic", content: "{licenseNumber}", x: 300, y: 100, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "licenseNumber" },
      { id: "e43", type: "dynamic", content: "{inspectorName}", x: 60, y: 140, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "inspectorName" },
      { id: "e44", type: "text", content: "Findings", x: 60, y: 190, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "e45", type: "table", content: "Inspection Findings Table", x: 60, y: 220, width: 440, height: 100, style: { ...defaultStyle } },
      { id: "e46", type: "signature", content: "Inspector Signature", x: 60, y: 360, width: 200, height: 60, style: { ...defaultStyle } },
    ],
  },
  {
    id: "doc-5",
    name: "Payment Receipt",
    type: "custom",
    generateWhen: "Paid",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e50", type: "text", content: "Payment Receipt", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "e51", type: "text", content: "Department of Trade & Commerce", x: 60, y: 80, width: 440, height: 18, style: { ...defaultStyle, fontSize: 12, alignment: "center", color: "#6b7280" } },
      { id: "e52", type: "dynamic", content: "{applicationNumber}", x: 60, y: 130, width: 220, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicationNumber" },
      { id: "e53", type: "dynamic", content: "{applicantName}", x: 300, y: 130, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "e54", type: "text", content: "Amount Paid", x: 60, y: 180, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "e55", type: "table", content: "Fee Breakdown", x: 60, y: 210, width: 440, height: 120, style: { ...defaultStyle } },
      { id: "e56", type: "text", content: "Thank you for your payment.", x: 60, y: 360, width: 440, height: 20, style: { ...defaultStyle, alignment: "center", color: "#6b7280" } },
    ],
  },
  {
    id: "doc-6",
    name: "Demand Notice",
    type: "custom",
    generateWhen: "Payment Pending",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e60", type: "image", content: "Government Logo", x: 240, y: 24, width: 80, height: 40, style: { ...defaultStyle, alignment: "center" } },
      { id: "e61", type: "text", content: "Government of India", x: 60, y: 72, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#6b7280" } },
      { id: "e62", type: "text", content: "Department of Municipal Administration", x: 60, y: 90, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#6b7280" } },
      { id: "e63", type: "text", content: "Demand Notice / Fee Bill", x: 60, y: 120, width: 440, height: 28, style: { ...defaultStyle, fontSize: 18, fontWeight: "bold", alignment: "center" } },
      { id: "e64", type: "text", content: "Application ID", x: 60, y: 170, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "e65", type: "dynamic", content: "{applicationNumber}", x: 60, y: 188, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicationNumber" },
      { id: "e66", type: "text", content: "Applicant", x: 300, y: 170, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "e67", type: "dynamic", content: "{applicantName}", x: 300, y: 188, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicantName" },
      { id: "e68", type: "text", content: "Business", x: 60, y: 220, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "e69", type: "dynamic", content: "{businessName}", x: 60, y: 238, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "businessName" },
      { id: "e70", type: "text", content: "Issued On", x: 300, y: 220, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "e71", type: "dynamic", content: "{submittedOn}", x: 300, y: 238, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "submittedOn" },
      { id: "e72", type: "text", content: "Fee Breakdown", x: 60, y: 280, width: 440, height: 22, style: { ...defaultStyle, fontSize: 14, fontWeight: "bold" } },
      { id: "e73", type: "table", content: "Demand Line Items", x: 60, y: 308, width: 440, height: 140, style: { ...defaultStyle } },
      { id: "e74", type: "text", content: "Total Amount Payable", x: 60, y: 470, width: 280, height: 22, style: { ...defaultStyle, fontSize: 12, fontWeight: "bold" } },
      { id: "e75", type: "dynamic", content: "₹{amount}", x: 340, y: 470, width: 160, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold", alignment: "right" }, sourceMapping: "amount" },
      { id: "e76", type: "text", content: "Please complete payment to proceed with license issuance.", x: 60, y: 510, width: 440, height: 18, style: { ...defaultStyle, fontSize: 11, alignment: "center", color: "#6b7280" } },
      { id: "e77", type: "text", content: "This is a system-generated demand notice. No physical signature required.", x: 60, y: 540, width: 440, height: 16, style: { ...defaultStyle, fontSize: 9, alignment: "center", color: "#9ca3af" } },
    ],
  },
];

// ── Toolbar items ──────────────────────────────────────

const TOOLBAR_ITEMS = [
  { type: "text" as const, icon: Type, label: "Text" },
  { type: "dynamic" as const, icon: Variable, label: "Field" },
  { type: "image" as const, icon: Image, label: "Image" },
  { type: "table" as const, icon: Table, label: "Table" },
  { type: "qrcode" as const, icon: QrCode, label: "QR Code" },
  { type: "signature" as const, icon: PenTool, label: "Signature" },
];

// Renewal-specific document set: simpler list, no inspection report,
// renewed certificate copy.
const createRenewalDocuments = (): DesignDocument[] => [
  {
    id: "rdoc-1",
    name: "Renewed License Certificate",
    type: "certificate",
    generateWhen: "License Renewed",
    verifiableCredential: { enabled: true, credentialType: "TradeCredential", idMapping: "License Number", includeQR: true },
    elements: [
      { id: "re1", type: "image", content: "Government Logo", x: 220, y: 20, width: 120, height: 60, style: { ...defaultStyle, alignment: "center" } },
      { id: "re2", type: "text", content: "Business License — Renewal Certificate", x: 60, y: 100, width: 440, height: 36, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "re3", type: "text", content: "Department of Trade & Commerce", x: 60, y: 140, width: 440, height: 20, style: { ...defaultStyle, fontSize: 12, alignment: "center", color: "#6b7280" } },
      { id: "re5", type: "dynamic", content: "{businessName}", x: 60, y: 210, width: 440, height: 24, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" }, sourceMapping: "businessName" },
      { id: "re6", type: "dynamic", content: "{licenseNumber}", x: 60, y: 250, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "licenseNumber" },
      { id: "re7", type: "dynamic", content: "{applicantName}", x: 60, y: 280, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "re8", type: "text", content: "Renewed Until:", x: 300, y: 250, width: 100, height: 20, style: { ...defaultStyle, fontSize: 12, color: "#6b7280" } },
      { id: "re9", type: "dynamic", content: "{expiryDate}", x: 300, y: 280, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "expiryDate" },
      { id: "re10", type: "qrcode", content: "QR Verification", x: 220, y: 340, width: 80, height: 80, style: { ...defaultStyle, alignment: "center" } },
      { id: "re11", type: "text", content: "This renewal certificate is digitally verifiable.", x: 60, y: 440, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#9ca3af" } },
    ],
  },
  {
    id: "rdoc-2",
    name: "Renewal Application PDF",
    type: "application_pdf",
    generateWhen: "Submitted",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "re20", type: "text", content: "Business License Renewal Application", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "re21", type: "text", content: "Applicant Details", x: 60, y: 100, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "re22", type: "dynamic", content: "{applicantName}", x: 60, y: 130, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "re23", type: "dynamic", content: "{applicationNumber}", x: 300, y: 130, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "applicationNumber" },
      { id: "re24", type: "text", content: "Existing License", x: 60, y: 180, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "re25", type: "dynamic", content: "{licenseNumber}", x: 60, y: 210, width: 220, height: 20, style: { ...defaultStyle }, sourceMapping: "licenseNumber" },
      { id: "re26", type: "dynamic", content: "{businessName}", x: 300, y: 210, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "businessName" },
      { id: "re27", type: "text", content: "Declaration: I confirm the details above are unchanged or have been updated.", x: 60, y: 280, width: 440, height: 40, style: { ...defaultStyle, fontSize: 11, color: "#6b7280" } },
      { id: "re28", type: "signature", content: "Applicant Signature", x: 60, y: 360, width: 200, height: 60, style: { ...defaultStyle } },
    ],
  },
  {
    id: "rdoc-3",
    name: "Renewal Acknowledgement",
    type: "acknowledgement",
    generateWhen: "Submitted",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "re30", type: "text", content: "Renewal Application Acknowledgement", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "re31", type: "text", content: "Your renewal application has been successfully submitted.", x: 60, y: 90, width: 440, height: 20, style: { ...defaultStyle, alignment: "center", color: "#6b7280" } },
      { id: "re32", type: "dynamic", content: "{applicationNumber}", x: 60, y: 140, width: 440, height: 24, style: { ...defaultStyle, fontSize: 18, fontWeight: "bold", alignment: "center" }, sourceMapping: "applicationNumber" },
      { id: "re33", type: "text", content: "Next Steps:", x: 60, y: 200, width: 440, height: 20, style: { ...defaultStyle, fontWeight: "bold" } },
      { id: "re34", type: "text", content: "1. Your renewal will be reviewed by the verification team.\n2. You will receive payment instructions once approved.\n3. Track your renewal using the reference number above.", x: 60, y: 230, width: 440, height: 60, style: { ...defaultStyle, fontSize: 12, color: "#6b7280" } },
    ],
  },
  {
    id: "rdoc-4",
    name: "Renewal Payment Receipt",
    type: "custom",
    generateWhen: "Paid",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "re50", type: "text", content: "Renewal Payment Receipt", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
      { id: "re51", type: "text", content: "Department of Trade & Commerce", x: 60, y: 80, width: 440, height: 18, style: { ...defaultStyle, fontSize: 12, alignment: "center", color: "#6b7280" } },
      { id: "re52", type: "dynamic", content: "{applicationNumber}", x: 60, y: 130, width: 220, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicationNumber" },
      { id: "re53", type: "dynamic", content: "{applicantName}", x: 300, y: 130, width: 200, height: 20, style: { ...defaultStyle }, sourceMapping: "applicantName" },
      { id: "re54", type: "text", content: "Amount Paid", x: 60, y: 180, width: 440, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold" } },
      { id: "re55", type: "table", content: "Renewal Fee Breakdown", x: 60, y: 210, width: 440, height: 100, style: { ...defaultStyle } },
      { id: "re56", type: "text", content: "Thank you for renewing your licence.", x: 60, y: 340, width: 440, height: 20, style: { ...defaultStyle, alignment: "center", color: "#6b7280" } },
    ],
  },
  {
    id: "rdoc-5",
    name: "Renewal Demand Notice",
    type: "custom",
    generateWhen: "Payment Pending",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "re60", type: "image", content: "Government Logo", x: 240, y: 24, width: 80, height: 40, style: { ...defaultStyle, alignment: "center" } },
      { id: "re61", type: "text", content: "Government of India", x: 60, y: 72, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#6b7280" } },
      { id: "re62", type: "text", content: "Department of Municipal Administration", x: 60, y: 90, width: 440, height: 16, style: { ...defaultStyle, fontSize: 10, alignment: "center", color: "#6b7280" } },
      { id: "re63", type: "text", content: "Renewal Demand Notice", x: 60, y: 120, width: 440, height: 28, style: { ...defaultStyle, fontSize: 18, fontWeight: "bold", alignment: "center" } },
      { id: "re64", type: "text", content: "Application ID", x: 60, y: 170, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "re65", type: "dynamic", content: "{applicationNumber}", x: 60, y: 188, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicationNumber" },
      { id: "re66", type: "text", content: "Applicant", x: 300, y: 170, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "re67", type: "dynamic", content: "{applicantName}", x: 300, y: 188, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "applicantName" },
      { id: "re68", type: "text", content: "Business", x: 60, y: 220, width: 200, height: 16, style: { ...defaultStyle, fontSize: 10, color: "#6b7280" } },
      { id: "re69", type: "dynamic", content: "{businessName}", x: 60, y: 238, width: 200, height: 20, style: { ...defaultStyle, fontWeight: "bold" }, sourceMapping: "businessName" },
      { id: "re70", type: "text", content: "Fee Breakdown", x: 60, y: 280, width: 440, height: 22, style: { ...defaultStyle, fontSize: 14, fontWeight: "bold" } },
      { id: "re71", type: "table", content: "Renewal Demand Line Items", x: 60, y: 308, width: 440, height: 120, style: { ...defaultStyle } },
      { id: "re72", type: "text", content: "Total Amount Payable", x: 60, y: 450, width: 280, height: 22, style: { ...defaultStyle, fontSize: 12, fontWeight: "bold" } },
      { id: "re73", type: "dynamic", content: "₹{amount}", x: 340, y: 450, width: 160, height: 22, style: { ...defaultStyle, fontSize: 16, fontWeight: "bold", alignment: "right" }, sourceMapping: "amount" },
      { id: "re74", type: "text", content: "Please complete payment to renew your licence.", x: 60, y: 490, width: 440, height: 18, style: { ...defaultStyle, fontSize: 11, alignment: "center", color: "#6b7280" } },
    ],
  },
];

// ── Component ──────────────────────────────────────────

interface Props {
  moduleName: string;
  onBack: () => void;
}

const DocumentDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const renewal = isRenewalModule(moduleName);
  const GENERATE_WHEN_OPTIONS = [
    ...(renewal ? RENEWAL_STATE_NAMES : TRADE_STATE_NAMES),
    "Workflow State Selection",
  ];
  const [documents, setDocuments] = useModuleState<DesignDocument[]>(
    "documents", serviceId, moduleName,
    () => (renewal ? createRenewalDocuments() : createTemplateDocuments()),
  );
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id ?? "");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadTarget, setImageUploadTarget] = useState<string | null>(null); // element id or null for new
  const [showVCDesigner, setShowVCDesigner] = useState(false);
  const [syncConfirmDocId, setSyncConfirmDocId] = useState<string | null>(null);

  // Live form schema → variable catalog
  const [formSteps, setFormSteps] = useState<WizardStep[]>(() =>
    loadFormSteps(serviceId, "Issuance"),
  );
  useEffect(() => {
    const refresh = () => setFormSteps(loadFormSteps(serviceId, "Issuance"));
    refresh();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || (detail.serviceId === serviceId && detail.moduleName === "Issuance")) refresh();
    };
    window.addEventListener(FORM_UPDATED_EVENT, handler);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FORM_UPDATED_EVENT, handler);
      window.removeEventListener("storage", refresh);
    };
  }, [serviceId]);
  const varCatalog = useMemo(() => buildVarCatalog(formSteps), [formSteps]);
  const firstFieldValue = varCatalog[0]?.options[0]?.value ?? "applicationNumber";

  // Undo/Redo
  const [history, setHistory] = useState<DesignDocument[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents.find((d) => d.id === activeDocId)!;
  const selectedElement = selectedElementId ? activeDoc.elements.find((e) => e.id === selectedElementId) : null;
  const qrElements = activeDoc?.elements.filter((e) => e.type === "qrcode") ?? [];

  // Auto-seed Application PDF once from the live form
  useEffect(() => {
    const pending = documents.find(
      (d) => d.type === "application_pdf" && !d.syncedFromForm,
    );
    if (!pending) return;
    if (formSteps.length === 0) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === pending.id
          ? { ...d, elements: buildApplicationPdfElements(formSteps, d.name), syncedFromForm: true }
          : d,
      ),
    );
    // run once per service+module on first load with form data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSteps]);


  // Auto-disable VC / clear mapped QR if the underlying QR elements are gone
  useEffect(() => {
    if (!activeDoc) return;
    const vc = activeDoc.verifiableCredential;
    if (qrElements.length === 0 && (vc.enabled || vc.mappedQrElementId)) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? { ...d, verifiableCredential: { ...d.verifiableCredential, enabled: false, mappedQrElementId: null } }
            : d
        )
      );
      return;
    }
    if (vc.mappedQrElementId && !qrElements.some((q) => q.id === vc.mappedQrElementId)) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? { ...d, verifiableCredential: { ...d.verifiableCredential, mappedQrElementId: qrElements[0]?.id ?? null } }
            : d
        )
      );
    }
    if (vc.enabled && qrElements.length === 1 && !vc.mappedQrElementId) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === activeDocId
            ? { ...d, verifiableCredential: { ...d.verifiableCredential, mappedQrElementId: qrElements[0].id } }
            : d
        )
      );
    }
  }, [qrElements.length, activeDocId, activeDoc?.verifiableCredential.enabled, activeDoc?.verifiableCredential.mappedQrElementId]);

  const pushHistory = useCallback((docs: DesignDocument[]) => {
    setHistory((prev) => {
      const newH = prev.slice(0, historyIndex + 1);
      newH.push(JSON.parse(JSON.stringify(docs)));
      return newH.slice(-30);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setDocuments(JSON.parse(JSON.stringify(history[newIdx])));
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setDocuments(JSON.parse(JSON.stringify(history[newIdx])));
  }, [history, historyIndex]);

  // ── Document CRUD ────────────────────────────────────

  const setDocumentsWithHistory = useCallback((updater: (prev: DesignDocument[]) => DesignDocument[]) => {
    setDocuments((prev) => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const createDocument = () => {
    if (!newDocName.trim()) return;
    const doc: DesignDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      type: "custom",
      elements: [],
      generateWhen: "Submitted",
      verifiableCredential: { enabled: false, credentialType: "", idMapping: "", mappedQrElementId: null },
    };
    setDocumentsWithHistory((prev) => [...prev, doc]);
    setActiveDocId(doc.id);
    setSelectedElementId(null);
    setShowCreateModal(false);
    setNewDocName("");
  };

  const duplicateDocument = (id: string) => {
    const src = documents.find((d) => d.id === id);
    if (!src) return;
    const dup: DesignDocument = {
      ...src,
      id: `doc-${Date.now()}`,
      name: `${src.name} (Copy)`,
      elements: src.elements.map((e) => ({ ...e, id: uid() })),
    };
    setDocumentsWithHistory((prev) => [...prev, dup]);
    setActiveDocId(dup.id);
  };

  const deleteDocument = () => {
    if (!deleteDocId) return;
    setDocumentsWithHistory((prev) => {
      const next = prev.filter((d) => d.id !== deleteDocId);
      if (activeDocId === deleteDocId && next.length) setActiveDocId(next[0].id);
      return next;
    });
    setSelectedElementId(null);
    setDeleteDocId(null);
  };

  const renameDocument = (id: string) => {
    if (!editingName.trim()) { setEditingDocId(null); return; }
    setDocumentsWithHistory((prev) => prev.map((d) => (d.id === id ? { ...d, name: editingName.trim() } : d)));
    setEditingDocId(null);
  };

  const updateDocField = (field: keyof DesignDocument, value: any) => {
    setDocumentsWithHistory((prev) => prev.map((d) => (d.id === activeDocId ? { ...d, [field]: value } : d)));
  };

  const updateVC = (field: string, value: any) => {
    setDocumentsWithHistory((prev) =>
      prev.map((d) =>
        d.id === activeDocId ? { ...d, verifiableCredential: { ...d.verifiableCredential, [field]: value } } : d
      )
    );
  };

  const syncApplicationPdf = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    setDocumentsWithHistory((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, elements: buildApplicationPdfElements(formSteps, d.name), syncedFromForm: true }
          : d,
      ),
    );
    setSelectedElementId(null);
    toast({ title: "Application PDF synced", description: `Rebuilt from ${formSteps.reduce((n, s) => n + s.subScreens.reduce((m, ss) => m + ss.fields.length, 0), 0)} form fields.` });
  };

  // ── Element operations ───────────────────────────────

  const addElement = (type: DocumentElement["type"]) => {
    if (type === "image") {
      setImageUploadTarget(null);
      setShowImageUpload(true);
      return;
    }
    const el: DocumentElement = {
      id: uid(),
      type,
      content: type === "dynamic" ? `{${firstFieldValue}}` : type === "qrcode" ? "QR Code" : type === "signature" ? "Signature" : type === "table" ? "Data Table" : "New Text",
      x: 60,
      y: 40 + activeDoc.elements.length * 30,
      width: type === "qrcode" ? 80 : type === "signature" ? 200 : 440,
      height: type === "qrcode" ? 80 : type === "table" ? 100 : type === "signature" ? 60 : 24,
      style: { ...defaultStyle },
      sourceMapping: type === "dynamic" ? firstFieldValue : undefined,
    };
    setDocumentsWithHistory((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, elements: [...d.elements, el] } : d))
    );
    setSelectedElementId(el.id);
  };

  const addImageElement = (dataUrl: string) => {
    if (imageUploadTarget) {
      // Replace existing image
      updateElement(imageUploadTarget, { content: dataUrl });
    } else {
      const el: DocumentElement = {
        id: uid(),
        type: "image",
        content: dataUrl,
        x: 60,
        y: 40 + activeDoc.elements.length * 30,
        width: 120,
        height: 80,
        style: { ...defaultStyle },
      };
      setDocumentsWithHistory((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, elements: [...d.elements, el] } : d))
      );
      setSelectedElementId(el.id);
    }
    setImageUploadTarget(null);
  };

  const deleteElement = (elId: string) => {
    setDocumentsWithHistory((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, elements: d.elements.filter((e) => e.id !== elId) } : d))
    );
    if (selectedElementId === elId) setSelectedElementId(null);
  };

  const updateElement = (elId: string, updates: Partial<DocumentElement>) => {
    setDocumentsWithHistory((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, elements: d.elements.map((e) => (e.id === elId ? { ...e, ...updates } : e)) }
          : d
      )
    );
  };

  // Non-history version for drag (too frequent)
  const updateElementSilent = (elId: string, updates: Partial<DocumentElement>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, elements: d.elements.map((e) => (e.id === elId ? { ...e, ...updates } : e)) }
          : d
      )
    );
  };

  const updateElementStyle = (elId: string, styleUpdates: Partial<ElementStyle>) => {
    setDocumentsWithHistory((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, elements: d.elements.map((e) => (e.id === elId ? { ...e, style: { ...e.style, ...styleUpdates } } : e)) }
          : d
      )
    );
  };

  const moveElementLayer = (elId: string, direction: "up" | "down") => {
    setDocumentsWithHistory((prev) =>
      prev.map((d) => {
        if (d.id !== activeDocId) return d;
        const idx = d.elements.findIndex((e) => e.id === elId);
        if (idx < 0) return d;
        const newIdx = direction === "up" ? idx + 1 : idx - 1;
        if (newIdx < 0 || newIdx >= d.elements.length) return d;
        const els = [...d.elements];
        [els[idx], els[newIdx]] = [els[newIdx], els[idx]];
        return { ...d, elements: els };
      })
    );
  };

  const duplicateElement = (elId: string) => {
    const el = activeDoc.elements.find((e) => e.id === elId);
    if (!el) return;
    const dup = { ...el, id: uid(), x: el.x + 10, y: el.y + 10 };
    setDocumentsWithHistory((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, elements: [...d.elements, dup] } : d))
    );
    setSelectedElementId(dup.id);
  };

  // ── Keyboard shortcuts ──────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return; // Don't capture when editing text

      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      }
      if (e.key === "d" && (e.ctrlKey || e.metaKey) && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.key === "y" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Escape") {
        setSelectedElementId(null);
        setEditingTextId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedElementId, editingTextId, undo, redo]);

  // ── Handle move/resize from DraggableElement ────────

  const handleMove = useCallback((id: string, x: number, y: number) => {
    updateElementSilent(id, { x, y });
  }, [activeDocId]);

  const handleResize = useCallback((id: string, width: number, height: number, x: number, y: number) => {
    updateElementSilent(id, { width, height, x, y });
  }, [activeDocId]);

  const handleDoubleClick = useCallback((id: string) => {
    const el = activeDoc.elements.find((e) => e.id === id);
    if (el && (el.type === "text")) {
      setEditingTextId(id);
    }
  }, [activeDoc]);

  // ── Render element content ──────────────────────────

  const renderElementContent = (el: DocumentElement) => {
    const textStyle: React.CSSProperties = {
      fontFamily: el.style.fontFamily,
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight === "bold" ? 700 : 400,
      textAlign: el.style.alignment as any,
      color: el.style.color,
      width: "100%",
      height: "100%",
      padding: "2px 4px",
    };

    if (el.type === "text") {
      return (
        <InlineTextEditor
          content={el.content}
          style={textStyle}
          isEditing={editingTextId === el.id}
          onFinish={(newContent) => {
            updateElement(el.id, { content: newContent });
            setEditingTextId(null);
          }}
          onCancel={() => setEditingTextId(null)}
        />
      );
    }

    if (el.type === "dynamic") {
      return (
        <div style={textStyle} className="flex items-center">
          <span className="text-blue-600 font-mono text-xs bg-blue-50 px-1 rounded">{el.content}</span>
        </div>
      );
    }

    if (el.type === "qrcode") {
      return (
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full">
          <QrCode className="h-8 w-8 text-muted-foreground/50" />
        </div>
      );
    }

    if (el.type === "signature") {
      if (el.content.startsWith("data:")) {
        return (
          <div className="w-full h-full flex items-center justify-center p-1">
            <img src={el.content} alt="Signature" className="max-w-full max-h-full object-contain" />
          </div>
        );
      }
      return (
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full gap-2">
          <PenTool className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/50">{el.content}</span>
        </div>
      );
    }

    if (el.type === "image") {
      if (el.content.startsWith("data:")) {
        return (
          <img src={el.content} alt="Uploaded" className="w-full h-full object-contain" />
        );
      }
      return (
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full bg-muted/20 gap-1">
          <Image className="h-4 w-4 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/50">{el.content}</span>
        </div>
      );
    }

    if (el.type === "table") {
      return (
        <div className="border border-muted-foreground/20 rounded w-full h-full flex flex-col">
          <div className="flex border-b border-muted-foreground/20 bg-muted/30">
            <div className="flex-1 px-2 py-1 text-[9px] font-semibold text-muted-foreground border-r border-muted-foreground/20">Column 1</div>
            <div className="flex-1 px-2 py-1 text-[9px] font-semibold text-muted-foreground border-r border-muted-foreground/20">Column 2</div>
            <div className="flex-1 px-2 py-1 text-[9px] font-semibold text-muted-foreground">Column 3</div>
          </div>
          <div className="flex border-b border-muted-foreground/10">
            <div className="flex-1 px-2 py-1 text-[9px] text-muted-foreground/60 border-r border-muted-foreground/10">Data</div>
            <div className="flex-1 px-2 py-1 text-[9px] text-muted-foreground/60 border-r border-muted-foreground/10">Data</div>
            <div className="flex-1 px-2 py-1 text-[9px] text-muted-foreground/60">Data</div>
          </div>
        </div>
      );
    }

    return <div style={textStyle}>{el.content}</div>;
  };

  // Element type labels
  const TYPE_LABELS: Record<string, string> = {
    text: "Text",
    dynamic: "Field",
    image: "Image",
    table: "Table",
    qrcode: "QR",
    signature: "Sign",
  };

  // ── JSX ──────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Document Designer</h1>
            <p className="text-xs text-muted-foreground">Business License · {moduleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Document saved" })}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <aside className="w-64 border-r bg-card flex flex-col shrink-0">
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Documents</h2>
            <Button size="sm" className="w-full gap-1.5" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" /> Create Document
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {documents.map((doc) => {
                const Icon = DOC_TYPE_ICONS[doc.type] || FileText;
                const isActive = doc.id === activeDocId;
                return (
                  <div
                    key={doc.id}
                    className={`group rounded-md px-3 py-2.5 cursor-pointer transition-colors ${isActive ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-muted/50 border-l-2 border-l-transparent"}`}
                    onClick={() => { setActiveDocId(doc.id); setSelectedElementId(null); setEditingTextId(null); }}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        {editingDocId === doc.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => renameDocument(doc.id)}
                            onKeyDown={(e) => e.key === "Enter" && renameDocument(doc.id)}
                            className="h-6 text-xs px-1"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className={`text-sm font-medium truncate ${isActive ? "text-foreground" : "text-foreground/80"}`}>{doc.name}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">{DOC_TYPE_LABELS[doc.type]}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setEditingDocId(doc.id); setEditingName(doc.name); }}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateDocument(doc.id); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDocId(doc.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Layers */}
            <Separator className="my-2" />
            <div className="p-2">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layers</h3>
              </div>
              <div className="space-y-0.5">
                {[...activeDoc.elements].reverse().map((el) => (
                  <div
                    key={el.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                      selectedElementId === el.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground/70"
                    }`}
                    onClick={() => setSelectedElementId(el.id)}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground w-6">{TYPE_LABELS[el.type]}</span>
                    <span className="truncate flex-1">
                      {el.content.startsWith("data:") ? "(uploaded)" : el.content.substring(0, 20)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* ── Center Panel ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          {/* Toolbar */}
          <div className="border-b bg-card px-4 py-2 flex items-center gap-1 shrink-0">
            {TOOLBAR_ITEMS.map((item) => (
              <Button
                key={item.type}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => addElement(item.type)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => { setImageUploadTarget(null); setShowImageUpload(true); }}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            {activeDoc?.type === "application_pdf" && (
              <>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs ml-auto"
                  onClick={() => setSyncConfirmDocId(activeDoc.id)}
                  title="Rebuild this PDF layout from the current form fields"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync with form
                </Button>
              </>
            )}
          </div>
          {/* Canvas (auto-grows in page-sized increments to fit all elements) */}
          {(() => {
            const maxBottom = activeDoc.elements.reduce(
              (m, el) => Math.max(m, el.y + el.height),
              CANVAS_HEIGHT,
            );
            const totalPages = Math.max(1, Math.ceil(maxBottom / CANVAS_HEIGHT));
            const canvasHeight = totalPages * CANVAS_HEIGHT;
            return (
              <div className="flex-1 overflow-auto flex items-start justify-center p-6">
                <div
                  ref={canvasRef}
                  className="bg-white rounded-sm shadow-lg relative"
                  style={{ width: CANVAS_WIDTH, height: canvasHeight, minHeight: canvasHeight }}
                  onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedElementId(null); setEditingTextId(null); } }}
                >
                  {/* Page break guides */}
                  {Array.from({ length: totalPages - 1 }).map((_, i) => (
                    <div
                      key={`pb-${i}`}
                      className="absolute left-0 right-0 pointer-events-none flex items-center justify-end pr-2"
                      style={{ top: (i + 1) * CANVAS_HEIGHT, transform: "translateY(-1px)" }}
                    >
                      <div className="absolute inset-x-0 border-t border-dashed border-muted-foreground/30" />
                      <span className="relative text-[10px] bg-card px-2 rounded-full border text-muted-foreground">
                        Page {i + 2}
                      </span>
                    </div>
                  ))}
                  {activeDoc.elements.map((el) => (
                    <DraggableElement
                      key={el.id}
                      id={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      isSelected={selectedElementId === el.id}
                      isHovered={hoveredElementId === el.id}
                      onSelect={(id) => { setSelectedElementId(id); setEditingTextId(null); }}
                      onDoubleClick={handleDoubleClick}
                      onMove={handleMove}
                      onResize={handleResize}
                      onHover={setHoveredElementId}
                      canvasWidth={CANVAS_WIDTH}
                      canvasHeight={canvasHeight}
                      allElements={activeDoc.elements}
                    >
                      {renderElementContent(el)}
                    </DraggableElement>
                  ))}
                  {activeDoc.elements.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                      <FileText className="h-12 w-12 mb-3" />
                      <p className="text-sm font-medium">Empty Document</p>
                      <p className="text-xs">Use the toolbar above to add elements</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </main>

        {/* ── Right Panel ── */}
        <aside className="w-72 border-l bg-card flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Element Properties */}
              {selectedElement ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {TYPE_LABELS[selectedElement.type]} Properties
                      </h3>
                      <div className="ml-auto flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateElement(selectedElement.id)} title="Duplicate (Ctrl+D)">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteElement(selectedElement.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Position & Size */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Move className="h-3 w-3" /> Position & Size
                      </Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">X</Label>
                          <Input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} className="h-7 text-xs px-1.5" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Y</Label>
                          <Input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} className="h-7 text-xs px-1.5" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">W</Label>
                          <Input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} className="h-7 text-xs px-1.5" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">H</Label>
                          <Input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })} className="h-7 text-xs px-1.5" />
                        </div>
                      </div>
                    </div>

                    {/* Layer order */}
                    <div className="flex items-center gap-1 mb-4">
                      <Label className="text-xs text-muted-foreground mr-auto">Layer</Label>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => moveElementLayer(selectedElement.id, "up")} title="Bring Forward">
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => moveElementLayer(selectedElement.id, "down")} title="Send Back">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Dynamic field mapping */}
                    {selectedElement.type === "dynamic" && (() => {
                      const currentVal = selectedElement.sourceMapping || "";
                      const knownLabel = findVarLabel(varCatalog, currentVal);
                      const isStale = currentVal && !knownLabel;
                      return (
                        <div className="space-y-2 mb-4">
                          <Label className="text-xs">Source Mapping</Label>
                          <Select
                            value={currentVal}
                            onValueChange={(v) => { updateElement(selectedElement.id, { sourceMapping: v, content: `{${v}}` }); }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select a form field" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {isStale && (
                                <SelectGroup>
                                  <SelectLabel className="text-[10px] uppercase tracking-wider text-destructive">Removed</SelectLabel>
                                  <SelectItem value={currentVal}>(removed) {currentVal}</SelectItem>
                                </SelectGroup>
                              )}
                              {varCatalog.map((g) => (
                                <SelectGroup key={g.group}>
                                  <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.group}</SelectLabel>
                                  {g.options.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                          {isStale && (
                            <p className="text-[10px] text-destructive">This field is no longer in the form. Pick a new one.</p>
                          )}
                        </div>
                      );
                    })()}


                    {/* Text / Dynamic styling */}
                    {(selectedElement.type === "text" || selectedElement.type === "dynamic") && (
                      <div className="space-y-3">
                        {selectedElement.type === "text" && (
                          <div>
                            <Label className="text-xs">Content</Label>
                            <Input
                              value={selectedElement.content}
                              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                              className="h-8 text-xs mt-1"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Font</Label>
                            <Select value={selectedElement.style.fontFamily} onValueChange={(v) => updateElementStyle(selectedElement.id, { fontFamily: v })}>
                              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["Roboto", "Inter", "Public Sans", "DM Sans", "Arial", "Times New Roman"].map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Size</Label>
                            <Input type="number" value={selectedElement.style.fontSize} onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: Number(e.target.value) })} className="h-8 text-xs mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Weight & Alignment</Label>
                          <div className="flex gap-1 mt-1">
                            <Button variant={selectedElement.style.fontWeight === "bold" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => updateElementStyle(selectedElement.id, { fontWeight: selectedElement.style.fontWeight === "bold" ? "normal" : "bold" })}>
                              <Bold className="h-3.5 w-3.5" />
                            </Button>
                            {(["left", "center", "right"] as const).map((a) => {
                              const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                              return (
                                <Button key={a} variant={selectedElement.style.alignment === a ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => updateElementStyle(selectedElement.id, { alignment: a })}>
                                  <Icon className="h-3.5 w-3.5" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={selectedElement.style.color} onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                            <Input value={selectedElement.style.color} onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} className="h-8 text-xs flex-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image properties */}
                    {selectedElement.type === "image" && (
                      <div className="space-y-3">
                        <InlineImageUpload
                          currentSrc={selectedElement.content}
                          onUpload={(dataUrl) => updateElement(selectedElement.id, { content: dataUrl })}
                        />
                      </div>
                    )}

                    {/* Signature properties */}
                    {selectedElement.type === "signature" && (
                      <SignatureDialog
                        currentSignature={selectedElement.content}
                        onSave={(dataUrl) => updateElement(selectedElement.id, { content: dataUrl })}
                      />
                    )}
                  </div>
                  <Separator />
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center">
                  <Info className="h-5 w-5 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">Select an element on the canvas to edit its properties.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Double-click text to edit inline</p>
                </div>
              )}

              {/* Document Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Document Settings</h3>
                <div>
                  <Label className="text-xs">Document Name</Label>
                  <Input value={activeDoc.name} onChange={(e) => updateDocField("name", e.target.value)} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Document Type</Label>
                  <Select value={activeDoc.type} onValueChange={(v) => updateDocField("type", v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Generate When</Label>
                  <Select value={activeDoc.generateWhen} onValueChange={(v) => updateDocField("generateWhen", v)}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENERATE_WHEN_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Verifiable Credential */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Verifiable Credential</h3>
                {qrElements.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add a QR Code element to the document to enable Verifiable Credential.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Enable VC</Label>
                      <Switch checked={activeDoc.verifiableCredential.enabled} onCheckedChange={(v) => updateVC("enabled", v)} />
                    </div>
                    {activeDoc.verifiableCredential.enabled && (
                      <div className="space-y-3 pl-1 border-l-2 border-accent/20 ml-1">
                        <div>
                          <Label className="text-xs">Credential Type</Label>
                          <Input value={activeDoc.verifiableCredential.credentialType} onChange={(e) => updateVC("credentialType", e.target.value)} className="h-8 text-xs mt-1" placeholder="e.g. TradeCredential" />
                        </div>
                        <div>
                          <Label className="text-xs">Credential ID Mapping</Label>
                          <Select value={activeDoc.verifiableCredential.idMapping} onValueChange={(v) => updateVC("idMapping", v)}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select mapping" /></SelectTrigger>
                            <SelectContent>
                              {CREDENTIAL_ID_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Verification URL</Label>
                          <Input value={`https://verify.digit.org/${activeDoc.id}`} readOnly className="h-8 text-xs mt-1 bg-muted/50 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-xs">Mapped QR Element</Label>
                          <Select
                            value={activeDoc.verifiableCredential.mappedQrElementId ?? "none"}
                            onValueChange={(v) => updateVC("mappedQrElementId", v === "none" ? null : v)}
                          >
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select QR" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {qrElements.map((q, i) => (
                                <SelectItem key={q.id} value={q.id}>
                                  QR Code {i + 1} ({Math.round(q.x)}, {Math.round(q.y)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            The VC payload will be encoded into the selected QR Code element.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 text-xs"
                          onClick={() => setShowVCDesigner(true)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Design Verification Screen
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* ── Modals ── */}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Document Name</Label>
              <Input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="e.g. Payment Receipt" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={createDocument} disabled={!newDocName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDocId} onOpenChange={(o) => !o && setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this document?</AlertDialogTitle>
            <AlertDialogDescription>Remove this document from this application? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!syncConfirmDocId} onOpenChange={(o) => !o && setSyncConfirmDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Application PDF with form?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the current Application PDF layout with one row per form field. Any custom edits to this document will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (syncConfirmDocId) { syncApplicationPdf(syncConfirmDocId); setSyncConfirmDocId(null); } }}>
              Sync now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageUploadDialog
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onImageSelected={addImageElement}
      />

      <VCScreenDesigner
        open={showVCDesigner}
        onOpenChange={setShowVCDesigner}
        config={activeDoc.verifiableCredential.scanScreenConfig || defaultScanScreenConfig}
        onSave={(config) => updateVC("scanScreenConfig", config)}
      />
    </div>
  );
};

export default DocumentDesigner;
