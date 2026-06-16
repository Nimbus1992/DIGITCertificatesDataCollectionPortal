import React from "react";
import { usePreview } from "../PreviewContext";
import CitizenScreenShell from "./_shell/CitizenScreenShell";
import { User, Building2, MapPin, Users, FileText } from "lucide-react";

const items = [
  { icon: User, title: "Your details", sub: "Name, mobile number, and a valid ID" },
  { icon: Building2, title: "Business details", sub: "Business name, type, and category" },
  { icon: MapPin, title: "Business location", sub: "Address or area where your business operates" },
  { icon: Users, title: "Team (if applicable)", sub: "Names and phone numbers of people involved" },
  { icon: FileText, title: "Documents", sub: "ID proof, address proof, and business proof" },
];

const ApplicationIntro: React.FC = () => {
  const { setScreen } = usePreview();

  return (
    <CitizenScreenShell
      onBack={() => setScreen({ type: "home" })}
      footer={
        <div className="space-y-2">
          <button
            onClick={() => setScreen({ type: "apply" })}
            className="w-full h-11 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: "#F4A261" }}
          >
            Start Application
          </button>
          <button
            onClick={() => setScreen({ type: "home" })}
            className="w-full text-[11px] text-center"
            style={{ color: "#6B7280" }}
          >
            {"\u200B"}
          </button>
        </div>
      }
    >
      <div className="bg-white rounded-xl shadow-sm p-4 mb-3" style={{ border: "1px solid #E0E0E0" }}>
        <h2 className="text-base font-bold leading-snug" style={{ color: "#1D3557" }}>
          Get these ready before you start
        </h2>
        <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "#363636" }}>
          This will take about 5–7 minutes.<br />
          You can save your progress and continue anytime.
        </p>
      </div>

      <p className="text-[10px] uppercase tracking-wider font-bold mb-2 px-1" style={{ color: "#6B7280" }}>
        Keep these ready
      </p>

      <div className="bg-white rounded-xl shadow-sm divide-y" style={{ border: "1px solid #E0E0E0", borderColor: "#E0E0E0" }}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex items-start gap-3 p-3">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EAF2FB" }}
              >
                <Icon className="h-4 w-4" style={{ color: "#1D3557" }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "#1D3557" }}>{it.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{it.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </CitizenScreenShell>
  );
};

export default ApplicationIntro;
