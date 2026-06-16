import React, { useState } from "react";
import { usePreview } from "../PreviewContext";
import CitizenScreenShell from "./_shell/CitizenScreenShell";
import { Building2, CalendarDays, Store, ChevronRight, Search } from "lucide-react";

interface CatalogueService {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  active: boolean;
}

const ServiceCatalogue: React.FC = () => {
  const { setScreen, serviceName } = usePreview();
  const [query, setQuery] = useState("");

  const services: CatalogueService[] = [
    { id: "trade", title: serviceName, desc: "Required for businesses operating within municipal limits", icon: Store, active: true },
    { id: "building", title: "Building Permit", desc: "Construction & occupancy approvals.", icon: Building2, active: false },
    { id: "event", title: "Event Permit", desc: "Public gathering & temporary use.", icon: CalendarDays, active: false },
  ];

  const filtered = services.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <CitizenScreenShell showHeaderActions>
      {/* Welcome card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-3" style={{ border: "1px solid #E0E0E0" }}>
        <span
          className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mb-2"
          style={{ color: "#1D3557", backgroundColor: "#EAF2FB" }}
        >
          Citizen Portal
        </span>
        <h1 className="text-lg font-bold leading-tight" style={{ color: "#1D3557" }}>
          Licenses &amp; Permits
        </h1>
        <p className="text-[12px] mt-1 leading-snug" style={{ color: "#363636" }}>
          Browse services and apply, pay, or download from one place
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications"
          className="w-full bg-white rounded-lg pl-9 pr-3 py-2.5 text-[12px] outline-none focus:ring-2"
          style={{ border: "1px solid #E0E0E0", color: "#363636" }}
        />
      </div>

      <p className="text-[10px] uppercase tracking-wider font-bold mb-2 px-1" style={{ color: "#6B7280" }}>
        Available Services
      </p>

      <div className="space-y-2">
        {filtered.map((s) => {
          const Icon = s.icon;
          const onClick = s.active ? () => setScreen({ type: "home" }) : undefined;
          return (
            <button
              key={s.id}
              onClick={onClick}
              disabled={!s.active}
              className={`w-full text-left bg-white rounded-xl p-3.5 shadow-sm transition-all flex items-start gap-3 ${
                s.active ? "hover:shadow-md cursor-pointer" : "opacity-60 cursor-not-allowed"
              }`}
              style={{ border: "1px solid #E0E0E0", borderLeft: s.active ? "3px solid #1D3557" : "1px solid #E0E0E0" }}
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EAF2FB" }}
              >
                <Icon className="h-5 w-5" style={{ color: "#1D3557" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-semibold text-[13px]" style={{ color: "#1D3557" }}>{s.title}</p>
                  {!s.active && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#F5F7FA", color: "#6B7280" }}>
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-snug" style={{ color: "#6B7280" }}>{s.desc}</p>
              </div>
              {s.active && <ChevronRight className="h-4 w-4 shrink-0 mt-1" style={{ color: "#1D3557" }} />}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] mt-6" style={{ color: "#6B7280" }}>
        Powered by DIGIT Studio
      </p>
    </CitizenScreenShell>
  );
};

export default ServiceCatalogue;
