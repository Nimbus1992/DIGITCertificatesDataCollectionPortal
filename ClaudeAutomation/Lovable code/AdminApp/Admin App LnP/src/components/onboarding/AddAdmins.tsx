import { useState } from "react";
import { ArrowRight, X, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useOnboarding, type InvitedAdmin } from "@/contexts/OnboardingContext";
import AuthShell from "./AuthShell";

interface Props {
  onComplete: (admins: InvitedAdmin[]) => void;
  onSkip: () => void;
}

export default function AddAdmins({ onComplete, onSkip }: Props) {
  const { state } = useOnboarding();
  const [emailInput, setEmailInput] = useState("");
  const [admins, setAdmins] = useState<InvitedAdmin[]>([]);

  function pushEmail() {
    const v = emailInput.trim().replace(/,$/, "");
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast({ title: "Invalid email", description: v, variant: "destructive" });
      return;
    }
    if (admins.some((a) => a.email === v)) {
      setEmailInput("");
      return;
    }
    setAdmins((prev) => [...prev, { id: `adm_${Date.now()}`, email: v, status: "invited" }]);
    setEmailInput("");
  }

  function removeAdmin(id: string) {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  }

  function handleContinue() {
    onComplete(admins);
  }

  return (
    <AuthShell step="Step 4 of 6 · Admin team">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Build your admin team</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invite additional admins to help manage {state.orgName || "your organisation"}.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 border border-border">
          <strong className="text-foreground">Note:</strong> As Super Admin, you are the only person who can create or delete Admin accounts. Admins you invite here will have full platform access except the ability to manage Admin users.
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground uppercase tracking-wide">Admin email addresses</label>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-10 items-center">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); pushEmail(); } }}
                  placeholder="admin@organisation.gov"
                  className="flex-1 min-w-[180px] bg-transparent text-sm outline-none px-1"
                />
              </div>
              <Button type="button" variant="outline" onClick={pushEmail} className="shrink-0 h-10">
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add. Each admin will receive an email invite.</p>
          </div>

          {admins.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Invited ({admins.length})
              </div>
              <div className="space-y-1.5">
                {admins.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {a.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm truncate">{a.email}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px] font-normal">Admin</Badge>
                      <button onClick={() => removeAdmin(a.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-3 border-t border-border bg-muted/30">
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
            Skip for now
          </Button>
          <Button onClick={handleContinue} className="gap-2 h-10 px-5">
            {admins.length > 0 ? `Continue with ${admins.length} admin${admins.length > 1 ? "s" : ""}` : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </AuthShell>
  );
}
