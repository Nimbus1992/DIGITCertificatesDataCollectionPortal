import { useState } from "react";
import type { ImplementationConfig, DeploymentArea } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, MapPin } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

export default function Step3Deployment({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const d = config.deployment;
  const [error, setError] = useState("");

  const setScope = (scope: typeof d.availabilityScope) => {
    updateConfig("deployment", { ...d, availabilityScope: scope });
  };

  const setAreas = (areas: DeploymentArea[]) => {
    updateConfig("deployment", { ...d, areas });
  };

  const updateArea = (idx: number, field: "city" | "zones", value: string | string[]) => {
    const updated = d.areas.map((a, i) => i === idx ? { ...a, [field]: value } : a);
    setAreas(updated);
  };

  const addArea = () => setAreas([...d.areas, { city: "", zones: [""] }]);
  const removeArea = (idx: number) => setAreas(d.areas.filter((_, i) => i !== idx));

  const updateZone = (areaIdx: number, zoneIdx: number, value: string) => {
    const newZones = d.areas[areaIdx].zones.map((z, i) => i === zoneIdx ? value : z);
    updateArea(areaIdx, "zones", newZones);
  };

  const addZone = (areaIdx: number) => {
    const newZones = [...d.areas[areaIdx].zones, ""];
    updateArea(areaIdx, "zones", newZones);
  };

  const removeZone = (areaIdx: number, zoneIdx: number) => {
    const newZones = d.areas[areaIdx].zones.filter((_, i) => i !== zoneIdx);
    updateArea(areaIdx, "zones", newZones.length > 0 ? newZones : [""]);
  };

  const validate = () => {
    const hasValidArea = d.areas.some((a) => a.city.trim());
    if (!hasValidArea) {
      setError("Please enter at least one city or district.");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <StepWrapper
      step={3}
      title="Deployment Areas"
      subtitle="Define where the Business License service will be available."
      onNext={handleNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">
        {/* Scope */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability Scope</p>

          {(["entire_state", "select_cities", "select_districts"] as const).map((scope) => {
            const labels: Record<string, { title: string; desc: string }> = {
              entire_state:      { title: "Entire State / Country",   desc: "Available across your entire jurisdiction" },
              select_cities:     { title: "Select Cities",            desc: "Available in specific cities only" },
              select_districts:  { title: "Select Districts",         desc: "Available in specific districts only" },
            };
            return (
              <label
                key={scope}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                  ${d.availabilityScope === scope
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="scope"
                  value={scope}
                  checked={d.availabilityScope === scope}
                  onChange={() => setScope(scope)}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{labels[scope].title}</p>
                  <p className="text-xs text-slate-500">{labels[scope].desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Area configuration */}
        {d.availabilityScope !== "entire_state" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                {d.availabilityScope === "select_cities" ? "Cities & Zones" : "Districts & Areas"}
              </p>
              <button
                onClick={addArea}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} /> Add {d.availabilityScope === "select_cities" ? "City" : "District"}
              </button>
            </div>

            {d.areas.map((area, aIdx) => (
              <div key={aIdx} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    className={`${inputCls} flex-1`}
                    placeholder={d.availabilityScope === "select_cities" ? "City name, e.g. Mumbai" : "District name, e.g. Thane"}
                    value={area.city}
                    onChange={(e) => updateArea(aIdx, "city", e.target.value)}
                  />
                  {d.areas.length > 1 && (
                    <button onClick={() => removeArea(aIdx)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Zones */}
                <div className="pl-7 space-y-2">
                  <p className="text-xs text-slate-500">Zones / Wards (optional — add if you want zone-level control)</p>
                  {area.zones.map((zone, zIdx) => (
                    <div key={zIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder={`Zone ${zIdx + 1}, e.g. Ward 1`}
                        value={zone}
                        onChange={(e) => updateZone(aIdx, zIdx, e.target.value)}
                      />
                      {area.zones.length > 1 && (
                        <button onClick={() => removeZone(aIdx, zIdx)} className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addZone(aIdx)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add zone
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {d.availabilityScope === "entire_state" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <span className="text-green-600 text-lg">✓</span>
            <p className="text-sm text-green-700">
              The service will be available across your entire state or country.
              No further area configuration needed.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </StepWrapper>
  );
}
