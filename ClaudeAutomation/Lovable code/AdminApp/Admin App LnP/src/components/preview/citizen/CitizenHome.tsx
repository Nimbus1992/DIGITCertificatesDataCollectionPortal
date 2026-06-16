import React, { useEffect, useState } from "react";
import { usePreview } from "../PreviewContext";
import CitizenScreenShell from "./_shell/CitizenScreenShell";
import NotificationsPanel from "../NotificationsPanel";
import { FileText, ListChecks, FolderOpen, Plus, ChevronRight, Search, RotateCcw } from "lucide-react";

const STEP_NAMES = ["Applicant Details", "Business Details", "Business Location", "Operational Details", "Documents"];

const CitizenHome: React.FC = () => {
  const { setScreen, applications, serviceName, userDocuments } = usePreview();
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<{ step: number } | null>(null);

  // Detect saved draft
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tl-draft-new");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && typeof parsed.currentStep === "number") {
        setDraft({ step: parsed.currentStep });
      }
    } catch { /* ignore */ }
  }, []);

  const total = applications.length;
  const pendingPayment = applications.filter((a) => a.paymentStatus === "pending").length;
  const issued = applications.filter((a) => a.license).length;

  const stats = [
    { label: "Total Applications", value: total, target: () => setScreen({ type: "my_applications" }) },
    { label: "Payments Due", value: pendingPayment, accent: pendingPayment > 0, target: () => setScreen({ type: "my_applications" }) },
    { label: "Active Licenses", value: issued, target: () => setScreen({ type: "my_applications" }) },
  ];

  const tiles = [
    { id: "apply", label: "Apply", desc: "Start a new application", icon: Plus, action: () => setScreen({ type: "apply_intro" }), primary: true },
    { id: "my", label: "My Applications", desc: `${total} ${total === 1 ? "application" : "applications"}`, icon: ListChecks, action: () => setScreen({ type: "my_applications" }) },
    { id: "docs", label: "My Documents", desc: `${userDocuments.length} documents — Saved documents you can reuse`, icon: FolderOpen, action: () => setScreen({ type: "my_documents" }) },
  ];

  const draftStepIdx = draft ? Math.min(draft.step, 4) : 0;
  const draftStepName = STEP_NAMES[draftStepIdx] || STEP_NAMES[0];

  return (
    <>
      <CitizenScreenShell
        showHeaderActions
        onBack={() => setScreen({ type: "catalogue" })}
        backLabel="All Applications"
      >
        {/* Welcome card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-3" style={{ border: "1px solid #E0E0E0" }}>
          <span
            className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mb-2"
            style={{ color: "#1D3557", backgroundColor: "#EAF2FB" }}
          >
            {serviceName}
          </span>
          <h1 className="text-lg font-bold leading-tight" style={{ color: "#1D3557" }}>
            Apply, Track &amp; Manage
          </h1>
          <p className="text-[12px] mt-1 leading-snug" style={{ color: "#363636" }}>
            Apply for a new license or manage existing ones.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications or licenses"
            className="w-full bg-white rounded-lg pl-9 pr-3 py-2.5 text-[12px] outline-none"
            style={{ border: "1px solid #E0E0E0", color: "#363636" }}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={s.target}
              className="bg-white rounded-xl p-2.5 text-left shadow-sm hover:shadow-md transition-shadow"
              style={{ border: "1px solid #E0E0E0" }}
            >
              <p className="text-xl font-bold leading-none" style={{ color: s.accent ? "#F4A261" : "#1D3557" }}>
                {s.value}
              </p>
              <p className="text-[10px] mt-1 leading-tight" style={{ color: "#6B7280" }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Resume block */}
        {draft && (
          <button
            onClick={() => setScreen({ type: "apply" })}
            className="w-full bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 mb-3 text-left hover:shadow-md transition-shadow"
            style={{ border: "1px solid #E0E0E0", borderLeft: "3px solid #F4A261" }}
          >
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF3E5" }}>
              <RotateCcw className="h-4 w-4" style={{ color: "#F4A261" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#6B7280" }}>
                Continue where you left off
              </p>
              <p className="text-[12px] font-semibold mt-0.5" style={{ color: "#1D3557" }}>
                {serviceName} Application
              </p>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>
                Step {draftStepIdx + 1} of 5 · {draftStepName}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#1D3557" }} />
          </button>
        )}

        {/* What would you like to do */}
        <p className="text-[10px] uppercase tracking-wider font-bold mb-2 px-1" style={{ color: "#6B7280" }}>
          What would you like to do?
        </p>

        <div className="space-y-2">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={t.action}
                className="w-full bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                style={{ border: "1px solid #E0E0E0", borderLeft: t.primary ? "3px solid #F4A261" : "1px solid #E0E0E0" }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.primary ? "#FFF3E5" : "#EAF2FB" }}
                >
                  <Icon className="h-5 w-5" style={{ color: t.primary ? "#F4A261" : "#1D3557" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px]" style={{ color: "#1D3557" }}>{t.label}</p>
                  <p className="text-[11px]" style={{ color: "#6B7280" }}>{t.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#1D3557" }} />
              </button>
            );
          })}
        </div>
      </CitizenScreenShell>
      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
};

export default CitizenHome;
