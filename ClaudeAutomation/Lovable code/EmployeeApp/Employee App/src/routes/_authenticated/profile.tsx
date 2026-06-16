import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession, logout } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/users";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: () => {
    const session = useSession()!;
    const navigate = useNavigate();
    return (
      <div className="space-y-5 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Card className="p-5 space-y-3">
          <Row label="Name" value={session.name} />
          <Row label="Email" value={session.email} />
          <Row label="Role" value={ROLE_LABELS[session.roleId]} />
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="size-4 mr-2" /> Sign out
            </Button>
          </div>
        </Card>
      </div>
    );
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
