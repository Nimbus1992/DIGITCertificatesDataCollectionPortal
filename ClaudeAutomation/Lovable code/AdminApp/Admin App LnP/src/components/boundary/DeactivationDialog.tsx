import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { BoundaryHierarchy } from "@/contexts/OnboardingContext";

interface Props {
  hierarchy: BoundaryHierarchy | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function DeactivationDialog({ hierarchy, open, onOpenChange, onConfirm }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!hierarchy) return null;
  const hasServices = hierarchy.usedByServices.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) setAcknowledged(false); onOpenChange(v); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate "{hierarchy.name}"?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Inactive hierarchies cannot be selected by services. Any service pointing to a deactivated
                hierarchy must be reassigned before it can go live.
              </p>
              {hasServices && (
                <div className="space-y-2">
                  <p className="font-medium text-foreground text-sm">
                    The following {hierarchy.usedByServices.length === 1 ? "service is" : "services are"} currently using this hierarchy:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {hierarchy.usedByServices.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer mt-3">
                    <Checkbox
                      checked={acknowledged}
                      onCheckedChange={(v) => setAcknowledged(!!v)}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-foreground leading-snug">
                      I understand these services will lose boundary access until reassigned to a different hierarchy.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={hasServices && !acknowledged}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
