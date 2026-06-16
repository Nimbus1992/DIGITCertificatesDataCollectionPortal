import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { StageDot } from "@/components/op/StageDot";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/search")({
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const apps = useStore((s) => s.applications);
  const filtered = apps.filter((a) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (
      a.id.toLowerCase().includes(t) ||
      a.applicantName.toLowerCase().includes(t) ||
      a.phone.includes(t) ||
      a.serviceLabel.toLowerCase().includes(t)
    );
  });
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Search applications</h1>
      <Card className="p-3 flex items-center gap-2">
        <Search className="size-4 text-muted-foreground ml-2" />
        <Input
          placeholder="Search by ARN, applicant, phone or service…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-0 focus-visible:ring-0 shadow-none"
        />
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 text-sm font-semibold bg-surface-muted border-b">
          <div>Application</div>
          <div>Applicant</div>
          <div>Service</div>
          <div>Status</div>
          <div>Updated</div>
        </div>
        {filtered.map((a) => (
          <Link
            key={a.id}
            to="/inbox/$appId"
            params={{ appId: a.id }}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center border-b last:border-0 hover:bg-surface-muted/60"
          >
            <div className="font-mono text-xs">{a.id}</div>
            <div className="text-sm">{a.applicantName}</div>
            <div className="text-sm">{a.serviceLabel}</div>
            <div><StageDot stage={a.currentStageId} /></div>
            <div className="text-sm text-muted-foreground">
              {new Date(a.updatedAt).toLocaleDateString("en-GB")}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">No matches.</div>
        )}
      </Card>
    </div>
  );
}
