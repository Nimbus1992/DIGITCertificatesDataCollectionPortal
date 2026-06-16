import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Users, ShieldCheck, Briefcase, MailPlus, Settings2, Clock, Filter, CheckCircle2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  ROLES_SEED, USERS_SEED, DEFAULT_ROLE_PERMISSIONS, DEFAULT_SERVICES, STORAGE_KEY,
  ACTIVITY_LOG_STORAGE_KEY, ACTIVITY_LOG_SEED, relativeTime,
} from "@/data/usersAccess";
import type {
  AccessLevel, RoleDef, RolePermissions, ServiceStageAccess, UserRow, UserStatus,
  ActivityLogEntry, ActivityAction,
} from "@/data/usersAccess";
import { InviteUserSheet } from "@/components/users-access/InviteUserSheet";
import { RoleDetailSheet } from "@/components/users-access/RoleDetailSheet";
import { toast } from "@/hooks/use-toast";

type UserFilter = "all" | "system" | "service" | "invited";

interface PersistedState {
  users: UserRow[];
  rolePerms: RolePermissions;
  roleScopes: Record<string, string[]>;
  stageAccess: ServiceStageAccess;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    users: USERS_SEED,
    rolePerms: DEFAULT_ROLE_PERMISSIONS,
    roleScopes: {
      service_owner: ["Building Permit"],
      document_verifier: ["Trade License"],
      field_inspector: ["Building Permit", "Fire NOC"],
      approver: ["Trade License"],
      counter_operator: ["Trade License", "Building Permit", "Fire NOC"],
      viewer: ["Trade License"],
    },
    stageAccess: {
      approver: { "Trade License": ["Approval"] },
      field_inspector: { "Building Permit": ["Inspection"], "Fire NOC": ["Inspection"] },
      document_verifier: { "Trade License": ["Document Verification"] },
    },
  };
}

function loadActivityLog(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return ACTIVITY_LOG_SEED;
}

const avatarTone: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
};

