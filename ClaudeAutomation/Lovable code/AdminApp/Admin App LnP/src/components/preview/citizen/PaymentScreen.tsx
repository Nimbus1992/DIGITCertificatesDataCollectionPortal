import React, { useState } from "react";
import { usePreview } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, ArrowLeft, FileText } from "lucide-react";

const PaymentScreen: React.FC = () => {
  const { screen, applications, setScreen, payApplication } = usePreview();
  const app = applications.find((a) => a.id === screen.applicationId);
  const [processing, setProcessing] = useState(false);

  if (!app || !app.demand) {
    return <div className="p-4 text-sm text-muted-foreground">Demand not found.</div>;
  }

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      payApplication(app.id);
      setScreen({ type: "application_detail", applicationId: app.id });
    }, 700);
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-background">
      <div className="bg-[#0b4f6c] text-white px-4 py-3 flex items-center gap-2 text-sm font-medium">
        <span className="grid grid-cols-2 gap-0.5">
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
          <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
        </span>
        DIGIT <span className="text-white/60 ml-1">| dev</span>
      </div>

      <div className="px-4 py-2 text-xs flex items-center gap-1">
        <button
          onClick={() => setScreen({ type: "application_detail", applicationId: app.id })}
          className="text-accent hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
      </div>

      <div className="px-4 pb-4 space-y-4">
        <div>
          <h2 className="font-bold text-foreground">Pay License Fee</h2>
          <p className="text-[11px] text-muted-foreground break-all">{app.applicationNumber}</p>
        </div>

        <div className="border rounded-xl p-4 bg-card">
          <p className="text-xs font-semibold text-accent mb-3">Fee Breakdown</p>
          <dl className="space-y-2 text-sm">
            {app.demand.lines && app.demand.lines.length > 0 ? (
              app.demand.lines.map((line) => (
                <div key={line.feeId} className="flex justify-between">
                  <dt className="text-muted-foreground">{line.name}</dt>
                  <dd className="font-medium text-foreground">₹{line.amount.toLocaleString()}</dd>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">License Fee</dt>
                <dd className="font-medium text-foreground">₹{app.demand.fee.toLocaleString()}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax (10%)</dt>
              <dd className="font-medium text-foreground">₹{app.demand.tax.toLocaleString()}</dd>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-bold text-accent text-base">₹{app.demand.total.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {app.demand.stage === "license" && (
          <button
            onClick={() => setScreen({ type: "demand_notice", applicationId: app.id })}
            className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-accent hover:underline"
          >
            <FileText className="h-3 w-3" /> View Demand Notice
          </button>
        )}

        <div className="rounded-lg bg-muted/50 px-3 py-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
          Secure mock payment for preview demonstration.
        </div>

        <Button
          onClick={handlePay}
          disabled={processing}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
        >
          <CreditCard className="h-4 w-4" />
          {processing ? "Processing..." : `Pay ₹${app.demand.total.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentScreen;
