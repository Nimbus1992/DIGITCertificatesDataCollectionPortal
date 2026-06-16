import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { PERMISSIONS, type ServiceRoleRecord } from "@/lib/useServiceRoles";

export type RolePersona = "citizen" | "employee";

const personaPresetPermissions = (persona: RolePersona): string[] =>
  persona === "citizen"
    ? ["create_application", "edit_application", "view_application"]
    : ["view_application", "view_checklist", "fill_checklist"];

export interface RoleDraft {
  id: string | null;
  name: string;
  description: string;
  persona: RolePersona;
  permissions: string[];
}

export const emptyRoleDraft = (): RoleDraft => ({
  id: null,
  name: "",
  description: "",
  persona: "employee",
  permissions: personaPresetPermissions("employee"),
});

export const draftFromRole = (role: ServiceRoleRecord): RoleDraft => {
  const isCitizen = role.permissions.includes("create_application");
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    persona: isCitizen ? "citizen" : "employee",
    permissions: [...role.permissions],
  };
};

interface RoleEditorDialogProps {
  draft: RoleDraft | null;
  onClose: () => void;
  /** Receives the finalized values; parent persists. */
  onSave: (values: { name: string; description: string; permissions: string[] }) => void;
  /** Existing role ids — used only when creating to avoid name->id collisions in the parent. */
  existingNames?: string[];
}

const RoleEditorDialog: React.FC<RoleEditorDialogProps> = ({ draft, onClose, onSave }) => {
  const [local, setLocal] = useState<RoleDraft | null>(draft);

  // Keep local mirror in sync when parent opens / changes the draft.
  useEffect(() => { setLocal(draft); }, [draft]);

  if (!local) return null;

  const togglePermission = (pid: string) => {
    setLocal((d) => d && ({
      ...d,
      permissions: d.permissions.includes(pid)
        ? d.permissions.filter((p) => p !== pid)
        : [...d.permissions, pid],
    }));
  };

  const setPersona = (p: RolePersona) => {
    setLocal((d) => d && ({
      ...d,
      persona: p,
      // Replace permissions with the persona preset; the user can still tweak after.
      permissions: personaPresetPermissions(p),
    }));
  };

  const handleSave = () => {
    const name = local.name.trim();
    if (!name) {
      toast({ title: "Role name required", variant: "destructive" });
      return;
    }
    if (local.permissions.length === 0) {
      toast({ title: "Pick at least one permission", variant: "destructive" });
      return;
    }
    onSave({ name, description: local.description.trim(), permissions: local.permissions });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{local.id ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Role Name</Label>
            <Input
              value={local.name}
              onChange={(e) => setLocal({ ...local, name: e.target.value })}
              placeholder="e.g. Finance Officer"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={local.description}
              onChange={(e) => setLocal({ ...local, description: e.target.value })}
              placeholder="Brief description of this role"
              rows={2}
            />
          </div>
          <div>
            <Label className="mb-2 block">Persona</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["citizen", "employee"] as RolePersona[]).map((p) => {
                const selected = local.persona === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPersona(p)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground capitalize">{p}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p === "citizen"
                        ? "Submits and tracks applications"
                        : "Reviews and acts on applications"}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Persona sets a recommended permission preset — adjust below as needed.
            </p>
          </div>
          <div>
            <Label className="mb-2 block">Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => {
                const checked = local.permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      checked ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                    }`}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => togglePermission(p.id)} />
                    <span className="text-xs text-foreground">{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {local.id ? "Save Changes" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditorDialog;
