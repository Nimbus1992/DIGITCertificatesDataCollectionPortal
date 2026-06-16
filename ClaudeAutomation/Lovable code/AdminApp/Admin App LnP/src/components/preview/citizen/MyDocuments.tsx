import React, { useState, useMemo } from "react";
import { usePreview, getCitizenDocuments, type CitizenDocumentKind } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Bell, FolderOpen, FileText, Trash2, Upload, Plus, Download, Eye, FileBadge } from "lucide-react";
import { downloadDemandNoticePdf } from "@/lib/demandNoticePdf";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { downloadLicensePdf } from "@/lib/licensePdf";

const DOC_TYPES = ["Identity Proof", "Address Proof", "Business Proof", "PAN Card", "Bank Statement", "Other"];

const MyDocuments: React.FC = () => {
  const { setScreen, userDocuments, addUserDocument, removeUserDocument, unreadCount, applications, serviceName } = usePreview();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(DOC_TYPES[0]);

  const handleUpload = () => {
    const finalName = name.trim() || `${type.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    addUserDocument(finalName, type);
    setName("");
    setType(DOC_TYPES[0]);
    setOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="bg-[#0b4f6c] text-white px-4 py-3 flex items-center justify-between text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="grid grid-cols-2 gap-0.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
            <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
            <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
            <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          </span>
          DIGIT <span className="text-white/60 ml-1">| dev</span>
        </div>
        <div className="relative">
          <Bell className="h-4 w-4 text-white/80" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 rounded-full bg-destructive text-[9px] font-bold flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <button
          onClick={() => setScreen({ type: "home" })}
          className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors px-2.5 py-1 rounded-full font-medium"
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </button>
      </div>

      <div className="px-4 pt-2 pb-4">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden border mb-4 bg-gradient-to-br from-indigo-100 via-violet-50 to-fuchsia-50 p-4">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-indigo-300/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base leading-tight">My Documents</h2>
              <p className="text-[11px] text-slate-600 leading-snug">
                Upload once, reuse across applications.
              </p>
            </div>
          </div>
        </div>

        {/* Issued Documents (system-generated) */}
        <IssuedDocumentsSection
          applications={applications}
          serviceName={serviceName}
          onView={(appId, kind) => {
            const screenType = kind === "demand" ? "demand_notice" : kind === "invoice" ? "invoice" : "license";
            setScreen({ type: screenType as any, applicationId: appId });
          }}
        />

        <div className="flex items-center justify-between mt-2 mb-2">
          <h3 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">My Uploads</h3>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white gap-1.5 shadow-md shadow-indigo-500/20 mb-4"
        >
          <Plus className="h-4 w-4" /> Upload New Document
        </Button>

        {userDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
            <svg className="w-20 h-20 mx-auto mb-2" viewBox="0 0 100 80" fill="none" aria-hidden="true">
              <rect x="20" y="20" width="60" height="50" rx="4" fill="hsl(240 80% 95%)" stroke="hsl(240 60% 70%)" strokeWidth="1.5" />
              <path d="M20 28h22l5-6h33" stroke="hsl(240 60% 70%)" strokeWidth="1.5" fill="hsl(240 80% 92%)" />
              <line x1="32" y1="44" x2="68" y2="44" stroke="hsl(240 30% 60%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="32" y1="52" x2="60" y2="52" stroke="hsl(240 30% 60%)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">No documents yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Upload to start reusing them in applications.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {userDocuments.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-card p-3 hover:shadow-sm transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {d.type} • {new Date(d.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removeUserDocument(d.id)}
                  className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-indigo-500" /> Upload Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Document Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">File Name (optional)</Label>
              <Input
                placeholder="e.g. aadhaar-front.pdf"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} className="bg-indigo-600 hover:bg-indigo-700 text-white">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface IssuedDocsProps {
  applications: ReturnType<typeof usePreview>["applications"];
  serviceName: string;
  onView: (appId: string, kind: CitizenDocumentKind) => void;
}

const IssuedDocumentsSection: React.FC<IssuedDocsProps> = ({ applications, serviceName, onView }) => {
  const rows = useMemo(() => {
    const out: { appId: string; appNumber: string; kind: CitizenDocumentKind; label: string; generatedAt: number }[] = [];
    applications.forEach((app) => {
      getCitizenDocuments(app).forEach((d) =>
        out.push({ appId: app.id, appNumber: app.applicationNumber, kind: d.kind, label: d.label, generatedAt: d.generatedAt })
      );
    });
    return out.sort((a, b) => b.generatedAt - a.generatedAt);
  }, [applications]);

  const handleDownload = (appId: string, kind: CitizenDocumentKind) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    if (kind === "demand") downloadDemandNoticePdf(app, serviceName);
    else if (kind === "invoice") downloadInvoicePdf(app, serviceName);
    else if (kind === "license") downloadLicensePdf(app, serviceName);
  };

  const iconFor = (kind: CitizenDocumentKind) => {
    if (kind === "demand") return <FileText className="h-4 w-4 text-amber-600" />;
    if (kind === "invoice") return <FileText className="h-4 w-4 text-emerald-600" />;
    return <FileBadge className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="mb-4">
      <h3 className="text-[12px] font-bold text-slate-700 uppercase tracking-wide mb-2">
        Issued Documents
      </h3>
      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
          <p className="text-[11px] text-slate-500">
            Issued documents will appear here once your application progresses.
          </p>
        </div>
      ) : (
        <ul className="border border-slate-200 rounded-md divide-y divide-slate-200 bg-card overflow-hidden">
          {rows.map((r) => (
            <li key={`${r.appId}-${r.kind}`} className="px-3 py-2.5 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {iconFor(r.kind)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] font-semibold text-foreground truncate">{r.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {r.appNumber} · {new Date(r.generatedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => onView(r.appId, r.kind)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700"
                aria-label="View"
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDownload(r.appId, r.kind)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700"
                aria-label="Download"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDocuments;
