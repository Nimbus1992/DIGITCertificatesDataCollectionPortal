import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { userApi } from "@/lib/backendApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, Plus, Search, MoreVertical, Mail, Trash2,
  Shield, UserCheck, Clock, CheckCircle2, Wrench,
  Eye, Loader2, Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Role definitions ──────────────────────────────────────────────────────────

type RoleCategory = "system" | "service";

interface RoleDef {
  value: string;
  label: string;
  description: string;
  category: RoleCategory;
  color: string;
  icon: React.FC<{ className?: string }>;
}

const ROLES: RoleDef[] = [
  {
    value: "system_admin",
    label: "System Admin",
    description:
      "Manage service designers, edit org profile, change auth settings, add languages, and view audit log",
    category: "system",
    color: "bg-purple-100 text-purple-700",
    icon: Shield,
  },
  {
    value: "service_designer",
    label: "Service Designer",
    description: "Add new services and fully configure them",
    category: "system",
    color: "bg-blue-100 text-blue-700",
    icon: Wrench,
  },
  {
    value: "field_inspector",
    label: "Field Inspector",
    description: "Conduct field inspections and submit inspection reports for a service",
    category: "service",
    color: "bg-orange-100 text-orange-700",
    icon: UserCheck,
  },
  {
    value: "approver",
    label: "Approving Authority",
    description: "Review and approve or reject applications for a service",
    category: "service",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  {
    value: "counter_operator",
    label: "Counter Operator",
    description: "Process, verify, and triage incoming applications for a service",
    category: "service",
    color: "bg-sky-100 text-sky-700",
    icon: Users,
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to applications and reports for a service",
    category: "service",
    color: "bg-muted text-muted-foreground",
    icon: Eye,
  },
];

const SYSTEM_ROLES = ROLES.filter((r) => r.category === "system");
const SERVICE_ROLES = ROLES.filter((r) => r.category === "service");

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:   { label: "Active",      className: "bg-green-100 text-green-700" },
  pending:  { label: "Invite Sent", className: "bg-amber-100 text-amber-700" },
  inactive: { label: "Inactive",    className: "bg-muted text-muted-foreground" },
};

const SERVICE_STATUS_CONFIG: Record<string, string> = {
  live:      "bg-green-100 text-green-700",
  published: "bg-blue-100 text-blue-700",
  draft:     "bg-muted text-muted-foreground",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  name: string;
  status: string;
}

