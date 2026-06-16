import React from "react";
import { ClipboardCheck } from "lucide-react";
import EmulatorFrame from "./EmulatorFrame";

type FieldType = "text" | "radio" | "checkbox" | "dropdown" | "file_upload";

interface Question {
  id: string;
  text: string;
  fieldType: FieldType;
  required: boolean;
  options?: string[];
}

interface ChecklistShape {
  name: string;
  workflowState: string;
  questions: Question[];
}

const ChecklistPreview: React.FC<{ checklist: ChecklistShape }> = ({ checklist }) => (
  <EmulatorFrame device="desktop" label="Employee view">
    <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-accent" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {checklist.name || "(Untitled checklist)"}
          </h3>
          {checklist.workflowState && (
            <p className="text-[10px] text-muted-foreground">
              Triggers on: {checklist.workflowState}
            </p>
          )}
        </div>
      </div>

      {checklist.questions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Add questions to see them rendered here.
        </p>
      ) : (
        <ol className="space-y-3">
          {checklist.questions.map((q, idx) => (
            <li key={q.id} className="space-y-1.5">
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-muted-foreground">{idx + 1}.</span>
                <span className="text-foreground">
                  {q.text || "(Untitled question)"}
                  {q.required && <span className="text-destructive ml-0.5">*</span>}
                </span>
              </div>
              <div className="pl-5">{renderInput(q)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  </EmulatorFrame>
);

const renderInput = (q: Question) => {
  switch (q.fieldType) {
    case "text":
      return (
        <input
          disabled
          placeholder="Type answer…"
          className="w-full h-7 text-xs border rounded px-2 bg-muted/30"
        />
      );
    case "dropdown":
      return (
        <select disabled className="w-full h-7 text-xs border rounded px-2 bg-muted/30">
          <option>Select…</option>
          {(q.options ?? []).map((o, i) => <option key={i}>{o || `Option ${i + 1}`}</option>)}
        </select>
      );
    case "radio":
      return (
        <div className="space-y-1">
          {(q.options ?? []).map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-[11px]">
              <input type="radio" disabled />
              {o || `Option ${i + 1}`}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="space-y-1">
          {(q.options ?? []).map((o, i) => (
            <label key={i} className="flex items-center gap-2 text-[11px]">
              <input type="checkbox" disabled />
              {o || `Option ${i + 1}`}
            </label>
          ))}
        </div>
      );
    case "file_upload":
      return (
        <div className="h-12 border border-dashed rounded flex items-center justify-center text-[11px] text-muted-foreground">
          Upload file
        </div>
      );
    default:
      return null;
  }
};

export default ChecklistPreview;
