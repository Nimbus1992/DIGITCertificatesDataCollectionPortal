import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { StageDot } from "@/components/op/StageDot";

export const Route = createFileRoute("/_authenticated/inspections")({
  component: () => {
    const apps = useStore((s) => s.applications).filter((a) =>
      ["inspection_pending", "inspection_scheduled"].includes(a.currentStageId),
    );
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
        <Card className="p-0 overflow-hidden">
          {apps.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No inspections scheduled.</div>
          ) : (
            apps.map((a) => (
              <Link
                key={a.id}
                to="/inbox/$appId"
                params={{ appId: a.id }}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-surface-muted/60"
              >
                <div className="flex-1">
                  <div className="font-mono text-xs">{a.id}</div>
                  <div className="text-sm font-medium mt-0.5">{a.applicantName}</div>
                </div>
                <StageDot stage={a.currentStageId} />
              </Link>
            ))
          )}
        </Card>
      </div>
    );
  },
});