interface Member {
  id: string;
  organization_id: string;
  service_id: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  service_name?: string | null;
  service_status?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getRoleDef(value: string): RoleDef | undefined {
  return ROLES.find((r) => r.value === value);
}

// ── Component ─────────────────────────────────────────────────────────────────

const UsersAndRoles: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Invite dialog
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCategory, setInviteCategory] = useState<RoleCategory>("system");
  const [inviteForm, setInviteForm] = useState({
    name: "", email: "", role: "system_admin", service_id: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Load: separate queries — no FK join to avoid schema-cache errors ─────────

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!org || cancelled) { setLoading(false); return; }
      setOrgId(org.id);

      // Fetch members and services independently — no PostgREST FK join
      const [membersRes, servicesRes] = await Promise.all([
        supabase
          .from("team_members")
          .select("id, organization_id, service_id, name, email, role, status, created_at")
          .eq("organization_id", org.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("services")
          .select("id, name, status")
          .eq("organization_id", org.id)
          .order("name"),
      ]);

      if (!cancelled) {
        const svcMap = new Map<string, ServiceOption>();
        (servicesRes.data ?? []).forEach((s) => svcMap.set(s.id, s as ServiceOption));
        setServices(servicesRes.data as ServiceOption[] ?? []);

        // Manually join service name/status onto each member
        const mapped: Member[] = (membersRes.data ?? []).map((m) => ({
          ...m,
          service_name: m.service_id ? (svcMap.get(m.service_id)?.name ?? null) : null,
          service_status: m.service_id ? (svcMap.get(m.service_id)?.status ?? null) : null,
        }));
        setMembers(mapped);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const systemMembers = members.filter((m) => {
    const cat = getRoleDef(m.role)?.category ?? "service";
    if (cat !== "system") return false;
    if (!search) return true;
    return m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  const serviceMembers = members.filter((m) => {
    const cat = getRoleDef(m.role)?.category ?? "service";
    if (cat !== "service") return false;
    if (!search) return true;
    return m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  // ── Invite dialog helpers ──────────────────────────────────────────────────

  const openInvite = () => {
    setInviteCategory("system");
    setInviteForm({ name: "", email: "", role: "system_admin", service_id: "" });
    setShowInvite(true);
  };

  const handleCategorySwitch = (cat: RoleCategory) => {
    setInviteCategory(cat);
    setInviteForm((f) => ({
      ...f,
      role: cat === "system" ? "system_admin" : "field_inspector",
      service_id: "",
    }));
  };

  const handleInvite = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim() || !orgId) return;
    if (inviteCategory === "service" && !inviteForm.service_id) {
      toast({ title: "Select a service", description: "Service-specific users must be linked to a service.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Call backend: creates auth.users (invited state) + inserts team_member
      const res = await userApi.invite({
        email: inviteForm.email.trim().toLowerCase(),
        name: inviteForm.name.trim(),
        role: inviteForm.role,
        organizationId: orgId,
        serviceId: inviteCategory === "service" ? inviteForm.service_id : undefined,
      });

      if (!res.success || !res.data) throw new Error(res.error ?? "Invite failed");

      const svc = inviteCategory === "service"
        ? services.find((s) => s.id === inviteForm.service_id)
        : null;

      const newMember: Member = {
        ...res.data.member,
        service_name: svc?.name ?? null,
        service_status: svc?.status ?? null,
      };
      setMembers((prev) => [...prev, newMember]);
      setShowInvite(false);

      toast({
        title: res.data.invited ? "Invite sent" : "User added",
        description: res.data.invited
          ? `An invitation email has been sent to ${inviteForm.email}.`
          : `${inviteForm.name} added (already has an account).`,
      });
    } catch (err: any) {
      // Friendly message if backend isn't running
      const isNetworkError = err.message?.includes("fetch") || err.message?.includes("Failed");
      toast({
        title: "Invite failed",
        description: isNetworkError
          ? "Backend is not running. Start it with: cd backend && npm run dev"
          : err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await userApi.remove(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // Fallback: remove from Supabase directly if backend unavailable
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    const { error } = await supabase.from("team_members").update({ role }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const handleUpdateStatus = async (id: string, status: "active" | "inactive" | "pending") => {
    const { error } = await supabase.from("team_members").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  // ── Member row ─────────────────────────────────────────────────────────────

  const MemberRow = ({ member, showService }: { member: Member; showService?: boolean }) => {
    const roleDef = getRoleDef(member.role);
    const RoleIcon = roleDef?.icon ?? Users;
    const statusCfg = STATUS_CONFIG[member.status] ?? STATUS_CONFIG.pending;
    const roleOptions = showService ? SERVICE_ROLES : SYSTEM_ROLES;

    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
            {getInitials(member.name)}
          </div>

          {/* Name / email / service */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-foreground">{member.name}</p>
              <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusCfg.className}`}>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            {showService && member.service_name && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground">{member.service_name}</span>
                {member.service_status && (
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${SERVICE_STATUS_CONFIG[member.service_status] ?? ""}`}>
                    {member.service_status}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Role badge + selector */}
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${roleDef?.color ?? ""}`}>
              <RoleIcon className="h-3 w-3" />
              {roleDef?.label ?? member.role}
            </div>
            <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.id, v)}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {member.status !== "active" && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, "active")}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Set Active
                </DropdownMenuItem>
              )}
              {member.status !== "inactive" && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, "inactive")}>
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" /> Disable
                </DropdownMenuItem>
              )}
              {member.status === "pending" && (
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" /> Resend Invite
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleRemove(member.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage team members and their access</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={openInvite}>
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Members",  value: members.length,                                                              icon: Users,        color: "text-accent" },
            { label: "System Users",   value: members.filter((m) => getRoleDef(m.role)?.category === "system").length,    icon: Shield,       color: "text-purple-600" },
            { label: "Service Users",  value: members.filter((m) => getRoleDef(m.role)?.category === "service").length,   icon: UserCheck,    color: "text-orange-600" },
            { label: "Pending Invite", value: members.filter((m) => m.status === "pending").length,                       icon: Clock,        color: "text-amber-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        )}

        {!loading && (
          <Tabs defaultValue="system">
            <TabsList>
              <TabsTrigger value="system">
                System Users
                {systemMembers.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{systemMembers.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="service">
                Service Users
                {serviceMembers.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{serviceMembers.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="roles">Role Definitions</TabsTrigger>
            </TabsList>

            {/* ── System Users ─────────────────────────────────────────── */}
            <TabsContent value="system" className="mt-4 space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
                <strong>System Admins</strong> manage users, org settings, auth, and audit logs.{" "}
                <strong>Service Designers</strong> create and configure services.
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="space-y-2">
                {systemMembers.map((m) => <MemberRow key={m.id} member={m} showService={false} />)}
                {systemMembers.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    <Shield className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No system users yet — invite a System Admin or Service Designer.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Service Users ─────────────────────────────────────────── */}
            <TabsContent value="service" className="mt-4 space-y-4">
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-orange-700">
                Service-specific users are linked to a single service. System Admins and Service
                Designers can add them once a service exists.
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="space-y-2">
                {serviceMembers.map((m) => <MemberRow key={m.id} member={m} showService />)}
                {serviceMembers.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    <UserCheck className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No service-specific users yet.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Role Definitions ──────────────────────────────────────── */}
            <TabsContent value="roles" className="mt-4">
              <div className="space-y-8">
                {(["system", "service"] as RoleCategory[]).map((cat) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {cat === "system" ? "System-Level Roles" : "Service-Specific Roles"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ROLES.filter((r) => r.category === cat).map((role) => {
                        const Icon = role.icon;
                        const roleMembers = members.filter((m) => m.role === role.value);

                        return (
                          <Card key={role.value}>
                            <CardContent className="p-4 space-y-3">
                              {/* Header row */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.color}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-foreground">{role.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {roleMembers.length} member{roleMembers.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                                {/* System / Service tag */}
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] ${cat === "system" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
                                >
                                  {cat === "system" ? "System" : "Service"}
                                </Badge>
                              </div>

                              <p className="text-xs text-muted-foreground">{role.description}</p>

                              {/* Members assigned to this role */}
                              {roleMembers.length > 0 && (
                                <div className="pt-1 space-y-1.5 border-t">
                                  {roleMembers.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-[9px] shrink-0">
                                          {getInitials(m.name)}
                                        </div>
                                        <span className="truncate text-foreground">{m.name}</span>
                                        <Badge className={`text-[9px] px-1 py-0 border-0 shrink-0 ${STATUS_CONFIG[m.status]?.className}`}>
                                          {STATUS_CONFIG[m.status]?.label}
                                        </Badge>
                                      </div>
                                      {/* For service roles: show service name + status */}
                                      {cat === "service" && m.service_name && (
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                          <Building2 className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-muted-foreground">{m.service_name}</span>
                                          {m.service_status && (
                                            <span className={`text-[9px] px-1 py-0.5 rounded-full ${SERVICE_STATUS_CONFIG[m.service_status] ?? ""}`}>
                                              {m.service_status}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* ── Invite Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* System / Service toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              {(["system", "service"] as RoleCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySwitch(cat)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    inviteCategory === cat
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat === "system" ? "System User" : "Service User"}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {inviteCategory === "system"
                ? "System Admins and Service Designers have org-wide access. An invitation email will be sent."
                : "Service users are linked to a specific service. An invitation email will be sent."}
            </p>

            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="Jane Smith" />
            </div>

            <div className="space-y-1.5">
              <Label>Email Address *</Label>
              <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="jane@example.com" />
            </div>

            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(inviteCategory === "system" ? SYSTEM_ROLES : SERVICE_ROLES).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div>
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inviteCategory === "service" && (
              <div className="space-y-1.5">
                <Label>Service *</Label>
                <Select value={inviteForm.service_id} onValueChange={(v) => setInviteForm({ ...inviteForm, service_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a service…" /></SelectTrigger>
                  <SelectContent>
                    {services.length === 0 && (
                      <SelectItem value="__none__" disabled>No services available</SelectItem>
                    )}
                    {services.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        <div className="flex items-center gap-2">
                          <span>{svc.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${SERVICE_STATUS_CONFIG[svc.status] ?? ""}`}>
                            {svc.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-2.5 text-[10px] text-muted-foreground">
              Inviting adds the user to Supabase Auth in <strong>invited</strong> state and sends them a sign-up link.
              Requires the backend to be running (<code>cd backend && npm run dev</code>).
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleInvite}
              disabled={
                saving ||
                !inviteForm.name.trim() ||
                !inviteForm.email.trim() ||
                (inviteCategory === "service" && !inviteForm.service_id)
              }
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersAndRoles;
