import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Save,
  Rocket,
  Type,
  Variable,
  Image,
  Table,
  QrCode,
  PenTool,
  Trash2,
  Copy,
  Edit3,
  FileText,
  FileBadge,
  FileCheck,
  ClipboardList,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  verifiableCredential: {
    enabled: boolean;
    credentialType: string;
    idMapping: string;
    includeQR: boolean;
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

const DYNAMIC_VARS = [
  { value: "businessName", label: "Business Name" },
  { value: "licenseNumber", label: "License Number" },
  { value: "applicantName", label: "Applicant Name" },
  { value: "approvalDate", label: "Approval Date" },
  { value: "expiryDate", label: "Expiry Date" },
  { value: "applicationNumber", label: "Application Number" },
  { value: "wardNumber", label: "Ward Number" },
  { value: "tradeType", label: "Trade Type" },
  { value: "inspectorName", label: "Inspector Name" },
];

const GENERATE_WHEN_OPTIONS = [
  "Application Submitted",
  "Application Approved",
  "Payment Completed",
  "Inspection Completed",
  "Workflow State Selection",
];

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

// ── Template Documents ─────────────────────────────────

const createTemplateDocuments = (): DesignDocument[] => [
  {
    id: "doc-1",
    name: "License Certificate",
    type: "certificate",
    generateWhen: "Application Approved",
    verifiableCredential: { enabled: true, credentialType: "TradeCredential", idMapping: "License Number", includeQR: true },
    elements: [
      { id: "e1", type: "image", content: "Government Logo", x: 220, y: 20, width: 120, height: 60, style: { ...defaultStyle, alignment: "center" } },
      { id: "e2", type: "text", content: "Trade License Certificate", x: 60, y: 100, width: 440, height: 36, style: { ...defaultStyle, fontSize: 24, fontWeight: "bold", alignment: "center" } },
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
    generateWhen: "Application Submitted",
    verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    elements: [
      { id: "e20", type: "text", content: "Trade License Application", x: 60, y: 40, width: 440, height: 32, style: { ...defaultStyle, fontSize: 22, fontWeight: "bold", alignment: "center" } },
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
    generateWhen: "Application Submitted",
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
    generateWhen: "Inspection Completed",
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
];

// ── Toolbar items ──────────────────────────────────────

const TOOLBAR_ITEMS = [
  { type: "text" as const, icon: Type, label: "Add Text" },
  { type: "dynamic" as const, icon: Variable, label: "Dynamic Field" },
  { type: "image" as const, icon: Image, label: "Images" },
  { type: "table" as const, icon: Table, label: "Tables" },
  { type: "qrcode" as const, icon: QrCode, label: "QR Code" },
  { type: "signature" as const, icon: PenTool, label: "Signature" },
];

// ── Component ──────────────────────────────────────────

interface Props {
  moduleName: string;
  onBack: () => void;
}

const DocumentDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const [documents, setDocuments] = useState<DesignDocument[]>(createTemplateDocuments);
  const [activeDocId, setActiveDocId] = useState(documents[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<string>("certificate");

  const activeDoc = documents.find((d) => d.id === activeDocId)!;
  const selectedElement = selectedElementId ? activeDoc.elements.find((e) => e.id === selectedElementId) : null;

  // ── Document CRUD ────────────────────────────────────

  const createDocument = () => {
    if (!newDocName.trim()) return;
    const doc: DesignDocument = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      type: newDocType as DesignDocument["type"],
      elements: [],
      generateWhen: "Application Submitted",
      verifiableCredential: { enabled: false, credentialType: "", idMapping: "", includeQR: false },
    };
    setDocuments((prev) => [...prev, doc]);
    setActiveDocId(doc.id);
    setSelectedElementId(null);
    setShowCreateModal(false);
    setNewDocName("");
    setNewDocType("certificate");
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
    setDocuments((prev) => [...prev, dup]);
    setActiveDocId(dup.id);
  };

  const deleteDocument = () => {
    if (!deleteDocId) return;
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== deleteDocId);
      if (activeDocId === deleteDocId && next.length) setActiveDocId(next[0].id);
      return next;
    });
    setSelectedElementId(null);
    setDeleteDocId(null);
  };

  const renameDocument = (id: string) => {
    if (!editingName.trim()) { setEditingDocId(null); return; }
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, name: editingName.trim() } : d)));
    setEditingDocId(null);
  };

  const updateDocField = (field: keyof DesignDocument, value: any) => {
    setDocuments((prev) => prev.map((d) => (d.id === activeDocId ? { ...d, [field]: value } : d)));
  };

  const updateVC = (field: string, value: any) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId ? { ...d, verifiableCredential: { ...d.verifiableCredential, [field]: value } } : d
      )
    );
  };

  // ── Element operations ───────────────────────────────

  const addElement = (type: DocumentElement["type"]) => {
    const el: DocumentElement = {
      id: uid(),
      type,
      content: type === "dynamic" ? "{fieldName}" : type === "qrcode" ? "QR Code" : type === "signature" ? "Signature" : type === "table" ? "Data Table" : type === "image" ? "Image Placeholder" : "New Text",
      x: 60,
      y: 40 + activeDoc.elements.length * 30,
      width: type === "qrcode" ? 80 : type === "signature" ? 200 : 440,
      height: type === "qrcode" ? 80 : type === "table" ? 100 : type === "signature" ? 60 : 24,
      style: { ...defaultStyle },
      sourceMapping: type === "dynamic" ? "businessName" : undefined,
    };
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, elements: [...d.elements, el] } : d))
    );
    setSelectedElementId(el.id);
  };

  const deleteElement = (elId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, elements: d.elements.filter((e) => e.id !== elId) } : d))
    );
    if (selectedElementId === elId) setSelectedElementId(null);
  };

  const updateElement = (elId: string, updates: Partial<DocumentElement>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, elements: d.elements.map((e) => (e.id === elId ? { ...e, ...updates } : e)) }
          : d
      )
    );
  };

  const updateElementStyle = (elId: string, styleUpdates: Partial<ElementStyle>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId
          ? { ...d, elements: d.elements.map((e) => (e.id === elId ? { ...e, style: { ...e.style, ...styleUpdates } } : e)) }
          : d
      )
    );
  };

  // ── Render helpers ───────────────────────────────────

  const renderCanvasElement = (el: DocumentElement) => {
    const isSelected = selectedElementId === el.id;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      fontFamily: el.style.fontFamily,
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight === "bold" ? 700 : 400,
      textAlign: el.style.alignment as any,
      color: el.style.color,
      cursor: "pointer",
      border: isSelected ? "2px dashed hsl(var(--primary))" : "1px solid transparent",
      borderRadius: 2,
      padding: "2px 4px",
      transition: "border-color 0.15s",
      overflow: "hidden",
      whiteSpace: el.type === "text" && el.content.includes("\n") ? "pre-wrap" : undefined,
    };

    if (el.type === "dynamic") {
      return (
        <div key={el.id} style={baseStyle} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
          <span className="text-blue-600 font-mono text-xs bg-blue-50 px-1 rounded">{el.content}</span>
        </div>
      );
    }

    if (el.type === "qrcode") {
      return (
        <div key={el.id} style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full">
            <QrCode className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </div>
      );
    }

    if (el.type === "signature") {
      return (
        <div key={el.id} style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full gap-2">
            <PenTool className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/50">{el.content}</span>
          </div>
        </div>
      );
    }

    if (el.type === "image") {
      return (
        <div key={el.id} style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center w-full h-full bg-muted/20 gap-1">
            <Image className="h-4 w-4 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">{el.content}</span>
          </div>
        </div>
      );
    }

    if (el.type === "table") {
      return (
        <div key={el.id} style={baseStyle} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
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
        </div>
      );
    }

    // text
    return (
      <div key={el.id} style={baseStyle} onClick={() => setSelectedElementId(el.id)} className="hover:border-primary/40">
        {el.content}
      </div>
    );
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
            <p className="text-xs text-muted-foreground">Trade License · {moduleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Document saved" })}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5" onClick={() => toast({ title: "Document published" })}>
            <Rocket className="h-4 w-4" /> Publish
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <aside className="w-64 border-r bg-card flex flex-col shrink-0">
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Documents</h2>
            <p className="text-xs text-muted-foreground">Design documents generated automatically.</p>
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
                    className={`group relative rounded-md px-3 py-2.5 cursor-pointer transition-colors ${isActive ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-muted/50 border-l-2 border-l-transparent"}`}
                    onClick={() => { setActiveDocId(doc.id); setSelectedElementId(null); }}
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
                    </div>
                    {/* Hover actions */}
                    <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5">
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
                );
              })}
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
          </div>
          {/* Canvas */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            <div
              className="bg-white rounded-sm shadow-lg relative"
              style={{ width: 560, height: 792, minHeight: 792 }}
              onClick={() => setSelectedElementId(null)}
            >
              {activeDoc.elements.map(renderCanvasElement)}
              {activeDoc.elements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                  <FileText className="h-12 w-12 mb-3" />
                  <p className="text-sm font-medium">Empty Document</p>
                  <p className="text-xs">Use the toolbar above to add elements</p>
                </div>
              )}
            </div>
          </div>
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
                      <h3 className="text-sm font-semibold text-foreground">Element Properties</h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive" onClick={() => deleteElement(selectedElement.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {selectedElement.type === "dynamic" && (
                      <div className="space-y-2 mb-4">
                        <Label className="text-xs">Source Mapping</Label>
                        <Select value={selectedElement.sourceMapping || ""} onValueChange={(v) => { updateElement(selectedElement.id, { sourceMapping: v, content: `{${v}}` }); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {DYNAMIC_VARS.map((v) => (
                              <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(selectedElement.type === "text" || selectedElement.type === "dynamic") && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Content</Label>
                          <Input
                            value={selectedElement.content}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Font Family</Label>
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
                  </div>
                  <Separator />
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center">
                  <Info className="h-5 w-5 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">Select an element on the canvas to edit its properties.</p>
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Enable Verifiable Credential</Label>
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
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Include QR Code</Label>
                      <Switch checked={activeDoc.verifiableCredential.includeQR} onCheckedChange={(v) => updateVC("includeQR", v)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* ── Create Document Modal ── */}
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
            <div>
              <Label>Document Type</Label>
              <Select value={newDocType} onValueChange={setNewDocType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={createDocument} disabled={!newDocName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteDocId} onOpenChange={(o) => !o && setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this document?</AlertDialogTitle>
            <AlertDialogDescription>Remove this document from this service? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentDesigner;
