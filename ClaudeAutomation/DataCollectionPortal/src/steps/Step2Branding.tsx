import type { ImplementationConfig } from "../types";
import { COLOR_PRESETS } from "../defaults";
import { StepWrapper } from "./StepWrapper";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

export default function Step2Branding({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const b = config.branding;
  const set = (field: keyof typeof b, value: string) => {
    updateConfig("branding", { ...b, [field]: value });
  };

  return (
    <StepWrapper
      step={2}
      title="Branding"
      subtitle="Customise how the portal looks to citizens and staff."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">
        {/* Portal Name */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Identity</p>
            <span className="suggested-badge">Suggested</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Portal Name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Business License Portal"
              value={b.portalName}
              onChange={(e) => set("portalName", e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Shown in the header and on documents</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tagline <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="Apply for your Business License online — fast, simple, and paperless."
              value={b.portalTagline}
              onChange={(e) => set("portalTagline", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Copyright Text <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder={`© ${new Date().getFullYear()} ${config.account.organizationName || "Your Organisation"}`}
              value={b.copyrightText}
              onChange={(e) => set("copyrightText", e.target.value)}
            />
          </div>
        </div>

        {/* Primary Color */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Colour</p>
            <span className="suggested-badge">Suggested</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => set("primaryColor", preset.value)}
                className={`
                  flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all
                  ${b.primaryColor === preset.value
                    ? "border-blue-600 shadow-md scale-105"
                    : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <div className="w-10 h-10 rounded-lg shadow-sm" style={{ backgroundColor: preset.value }} />
                <span className="text-xs text-slate-600 whitespace-nowrap">{preset.name}</span>
              </button>
            ))}
            {/* Custom color */}
            <div className="flex flex-col items-center gap-1.5 p-2 relative">
              <div
                className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 overflow-hidden cursor-pointer"
                style={{ backgroundColor: b.primaryColor }}
              >
                <input
                  type="color"
                  className="w-14 h-14 -m-2 opacity-0 absolute cursor-pointer"
                  value={b.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                />
              </div>
              <span className="text-xs text-slate-600">Custom</span>
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-xl p-4 text-white text-sm font-medium flex items-center justify-between shadow-sm"
            style={{ backgroundColor: b.primaryColor }}
          >
            <span>{b.portalName || "Business License Portal"}</span>
            <span className="text-xs opacity-80">Preview</span>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Logo URL <span className="text-slate-400 font-normal">(optional — paste a public URL)</span>
            </label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://municipality.gov.in/logo.png"
              value={b.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
            />
          </div>

          {b.logoUrl && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <img
                src={b.logoUrl}
                alt="Logo preview"
                className="h-10 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <p className="text-xs text-slate-500">Logo preview</p>
            </div>
          )}
          <p className="text-xs text-slate-400">
            If you uploaded a logo in Step 1 it is already applied here. You can also paste a URL.
          </p>
        </div>
      </div>
    </StepWrapper>
  );
}
