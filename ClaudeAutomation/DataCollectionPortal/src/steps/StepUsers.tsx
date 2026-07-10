import { useState } from "react";
import type { ImplementationConfig, StaffRole } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, Users, Info } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

export default function StepUsers({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const roles = config.roles;
  const staffRoles = roles.filter((r) => r.id !== "citizen");

  const [emailInputs, setEmailInputs] = useState<Record<string, string>>(
    () => Object.fromEntries(staffRoles.map((r) => [r.id, ""]))
  );

  function updateRole(idx: number, patch: Partial<StaffRole>) {
    updateConfig("roles", roles.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function getRoleIdx(roleId: string) {
    return roles.findIndex((r) => r.id === roleId);
  }

  function addEmail(roleId: string) {
    const rIdx = getRoleIdx(roleId);
    if (rIdx < 0) return;
    const role = roles[rIdx];
    const raw = (emailInputs[roleId] ?? "").trim();
    if (!raw) return;
    const valid = raw.split(/[\s,;]+/).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (valid.length === 0) return;
    updateRole(rIdx, { staffEmails: [...new Set([...role.staffEmails, ...valid])] });
    setEmailInputs((prev) => ({ ...prev, [roleId]: "" }));
  }

  function removeEmail(roleId: string, email: string) {
    const rIdx = getRoleIdx(roleId);
    if (rIdx < 0) return;
    updateRole(rIdx, { staffEmails: roles[rIdx].staffEmails.filter((e) => e !== email) });
  }

  const totalAssigned = staffRoles.reduce((sum, r) => sum + r.staffEmails.length, 0);

  return (
    <StepWrapper
      step={11}
      title="Users"
      subtitle="Assign staff members to each role in the Business License workflow."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 leading-relaxed">
            <p className="font-medium mb-1">Assigning users to roles</p>
            <p>
              Add the email addresses of staff who will handle each workflow stage.
              You can add multiple emails per role — all assigned staff will receive tasks and notifications.
            </p>
          </div>
        </div>

        {totalAssigned === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            No staff assigned yet. Add at least one email to each active role before going live.
          </div>
        )}

        <div className="space-y-4">
          {staffRoles.map((role) => (
            <div key={role.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Role header */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Users size={13} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-slate-500">{role.description}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-slate-400">
                  {role.staffEmails.length} assigned
                </span>
              </div>

              {/* Email list + input */}
              <div className="px-5 py-4 space-y-3">
                {role.staffEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {role.staffEmails.map((email) => (
                      <span
                        key={email}
                        className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full"
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(role.id, email)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailInputs[role.id] ?? ""}
                    onChange={(e) => setEmailInputs((prev) => ({ ...prev, [role.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail(role.id); }
                    }}
                    placeholder="staff@municipality.gov.in"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400"
                  />
                  <button
                    onClick={() => addEmail(role.id)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepWrapper>
  );
}
