import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePreview, type PreviewRole } from "./PreviewContext";
import { User, Bell, Briefcase, RotateCcw, MessageSquare } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";
import MessagesDrawer from "./MessagesDrawer";
import { useServiceRoles, permissionLabel, canonicalRoleId, isCitizenRole } from "@/lib/useServiceRoles";

// Map a service-role id to a PreviewRole for screen-routing only.
// Behaviour (queues, action buttons) is driven by activeRoleId, not by persona.
const personaFor = (canonicalId: string): PreviewRole => {
  if (canonicalId === "citizen" || canonicalId === "applicant") return "citizen";
  if (canonicalId === "document_verifier") return "documentVerifier";
  if (canonicalId === "field_inspector") return "fieldInspector";
  return "approver"; // any other employee role uses the generic employee layout
};

const PreviewSidebar: React.FC = () => {
  const { id: serviceId = "service" } = useParams();
  const [serviceRoles] = useServiceRoles(serviceId);
  const {
    activeRoleId, setRole,
    unreadCount, markNotificationsRead,
    unreadMessagesCount, markMessagesRead,
    messagesDrawerOpen, setMessagesDrawerOpen,
    resetDemo, role,
    workflowTransitions,
  } = usePreview();
  const [notifOpen, setNotifOpen] = useState(false);

  // Split roles into Citizen vs Employee buckets by permission.
  const { citizenRoles, employeeRoles } = useMemo(() => {
    const citizenRoles = serviceRoles.filter(isCitizenRole);
    const employeeRoles = serviceRoles.filter((r) => !isCitizenRole(r));
    return { citizenRoles, employeeRoles };
  }, [serviceRoles]);

  // Count transitions assigned to a role so the user sees workflow coverage.
  const transitionCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    workflowTransitions.forEach((t) => {
      const cid = canonicalRoleId(t.roleId || "");
      counts[cid] = (counts[cid] ?? 0) + 1;
    });
    return counts;
  }, [workflowTransitions]);

  const openNotifications = () => {
    setNotifOpen(true);
    markNotificationsRead();
  };

  const openMessages = () => {
    setMessagesDrawerOpen(true);
    markMessagesRead();
  };

  const RoleCard: React.FC<{ r: typeof serviceRoles[number]; persona: PreviewRole; Icon: React.ElementType }> = ({ r, persona, Icon }) => {
    const isActive = activeRoleId === r.id;
    const txCount = transitionCountByRole[canonicalRoleId(r.id)] ?? 0;
    return (
      <button
        onClick={() => setRole(persona, r.id)}
        aria-pressed={isActive}
        className={`w-full text-left rounded-xl border-2 p-3 transition-all ${
          isActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-accent shrink-0" />
          <span className="font-semibold text-foreground text-sm truncate">{r.name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {r.permissions.slice(0, 3).map((p) => (
            <Badge key={p} variant="outline" className="text-[10px] px-2 py-0.5 bg-accent/5 text-accent border-accent/20">
              {permissionLabel(p)}
            </Badge>
          ))}
        </div>
        {persona !== "citizen" && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            {txCount === 0
              ? "No workflow actions assigned"
              : `${txCount} workflow action${txCount > 1 ? "s" : ""}`}
          </p>
        )}
      </button>
    );
  };

  return (
    <div className="w-[280px] border-l bg-card flex flex-col h-full min-h-0">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-foreground">Roles</h3>
        <div className="flex items-center gap-1">
          {role === "citizen" && (
            <button
              onClick={openMessages}
              className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Messages"
              title="SMS & Email"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={openNotifications}
            className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 space-y-5 overflow-y-auto">
        <section>
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
            <User className="h-3 w-3" /> Citizen
          </p>
          <div className="space-y-2">
            {citizenRoles.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No citizen roles configured.</p>
            )}
            {citizenRoles.map((r) => (
              <RoleCard key={r.id} r={r} persona="citizen" Icon={User} />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" /> Employee
          </p>
          <div className="space-y-2">
            {employeeRoles.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No employee roles configured.</p>
            )}
            {employeeRoles.map((r) => (
              <RoleCard key={r.id} r={r} persona={personaFor(canonicalRoleId(r.id))} Icon={Briefcase} />
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t shrink-0 space-y-2">
        <Button onClick={resetDemo} variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <RotateCcw className="h-4 w-4" /> Reset Demo
        </Button>
      </div>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
      <MessagesDrawer
        open={messagesDrawerOpen}
        onOpenChange={(o) => {
          setMessagesDrawerOpen(o);
          if (o) markMessagesRead();
        }}
      />
    </div>
  );
};

export default PreviewSidebar;
