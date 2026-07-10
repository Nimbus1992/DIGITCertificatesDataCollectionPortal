import { CheckCircle2, ArrowRight, Pencil } from "lucide-react";

export interface SummaryItem {
  label: string;
  value: string | string[];
}

interface SectionSummaryProps {
  title: string;
  icon?: React.ReactNode;
  items: SummaryItem[];
  nextSectionLabel: string;
  onConfigure: () => void;
  onEdit: () => void;
}

export function SectionSummary({
  title,
  icon,
  items,
  nextSectionLabel,
  onConfigure,
  onEdit,
}: SectionSummaryProps) {
  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Green "complete" banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">
              Section Complete
            </p>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          {icon && (
            <div className="ml-auto text-white/60">
              {icon}
            </div>
          )}
        </div>

        {/* Summary items */}
        <div className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              No configuration details to display.
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 px-6 py-3.5">
                <span className="text-xs font-medium text-slate-500 shrink-0 mt-0.5 w-36">
                  {item.label}
                </span>
                <div className="flex-1 text-right">
                  {Array.isArray(item.value) ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {item.value.length === 0 ? (
                        <span className="text-sm text-slate-400 italic">None</span>
                      ) : (
                        item.value.map((v, vi) => (
                          <span
                            key={vi}
                            className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full"
                          >
                            {v}
                          </span>
                        ))
                      )}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800">
                      {item.value || <span className="text-slate-400 italic font-normal">Not set</span>}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 font-medium hover:bg-white transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={onConfigure}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {nextSectionLabel}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Your progress is saved automatically. You can return to any section from the sidebar.
      </p>
    </div>
  );
}
