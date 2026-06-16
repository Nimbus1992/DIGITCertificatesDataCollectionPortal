import React, { useState } from "react";
import { Download, FileText, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Panel, Chip } from "../shared/primitives";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  description: string;
  category: "Monitor" | "Finance" | "Compliance" | "Lifecycle";
  rows: number;
  lastRun: string;
}

const REPORTS: Report[] = [
  { id: "daily-apps", name: "Daily Applications", description: "Application volume, channels and status breakdown.", category: "Monitor", rows: 1240, lastRun: "Today, 06:00" },
  { id: "revenue-summary", name: "Revenue Summary", description: "Collections, refunds and outstanding by category.", category: "Finance", rows: 312, lastRun: "Today, 06:00" },
  { id: "sla-compliance", name: "SLA Compliance", description: "Stage-wise SLA breaches and escalation log.", category: "Compliance", rows: 184, lastRun: "Yesterday, 18:00" },
  { id: "renewal-status", name: "Renewal Status", description: "Eligible, notified, completed and expired renewals.", category: "Lifecycle", rows: 762, lastRun: "Today, 06:00" },
  { id: "pending-cases", name: "Pending Cases", description: "All pending applications grouped by stage and assignee.", category: "Monitor", rows: 480, lastRun: "1 hour ago" },
  { id: "rejected-applications", name: "Rejected Applications", description: "Reason codes and stage at which rejection occurred.", category: "Compliance", rows: 96, lastRun: "Today, 06:00" },
];

export const ReportsView: React.FC = () => {
  const [busy, setBusy] = useState<string | null>(null);

  const run = (r: Report, fmt: "csv" | "pdf") => {
    setBusy(r.id);
    setTimeout(() => {
      setBusy(null);
      toast.success(`${r.name} exported as ${fmt.toUpperCase()}`);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <Section title="Reports & Exports" description="Prebuilt operational reports for governance, compliance and finance teams.">
        <Panel title="Prebuilt Reports" padded={false}>
          <div className="divide-y">
            {REPORTS.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground">{r.name}</h4>
                    <Chip tone="neutral">{r.category}</Chip>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="tabular-nums">{r.rows.toLocaleString()} rows</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.lastRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    disabled={busy === r.id}
                    onClick={() => run(r, "csv")}
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    disabled={busy === r.id}
                    onClick={() => run(r, "pdf")}
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Scheduled Reports" subtitle="Automated delivery to stakeholders (coming soon)">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Schedule daily, weekly or monthly delivery via email or secure download. Configure recipients and formats per report.
            <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" disabled>
              Configure schedule
            </Button>
          </div>
        </Panel>
      </Section>
    </div>
  );
};
