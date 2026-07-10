import type { ImplementationConfig, StaffRole } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, Info } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

const DEFAULT_ICONS: Record<string, string> = {
  citizen: "🙋",
  document_verifier: "📄",
  field_inspector: "🔍",
  approver: "✅",
  counter_employee: "🖥️",
  dashboard_viewer: "📊",
};

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function Step5RolesStaff({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const roles = config.roles;
  const setRoles = (r: StaffRole[]) => updateConfig("roles", r);

  function updateRole(idx: number, patch: Partial<StaffRole>) {
    setRoles(roles.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function addRole() {
    setRoles([...roles, { id: uid(), name: "New Role", description: "", staffEmails: [] }]);
  }

  function removeRole(idx: number) {
    setRoles(roles.filter((_, i) => i !== idx));
  }

  return (
    <StepWrapper
      step={7}
      title="Roles"
      subtitle="Define the roles involved in the Business License workflow."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Define each role that participates in the workflow. You will assign staff members to these
            roles in the <strong>Users</strong> section. The <em>Citizen</em> role is public-facing and
            does not need staff assignment.
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((role, rIdx) => (
            <div key={role.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="text-2xl shrink-0">{DEFAULT_ICONS[role.id] ?? "👤"}</span>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={role.name}
                    onChange={(e) => updateRole(rIdx, { name: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5"
                  />
                  <input
                    type="text"
                    value={role.description}
                    onChange={(e) => updateRole(rIdx, { description: e.target.value })}
                    placeholder="Describe this role…"
                    className="w-full text-xs text-slate-500 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 mt-0.5"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {role.id === "citizen" && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Public</span>
                  )}
                  {!["citizen", "document_verifier", "field_inspector", "approver"].includes(role.id) && (
                    <button
                      onClick={() => removeRole(rIdx)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRole}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all w-full justify-center"
        >
          <Plus size={14} />
          Add custom role
        </button>
      </div>
    </StepWrapper>
  );
}
