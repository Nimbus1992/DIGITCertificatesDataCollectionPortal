import React from "react";
import type { TimelineEntry } from "./PreviewContext";
import { Check, ClipboardList } from "lucide-react";

interface Props {
  entries: TimelineEntry[];
  compact?: boolean;
  onViewChecklist?: () => void;
}

const fmt = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

// Stage names that map to a workflow checklist
const CHECKLIST_STAGES = [
  "Verified Application",
  "Under Document Verification",
  "Inspection Completed",
  "Inspection Pending",
  "Approved",
  "Under Approval",
];

const TimelineList: React.FC<Props> = ({ entries, compact, onViewChecklist }) => {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">No activity yet.</p>;
  }
  return (
    <ol className="relative border-l border-border ml-2 space-y-4">
      {entries.map((e, i) => {
        const isLast = i === entries.length - 1;
        const hasChecklist = onViewChecklist && CHECKLIST_STAGES.some((s) =>
          e.state.toLowerCase().includes(s.toLowerCase())
        );
        return (
          <li key={i} className="ml-4">
            <span
              className={`absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-background ${
                isLast ? "bg-accent" : "bg-muted-foreground/40"
              }`}
            >
              {isLast && <Check className="h-2 w-2 text-accent-foreground" />}
            </span>
            <p className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
              {e.state}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {e.actor} • {fmt(e.at)}
            </p>
            {e.note && (
              <p className={`text-muted-foreground mt-0.5 ${compact ? "text-[11px]" : "text-xs"}`}>
                {e.note}
              </p>
            )}
            {hasChecklist && (
              <button
                onClick={onViewChecklist}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-medium"
              >
                <ClipboardList className="h-3 w-3" /> View Checklist
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default TimelineList;
