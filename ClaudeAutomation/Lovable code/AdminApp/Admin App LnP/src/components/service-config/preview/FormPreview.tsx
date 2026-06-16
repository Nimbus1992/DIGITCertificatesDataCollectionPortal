import React from "react";
import { MapPinned } from "lucide-react";
import type { WizardField, WizardSubScreen } from "@/data/wizardForm";

/**
 * Read-only citizen-style render of a single sub-screen used inside the
 * Form Builder mobile emulator. Styling intentionally mirrors the look of
 * `src/components/preview/citizen/ApplicationForm.tsx` so the editor preview
 * matches the real preview experience.
 */
const FieldPreview: React.FC<{ field: WizardField }> = ({ field }) => {
  const labelEl = (
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
  const helper = field.helpText ? (
    <p className="text-[10px] text-gray-500 mt-1">{field.helpText}</p>
  ) : null;
  const baseInput =
    "w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none";

  const body = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            disabled
            placeholder={field.placeholder || "Type your answer"}
            className={`${baseInput} resize-none h-16`}
          />
        );
      case "date":
        return <input type="date" disabled className={baseInput} />;
      case "number":
        return (
          <input
            type="number"
            disabled
            placeholder={field.placeholder || "0"}
            className={baseInput}
          />
        );
      case "dropdown":
      case "multiselect":
        return (
          <select disabled className={baseInput}>
            <option>{field.placeholder || "Select…"}</option>
            {(field.options ?? []).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-1.5">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-2 text-xs text-gray-700">
                <input type="radio" disabled name={field.id} />
                {o}
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-1.5">
            {(field.options ?? []).map((o) => (
              <label key={o} className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" disabled />
                {o}
              </label>
            ))}
          </div>
        );
      case "file":
        return (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-2.5 py-3 text-center text-[11px] text-gray-500">
            Tap to upload {field.label.toLowerCase()}
          </div>
        );
      case "text":
      default:
        return (
          <input
            type="text"
            disabled
            placeholder={field.placeholder || "Type your answer"}
            className={baseInput}
          />
        );
    }
  })();

  return (
    <div>
      {labelEl}
      {body}
      {helper}
    </div>
  );
};

export const FormPreview: React.FC<{
  stepName?: string;
  stepIndex?: number;
  totalSteps?: number;
  subScreen?: WizardSubScreen;
}> = ({ stepName, stepIndex, totalSteps, subScreen }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* App-bar */}
      <div className="px-3 py-2 border-b bg-gray-50">
        {typeof stepIndex === "number" && totalSteps ? (
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            Step {stepIndex + 1} of {totalSteps}
          </p>
        ) : null}
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {stepName || "Application"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {!subScreen ? (
          <p className="text-xs text-gray-500 text-center py-8">
            Select a sub-screen to preview
          </p>
        ) : (
          <>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{subScreen.title}</h4>
              {subScreen.subtitle && (
                <p className="text-[11px] text-gray-500 mt-0.5">{subScreen.subtitle}</p>
              )}
            </div>

            {subScreen.helperBanner && (
              <div className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-[10px] text-blue-900">
                {subScreen.helperBanner}
              </div>
            )}

            {subScreen.isMap && (
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 h-28 flex items-center justify-center text-[11px] text-gray-500">
                <MapPinned className="h-4 w-4 mr-1.5" /> Drop a pin on the map
              </div>
            )}

            {subScreen.fields.length === 0 && !subScreen.isMap && (
              <p className="text-[11px] text-gray-400 text-center py-6">
                No fields yet. Add fields from the palette.
              </p>
            )}

            <div className="space-y-3">
              {subScreen.fields.map((f) => (
                <FieldPreview key={f.id} field={f} />
              ))}
            </div>

            <div className="pt-3">
              <button
                disabled
                className="w-full rounded-md bg-blue-600 text-white text-xs font-medium py-2 opacity-90"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FormPreview;
