import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Shield, Pencil, Trash2, Info } from "lucide-react";

interface Permission {
  id: string;
  label: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
  actions: string[];
}

const ALL_PERMISSIONS: Permission[] = [
  { id: "create_application", label: "Create Application" },
  { id: "edit_draft", label: "Edit Draft" },
  { id: "edit_application", label: "Edit Application" },
  { id: "submit_application", label: "Submit Application" },
  { id: "upload_documents", label: "Upload Documents" },
  { id: "view_status", label: "View Status" },
  { id: "download_certificate", label: "Download Certificate" },
  { id: "verify_documents", label: "Verify Documents" },
  { id: "raise_query", label: "Raise Query" },
  { id: "approve_scrutiny", label: "Approve Scrutiny" },
  { id: "reject_application", label: "Reject Application" },
  { id: "submit_inspection", label: "Submit Inspection" },
  { id: "upload_photos", label: "Upload Photos" },
  { id: "recommend_decision", label: "Recommend Decision" },
  { id: "approve_license", label: "Approve License" },
  { id: "reject_license", label: "Reject License" },
  { id: "send_back", label: "Send Back" },
];

const defaultRoles: Role[] = [
  {
    id: "citizen",
    name: "Citizen",
    description: "Applicant applying for Trade License",
    isDefault: true,
    permissions: ["create_application", "edit_draft", "submit_application", "upload_documents", "view_status", "download_certificate"],
    actions: ["Create", "Edit", "View"],
  },
  {
    id: "counter_operator",
    name: "Counter Operator",
    description: "Creates application on behalf of citizen",
    permissions: ["create_application", "edit_application", "upload_documents", "submit_application"],
    actions: ["Edit", "View"],
  },
  {
    id: "scrutiny_officer",
    name: "Scrutiny Officer",
    description: "Verifies application and documents",
    permissions: ["verify_documents", "raise_query", "approve_scrutiny", "reject_application"],
    actions: ["Edit", "View"],
  },
  {
    id: "field_inspector",
    name: "Field Inspector",
    description: "Conducts physical inspection",
    permissions: ["submit_inspection", "upload_photos", "recommend_decision"],
    actions: ["Edit", "View"],
  },
  {
    id: "approving_authority",
    name: "Approving Authority",
    description: "Final approval authority",
    permissions: ["approve_license", "reject_license", "send_back"],
    actions: ["Edit", "View"],
  },
];

const getPermissionLabel = (id: string) =>
  ALL_PERMISSIONS.find((p) => p.id === id)?.label || id;

interface Props {
  moduleName: string;
  onBack: () => void;
}

const RolesDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as string[] });

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!newRole.name.trim()) return;
    setRoles((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        actions: ["Edit", "View"],
      },
    ]);
    setNewRole({ name: "", description: "", permissions: [] });
    setShowDialog(false);
  };

  const togglePermission = (permId: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{moduleName} — Roles Designer</h1>
            <p className="text-xs text-muted-foreground">Define access roles for this module</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Role
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Roles define who can access and act on Trade License applications.
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{role.name}</h3>
                        {role.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!role.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setRoles((prev) => prev.filter((r) => r.id !== role.id))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-muted-foreground mr-1">Actions:</span>
                  {role.actions.map((a) => (
                    <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                      {getPermissionLabel(p)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role Name</Label>
              <Input value={newRole.name} onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Finance Officer" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newRole.description} onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description of this role" rows={2} />
            </div>
            <div>
              <Label className="mb-2 block">Permissions</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={newRole.permissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!newRole.name.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesDesigner;
