import { useRef } from "react";
import type { ImplementationConfig } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Upload, X, Building2 } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof typeof b, value: string) =>
    updateConfig("branding", { ...b, [field]: value });

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => set("logoUrl", e.target!.result as string);
    reader.readAsDataURL(file);
  };

  const portalName = b.portalName || "Business License Portal";
  const tagline    = b.portalTagline || "Apply for your Business License online — fast, simple, and paperless.";
  const logo       = b.logoUrl;

  return (
    <StepWrapper
      step={2}
      title="Branding"
      subtitle="Set your portal name, tagline, and logo. See exactly how they appear to citizens."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left: form ───────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Logo upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Logo</p>

            {logo ? (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-14 w-auto object-contain rounded"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">Logo uploaded</p>
                  <p className="text-xs text-slate-400 mt-0.5">Shown in the portal header alongside the portal name</p>
                </div>
                <button
                  onClick={() => set("logoUrl", "")}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Remove logo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleLogoFile(file);
                }}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
              >
                <Upload size={24} className="mx-auto text-slate-300 group-hover:text-blue-400 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG · Recommended: 200 × 60 px</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleLogoFile(e.target.files[0]);
                e.target.value = "";
              }}
            />

            {logo && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Replace logo
              </button>
            )}
          </div>

          {/* Portal name + tagline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portal Identity</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Portal Name</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Business License Portal"
                value={b.portalName}
                onChange={(e) => set("portalName", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">Shown in the header and on all documents</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tagline <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Apply for your Business License online — fast, simple, and paperless."
                value={b.portalTagline}
                onChange={(e) => set("portalTagline", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">Appears below the portal name on the home page</p>
            </div>
          </div>
        </div>

        {/* ── Right: live preview ───────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</p>
              <span className="text-xs text-slate-400">Citizen Portal</span>
            </div>

            {/* Browser-chrome mockup */}
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm text-left">

                {/* Nav bar */}
                <div className="bg-blue-800 px-4 py-2.5 flex items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-7 w-auto object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <Building2 size={20} className="text-blue-300 shrink-0" />
                  )}
                  <span className="text-white text-sm font-semibold truncate">{portalName}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-blue-300 text-xs hidden sm:block">Home</span>
                    <span className="text-blue-300 text-xs hidden sm:block">Track Application</span>
                    <span className="text-xs bg-white text-blue-800 px-2.5 py-1 rounded-md font-medium">Login</span>
                  </div>
                </div>

                {/* Hero */}
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-10 text-center">
                  <h1 className="text-white text-xl font-bold leading-snug">{portalName}</h1>
                  <p className="text-blue-200 text-xs mt-2 max-w-xs mx-auto leading-relaxed">{tagline}</p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button className="bg-white text-blue-800 text-xs font-semibold px-5 py-2 rounded-lg shadow">
                      Apply Now
                    </button>
                    <button className="border border-blue-400 text-white text-xs font-medium px-4 py-2 rounded-lg">
                      Track Application
                    </button>
                  </div>
                </div>

                {/* Body stub */}
                <div className="bg-slate-50 px-6 py-5 space-y-2">
                  <div className="h-2.5 bg-slate-200 rounded-full w-1/3" />
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-white rounded-lg border border-slate-200" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Annotations */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Where things appear</p>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <p className="text-xs text-slate-600"><span className="font-medium">Logo</span> — top-left of the navigation bar, next to the portal name</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <p className="text-xs text-slate-600"><span className="font-medium">Portal Name</span> — navigation bar and as the main heading in the hero section</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <p className="text-xs text-slate-600"><span className="font-medium">Tagline</span> — beneath the portal name in the hero section on the home page</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
