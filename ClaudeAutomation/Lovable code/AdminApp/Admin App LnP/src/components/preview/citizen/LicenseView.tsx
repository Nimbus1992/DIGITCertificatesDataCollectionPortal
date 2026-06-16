import React from "react";
import { usePreview } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, QrCode, RefreshCw } from "lucide-react";
import { downloadLicensePdf } from "@/lib/licensePdf";

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const LicenseView: React.FC = () => {
  const { screen, applications, setScreen, serviceName } = usePreview();
  const app = applications.find((a) => a.id === screen.applicationId);

  if (!app || !app.license) {
    return <div className="p-4 text-sm text-muted-foreground">License not found.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-muted/30">
      {/* App chrome top bar (kept for consistency) */}
      <div className="bg-[#0b4f6c] text-white px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <span className="grid grid-cols-2 gap-0.5">
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
        </span>
        DIGIT <span className="text-white/60 ml-1">| dev</span>
      </div>

      <div className="px-4 py-2 text-xs">
        <button
          onClick={() => setScreen({ type: "application_detail", applicationId: app.id })}
          className="text-accent hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
      </div>

      <div className="px-3 pb-4">
        {/* Certificate sheet — formal document feel */}
        <div className="bg-white border border-slate-300 rounded-sm px-5 py-6 text-slate-900">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 border border-slate-400 grid grid-cols-2 gap-0.5 p-1">
              <span className="bg-slate-700" />
              <span className="bg-slate-700" />
              <span className="bg-slate-700" />
              <span className="bg-slate-700" />
            </div>
            <p className="text-[10px] tracking-[0.2em] font-semibold text-slate-700 uppercase">
              Government of India
            </p>
            <p className="text-[10px] text-slate-500 -mt-1">
              Department of Municipal Administration
            </p>
            <div className="pt-2">
              <p className="text-[13px] tracking-[0.15em] font-bold uppercase text-slate-900">
                Business License Certificate
              </p>
              <div className="mx-auto mt-1 h-px w-10 bg-accent" />
            </div>
          </div>

          {/* License number — primary */}
          <div className="mt-5 flex items-baseline justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              License No.
            </span>
            <span className="text-[15px] font-bold tracking-wide text-slate-900">
              {app.license.number}
            </span>
          </div>

          <div className="mt-4 border-t border-dashed border-slate-300" />

          {/* Details with QR */}
          <div className="mt-4 relative">
            <div className="grid grid-cols-[88px_1fr] gap-y-2 text-[11.5px] pr-20">
              <span className="text-slate-500">Applicant</span>
              <span className="font-semibold text-slate-900">{app.formData.f1 || "—"}</span>
              <span className="text-slate-500">Business</span>
              <span className="font-semibold text-slate-900">{app.formData.f5 || "—"}</span>
              <span className="text-slate-500">Type</span>
              <span className="font-semibold text-slate-900">{app.formData.f6 || "—"}</span>
              <span className="text-slate-500">Application</span>
              <span className="font-semibold text-slate-900">{serviceName}</span>
            </div>

            <div className="absolute top-0 right-0 flex flex-col items-center">
              <div className="w-16 h-16 border border-slate-400 flex items-center justify-center">
                <QrCode className="h-12 w-12 text-slate-700" />
              </div>
              <span className="mt-1 text-[8.5px] text-slate-500 tracking-wide">
                Scan to verify
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-300" />

          {/* Validity */}
          <div className="mt-4 grid grid-cols-[88px_1fr] gap-y-2 text-[11.5px]">
            <span className="text-slate-500">Issued</span>
            <span className="font-semibold text-slate-900">{fmt(app.license.issuedAt)}</span>
            <span className="text-slate-500">Valid Till</span>
            <span className="font-bold text-green-700">{fmt(app.license.validTill)}</span>
          </div>

          <div className="mt-6 border-t border-dashed border-slate-300" />

          {/* Authority */}
          <div className="mt-8 flex flex-col items-end">
            <div className="w-40 border-t border-slate-500" />
            <p className="mt-1 text-[11px] font-semibold text-slate-800">Issuing Authority</p>
            <p className="text-[10px] text-slate-500 italic">(Signature)</p>
            <p className="mt-1 text-[8.5px] uppercase tracking-wider text-slate-400">
              Digitally Generated
            </p>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-300" />

          {/* Footer */}
          <p className="mt-3 text-center text-[9.5px] italic text-slate-500 leading-relaxed">
            This is a system-generated certificate.
            <br />
            No physical signature required.
          </p>
        </div>

        {/* Actions outside the certificate */}
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => downloadLicensePdf(app, serviceName)}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>

          {app.type === "NEW" && app.currentStateId === "s6" && (
            <Button
              onClick={() => setScreen({ type: "renew", parentLicenseId: app.id })}
              variant="outline"
              className="w-full gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <RefreshCw className="h-4 w-4" /> Renew License
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseView;
