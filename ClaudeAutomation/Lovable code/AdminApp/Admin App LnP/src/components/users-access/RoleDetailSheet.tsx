import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ACCESS_LEVELS, PERMISSION_GROUPS, DEFAULT_STAGES_BY_SERVICE } from "@/data/usersAccess";
import type { AccessLevel, RoleDef } from "@/data/usersAccess";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: RoleDef | null;
  userCount: number;
  services: string[];
  permissions: Record<string, AccessLevel>;
  scopedServices: string[];
  stageAccess: Record<string, string[]>;
  onSave: (next: {
    permissions: Record<string, AccessLevel>;
    scopedServices: string[];
    stageAccess: Record<string, string[]>;
  }) => void;
}

export function RoleDetailSheet({ open, onOpenChange, role, userCount, services, permissions, scopedServices, stageAccess, onSave }: Props) {
  const [perms, setPerms] = useState(permissions);
  const [scoped, setScoped] = useState(scopedServices);
  const [stages, setStages] = useState(stageAccess);

  useEffect(() => { setPerms(permissions); setScoped(scopedServices); setStages(stageAccess); }, [permissions, scopedServices, stageAccess, role?.id]);

  const dirty = useMemo(
    () => JSON.stringify({ perms, scoped, stages }) !== JSON.stringify({ perms: permissions, scoped: scopedServices, stages: stageAccess }),
    [perms, scoped, stages, permissions, scopedServices, stageAccess],
  );

  if (!role) return null;

  function setLevel(key: string, level: AccessLevel) { setPerms((p) => ({ ...p, [key]: level })); }
  function toggleScope(s: string) {
    setScoped((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function toggleStage(service: string, stage: string) {
    setStages((prev) => {
      const cur = prev[service] || [];
      const next = cur.includes(stage) ? cur.filter((s) => s !== stage) : [...cur, stage];
      return { ...prev, [service]: next };
    });
  }

  function attemptClose(v: boolean) {
    if (!v && dirty) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    onOpenChange(v);
  }

  function save() {
    onSave({ permissions: perms, scopedServices: scoped, stageAccess: stages });
    toast({ title: "Role updated", description: `${role!.name} permissions saved.` });
    onOpenChange(false);
  }

  const isService = role.type === "service";

  return (
    <Sheet open={open} onOpenChange={attemptClose}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border space-y-2">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">{role.name}</SheetTitle>
            <Badge variant={isService ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
              {isService ? "Service" : "System"}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">{userCount} {userCount === 1 ? "user" : "users"} assigned</span>
          </div>
          <p className="text-sm text-muted-foreground">{role.description}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isService && (
            <>
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Service Assignment</h3>
                  <p className="text-xs text-muted-foreground">Choose which services this role applies to.</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => {
                    const active = scoped.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleScope(s)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                          active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </section>

              {scoped.length > 0 && (
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Workflow Stage Access</h3>
                    <p className="text-xs text-muted-foreground">Limit this role to specific stages per service.</p>
                  </div>
                  <div className="space-y-3">
                    {scoped.map((s) => {
                      const stagesForService = DEFAULT_STAGES_BY_SERVICE[s] || ["Intake", "Review", "Approval", "Issuance"];
                      const sel = stages[s] || [];
                      return (
                        <div key={s} className="rounded-md border border-border">
                          <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs font-medium">{s}</div>
                          <div className="p-2 grid grid-cols-2 gap-1">
                            {stagesForService.map((st) => (
                              <label key={st} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 cursor-pointer">
                                <Checkbox checked={sel.includes(st)} onCheckedChange={() => toggleStage(s, st)} />
                                <span className="text-xs">{st}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Permissions</h3>
              <p className="text-xs text-muted-foreground">Set the access level for each capability.</p>
            </div>
            <Accordion type="single" collapsible defaultValue={PERMISSION_GROUPS[0].key} className="border border-border rounded-md divide-y divide-border">
              {PERMISSION_GROUPS.map((g) => (
                <AccordionItem key={g.key} value={g.key} className="border-b-0">
                  <AccordionTrigger className="px-3 py-3 text-sm font-medium hover:no-underline">
                    <span className="flex items-center gap-2">
                      {g.label}
                      <Badge variant="outline" className="text-[10px] font-normal">{g.permissions.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 pt-0 space-y-2">
                    {g.permissions.map((p) => {
                      const lvl = perms[p.key] || "none";
                      return (
                        <div key={p.key} className="flex items-center gap-3 py-2 border-t border-border first:border-t-0">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">{p.label}</div>
                            <div className="text-xs text-muted-foreground">{p.helper}</div>
                          </div>
                          <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                            {ACCESS_LEVELS.map((al) => (
                              <button
                                key={al.value}
                                onClick={() => setLevel(p.key, al.value)}
                                className={cn(
                                  "px-2.5 py-1 text-[11px] font-medium rounded transition-colors",
                                  lvl === al.value
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {al.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2">
          <Button variant="ghost" onClick={() => attemptClose(false)} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={!dirty} className="flex-1">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
