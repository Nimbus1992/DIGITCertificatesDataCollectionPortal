import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { RoleDef, UserRow } from "@/data/usersAccess";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roles: RoleDef[];
  services: string[];
  onInvite: (users: UserRow[]) => void;
}

export function InviteUserSheet({ open, onOpenChange, roles, services, onInvite }: Props) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [roleId, setRoleId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const selectedRole = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
  const needsServices = selectedRole?.type === "service";

  function reset() {
    setEmailInput(""); setEmails([]); setRoleId(""); setSelectedServices([]); setMessage("");
  }

  function pushEmail() {
    const v = emailInput.trim().replace(/,$/, "");
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast({ title: "Invalid email", description: v, variant: "destructive" });
      return;
    }
    if (!emails.includes(v)) setEmails([...emails, v]);
    setEmailInput("");
  }

  function submit() {
    if (emails.length === 0) { toast({ title: "Add at least one email" }); return; }
    if (!selectedRole) { toast({ title: "Pick a role" }); return; }
    if (needsServices && selectedServices.length === 0) { toast({ title: "Select at least one service" }); return; }

    const rows: UserRow[] = emails.map((e, i) => ({
      id: `inv_${Date.now()}_${i}`,
      name: e.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: e,
      avatarColor: ["primary", "accent", "warning", "success"][i % 4],
      roleId: selectedRole.id,
      services: needsServices ? selectedServices : ["Platform"],
      status: "invited",
      lastActiveISO: null,
    }));
    onInvite(rows);
    toast({ title: `Invited ${rows.length} ${rows.length === 1 ? "person" : "people"}` });
    reset();
    onOpenChange(false);
  }

  function toggleService(s: string) {
    setSelectedServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const systemRoles = roles.filter((r) => r.type === "system");
  const serviceRoles = roles.filter((r) => r.type === "service");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle>Invite users</SheetTitle>
          <SheetDescription>Send invitations to join your platform with a specific role.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-email-input">Email addresses</Label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-10">
              {emails.map((e) => (
                <Badge key={e} variant="secondary" className="gap-1 pl-2 pr-1">
                  {e}
                  <button onClick={() => setEmails(emails.filter((x) => x !== e))} className="hover:bg-muted rounded p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="invite-email-input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); pushEmail(); } }}
                onBlur={pushEmail}
                placeholder={emails.length === 0 ? "name@org.in, …" : ""}
                className="flex-1 min-w-[140px] bg-transparent text-sm outline-none px-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Press Enter or comma to add. Multiple invites allowed.</p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={(v) => { setRoleId(v); setSelectedServices([]); }}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>System Roles</SelectLabel>
                  {systemRoles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Service Roles</SelectLabel>
                  {serviceRoles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedRole && <p className="text-xs text-muted-foreground">{selectedRole.description}</p>}
          </div>

          {needsServices && (
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="rounded-md border border-border divide-y divide-border">
                {services.map((s) => (
                  <label key={s} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40">
                    <Checkbox checked={selectedServices.includes(s)} onCheckedChange={() => toggleService(s)} />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Service roles must be scoped to one or more services.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Personal message (optional)</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Welcome to the team…" />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
          <Button onClick={submit} className="flex-1">Send Invite{emails.length > 1 ? `s (${emails.length})` : ""}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
