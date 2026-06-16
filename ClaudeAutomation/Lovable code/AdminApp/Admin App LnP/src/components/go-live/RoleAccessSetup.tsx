import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, ShieldCheck, UserPlus, Smartphone, Mail, KeyRound, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import HelperText from "@/components/onboarding/HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";
import { useOnboarding, type AccessType, type RoleAuthMethod, type RoleAccessConfig, type RoleUser } from "@/contexts/OnboardingContext";
import { useServiceRoles, isCitizenRole } from "@/lib/useServiceRoles";

const ACCESS_OPTIONS: { value: AccessType; label: string; description: string }[] = [
  { value: "self_registration", label: "Self Registration", description: "Users sign up themselves" },
  { value: "pre_registered", label: "Pre-registered", description: "Admin adds users in advance" },
];

const SELF_AUTH: { value: RoleAuthMethod; label: string; icon: typeof Mail }[] = [
  { value: "mobile_otp", label: "Mobile OTP", icon: Smartphone },
  { value: "email_otp", label: "Email OTP", icon: Mail },
];

const PRE_AUTH: { value: RoleAuthMethod; label: string; icon: typeof Mail }[] = [
  { value: "email_otp", label: "Email + OTP", icon: Mail },
  { value: "email_password", label: "Email + Password", icon: KeyRound },
];

const newUser = (): RoleUser => ({ id: String(Date.now() + Math.random()), name: "", email: "" });

