import React, { useState, useMemo } from "react";
import { usePreview, type WorkflowTransitionConfig, type PreviewDocument } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  FileText, IndianRupee, Award, ArrowLeft, RefreshCw, Link2, FilePlus,
  CheckCircle2, ClipboardList, Repeat, MoreHorizontal, Download, ShieldCheck,
} from "lucide-react";
import TimelineList from "../TimelineList";
import { getStatusStyle } from "./InboxView";
import ChecklistDialog from "./ChecklistDialog";
import DocumentPreviewSheet from "./DocumentPreviewSheet";
import { downloadApplicationPdf } from "@/lib/applicationPdf";
import EmployeeTopBar from "./EmployeeTopBar";

const ApplicationReview: React.FC = () => {
  const {
    role, activeRoleId, screen, applications, setScreen, formSections, serviceName,
    workflowStates, workflowTransitions,
    issueLicense, completeRenewal,
  } = usePreview();

  const app = applications.find((a) => a.id === screen.applicationId);
  const [tab, setTab] = useState("applicant");
  const [pendingTransition, setPendingTransition] = useState<WorkflowTransitionConfig | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeChecklists, setIncludeChecklists] = useState(false);

  const currentState = app ? workflowStates.find((s) => s.id === app.currentStateId) : undefined;

  const availableTransitions = useMemo(() => {
    if (!app) return [];
    return workflowTransitions.filter(
      (t) => t.fromStateId === app.currentStateId && (t.roleId === activeRoleId || t.role === "any")
    );
  }, [workflowTransitions, app, activeRoleId]);

  const parentLicenseApp = app?.parentLicenseId
    ? applications.find((a) => a.id === app.parentLicenseId)
    : undefined;

  if (!app) return <div className="p-6 text-sm text-muted-foreground">Application not found.</div>;

  // The active role can issue a license if any of its transitions exit s5.
  const canIssueLicense =
    app.currentStateId === "s5" &&
    workflowTransitions.some((t) => t.fromStateId === "s5" && t.roleId === activeRoleId);
  const isRenewal = app.type === "RENEWAL";
  const statusStyle = getStatusStyle(app.currentStateId);
  const stripColor = statusStyle.dot;
  const uploadedBy = app.formData.fullName || app.formData.f1 || "Citizen";

  // Doc verification gating: any role that owns the verification transition.
  const allDocsVerified = app.documents.length === 0 || app.documents.every((d) => d.status === "Verified");
  const canReviewDocs =
    (app.currentStateId === "s_dv" || app.currentStateId === "s1") &&
    workflowTransitions.some(
      (t) => t.fromStateId === app.currentStateId && t.roleId === activeRoleId
    );

  const isTransitionBlocked = (t: WorkflowTransitionConfig) => {
    if (t.id === "t_verify_app" && !allDocsVerified) return true;
    return false;
  };

  // Primary vs secondary action split
  const primaryTransition = availableTransitions.find((t) =>
    !["t_send_back_dv", "t_send_back_ip", "t_reject"].includes(t.id)
  );
  const secondaryTransitions = availableTransitions.filter((t) => t !== primaryTransition);

  const handleDownload = () => {
    downloadApplicationPdf(app, serviceName, formSections, workflowStates, {
      includeDocuments: includeDocs,
      includeChecklists,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-background to-sky-50/40">
      <EmployeeTopBar />

      <div className="px-6 py-2 text-xs flex items-center justify-between">
        <button onClick={() => setScreen({ type: "inbox" })} className="text-accent hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to Inbox
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">Include in PDF</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={includeDocs}
              onCheckedChange={(v) => setIncludeDocs(!!v)}
              onSelect={(e) => e.preventDefault()}
            >
              Documents list
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={includeChecklists}
              onCheckedChange={(v) => setIncludeChecklists(!!v)}
              onSelect={(e) => e.preventDefault()}
            >
              Checklists
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownload} className="text-accent font-medium">
              <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-6 pb-32 space-y-4">
        {/* Header card with state-colored strip */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
          <div className={`h-1.5 ${stripColor}`} />
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  isRenewal ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {isRenewal ? <RefreshCw className="h-3 w-3" /> : <FilePlus className="h-3 w-3" />}
                  {isRenewal ? "Renewal" : "New"}
                </span>
                {isRenewal && parentLicenseApp?.license && (
                  <button
                    onClick={() => setScreen({ type: "application_review", applicationId: parentLicenseApp.id })}
                    className="text-[10px] text-accent hover:underline flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/5"
                  >
                    <Link2 className="h-3 w-3" /> Parent: {parentLicenseApp.license.number}
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{app.formData.businessName || app.formData.f5 || "Application"}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{app.applicationNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {app.status}
              </span>
            </div>
          </div>
        </div>

        {/* Demand banner */}
        {app.demand && (
          <div className={`rounded-xl border p-4 flex items-center justify-between overflow-hidden relative ${
            app.paymentStatus === "paid"
              ? "border-emerald-300/50 bg-gradient-to-r from-emerald-50 to-green-100"
              : "border-warning/30 bg-gradient-to-r from-warning/10 to-amber-50"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                app.paymentStatus === "paid" ? "bg-emerald-500 shadow-emerald-500/30" : "bg-amber-500 shadow-amber-500/30"
              }`}>
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">
                  ₹{app.demand.total.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Fee ₹{app.demand.fee} + Tax ₹{app.demand.tax}
                  {app.paymentStatus === "paid" && app.paymentDetails && ` • Paid on ${new Date(app.paymentDetails.paidAt).toLocaleDateString()} (${app.paymentDetails.txnId})`}
                  {app.paymentStatus !== "paid" && " • Pay by due date"}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              app.paymentStatus === "paid" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
            }`}>
              {app.paymentStatus === "paid" ? <><CheckCircle2 className="h-3.5 w-3.5" /> Paid</> : "Awaiting Payment"}
            </span>
          </div>
        )}

        {/* Tabs (full width) */}
        <div className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-auto p-2 gap-1 flex-wrap">
              <TabsTrigger value="applicant" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow">Applicant</TabsTrigger>
              <TabsTrigger value="business" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow">Business</TabsTrigger>
              <TabsTrigger value="docs" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow">
                Documents {app.documents.length > 0 && <span className="ml-1 opacity-80">({app.documents.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="checklist" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow">
                Checklist
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-full px-3 py-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow">Timeline</TabsTrigger>
            </TabsList>

            {[{ id: "applicant", sec: "sec-1" }, { id: "business", sec: "sec-2" }].map(({ id, sec }) => {
              const section = formSections.find((s) => s.id === sec);
              if (!section) return null;
              const fields = section.fields.filter((f) => app.formData[f.id]);
              return (
                <TabsContent key={id} value={id} className="p-4 mt-0">
                  {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data.</p>
                  ) : (
                    <dl className="grid grid-cols-2 gap-y-3 text-sm">
                      {fields.map((f) => (
                        <React.Fragment key={f.id}>
                          <dt className="text-muted-foreground">{f.label}</dt>
                          <dd className="text-foreground font-medium">{app.formData[f.id]}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                </TabsContent>
              );
            })}

            <TabsContent value="docs" className="p-4 mt-0">
              {app.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <div className="space-y-3">
                  {allDocsVerified && app.documents.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-800">All documents verified</p>
                    </div>
                  )}
                  {canReviewDocs && !allDocsVerified && (
                    <p className="text-[11px] text-muted-foreground">
                      Click any document to preview and verify.
                    </p>
                  )}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {app.documents.map((d, i) => {
                      const tones = ["from-sky-400 to-blue-500", "from-violet-400 to-fuchsia-500", "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500"];
                      const tone = tones[i % tones.length];
                      const docPill = d.status === "Verified"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.status === "Rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700";
                      return (
                        <button
                          key={d.id}
                          onClick={() => setPreviewDoc(d)}
                          className="text-left relative rounded-lg overflow-hidden border border-border/50 bg-card shadow-sm cursor-pointer hover:ring-2 hover:ring-accent/40 transition-all"
                        >
                          <div className={`h-1 bg-gradient-to-r ${tone}`} />
                          <div className="p-3">
                            <div className="flex items-start gap-2">
                              <FileText className="h-7 w-7 text-accent shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate">{d.type}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{d.name}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${docPill}`}>
                                {d.status}
                              </span>
                              {d.reused && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  <Repeat className="h-2.5 w-2.5" /> Reused
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="p-4 mt-0">
              <ChecklistTabContent appId={app.id} />
            </TabsContent>

            <TabsContent value="timeline" className="p-4 mt-0">
              <div className="rounded-lg bg-muted/30 p-3">
                <TimelineList entries={app.timeline} onViewChecklist={() => setTab("checklist")} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sticky bottom-right action bar */}
      {currentState?.type !== "end" && (
        <div className="sticky bottom-4 mr-6 ml-auto w-fit max-w-[90%] z-30">
          <div className="rounded-xl bg-card border border-border/60 shadow-2xl shadow-accent/20 overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-teal-600 h-1" />
            <div className="p-3 flex items-center gap-3">
              <div className="flex items-center gap-2 pr-3 border-r border-border">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {currentState?.name}
                </span>
              </div>

              {canIssueLicense ? (
                isRenewal ? (
                  <Button
                    onClick={() => completeRenewal(app.id)}
                    className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white gap-1.5 shadow-lg shadow-purple-500/30"
                  >
                    <RefreshCw className="h-4 w-4" /> Complete Renewal
                  </Button>
                ) : (
                  <Button
                    onClick={() => issueLicense(app.id)}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white gap-1.5 shadow-lg shadow-emerald-500/30"
                  >
                    <Award className="h-4 w-4" /> Issue License
                  </Button>
                )
              ) : primaryTransition ? (
                <>
                  <Button
                    onClick={() => setPendingTransition(primaryTransition)}
                    disabled={isTransitionBlocked(primaryTransition)}
                    title={isTransitionBlocked(primaryTransition) ? "Verify all documents first" : undefined}
                    className="bg-gradient-to-r from-accent to-teal-600 text-accent-foreground hover:from-accent/90 hover:to-teal-600/90 gap-1.5 shadow-lg shadow-accent/20"
                  >
                    {primaryTransition.name}
                    {isTransitionBlocked(primaryTransition) && (
                      <span className="text-[10px] opacity-80">(verify docs)</span>
                    )}
                  </Button>
                  {secondaryTransitions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {secondaryTransitions.map((t) => (
                          <DropdownMenuItem
                            key={t.id}
                            disabled={isTransitionBlocked(t)}
                            onClick={() => setPendingTransition(t)}
                          >
                            {t.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground px-2">
                  {app.currentStateId === "s4"
                    ? "Waiting for citizen to pay."
                    : `No actions for ${role}.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentState?.type === "end" && (
        <div className="sticky bottom-4 mr-6 ml-auto w-fit z-30">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
            app.currentStateId === "s6" || app.currentStateId === "s9"
              ? "bg-emerald-600 text-white shadow-emerald-500/30"
              : "bg-rose-600 text-white shadow-rose-500/30"
          }`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {currentState.name}
          </span>
        </div>
      )}

      <ChecklistDialog
        open={pendingTransition !== null}
        onOpenChange={(o) => !o && setPendingTransition(null)}
        transition={pendingTransition}
        applicationId={app.id}
      />

      <DocumentPreviewSheet
        open={previewDoc !== null}
        onOpenChange={(o) => !o && setPreviewDoc(null)}
        document={previewDoc}
        applicationId={app.id}
        uploadedBy={uploadedBy}
        allowActions={canReviewDocs}
      />
    </div>
  );
};

// Read-only checklist view inside the dedicated tab
const ChecklistTabContent: React.FC<{ appId: string }> = ({ appId }) => {
  const { applications, workflowStates, workflowTransitions } = usePreview();
  const app = applications.find((a) => a.id === appId);
  if (!app) return null;

  // Collect all transitions whose checklists are relevant (any saved or current state ones)
  const relevantTransitions = workflowTransitions.filter(
    (t) => t.checklist.length > 0 && (
      app.checklists[t.fromStateId] ||
      t.fromStateId === app.currentStateId
    )
  );

  if (relevantTransitions.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No checklists yet.</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">Items appear here as officers take actions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relevantTransitions.map((t) => {
        const stateName = workflowStates.find((s) => s.id === t.fromStateId)?.name ?? t.fromStateId;
        const saved = app.checklists[t.fromStateId];
        const items = saved ?? t.checklist.map((c) => ({ ...c, checked: false }));
        const done = items.filter((i) => i.checked).length;
        const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
        return (
          <div key={t.id} className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{stateName}</p>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {done} / {items.length}
              </span>
            </div>
            <div className="px-4 pt-2">
              <Progress value={pct} className="h-1.5" />
            </div>
            <ul className="p-4 space-y-1.5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-background border-border"
                  }`}>
                    {item.checked && <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span className={item.checked ? "text-foreground" : "text-muted-foreground"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            {!saved && (
              <p className="px-4 pb-3 text-[10px] text-muted-foreground/70 italic">
                Items will be checked off when an officer triggers “{t.name}”.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationReview;
