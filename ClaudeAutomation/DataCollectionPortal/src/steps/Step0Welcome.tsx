import { useEffect, useState } from "react";
import { ArrowRight, Clock, FileText, CheckCircle, Download, RefreshCw, Play, ChevronRight } from "lucide-react";
import { getDrafts, type DraftSummary } from "../lib/supabase";
import type { ImplementationConfig } from "../types";

interface Props {
  onNext: () => void;
  onLoadDraft: (config: ImplementationConfig, step: number) => void;
}

const STEP_LABELS: Record<number, string> = {
  1: "Account Profile",
  2: "Branding",
  3: "Deployment",
  4: "Application Form",
  5: "Roles & Staff",
  6: "Fees",
  7: "Payments & Notifications",
  8: "Review & Export",
};

function statusBadge(status: string) {
  return status === "submitted" ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium border border-green-200">
      Submitted
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium border border-amber-200">
      Draft
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Step0Welcome({ onNext, onLoadDraft }: Props) {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchDrafts = async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await getDrafts();
    if (error) setLoadError(error);
    setDrafts(data);
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleResume = (draft: DraftSummary) => {
    const step = draft.current_step ?? draft.config_data?.metadata?.lastStep ?? 1;
    onLoadDraft(draft.config_data, step);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg">
          <FileText size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Business License Setup</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Welcome. This guided setup collects the information needed to configure
          your Business License service on the DIGIT platform.
        </p>
      </div>

      {/* Saved drafts section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">
            {drafts.length > 0 ? "Your Saved Configurations" : "Saved Configurations"}
          </h2>
          <button
            onClick={fetchDrafts}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <RefreshCw size={14} className="animate-spin" />
            Loading saved drafts…
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            Could not load drafts: {loadError}
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            No saved configurations yet. Start the setup below to create your first one.
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => {
              const step = draft.current_step ?? 1;
              const pct = Math.round((step / 8) * 100);
              return (
                <div
                  key={draft.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-slate-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {draft.org_name || "Unnamed"}
                      </p>
                      {statusBadge(draft.status)}
                    </div>
                    <p className="text-xs text-slate-500">
                      {draft.department_name ? `${draft.department_name} · ` : ""}
                      {draft.country ?? ""}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${draft.status === "submitted" ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {draft.status === "submitted"
                          ? "Complete"
                          : `Step ${step} of 8 — ${STEP_LABELS[step] ?? "In progress"}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Last updated {formatDate(draft.updated_at)}</p>
                  </div>

                  {/* Resume button */}
                  <button
                    onClick={() => handleResume(draft)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0
                      ${draft.status === "submitted"
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"}
                    `}
                  >
                    {draft.status === "submitted" ? (
                      <><ChevronRight size={13} /> View</>
                    ) : (
                      <><Play size={13} /> Resume</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start new setup */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-4">Start a new configuration — what you'll set up:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "🏛️", title: "Account Profile",    desc: "Organisation name, contact details, currency" },
            { icon: "🎨", title: "Branding",            desc: "Portal name, colours, and logo" },
            { icon: "📍", title: "Deployment",          desc: "Cities and zones where the service will run" },
            { icon: "📋", title: "Application Form",    desc: "ID types, trade categories, documents required" },
            { icon: "👥", title: "Roles & Staff",       desc: "Who verifies, inspects, and approves" },
            { icon: "💰", title: "Fees & Payments",     desc: "Application fee, license fee, gateway" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: <Clock size={16} className="text-blue-500" />,    label: "~15 minutes",  sub: "Estimated time" },
          { icon: <CheckCircle size={16} className="text-green-500" />, label: "Auto-saved", sub: "Progress is saved" },
          { icon: <Download size={16} className="text-purple-500" />, label: "Export at end", sub: "JSON + PDF summary" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            {item.icon}
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested badge tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3">
        <span className="text-blue-500 text-lg shrink-0">💡</span>
        <p className="text-sm text-blue-700">
          Fields marked with a <span className="suggested-badge">Suggested</span> badge are pre-filled
          with recommended defaults — change only what's different for your context.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-base transition-colors shadow-sm"
      >
        Start New Setup
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
