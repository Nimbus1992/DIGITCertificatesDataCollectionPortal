import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "@/contexts/OnboardingContext";
import type { ServiceTemplate } from "@/data/serviceTemplates";

interface OwnerRow {
  name: string;
  email: string;
}

interface Props {
  template: ServiceTemplate;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const emptyRow = (): OwnerRow => ({ name: "", email: "" });

export const AssignTemplateSheet: React.FC<Props> = ({ template, open, onOpenChange }) => {
  const { addService } = useOnboarding();
  const [owners, setOwners] = useState<OwnerRow[]>([emptyRow()]);
  const Icon = template.icon;

  const updateOwner = (index: number, field: keyof OwnerRow, value: string) => {
    setOwners((prev) => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  };

  const addRow = () => {
    if (owners.length < 5) setOwners((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (index: number) => {
    setOwners((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const valid = owners.filter((o) => o.name.trim() && o.email.trim());
    if (valid.length === 0) {
      toast.error("Add at least one owner with a name and email.");
      return;
    }

    addService({
      id: crypto.randomUUID(),
      name: template.name,
      templateId: template.id,
      status: "assigned",
      customModules: template.modules,
      isPublished: false,
      isLive: false,
      assignedOwners: valid,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
    });

    const names = valid.map((o) => o.name).join(", ");
    toast.success(`Assigned to ${names}`);
    setOwners([emptyRow()]);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <SheetTitle className="text-base">{template.name}</SheetTitle>
          </div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">Assign to a teammate</span>
          </div>
          <SheetDescription className="text-xs mt-1">
            This teammate will be the service owner. They'll set up and manage this service independently.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {owners.map((owner, i) => (
            <div key={i} className="space-y-2 p-4 rounded-lg border border-border bg-muted/20 relative">
              {owners.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="absolute top-3 right-3 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Owner {owners.length > 1 ? i + 1 : ""}
              </p>
              <div className="space-y-1">
                <Label htmlFor={`name-${i}`} className="text-xs">Name</Label>
                <Input
                  id={`name-${i}`}
                  placeholder="Full name"
                  value={owner.name}
                  onChange={(e) => updateOwner(i, "name", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`email-${i}`} className="text-xs">Email</Label>
                <Input
                  id={`email-${i}`}
                  type="email"
                  placeholder="name@organisation.gov"
                  value={owner.email}
                  onChange={(e) => updateOwner(i, "email", e.target.value)}
                />
              </div>
            </div>
          ))}

          {owners.length < 5 && (
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add another owner
            </button>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
            Assign &amp; notify
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
