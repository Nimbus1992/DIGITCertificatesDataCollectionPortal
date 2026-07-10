import { CheckCircle2, Circle, ChevronRight, ArrowRight, LogOut } from "lucide-react";
import type { ImplementationConfig } from "../types";
import { isStepComplete } from "../lib/stepValidation";

interface StepMeta { id: number; label: string }

const GROUPS: Array<{ label: string; steps: StepMeta[] }> = [
  {
    label: "Account Profile",
    steps: [
      { id: 1, label: "Overview" },
      { id: 2, label: "Branding" },
      { id: 3, label: "Boundary" },
      { id: 4, label: "Integrations" },
    ],
  },
  {
    label: "Application Details",
    steps: [
      { id: 5, label: "Overall Configuration" },
      { id: 6, label: "Application Form" },
      { id: 7, label: "Roles" },
      { id: 8, label: "Fees" },
      { id: 9, label: "Workflow" },
      { id: 10, label: "Notifications" },
    ],
  },
  {
    label: "Users & Notes",
    steps: [
      { id: 11, label: "User Assignment" },
      { id: 12, label: "Other Information" },
    ],
  },
];

const TOTAL = 13;

interface Props {
  orgName: string;
  config: ImplementationConfig;
  onEnter: (step: number) => void;
  onLogout: () => void;
}

export default function AccountHome({ orgName, config, onEnter, onLogout }: Props) {
  const completedCount = Array.from({ length: TOTAL }, (_, i) => i + 1)
    .filter((id) => isStepComplete(id, config)).length;
  const progressPct = Math.round((completedCount / TOTAL) * 100);

  // Find the first incomplete step to resume from
  const firstIncomplete = Array.from({ length: TOTAL }, (_, i) => i + 1)
    .find((id) => !isStepComplete(id, config)) ?? TOTAL;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{orgName}</p>
            <p className="text-xs text-slate-500">Implementation Configuration Portal</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-sm"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-bold">BL</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Service Configuration
              </p>
              <h1 className="text-xl font-bold text-slate-900">Business License Template</h1>
              <p className="text-sm text-slate-500 mt-1">
                You are setting up the Business License service for{" "}
                <span className="font-medium text-slate-700">{orgName}</span>.
                Fill in all sections below and submit for eGov review.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>{completedCount} of {TOTAL} sections complete</span>
            <span className="font-semibold text-slate-700">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <button
            onClick={() => onEnter(firstIncomplete)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {completedCount === 0 ? "Start Configuration" : completedCount === TOTAL ? "Review & Submit" : "Continue where you left off"}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Section breakdown */}
        <div className="space-y-4">
          {GROUPS.map((group) => {
            const groupComplete = group.steps.filter((s) => isStepComplete(s.id, config)).length;
            return (
              <div key={group.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{group.label}</p>
                  <span className="text-xs text-slate-400">
                    {groupComplete}/{group.steps.length} done
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {group.steps.map((step) => {
                    const complete = isStepComplete(step.id, config);
                    return (
                      <button
                        key={step.id}
                        onClick={() => onEnter(step.id)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          {complete
                            ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            : <Circle size={16} className="text-slate-300 shrink-0" />}
                          <span className={`text-sm ${complete ? "text-slate-600" : "text-slate-800 font-medium"}`}>
                            {step.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {complete
                            ? <span className="text-xs text-green-600 font-medium">Complete</span>
                            : <span className="text-xs text-amber-600 font-medium">Incomplete</span>}
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Review & Export as standalone row */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => onEnter(13)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                {isStepComplete(13, config)
                  ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  : <Circle size={16} className="text-slate-300 shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-slate-800">Review & Export</p>
                  <p className="text-xs text-slate-400">Check all data and submit for eGov review</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
