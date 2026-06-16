import React from "react";
import { usePreview } from "../PreviewContext";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Download, Copy } from "lucide-react";
import { toast } from "sonner";

const SuccessScreen: React.FC = () => {
  const { setScreen, screen, applications } = usePreview();
  const app = applications.find((a) => a.id === screen.applicationId);

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

      <div className="px-4 py-2 text-xs">
        <button onClick={() => setScreen({ type: "home" })} className="text-accent hover:underline">Home</button>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="text-muted-foreground">Submitted</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4">
        <div className="w-full bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center text-white mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-lg font-bold mb-2">Your application has been submitted</h2>
          <p className="text-xs opacity-90 mb-1">Your Application ID</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-[11px] font-mono break-all opacity-95">{app?.applicationNumber || "N/A"}</p>
            {app?.applicationNumber && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(app.applicationNumber);
                  toast.success("Application ID copied");
                }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Copy Application ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mb-4 px-2">
          A clerk will review your application shortly. You'll be notified about payment and license issuance.
        </p>

        <div className="w-full space-y-2">
          {app && app.paymentStatus === "paid" && (
            <Button
              onClick={() => setScreen({ type: "invoice", applicationId: app.id })}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download Invoice
            </Button>
          )}
          {app && (
            <Button
              onClick={() => setScreen({ type: "application_detail", applicationId: app.id })}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
            >
              View Application <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button onClick={() => setScreen({ type: "home" })} variant="outline" className="w-full">
            Go To Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
