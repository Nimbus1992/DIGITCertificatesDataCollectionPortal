import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { usePreview, type WorkflowTransitionConfig } from "../PreviewContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transition: WorkflowTransitionConfig | null;
  applicationId: string;
}

const ChecklistDialog: React.FC<Props> = ({ open, onOpenChange, transition, applicationId }) => {
  const { applications, transitionApplication } = usePreview();
  const app = applications.find((a) => a.id === applicationId);

  // Pull configured checklist items off the transition (resolved live in
  // PreviewContext from the ChecklistBuilder store).
  const sourceItems = transition?.checklist ?? [];

  // Local ephemeral check state — items are reset every time the dialog opens
  // for a new transition. Avoids stale ticks across multiple actions.
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (open) setChecked({});
  }, [open, transition?.id]);

  const items = useMemo(
    () => sourceItems.map((c) => ({ ...c, checked: !!checked[c.id] })),
    [sourceItems, checked],
  );

  if (!transition || !app) return null;

  const done = items.filter((i) => i.checked).length;
  const total = items.length;
  const allDone = total === 0 || done === total;
  const progress = total === 0 ? 100 : (done / total) * 100;

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  const handleConfirm = () => {
    transitionApplication(app.id, transition.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent" /> {transition.name}
          </DialogTitle>
          <DialogDescription>
            Confirm each item before submitting this action.
          </DialogDescription>
        </DialogHeader>

        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-semibold ${allDone ? "text-emerald-600" : "text-amber-600"}`}>
                {done}/{total}
              </span>
            </div>
            <Progress
              value={progress}
              className={`h-1.5 ${allDone ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"}`}
            />
          </div>
        )}

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklist items — click Confirm to proceed.</p>
          ) : (
            items.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 cursor-pointer rounded-lg p-3 border transition-colors ${
                  item.checked ? "bg-emerald-50 border-emerald-200" : "bg-muted/40 border-border/50 hover:bg-muted/70"
                }`}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggle(item.id)}
                  className={item.checked ? "border-emerald-600 data-[state=checked]:bg-emerald-600" : ""}
                />
                <span className={`text-sm ${item.checked ? "text-emerald-800 line-through" : "text-foreground"}`}>
                  {item.text}
                </span>
                {item.checked && <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto" />}
              </label>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!allDone}
            className="bg-gradient-to-r from-accent to-teal-600 text-accent-foreground shadow-md shadow-accent/20"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistDialog;
