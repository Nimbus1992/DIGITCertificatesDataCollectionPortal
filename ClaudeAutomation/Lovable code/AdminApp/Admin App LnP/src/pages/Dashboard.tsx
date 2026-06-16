import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, ServiceItem } from "@/contexts/OnboardingContext";
import { ServiceOwnerSetup } from "@/components/onboarding/ServiceOwnerSetup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings,
  Eye,
  Rocket,
  ArrowRight,
  LayoutTemplate,
  Building2,
  PenLine,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string; stripe: string }> = {
  draft: {
    label: "Draft",
    className: "bg-warning/15 text-warning border-warning/30",
    stripe: "bg-warning",
  },
  published: {
    label: "Published",
    className: "bg-info/10 text-info border-info/30",
    stripe: "bg-info",
  },
  live: {
    label: "Live",
    className: "bg-success/10 text-success border-success/30 shadow-[0_0_12px_-2px_hsl(var(--accent)/0.4)]",
    stripe: "bg-success",
  },
  assigned: {
    label: "Assigned",
    className: "bg-info/10 text-info border-info/30",
    stripe: "bg-info",
  },
};

interface ServiceCardProps {
  service: ServiceItem;
  onConfigure: () => void;
  onGoLive: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetup?: () => void;
  isServiceOwner?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onConfigure,
  onGoLive,
  onView,
  onEdit,
  onDelete,
  onSetup,
  isServiceOwner,
}) => {
  const cfg = statusConfig[service.status] || statusConfig.draft;
  const isAssigned = service.status === "assigned";

  return (
    <Card className="relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-accent/40 transition-all group">
      <div className={cn("absolute top-0 left-0 right-0 h-1", cfg.stripe)} />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-primary/15 border border-accent/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-base">{service.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {service.customModules.length > 0
                ? `${service.customModules.length} flow${service.customModules.length > 1 ? "s" : ""}`
                : "From template"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={cfg.className}>
            {service.isLive && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                <span className="sr-only">Live</span>
              </>
            )}
            {cfg.label}
          </Badge>
          {!isServiceOwner && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Delete ${service.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Owner chips for assigned services */}
        {isAssigned && service.assignedOwners && service.assignedOwners.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.assignedOwners.map((o) => (
              <span
                key={o.email}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20"
              >
                <Users className="h-3 w-3" /> {o.name}
              </span>
            ))}
          </div>
        )}

        {/* Module chips */}
        {!isAssigned && service.customModules.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {service.customModules.slice(0, 3).map((m) => (
              <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {m}
              </span>
            ))}
            {service.customModules.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                +{service.customModules.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {isAssigned ? (
            isServiceOwner ? (
              <Button
                size="sm"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={onSetup}
              >
                Set up <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1" disabled>
                Awaiting setup
              </Button>
            )
          ) : service.isLive ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
                <Eye className="h-3.5 w-3.5 mr-1" /> View
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                <Settings className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onConfigure}>
                <Settings className="h-3.5 w-3.5 mr-1" /> Configure
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={onGoLive}
              >
                <Rocket className="h-3.5 w-3.5 mr-1" /> Go Live
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { state, setActiveService, deleteService } = useOnboarding();
  const navigate = useNavigate();
  const currentRole = state.currentUserRole || "super_admin";
  const isServiceOwner = currentRole === "service_owner";

  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Split services into "mine" and "assigned to others"
  const myServices = useMemo(
    () => state.services.filter((s) => !s.assignedOwners || s.assignedOwners.length === 0),
    [state.services],
  );
  const assignedServices = useMemo(
    () => state.services.filter((s) => s.assignedOwners && s.assignedOwners.length > 0),
    [state.services],
  );

  // Service owner sees only assigned services (demo: show all assigned ones)
  const ownerAssignedServices = useMemo(
    () => state.services.filter((s) => s.status === "assigned"),
    [state.services],
  );
  const ownerOwnServices = useMemo(
    () => state.services.filter((s) => s.status !== "assigned"),
    [state.services],
  );

  // Metrics (super_admin / admin)
  const metrics = useMemo(() => ({
    total: state.services.length,
    drafts: myServices.filter((s) => s.status === "draft").length,
    live: myServices.filter((s) => s.isLive).length,
    assigned: assignedServices.length,
  }), [state.services, myServices, assignedServices]);

  const handleAction = (service: ServiceItem) => {
    setActiveService(service.id);
  };

  const handleConfigure = (s: ServiceItem) => { handleAction(s); navigate(`/service/${s.id}/configure`); };
  const handleGoLive = (s: ServiceItem) => { handleAction(s); navigate("/go-live"); };
  const handleView = (s: ServiceItem) => { handleAction(s); navigate(`/service/${s.id}/manage`); };
  const handleEdit = (s: ServiceItem) => { handleAction(s); navigate(`/service/${s.id}/configure`); };
  const handleSetup = (s: ServiceItem) => {
    navigate(`/templates/${s.templateId}/setup`);
  };

  const serviceOwnerFirstService = isServiceOwner && ownerOwnServices.length > 0 ? ownerOwnServices[0] : null;

  const metricCards = [
    { label: "Total Services", value: metrics.total, icon: Building2, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Drafts", value: metrics.drafts, icon: PenLine, iconBg: "bg-warning/15", iconColor: "text-warning" },
    { label: "Live", value: metrics.live, icon: Rocket, iconBg: "bg-success/10", iconColor: "text-success", pulse: metrics.live > 0 },
    { label: "Assigned", value: metrics.assigned, icon: UserPlus, iconBg: "bg-info/10", iconColor: "text-info" },
  ];

  return (
    <div
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.08) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground tracking-tight max-w-2xl">
            {isServiceOwner ? "Your Services" : "Configure and Launch Licenses and Permits"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            {isServiceOwner
              ? "Configure and manage the services you own."
              : "Configure Licenses and Permits applications to manage end-to-end delivery of service to the citizen."}
          </p>
        </div>

        {/* Service Owner guided setup */}
        {isServiceOwner && serviceOwnerFirstService && (() => {
          const progress = state.serviceOwnerSetupProgress?.[serviceOwnerFirstService.id] || [];
          return progress.length < 4 ? (
            <ServiceOwnerSetup
              serviceId={serviceOwnerFirstService.id}
              serviceName={serviceOwnerFirstService.name}
              templateId={serviceOwnerFirstService.templateId}
            />
          ) : null;
        })()}

        {/* Metrics row (non-service-owner only) */}
        {!isServiceOwner && state.services.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metricCards.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.label} className="hover:-translate-y-0.5 transition-all hover:shadow-md hover:border-accent/30">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", m.iconBg)}>
                      <Icon className={cn("h-5 w-5", m.iconColor)} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-2xl font-bold text-foreground leading-none">{m.value}</p>
                        {"pulse" in m && m.pulse && (
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {state.services.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/5 p-8 md:p-10">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent mb-2">
                  Get Started
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  Set up your first application
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  Choose from a ready-made template to launch in minutes.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/services")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 gap-2 self-start md:self-auto"
              >
                <LayoutTemplate className="h-4 w-4" /> Choose Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== SUPER ADMIN / ADMIN VIEW ===== */}
        {!isServiceOwner && state.services.length > 0 && (
          <div className="space-y-10">
            {/* My Services */}
            {myServices.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold text-foreground">My Services</h2>
                    <Badge variant="secondary" className="rounded-full">{myServices.length}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/services")}>
                    <LayoutTemplate className="h-3.5 w-3.5" /> Add Service
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      onConfigure={() => handleConfigure(s)}
                      onGoLive={() => handleGoLive(s)}
                      onView={() => handleView(s)}
                      onEdit={() => handleEdit(s)}
                      onDelete={() => { setConfirmText(""); setPendingDelete(s); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Assigned to teammates */}
            {assignedServices.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Assigned</h2>
                  <Badge variant="secondary" className="rounded-full">{assignedServices.length}</Badge>
                  <span className="text-xs text-muted-foreground">— waiting for owners to set up</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assignedServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      onConfigure={() => handleConfigure(s)}
                      onGoLive={() => handleGoLive(s)}
                      onView={() => handleView(s)}
                      onEdit={() => handleEdit(s)}
                      onDelete={() => { setConfirmText(""); setPendingDelete(s); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty my-services with add prompt */}
            {myServices.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">You haven't created any services yet.</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/services")}>
                  <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" /> Browse templates
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== SERVICE OWNER VIEW ===== */}
        {isServiceOwner && state.services.length > 0 && (
          <div className="space-y-10">
            {/* Assigned to you */}
            {ownerAssignedServices.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Assigned to you</h2>
                  <Badge variant="secondary" className="rounded-full">{ownerAssignedServices.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ownerAssignedServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      isServiceOwner
                      onConfigure={() => handleConfigure(s)}
                      onGoLive={() => handleGoLive(s)}
                      onView={() => handleView(s)}
                      onEdit={() => handleEdit(s)}
                      onDelete={() => {}}
                      onSetup={() => handleSetup(s)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Own services */}
            {ownerOwnServices.length > 0 && (
              <section>
                <div className="flex items-center gap-2.5 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">My Services</h2>
                  <Badge variant="secondary" className="rounded-full">{ownerOwnServices.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ownerOwnServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      isServiceOwner
                      onConfigure={() => handleConfigure(s)}
                      onGoLive={() => handleGoLive(s)}
                      onView={() => handleView(s)}
                      onEdit={() => handleEdit(s)}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the service and its configuration (forms, workflow, fees, documents).
              {pendingDelete?.isLive && " Live services will go offline immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingDelete?.isLive && (
            <div className="space-y-2">
              <Label htmlFor="confirm-name" className="text-xs">
                Type <span className="font-mono font-semibold">{pendingDelete.name}</span> to confirm
              </Label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={pendingDelete.name}
                autoFocus
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pendingDelete?.isLive ? confirmText !== pendingDelete.name : false}
              onClick={() => {
                if (!pendingDelete) return;
                const name = pendingDelete.name;
                deleteService(pendingDelete.id);
                setPendingDelete(null);
                setConfirmText("");
                toast.success(`"${name}" deleted`);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
