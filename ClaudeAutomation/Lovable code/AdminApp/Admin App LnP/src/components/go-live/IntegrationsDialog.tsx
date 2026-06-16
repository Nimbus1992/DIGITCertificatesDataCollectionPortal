import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, MessageSquare, Mail } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SECTIONS = [
  { icon: CreditCard, label: "Payment Gateway", provider: "Slice" },
  { icon: MessageSquare, label: "SMS Provider", provider: "Amazon Web Applications" },
  { icon: Mail, label: "Email Provider", provider: "Amazon Web Applications" },
];

const IntegrationsDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Integrations</DialogTitle>
          <DialogDescription>Default providers configured for your application.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {SECTIONS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {s.label}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{s.provider}</p>
                </div>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">
                  Default
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground italic mt-2">
          Contact your account admin to add more integrations.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationsDialog;