const RoleAccessSetup: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateService, getActiveService } = useOnboarding();
  const guidance = onboardingGuidance.roleAccess ?? onboardingGuidance.addUsers;
  const activeService = getActiveService();
  // Pull roles from every module of the live store (Issuance + Renewal) so
  // any custom role added in any module's Roles & Access shows up here.
  const [issuanceRoles] = useServiceRoles(activeService?.id ?? "", "Issuance");
  const [renewalRoles] = useServiceRoles(activeService?.id ?? "", "Renewal");
  const roles = useMemo(() => {
    const map = new Map<string, { id: string; name: string; description: string; permissions: string[] }>();
    [...issuanceRoles, ...renewalRoles].forEach((r) => {
      if (!map.has(r.id)) {
        map.set(r.id, { id: r.id, name: r.name, description: r.description, permissions: r.permissions });
      }
    });
    return Array.from(map.values());
  }, [issuanceRoles, renewalRoles]);

  const [configs, setConfigs] = useState<RoleAccessConfig[]>(() => {
    const existing = activeService?.roleAccess ?? [];
    return roles.map((r) => {
      const found = existing.find((e) => e.roleId === r.id);
      if (found) return { ...found, roleName: r.name };
      const accessType: AccessType = isCitizenRole(r) ? "self_registration" : "pre_registered";
      return {
        roleId: r.id,
        roleName: r.name,
        accessType,
        authMethod: accessType === "self_registration" ? "mobile_otp" : "email_password",
        users: accessType === "pre_registered" ? [newUser()] : [],
      };
    });
  });

  // Reconcile if roles are added/removed/renamed while this step is mounted.
  React.useEffect(() => {
    setConfigs((prev) => {
      const next = roles.map((r) => {
        const existing = prev.find((c) => c.roleId === r.id);
        if (existing) return { ...existing, roleName: r.name };
        const accessType: AccessType = isCitizenRole(r) ? "self_registration" : "pre_registered";
        return {
          roleId: r.id,
          roleName: r.name,
          accessType,
          authMethod: accessType === "self_registration" ? "mobile_otp" : "email_password",
          users: accessType === "pre_registered" ? [newUser()] : [],
        } as RoleAccessConfig;
      });
      const same =
        next.length === prev.length &&
        next.every((n, i) => prev[i]?.roleId === n.roleId && prev[i]?.roleName === n.roleName);
      return same ? prev : next;
    });
  }, [roles]);

  const [openRoleId, setOpenRoleId] = useState<string>(roles[0]?.id ?? "");

  const updateConfig = (roleId: string, updater: (c: RoleAccessConfig) => RoleAccessConfig) => {
    setConfigs((prev) => prev.map((c) => (c.roleId === roleId ? updater(c) : c)));
  };

  const setAccessType = (roleId: string, type: AccessType) => {
    updateConfig(roleId, (c) => ({
      ...c,
      accessType: type,
      authMethod: type === "self_registration" ? "mobile_otp" : "email_password",
      users: type === "pre_registered" ? (c.users.length > 0 ? c.users : [newUser()]) : [],
    }));
  };

  const setAuthMethod = (roleId: string, method: RoleAuthMethod) => {
    updateConfig(roleId, (c) => ({ ...c, authMethod: method }));
  };

  const addUser = (roleId: string) => updateConfig(roleId, (c) => ({ ...c, users: [...c.users, newUser()] }));
  const removeUser = (roleId: string, userId: string) =>
    updateConfig(roleId, (c) => ({ ...c, users: c.users.length > 1 ? c.users.filter((u) => u.id !== userId) : c.users }));
  const updateUser = (roleId: string, userId: string, patch: Partial<RoleUser>) =>
    updateConfig(roleId, (c) => ({ ...c, users: c.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }));

  const isValid = configs.every((c) => {
    if (c.accessType === "pre_registered") {
      return c.users.some((u) => u.name.trim() && u.email.trim());
    }
    return true;
  });

  const handleComplete = () => {
    const cleaned = configs.map((c) => ({
      ...c,
      users: c.users.filter((u) => u.name.trim() && u.email.trim()),
    }));
    if (activeService) {
      updateService(activeService.id, { roleAccess: cleaned });
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl w-full mx-auto animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">User Access & Authentication</h2>
        </div>
        <HelperText text={guidance.helperText} reassurance={guidance.reassurance} />

        <p className="mt-4 text-xs text-muted-foreground">
          Roles are based on the <span className="font-medium text-foreground">{activeService?.name ?? "selected service"}</span> template.
        </p>

        <div className="mt-5 space-y-3">
          {configs.map((cfg) => {
            const role = roles.find((r) => r.id === cfg.roleId);
            const isOpen = openRoleId === cfg.roleId;
            const authOptions = cfg.accessType === "self_registration" ? SELF_AUTH : PRE_AUTH;
            const validUsers = cfg.users.filter((u) => u.name.trim() && u.email.trim()).length;
            return (
              <div key={cfg.roleId} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenRoleId(isOpen ? "" : cfg.roleId)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{role?.name}</p>
                      <p className="text-xs text-muted-foreground">{role?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {cfg.accessType === "self_registration" ? "Self Registration" : `Pre-registered${validUsers > 0 ? ` · ${validUsers}` : ""}`}
                    </Badge>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 space-y-5 animate-fade-in">
                    {/* Access type */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Access type</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ACCESS_OPTIONS.map((opt) => {
                          const selected = cfg.accessType === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setAccessType(cfg.roleId, opt.value)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                              }`}
                            >
                              <p className="text-sm font-medium text-foreground">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Auth method */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Authentication</p>
                      <div className="grid grid-cols-2 gap-2">
                        {authOptions.map((opt) => {
                          const Icon = opt.icon;
                          const selected = cfg.authMethod === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => setAuthMethod(cfg.roleId, opt.value)}
                              className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                                selected ? "border-accent bg-accent/5 text-accent" : "border-border text-foreground hover:border-accent/40"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pre-registered users */}
                    {cfg.accessType === "pre_registered" && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Users</p>
                        <div className="space-y-2">
                          {cfg.users.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-2">
                              <Input
                                value={u.name}
                                onChange={(e) => updateUser(cfg.roleId, u.id, { name: e.target.value })}
                                placeholder={`Full name ${i + 1}`}
                                className="text-sm"
                              />
                              <Input
                                value={u.email}
                                onChange={(e) => updateUser(cfg.roleId, u.id, { email: e.target.value })}
                                placeholder="Email address"
                                type="email"
                                className="text-sm"
                              />
                              <button
                                onClick={() => removeUser(cfg.roleId, u.id)}
                                className="text-muted-foreground hover:text-destructive p-2"
                                aria-label="Remove user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addUser(cfg.roleId)} className="gap-1 border-dashed w-full">
                            <Plus className="h-3.5 w-3.5" /> Add user
                          </Button>
                        </div>
                      </div>
                    )}

                    {cfg.accessType === "self_registration" && (
                      <p className="text-xs text-muted-foreground italic">
                        Users in this role will sign themselves up using {cfg.authMethod === "mobile_otp" ? "Mobile OTP" : "Email OTP"}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between pt-8">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!isValid}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!isValid && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Add at least one user to each Pre-registered role to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoleAccessSetup;
