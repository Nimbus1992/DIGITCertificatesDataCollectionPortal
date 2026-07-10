import type { ImplementationConfig, StaffRole } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, Info, GitBranch, Users, AlertTriangle } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

const ROLE_ICONS: Record<string, string> = {
  citizen:           "🙋",
  document_verifier: "📄",
  field_inspector:   "🔍",
  approver:          "✅",
  counter_employee:  "🖥️",
  dashboard_viewer:  "📊",
};

const LOCKED_ROLES = ["citizen", "document_verifier", "field_inspector", "approver"];

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function Step5RolesStaff({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const roles = config.roles;
  const stages = config.workflow?.stages ?? [];
  const setRoles = (r: StaffRole[]) => updateConfig("roles", r);

  // Map role name → workflow stage names that use it as actor
  const roleToStages: Record<string, string[]> = {};
  stages.forEach((stage) => {
    const actor = stage.actor?.trim();
    if (!actor || actor === "—" || actor === "System") return;
    if (!roleToStages[actor]) roleToStages[actor] = [];
    roleToStages[actor].push(stage.name);
  });

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
      <div className="space-y-6">

        {/* ── How roles work ─────────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info size={15} className="text-blue-500 shrink-0" />
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">How roles work</p>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Each workflow stage is assigned an <strong>actor</strong> — a role that can perform the
            action at that stage. For example, if the <em>Inspection</em> stage is assigned to the
            <em> Field Inspector</em> role, then every user you assign that role to in the{" "}
            <strong>Users</strong> section will be able to perform inspections.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-white rounded-lg border border-blue-200 p-3 flex gap-3 items-start">
              <GitBranch size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Roles → Workflow stages</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  In the Workflow step you assign a role to each stage. That determines who is
                  responsible for each action in the process.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-blue-200 p-3 flex gap-3 items-start">
              <Users size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Roles → Multiple users</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  You can assign one role to many users. All of them will share the same access and
                  be able to act on the same workflow stages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Role cards ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {roles.map((role, rIdx) => {
            const linkedStages = roleToStages[role.name] ?? [];
            const isCitizen = role.id === "citizen";

            return (
              <div key={role.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-4">
                  <span className="text-2xl shrink-0 mt-0.5">{ROLE_ICONS[role.id] ?? "👤"}</span>

                  <div className="flex-1 min-w-0 space-y-1">
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
                      className="w-full text-xs text-slate-500 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5"
                    />

                    {/* Workflow stage badges */}
                    {!isCitizen && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {linkedStages.length > 0 ? (
                          linkedStages.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5">
                              <GitBranch size={10} />
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 font-medium rounded-full px-2.5 py-1">
                            <AlertTriangle size={11} className="shrink-0" />
                            Not assigned to any workflow stage
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    {isCitizen && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Public</span>
                    )}
                    {!LOCKED_ROLES.includes(role.id) && (
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
            );
          })}
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
