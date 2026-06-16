import React, { useState } from "react";
import { usePreview, type PreviewDocument } from "../PreviewContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { CreditCard, Download, FileText, IndianRupee, ShieldCheck } from "lucide-react";
import TimelineList from "../TimelineList";
import DocumentPreviewSheet from "../employee/DocumentPreviewSheet";
import { downloadApplicationPdf } from "@/lib/applicationPdf";

const ApplicationDetail: React.FC = () => {
  const { screen, applications, setScreen, formSections, workflowStates, serviceName } = usePreview();
  const app = applications.find((a) => a.id === screen.applicationId);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [includeDocs, setIncludeDocs] = useState(true);

  if (!app) return <div className="p-4 text-sm text-muted-foreground">Application not found.</div>;

  const allDocsVerified = app.documents.length === 0 || app.documents.every((d) => d.status === "Verified");
  const uploadedBy = app.formData.fullName || app.formData.f1 || "You";

  const handleDownload = () => {
    downloadApplicationPdf(app, serviceName, formSections, workflowStates, {
      includeDocuments: includeDocs,
      includeChecklists: false,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-background">
      <div className="bg-[#0b4f6c] text-white px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <span className="grid grid-cols-2 gap-0.5">
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
        </span>
        DIGIT <span className="text-white/60 ml-1">| dev</span>
      </div>

      <div className="px-4 py-2 text-xs flex items-center justify-between">
        <div>
          <button onClick={() => setScreen({ type: "home" })} className="text-accent hover:underline">Home</button>
          <span className="mx-1 text-muted-foreground">/</span>
          <button onClick={() => setScreen({ type: "my_applications" })} className="text-accent hover:underline">My Applications</button>
          <span className="mx-1 text-muted-foreground">/</span>
          <span className="text-muted-foreground">Detail</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1 text-[11px] px-2">
              <Download className="h-3 w-3" /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Include in PDF</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={includeDocs}
              onCheckedChange={(v) => setIncludeDocs(!!v)}
              onSelect={(e) => e.preventDefault()}
            >
              Documents list
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownload} className="text-accent font-medium">
              <Download className="h-3 w-3 mr-1" /> Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-foreground">Application Details</h2>
          <Badge variant="outline">{app.status}</Badge>
        </div>

        {/* Payment accordion */}
        {app.demand && (
          <div className={`rounded-lg border overflow-hidden ${
            app.paymentStatus === "paid"
              ? "border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-green-50"
              : "border-warning/40 bg-gradient-to-br from-warning/10 to-amber-50"
          }`}>
            <Accordion type="single" collapsible defaultValue={app.paymentStatus === "pending" ? "pay" : undefined}>
              <AccordionItem value="pay" className="border-0">
                <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-sm ${
                      app.paymentStatus === "paid" ? "bg-emerald-500" : "bg-amber-500"
                    }`}>
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">₹{app.demand.total.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Payment</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mr-2 ${
                      app.paymentStatus === "paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}>
                      {app.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="rounded-md bg-card border border-border/40 p-3 space-y-1.5 text-[11px]">
                    <Row label="Base Fee" value={`₹${app.demand.fee.toLocaleString()}`} />
                    <Row label="Tax / GST" value={`₹${app.demand.tax.toLocaleString()}`} />
                    <Row label="Area Fee" value="—" muted />
                    <Row label="Hazard Fee" value="—" muted />
                    <Row label="Multiplier" value="—" muted />
                    <div className="border-t border-border/60 pt-1.5 mt-1.5">
                      <Row label="Total" value={`₹${app.demand.total.toLocaleString()}`} bold />
                    </div>
                    {app.paymentStatus === "paid" && app.paymentDetails && (
                      <div className="border-t border-border/60 pt-1.5 mt-1.5 space-y-1">
                        <Row label="Txn ID" value={app.paymentDetails.txnId} mono />
                        <Row label="Paid On" value={new Date(app.paymentDetails.paidAt).toLocaleString()} />
                      </div>
                    )}
                  </div>
                  {app.paymentStatus === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => setScreen({ type: "payment", applicationId: app.id })}
                      className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Pay Now ₹{app.demand.total}
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Issued Documents strip */}
        {(app.demand || app.paymentDetails || app.license) && (
          <div className="border rounded-lg bg-card">
            <div className="px-3 py-2 border-b">
              <h4 className="text-accent font-semibold text-xs">Documents</h4>
            </div>
            <ul className="divide-y">
              {app.demand && app.demand.stage === "license" && (
                <li className="px-3 py-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-semibold text-foreground">Demand Notice</p>
                    <p className="text-[10px] text-muted-foreground">Fee bill · {new Date(app.demand.generatedAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setScreen({ type: "demand_notice", applicationId: app.id })}
                  >
                    View
                  </Button>
                </li>
              )}
              {app.paymentDetails && (
                <li className="px-3 py-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-semibold text-foreground">Payment Invoice</p>
                    <p className="text-[10px] text-muted-foreground">Receipt · {new Date(app.paymentDetails.paidAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setScreen({ type: "invoice", applicationId: app.id })}
                  >
                    View
                  </Button>
                </li>
              )}
              {app.license && (
                <li className="px-3 py-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-semibold text-foreground">Business License Certificate</p>
                    <p className="text-[10px] text-muted-foreground break-all">{app.license.number}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setScreen({ type: "license", applicationId: app.id })}
                  >
                    View
                  </Button>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="border rounded-lg p-3 bg-card space-y-3">
          <div>
            <h4 className="text-accent font-semibold text-xs mb-1.5">Application</h4>
            <div className="grid grid-cols-2 gap-y-1 text-[11px]">
              <span className="font-medium text-foreground">App #</span>
              <span className="text-muted-foreground break-all">{app.applicationNumber}</span>
              <span className="font-medium text-foreground">Status</span>
              <span className="text-muted-foreground">{app.status}</span>
            </div>
          </div>

          {formSections.map((section) => {
            const sectionFields = section.fields.filter((f) => app.formData[f.id]);
            if (sectionFields.length === 0) return null;
            return (
              <div key={section.id}>
                <h4 className="text-accent font-semibold text-xs mb-1.5">{section.name}</h4>
                <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                  {sectionFields.map((field) => (
                    <React.Fragment key={field.id}>
                      <span className="font-medium text-foreground">{field.label}</span>
                      <span className="text-muted-foreground">{app.formData[field.id]}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}

          {app.documents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-accent font-semibold text-xs">Documents</h4>
                {allDocsVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-2.5 w-2.5" /> All verified
                  </span>
                )}
              </div>
              <ul className="space-y-1">
                {app.documents.map((d) => {
                  const statusStyle = d.status === "Verified"
                    ? "bg-emerald-100 text-emerald-700"
                    : d.status === "Rejected"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700";
                  return (
                    <li key={d.id}>
                      <button
                        onClick={() => setPreviewDoc(d)}
                        className="w-full text-left flex items-center gap-1.5 text-[11px] text-muted-foreground rounded p-1 hover:bg-accent/5 hover:ring-1 hover:ring-accent/20 transition-colors cursor-pointer"
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate flex-1">{d.type} — {d.name}</span>
                        {d.reused && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">Reused</span>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${statusStyle}`}>
                          {d.status}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-3 bg-card">
          <h4 className="text-accent font-semibold text-xs mb-2">Timeline</h4>
          <TimelineList entries={app.timeline} compact />
        </div>
      </div>

      <DocumentPreviewSheet
        open={previewDoc !== null}
        onOpenChange={(o) => !o && setPreviewDoc(null)}
        document={previewDoc}
        applicationId={app.id}
        uploadedBy={uploadedBy}
        allowActions={false}
      />
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean; mono?: boolean; muted?: boolean }> = ({ label, value, bold, mono, muted }) => (
  <div className="flex items-center justify-between gap-2">
    <span className={`${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</span>
    <span className={`${bold ? "font-bold text-foreground" : muted ? "text-muted-foreground/60 italic" : "text-foreground"} ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
  </div>
);

export default ApplicationDetail;
