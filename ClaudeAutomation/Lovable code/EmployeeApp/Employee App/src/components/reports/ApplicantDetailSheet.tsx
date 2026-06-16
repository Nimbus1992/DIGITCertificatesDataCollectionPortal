import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { AppRecord } from "@/lib/reportsMock";
import { STAGE_EMPLOYEE, STAGE_TONE, fmtZAR } from "@/lib/reportsMock";
import { Mail, Phone, MapPin, Briefcase, CalendarClock, ShieldAlert } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

const toneClasses: Record<string, string> = {
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  primary: "bg-primary/10 text-primary",
  success: "bg-success-soft text-success",
};

export function ApplicantDetailSheet({
  app, onClose,
}: { app: AppRecord | null; onClose: () => void }) {
  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {app && (
          <>
            <SheetHeader>
              <SheetTitle className="text-base">
                {app.id}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-2 space-y-6">
              <Section title="Application">
                <Row label="App #" value={<span className="font-mono text-xs">{app.id}</span>} />
                <Row label="Service" value="Business License" />
                <Row label="Status" value={
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${toneClasses[STAGE_TONE[app.stage]]}`}>
                    {app.status}
                  </span>
                } />
                <Row label="Channel" value={app.channel} />
              </Section>

              <Separator />
              <Section title="Applicant Details">
                <Row label="Full Name" value={app.applicant} />
                <Row label="Mobile Number" value={app.contact.phone} />
                <Row label="ID Type" value={app.idType} />
                <Row label="ID Number" value={<span className="font-mono text-xs">{app.idNumber}</span>} />
              </Section>

              <Separator />
              <Section title="Business Details">
                <Row label="Business Name" value={app.business.name} />
                <Row label="Business Category" value={app.business.category} />
                <Row label="Ownership Type" value={app.business.ownership} />
              </Section>

              <Separator />
              <Section title="Business Location">
                <Row label="Address Line 1" value={app.location.line1} />
                <Row label="City" value="Cape Town" />
                <Row label="Zone / Ward" value={`${app.location.zoneId.replace(/_/g, " ")} · ${app.location.ward}`} />
                <Row label="Postcode" value={app.location.postcode} />
              </Section>

              <Separator />
              <Section title="Operational Details">
                <Row label="Business Start Date" value={app.business.startDate} />
                <Row label="Shop Area (sq ft)" value={app.business.shopAreaSqFt} />
                <Row label="Is Hazardous?" value={
                  <span className="inline-flex items-center gap-1">
                    {app.business.hazardous && <ShieldAlert className="h-3.5 w-3.5 text-warning" />}
                    {app.business.hazardous ? "Yes" : "No"}
                  </span>
                } />
              </Section>

              <Separator />
              <Section title="Workflow">
                <Row label="Current Stage" value={
                  <Badge className={toneClasses[STAGE_TONE[app.stage]]} variant="secondary">{app.stage}</Badge>
                } />
                <Row label="Assigned To" value={(() => {
                  const emp = STAGE_EMPLOYEE[app.stage];
                  return (
                    <span className="inline-flex items-center gap-2">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{emp.name.split(" ").map(p => p[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                      {emp.name} · <span className="text-muted-foreground">{emp.role}</span>
                    </span>
                  );
                })()} />
                <Row label="Submitted" value={new Date(app.submittedAt).toLocaleString()} />
                <Row label="Age" value={`${app.ageDays} days`} />
                <Row label="Fee" value={fmtZAR(app.feeZAR, false)} />
              </Section>

              <Separator />
              <Section title="Workflow Timeline">
                <ol className="relative border-l-2 border-border ml-2 space-y-3 pl-4">
                  {app.history.map((h, i) => {
                    const isCurrent = i === app.history.length - 1;
                    return (
                      <li key={i} className="relative">
                        <span className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full ring-4 ring-background ${
                          isCurrent ? "bg-primary" : "bg-muted-foreground/40"
                        }`} />
                        <div className="text-sm font-semibold">{h.stage}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(h.at).toLocaleString()} · {h.actor} · {h.role}
                        </div>
                        {h.note && <div className="text-xs mt-0.5">{h.note}</div>}
                        {isCurrent && <Badge variant="secondary" className="mt-1">Current</Badge>}
                      </li>
                    );
                  })}
                </ol>
              </Section>

              {app.inspection && (
                <>
                  <Separator />
                  <Section title="Field Inspection">
                    <Row label="Inspector" value={
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {app.inspection.inspector ?? "Unassigned"}
                      </span>
                    } />
                    <Row label="Scheduled" value={
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        {app.inspection.scheduledAt ? new Date(app.inspection.scheduledAt).toLocaleDateString() : "—"}
                      </span>
                    } />
                    <Row label="Findings" value={app.inspection.findings ?? "—"} />
                    <Row label="Recommendation" value={app.inspection.recommendation ?? "Pending"} />
                  </Section>
                </>
              )}

              <Separator />
              <Section title="Contact">
                <Row label="Phone" value={
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{app.contact.phone}</span>
                } />
                <Row label="Email" value={
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{app.contact.email}</span>
                } />
                <Row label="Address" value={
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    {app.location.line1}, {app.location.ward}, Cape Town {app.location.postcode}
                  </span>
                } />
              </Section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
