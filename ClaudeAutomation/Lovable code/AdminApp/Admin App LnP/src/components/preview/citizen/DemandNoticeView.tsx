import React from "react";
import { usePreview } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CreditCard } from "lucide-react";
import { downloadDemandNoticePdf } from "@/lib/demandNoticePdf";

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const DemandNoticeView: React.FC = () => {
  const { screen, applications, setScreen, serviceName } = usePreview();
  const app = applications.find((a) => a.id === screen.applicationId);

  if (!app || !app.demand) {
    return <div className="p-4 text-sm text-muted-foreground">Demand notice not available.</div>;
  }

  const applicant = app.formData.fullName || app.formData.f1 || "—";
  const business = app.formData.businessName || app.formData.f5 || "—";

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-muted/30">
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
        {/* Document sheet */}
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
                Demand Notice / Fee Bill
              </p>
              <div className="mx-auto mt-1 h-px w-10 bg-accent" />
            </div>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-300" />

          {/* Application reference */}
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11.5px]">
            <div>
              <p className="text-slate-500">Application ID</p>
              <p className="font-semibold text-slate-900 break-all">{app.applicationNumber}</p>
            </div>
            <div>
              <p className="text-slate-500">Applicant</p>
              <p className="font-semibold text-slate-900">{applicant}</p>
            </div>
            <div>
              <p className="text-slate-500">Issued On</p>
              <p className="font-semibold text-slate-900">{fmt(app.demand.generatedAt)}</p>
            </div>
            <div>
              <p className="text-slate-500">Business</p>
              <p className="font-semibold text-slate-900">{business}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Application</p>
              <p className="font-semibold text-slate-900">{serviceName}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-dashed border-slate-300" />

          {/* Fee breakdown */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
              <span>Item</span>
              <span>Amount</span>
            </div>
            <div className="mt-1 border-t border-dashed border-slate-300" />
            <ul className="mt-2 text-[11.5px]">
              <li className="flex justify-between py-1">
                <span className="text-slate-800">Base Fee</span>
                <span className="font-semibold text-slate-900">₹{app.demand.fee.toLocaleString("en-IN")}</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-400 italic">Area Fee</span>
                <span className="text-slate-400 italic">—</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-400 italic">Hazard Fee</span>
                <span className="text-slate-400 italic">—</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-800">Tax / GST</span>
                <span className="font-semibold text-slate-900">₹{app.demand.tax.toLocaleString("en-IN")}</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-400 italic">Multiplier</span>
                <span className="text-slate-400 italic">—</span>
              </li>
            </ul>
          </div>

          <div className="mt-3 border-t border-dashed border-slate-300" />

          {/* Total */}
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800">
              Total Amount Payable
            </span>
            <span className="text-[18px] font-bold text-slate-900">
              ₹{app.demand.total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-4 border-t border-dashed border-slate-300" />

          {/* Instructions */}
          <p className="mt-4 text-center text-[11px] italic text-slate-600">
            Please complete payment to proceed with license issuance.
          </p>

          <div className="mt-5 border-t border-dashed border-slate-300" />

          {/* Footer */}
          <p className="mt-3 text-center text-[9.5px] italic text-slate-500 leading-relaxed">
            Generated on {fmt(Date.now())}
            <br />
            This is a system-generated demand notice. No physical signature required.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => downloadDemandNoticePdf(app, serviceName)}
            variant="outline"
            className="w-full gap-1.5"
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          {app.paymentStatus === "pending" && (
            <Button
              onClick={() => setScreen({ type: "payment", applicationId: app.id })}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
            >
              <CreditCard className="h-4 w-4" /> Pay Now ₹{app.demand.total.toLocaleString("en-IN")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandNoticeView;
