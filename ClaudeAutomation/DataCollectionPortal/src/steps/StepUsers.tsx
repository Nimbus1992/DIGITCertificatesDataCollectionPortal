import { useState } from "react";
import type { ImplementationConfig, StaffRole, StaffMember } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, Users, Info } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

interface UserDraft {
  name: string;
  mobile: string;
  email: string;
}

const EMPTY_DRAFT: UserDraft = { name: "", mobile: "", email: "" };

export default function StepUsers({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const roles = config.roles;
  const staffRoles = roles.filter((r) => r.id !== "citizen");

  // Per-role draft inputs — keyed by role ID (isolated, never shared)
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>(
    () => Object.fromEntries(staffRoles.map((r) => [r.id, { ...EMPTY_DRAFT }]))
  );

  function updateRole(roleId: string, patch: Partial<StaffRole>) {
    const idx = roles.findIndex((r) => r.id === roleId);
    if (idx < 0) return;
    updateConfig("roles", roles.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function setDraftField(roleId: string, field: keyof UserDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [field]: value },
    }));
  }

  function addUser(roleId: string) {
    const draft = drafts[roleId];
    if (!draft) return;
    const name   = draft.name.trim();
    const mobile = draft.mobile.trim();
    const email  = draft.email.trim();
    if (!name && !email) return; // require at least name or email

    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const newMember: StaffMember = {
      id: `${roleId}_${Date.now()}`,
      name,
      mobile,
      email,
    };

    const existing = role.staffMembers ?? [];
    updateRole(roleId, { staffMembers: [...existing, newMember] });
    // Reset only this role's draft
    setDrafts((prev) => ({ ...prev, [roleId]: { ...EMPTY_DRAFT } }));
  }

  function removeUser(roleId: string, memberId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    updateRole(roleId, {
      staffMembers: (role.staffMembers ?? []).filter((m) => m.id !== memberId),
    });
  }

  const totalAssigned = staffRoles.reduce(
    (sum, r) => sum + (r.staffMembers?.length ?? 0),
    0
  );

  const usersSummaryItems = [
    {
      label: "Total Staff Assigned",
      value: `${totalAssigned} staff member${totalAssigned !== 1 ? "s" : ""} across ${staffRoles.length} role${staffRoles.length !== 1 ? "s" : ""}`,
    },
    ...staffRoles.slice(0, 5).map((r) => ({
      label: r.name,
      value: (r.staffMembers?.length ?? 0) > 0
        ? `${r.staffMembers!.length} assigned`
        : "No users assigned",
    })),
  ];

  return (
    <StepWrapper
      step={11}
      title="Users"
      subtitle="Assign staff members to each role in the Business License workflow."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      summaryItems={usersSummaryItems}
      nextSectionLabel="Review & Export"
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 leading-relaxed">
            <p className="font-medium mb-1">Assigning users to roles</p>
            <p>
              Add the name, mobile number, and email address of staff who will handle each
              workflow stage. Users added to one role are independent of users in other roles.
            </p>
          </div>
        </div>

        {totalAssigned === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            No staff assigned yet. Add at least one user to each active role before going live.
          </div>
        )}

        <div className="space-y-4">
          {staffRoles.map((role) => {
            const members = role.staffMembers ?? [];
            const draft = drafts[role.id] ?? { ...EMPTY_DRAFT };

            return (
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
                    {members.length} assigned
                  </span>
                </div>

                {/* User list */}
                <div className="px-5 py-4 space-y-3">
                  {members.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No users assigned yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            {member.name && (
                              <p className="text-xs font-medium text-slate-800 truncate">{member.name}</p>
                            )}
                            <div className="flex gap-3 text-xs text-slate-500">
                              {member.mobile && <span>{member.mobile}</span>}
                              {member.email  && <span className="truncate">{member.email}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeUser(role.id, member.id)}
                            className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                            title="Remove user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add user form — strictly scoped to this role */}
                  <div className="border border-dashed border-slate-300 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-600">Add a user to this role</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => setDraftField(role.id, "name", e.target.value)}
                        placeholder="Full name"
                        className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400"
                      />
                      <input
                        type="tel"
                        value={draft.mobile}
                        onChange={(e) => setDraftField(role.id, "mobile", e.target.value)}
                        placeholder="Mobile number"
                        className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400"
                      />
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraftField(role.id, "email", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); addUser(role.id); }
                        }}
                        placeholder="Email ID"
                        className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400"
                      />
                    </div>
                    <button
                      onClick={() => addUser(role.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Plus size={13} />
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StepWrapper>
  );
}