function Avatar({ name, tone }: { name: string; tone: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0", avatarTone[tone] || avatarTone.primary)}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<UserStatus, { icon: React.ElementType; label: string; cls: string }> = {
    active: { icon: CheckCircle2, label: "Active", cls: "text-success" },
    invited: { icon: Clock, label: "Invited", cls: "text-warning" },
    disabled: { icon: Ban, label: "Disabled", cls: "text-muted-foreground" },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", s.cls)}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}

const ACTION_COLORS: Record<ActivityAction, string> = {
  "Invited": "bg-info/10 text-info",
  "Accepted invite": "bg-success/10 text-success",
  "Role changed": "bg-warning/10 text-warning",
  "Disabled": "bg-destructive/10 text-destructive",
  "Re-enabled": "bg-success/10 text-success",
  "Removed": "bg-destructive/10 text-destructive",
  "Resent invite": "bg-info/10 text-info",
  "Admin created": "bg-primary/10 text-primary",
  "Admin deleted": "bg-destructive/10 text-destructive",
};

function ActionBadge({ action }: { action: ActivityAction }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", ACTION_COLORS[action] || "bg-muted text-muted-foreground")}>
      {action}
    </span>
  );
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

const ALL_ACTIONS: ActivityAction[] = [
  "Invited", "Accepted invite", "Role changed", "Disabled", "Re-enabled",
  "Removed", "Resent invite", "Admin created", "Admin deleted",
];

export default function UsersAccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (["users", "roles", "activity"].includes(searchParams.get("tab") || "")) ? searchParams.get("tab")! : "users";
  const setTab = (v: string) => setSearchParams({ tab: v }, { replace: true });

  const { state: onboarding } = useOnboarding();
  const isSuperAdmin = onboarding.currentUserRole === "super_admin";

  const servicesFromCtx = useMemo(() => {
    const fromCtx = (onboarding.services || []).map((s) => s.name).filter(Boolean);
    return Array.from(new Set([...DEFAULT_SERVICES, ...fromCtx]));
  }, [onboarding.services]);

  const [state, setState] = useState<PersistedState>(() => loadState());
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => loadActivityLog());
  useEffect(() => { localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(activityLog)); }, [activityLog]);

  function appendActivity(entry: Omit<ActivityLogEntry, "id" | "timestamp">) {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: `al_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prev) => [newEntry, ...prev]);
  }

  const roles = ROLES_SEED;
  const rolesById = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), []);

  // Filter roles available to invite based on current user's role
  const invitableRoles = useMemo(() => {
    if (isSuperAdmin) return roles;
    // Non-super-admins cannot invite super_admin or system_admin (admin) roles
    return roles.filter((r) => r.id !== "super_admin" && r.id !== "system_admin");
  }, [roles, isSuperAdmin]);

  const total = state.users.length;
  const systemCount = state.users.filter((u) => rolesById[u.roleId]?.type === "system").length;
  const serviceCount = state.users.filter((u) => rolesById[u.roleId]?.type === "service").length;
  const invitedCount = state.users.filter((u) => u.status === "invited").length;

  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return state.users.filter((u) => {
      const role = rolesById[u.roleId];
      if (filter === "system" && role?.type !== "system") return false;
      if (filter === "service" && role?.type !== "service") return false;
      if (filter === "invited" && u.status !== "invited") return false;
      if (query) {
        const q = query.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !role?.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.users, filter, query, rolesById]);

  const filterPills: { id: UserFilter; label: string; count: number }[] = [
    { id: "all", label: "All Users", count: total },
    { id: "system", label: "System", count: systemCount },
    { id: "service", label: "Service", count: serviceCount },
    { id: "invited", label: "Invited", count: invitedCount },
  ];

  function addUsers(rows: UserRow[]) {
    setState((s) => ({ ...s, users: [...rows, ...s.users] }));
    rows.forEach((u) => {
      appendActivity({
        actor: onboarding.orgName || "You",
        actorEmail: onboarding.email || "",
        action: "Invited",
        affectedUser: u.name,
        affectedEmail: u.email,
        role: rolesById[u.roleId]?.name || u.roleId,
        service: u.services[0] !== "Platform" ? u.services[0] : null,
      });
    });
  }

  function setUserStatus(id: string, status: UserStatus) {
    const user = state.users.find((u) => u.id === id);
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
    if (user) {
      appendActivity({
        actor: onboarding.orgName || "You",
        actorEmail: onboarding.email || "",
        action: status === "disabled" ? "Disabled" : "Re-enabled",
        affectedUser: user.name,
        affectedEmail: user.email,
        role: rolesById[user.roleId]?.name || user.roleId,
        service: null,
      });
    }
  }

  function removeUser(id: string) {
    const user = state.users.find((u) => u.id === id);
    // Super Admin check: cannot remove another super_admin
    if (user?.roleId === "super_admin") {
      toast({ title: "Cannot remove Super Admin", description: "The Super Admin account cannot be removed.", variant: "destructive" });
      return;
    }
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));
    if (user) {
      appendActivity({
        actor: onboarding.orgName || "You",
        actorEmail: onboarding.email || "",
        action: "Removed",
        affectedUser: user.name,
        affectedEmail: user.email,
        role: rolesById[user.roleId]?.name || user.roleId,
        service: null,
      });
    }
    toast({ title: "User removed" });
  }

  function resendInvite(u: UserRow) {
    appendActivity({
      actor: onboarding.orgName || "You",
      actorEmail: onboarding.email || "",
      action: "Resent invite",
      affectedUser: u.name,
      affectedEmail: u.email,
      role: rolesById[u.roleId]?.name || u.roleId,
      service: null,
    });
    toast({ title: "Invite resent", description: u.email });
  }

  const [activeRole, setActiveRole] = useState<RoleDef | null>(null);

  function openRole(role: RoleDef) { setActiveRole(role); }
  function saveRole(roleId: string, next: { permissions: Record<string, AccessLevel>; scopedServices: string[]; stageAccess: Record<string, string[]> }) {
    setState((s) => ({
      ...s,
      rolePerms: { ...s.rolePerms, [roleId]: next.permissions },
      roleScopes: { ...s.roleScopes, [roleId]: next.scopedServices },
      stageAccess: { ...s.stageAccess, [roleId]: next.stageAccess },
    }));
  }

  function usersForRole(roleId: string) { return state.users.filter((u) => u.roleId === roleId).length; }

  const systemRoles = roles.filter((r) => r.type === "system");
  const serviceRoles = roles.filter((r) => r.type === "service");

  // Activity log filters
  const [activityQuery, setActivityQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filteredActivity = useMemo(() => {
    return activityLog.filter((entry) => {
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      if (activityQuery) {
        const q = activityQuery.toLowerCase();
        if (
          !entry.actor.toLowerCase().includes(q) &&
          !entry.affectedUser.toLowerCase().includes(q) &&
          !entry.affectedEmail.toLowerCase().includes(q) &&
          !entry.role.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [activityLog, actionFilter, activityQuery]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users & Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage people, roles, and service permissions across your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isSuperAdmin && (
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              Limited access — Admin invite only
            </Badge>
          )}
          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* USERS */}
        <TabsContent value="users" className="space-y-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard icon={Users} label="Total Users" value={total} hint="Across all services" />
            <MetricCard icon={ShieldCheck} label="System Users" value={systemCount} hint="Platform-level access" />
            <MetricCard icon={Briefcase} label="Service Users" value={serviceCount} hint="Scoped to services" />
            <MetricCard icon={MailPlus} label="Pending Invites" value={invitedCount} hint="Awaiting acceptance" />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-md border border-border bg-card p-0.5">
              {filterPills.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilter(p.id)}
                  aria-pressed={filter === p.id}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded transition-colors inline-flex items-center gap-1.5",
                    filter === p.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs font-normal">{p.count}</Badge>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or role"
                className="pl-8 w-[280px] h-9"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wide font-medium">User</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Role</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Service Scope</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Last Active</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                      No users match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((u) => {
                  const role = rolesById[u.roleId];
                  const visible = u.services.slice(0, 2);
                  const extra = u.services.length - visible.length;
                  const isProtected = u.roleId === "super_admin";
                  return (
                    <TableRow key={u.id} className="hover:bg-muted/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} tone={u.avatarColor} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">{u.name}</span>
                              {isProtected && <Badge variant="outline" className="text-xs font-normal shrink-0">Super Admin</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant={role?.type === "system" ? "secondary" : "outline"} className="font-normal">
                          {role?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {visible.map((s) => (
                            <Badge key={s} variant="outline" className="text-xs font-normal bg-muted/40">{s}</Badge>
                          ))}
                          {extra > 0 && <Badge variant="outline" className="text-xs font-normal">+{extra}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5"><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{relativeTime(u.lastActiveISO)}</TableCell>
                      <TableCell className="py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openRole(role!)} disabled={!role}>
                              <Settings2 className="h-4 w-4 mr-2" /> Edit role
                            </DropdownMenuItem>
                            {u.status === "invited" && (
                              <DropdownMenuItem onClick={() => resendInvite(u)}>
                                <MailPlus className="h-4 w-4 mr-2" /> Resend invite
                              </DropdownMenuItem>
                            )}
                            {u.status === "active" && !isProtected && (
                              <DropdownMenuItem onClick={() => setUserStatus(u.id, "disabled")}>
                                Disable user
                              </DropdownMenuItem>
                            )}
                            {u.status === "disabled" && (
                              <DropdownMenuItem onClick={() => setUserStatus(u.id, "active")}>
                                Re-enable user
                              </DropdownMenuItem>
                            )}
                            {!isProtected && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => removeUser(u.id)}
                                  disabled={u.roleId === "system_admin" && !isSuperAdmin}
                                >
                                  Remove
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
              <span>{filteredUsers.length} of {total}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </TabsContent>

        {/* ROLES */}
        <TabsContent value="roles" className="space-y-7 mt-5">
          {[
            { label: "System Roles", helper: "Platform-level roles that span the whole organization.", items: systemRoles },
            { label: "Service Roles", helper: "Operational roles scoped to one or more services.", items: serviceRoles },
          ].map((section) => (
            <section key={section.label} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    {section.label}
                    <Badge variant="secondary" className="text-xs font-normal">{section.items.length}</Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">{section.helper}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {section.items.map((r) => {
                  const count = usersForRole(r.id);
                  const scope = state.roleScopes[r.id] || [];
                  const isSuperAdminRole = r.id === "super_admin";
                  return (
                    <div key={r.id} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-foreground/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm font-semibold">{r.name}</div>
                            {isSuperAdminRole && (
                              <Badge variant="outline" className="text-xs font-normal shrink-0">1 per org</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                        </div>
                        <Badge variant={r.type === "system" ? "secondary" : "default"} className="text-xs uppercase tracking-wide shrink-0">
                          {r.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap min-h-[20px]">
                        <span className="font-medium text-foreground">{count}</span> {count === 1 ? "user" : "users"}
                        {r.type === "service" && scope.length > 0 && (
                          <>
                            <span className="text-border">·</span>
                            <span className="truncate">{scope.slice(0, 2).join(", ")}{scope.length > 2 ? ` +${scope.length - 2}` : ""}</span>
                          </>
                        )}
                        {r.type === "system" && <><span className="text-border">·</span><span>Platform-wide</span></>}
                      </div>
                      <div className="flex items-center gap-1 pt-1 border-t border-border -mx-4 px-4 -mb-1">
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => openRole(r)}>
                          Manage permissions
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-8 ml-auto" onClick={() => { setFilter("all"); setQuery(r.name); setTab("users"); }}>
                          View users
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </TabsContent>

        {/* ACTIVITY LOG */}
        <TabsContent value="activity" className="space-y-5 mt-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2.5 border border-border">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            This log is immutable and read-only. All user and role actions are recorded here and cannot be deleted.
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={activityQuery}
                onChange={(e) => setActivityQuery(e.target.value)}
                placeholder="Search by actor, user, or role"
                className="pl-8 h-9"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-9 w-[180px] text-xs">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ALL_ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Timestamp</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Actor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Action</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Affected User</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Role</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide font-medium">Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivity.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                      No activity log entries match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredActivity.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/40">
                    <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="text-sm font-medium">{entry.actor}</div>
                      <div className="text-xs text-muted-foreground">{entry.actorEmail}</div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <ActionBadge action={entry.action} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="text-sm">{entry.affectedUser}</div>
                      <div className="text-xs text-muted-foreground">{entry.affectedEmail}</div>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm">{entry.role}</TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      {entry.service || <span className="text-muted-foreground/50">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
              <span>{filteredActivity.length} of {activityLog.length} entries</span>
              <span>Read-only</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <InviteUserSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={invitableRoles}
        services={servicesFromCtx}
        onInvite={addUsers}
      />

      <RoleDetailSheet
        open={!!activeRole}
        onOpenChange={(v) => !v && setActiveRole(null)}
        role={activeRole}
        userCount={activeRole ? usersForRole(activeRole.id) : 0}
        services={servicesFromCtx}
        permissions={activeRole ? state.rolePerms[activeRole.id] || {} : {}}
        scopedServices={activeRole ? state.roleScopes[activeRole.id] || [] : []}
        stageAccess={activeRole ? state.stageAccess[activeRole.id] || {} : {}}
        onSave={(next) => activeRole && saveRole(activeRole.id, next)}
      />
    </div>
  );
}
