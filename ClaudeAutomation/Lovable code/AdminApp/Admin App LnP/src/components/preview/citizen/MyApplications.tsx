import React from "react";
import { usePreview } from "../PreviewContext";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, ChevronRight, RefreshCw } from "lucide-react";

const statusTone = (status: string): string => {
  if (status === "License Issued") return "bg-green-100 text-green-700 border-green-300";
  if (status === "License Renewed") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (status === "Rejected") return "bg-destructive/15 text-destructive border-destructive/30";
  if (status === "Payment Pending") return "bg-warning/15 text-warning border-warning/40";
  if (status === "Sent Back") return "bg-orange-100 text-orange-700 border-orange-300";
  if (status === "Paid") return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-accent/10 text-accent border-accent/30";
};

const MyApplications: React.FC = () => {
  const { applications, setScreen } = usePreview();

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
        <span className="text-muted-foreground">My Applications</span>
      </div>

      <div className="px-4 pb-4">
        <h2 className="font-bold text-foreground mb-4">My Applications</h2>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No applications yet.
            <button onClick={() => setScreen({ type: "apply" })} className="block mx-auto mt-3 text-accent hover:underline text-xs">
              Start a new application →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg bg-card overflow-hidden">
                <button
                  onClick={() => setScreen({ type: "application_detail", applicationId: app.id })}
                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[11px] text-accent font-mono break-all flex-1">{app.applicationNumber}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      app.type === "RENEWAL"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {app.type === "RENEWAL" ? "Renewal" : "New"}
                    </span>
                    <p className="text-sm font-semibold text-foreground truncate flex-1">
                      {app.formData.f5 || "Business"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-[10px] ${statusTone(app.status)}`}>{app.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>

                {app.paymentStatus === "pending" && (
                  <button
                    onClick={() => setScreen({ type: "payment", applicationId: app.id })}
                    className="w-full bg-warning text-warning-foreground text-xs font-semibold py-2 flex items-center justify-center gap-1.5 hover:opacity-90"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Pay Now — ₹{app.demand?.total ?? 0}
                  </button>
                )}
                {app.license && (
                  <>
                    <button
                      onClick={() => setScreen({ type: "license", applicationId: app.id })}
                      className="w-full bg-green-600 text-white text-xs font-semibold py-2 flex items-center justify-center gap-1.5 hover:bg-green-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Download License
                    </button>
                    {app.type === "NEW" && app.currentStateId === "s6" && (
                      <button
                        onClick={() => setScreen({ type: "renew", parentLicenseId: app.id })}
                        className="w-full bg-purple-600 text-white text-xs font-semibold py-2 flex items-center justify-center gap-1.5 hover:bg-purple-700"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Renew License
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

