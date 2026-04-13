import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding, type TeamMember } from "@/contexts/OnboardingContext";
import HelperText from "@/components/onboarding/HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";

const roles: { value: TeamMember["role"]; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "approver", label: "Approver" },
];

const AddUsers: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const guidance = onboardingGuidance.addUsers;
  const [members, setMembers] = useState<TeamMember[]>(
    state.teamMembers.length > 0
      ? state.teamMembers
      : [{ id: "1", name: "", email: "", role: "operator" }]
  );

  const addMember = () => {
    setMembers([...members, { id: String(Date.now()), name: "", email: "", role: "operator" }]);
  };

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleComplete = () => {
    const validMembers = members.filter((m) => m.name.trim() && m.email.trim());
    updateState({ teamMembers: validMembers });
    onComplete();
  };

  const hasAtLeastOneValid = members.some((m) => m.name.trim() && m.email.trim());

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full mx-auto animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Who will manage this service?</h2>
        </div>
        <HelperText text={guidance.helperText} reassurance={guidance.reassurance} />

        <div className="mt-6 space-y-4">
          {members.map((member, i) => (
            <div key={member.id} className="p-4 rounded-xl border border-border bg-card space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Team Member {i + 1}</span>
                {members.length > 1 && (
                  <button onClick={() => removeMember(member.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.id, { name: e.target.value })}
                  placeholder="Full name"
                  className="text-sm"
                />
                <Input
                  value={member.email}
                  onChange={(e) => updateMember(member.id, { email: e.target.value })}
                  placeholder="Email address"
                  type="email"
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => updateMember(member.id, { role: role.value })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${member.role === role.value
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addMember} className="w-full gap-1 border-dashed">
            <Plus className="h-4 w-4" /> Add Another Member
          </Button>
        </div>

        <div className="flex justify-between pt-8">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!hasAtLeastOneValid}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-3 italic">
          You can skip this step and add team members later.
        </p>
        <Button variant="link" onClick={onComplete} className="w-full text-xs text-muted-foreground">
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default AddUsers;
