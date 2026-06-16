import { useState, useEffect } from "react";
import { Plus, MapPin, AlertTriangle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding, type BoundaryHierarchy } from "@/contexts/OnboardingContext";
import { HierarchyCard } from "@/components/boundary/HierarchyCard";
import { DeactivationDialog } from "@/components/boundary/DeactivationDialog";
import { BoundarySetupWizard } from "@/components/boundary/BoundarySetupWizard";
import { SEED_HIERARCHY } from "@/data/boundaryData";
import { toast } from "@/hooks/use-toast";

export default function ApplicationAreas() {
  const { state, updateState, addBoundaryHierarchy, updateBoundaryHierarchy } = useOnboarding();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<BoundaryHierarchy | null>(null);

  const hierarchies = state.boundaryHierarchies || [];

  // Seed a demo hierarchy for Super Admin on first visit if none exist
  useEffect(() => {
    if (
      (state.currentUserRole === "super_admin" || state.currentUserRole === "admin") &&
      hierarchies.length === 0 &&
      state.isOnboardingComplete
    ) {
      addBoundaryHierarchy(SEED_HIERARCHY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMakeDefault(id: string) {
    hierarchies.forEach((h) => {
      if (h.isDefault && h.id !== id) updateBoundaryHierarchy(h.id, { isDefault: false });
    });
    updateBoundaryHierarchy(id, { isDefault: true });
    const name = hierarchies.find((h) => h.id === id)?.name;
    toast({ title: `"${name}" is now the default hierarchy` });
  }

  function handleToggleStatus(hierarchy: BoundaryHierarchy) {
    if (hierarchy.status === "active") {
      // deactivation — may need guard
      setDeactivateTarget(hierarchy);
    } else {
      updateBoundaryHierarchy(hierarchy.id, { status: "active" });
      toast({ title: `"${hierarchy.name}" activated` });
    }
  }

  function handleConfirmDeactivate() {
    if (!deactivateTarget) return;
    updateBoundaryHierarchy(deactivateTarget.id, { status: "inactive" });
    toast({ title: `"${deactivateTarget.name}" deactivated` });
    setDeactivateTarget(null);
  }

  const isSkipped = hierarchies.length === 0 && state.isBoundarySetupSkipped;
  const isEmpty = hierarchies.length === 0 && !state.isBoundarySetupSkipped;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Application Areas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure geographic and administrative boundary hierarchies. Services cannot go live until at least one active hierarchy is configured.
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add new hierarchy
        </Button>
      </header>

      {/* Deferred-state banner */}
      {isSkipped && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-5 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning">Boundary data not configured</p>
            <p className="text-sm text-warning/80 mt-1 leading-relaxed">
              You have not configured boundary data. Other onboarding steps can be completed, but no service can go live until boundaries are configured — either at the system level by you, or independently by each Service Owner when setting up their service.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-warning text-warning-foreground hover:bg-warning/90"
            onClick={() => {
              updateState({ isBoundarySetupSkipped: false });
              setWizardOpen(true);
            }}
          >
            Configure Boundaries
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">No boundary hierarchies yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Set up your first boundary hierarchy to define where services are available and how applications are geo-tagged.
            </p>
          </div>
          <Button onClick={() => setWizardOpen(true)} className="gap-2 mt-2">
            <Plus className="h-4 w-4" /> Set up first hierarchy
          </Button>
          <button
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={() => updateState({ isBoundarySetupSkipped: true })}
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Hierarchy grid */}
      {hierarchies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">
              Configured hierarchies
            </h2>
            <span className="text-xs text-muted-foreground ml-1">
              {hierarchies.filter((h) => h.status === "active").length} active · {hierarchies.filter((h) => h.status === "inactive").length} inactive
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hierarchies.map((h) => (
              <HierarchyCard
                key={h.id}
                hierarchy={h}
                onMakeDefault={() => handleMakeDefault(h.id)}
                onToggleStatus={() => handleToggleStatus(h)}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            The default hierarchy is used by all services that have not explicitly selected a different one. To change the default, click "Make default" on any active hierarchy.
          </p>
        </div>
      )}

      <BoundarySetupWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      <DeactivationDialog
        hierarchy={deactivateTarget}
        open={!!deactivateTarget}
        onOpenChange={(v) => !v && setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
