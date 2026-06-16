import type {
  NotificationChannel,
  NotificationTemplate,
  RecipientRole,
} from "./notificationMatrix";

// Loose shape — matches PreviewApplication without forcing a circular import.
interface AppLike {
  applicationNumber: string;
  formData: Record<string, string>;
  demand?: { total: number } | null;
  license?: { number: string; validTill: number } | null;
}

export interface SimulatedMessage {
  id: string;
  channel: NotificationChannel; // "SMS" | "EMAIL"
  recipientRole: RecipientRole;
  title: string;
  message: string;
  applicationId?: string;
  timestamp: number;
}

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function resolveTemplate(
  tpl: NotificationTemplate,
  app: AppLike,
  meta: Record<string, string> = {}
): { title: string; message: string } {
  const tokens: Record<string, string> = {
    applicantName: app.formData?.fullName || "Applicant",
    applicationId: app.applicationNumber || "",
    businessName: app.formData?.businessName || "your business",
    amount: app.demand?.total != null ? app.demand.total.toLocaleString("en-IN") : "",
    licenseNumber: app.license?.number || "",
    validTill: app.license?.validTill ? fmtDate(app.license.validTill) : "",
    actionBy: meta.actionBy || "",
    documentName: meta.documentName || "",
    remarks: meta.remarks || "",
    status: meta.status || "",
    ...meta,
  };

  const inject = (s: string) =>
    s.replace(/\{\{(\w+)\}\}/g, (_, k) => (tokens[k] != null ? String(tokens[k]) : ""));

  return { title: inject(tpl.title), message: inject(tpl.message) };
}
