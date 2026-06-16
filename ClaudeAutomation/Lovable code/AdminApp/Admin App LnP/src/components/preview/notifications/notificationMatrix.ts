// Single source of truth for all preview notifications.
// SMS / EMAIL are simulated silently — only PUSH renders in the UI.

export type NotificationChannel = "PUSH" | "SMS" | "EMAIL";
export type RecipientRole = "citizen" | "documentVerifier" | "fieldInspector" | "approver";

export interface NotificationTemplate {
  id: string;                // trigger id, e.g. "application_submitted"
  recipientRole: RecipientRole;
  channels: NotificationChannel[];
  title: string;             // also used as email subject
  message: string;           // body, supports {{variables}}
}

export const NOTIFICATION_MATRIX: NotificationTemplate[] = [
  // ── application_submitted ────────────────────────────────────────────────
  {
    id: "application_submitted",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Application submitted",
    message:
      "Hi {{applicantName}}, your application {{applicationId}} for {{businessName}} has been received. We'll keep you posted on its progress.",
  },
  {
    id: "application_submitted",
    recipientRole: "documentVerifier",
    channels: ["PUSH"],
    title: "New application to verify",
    message: "Application {{applicationId}} from {{applicantName}} is awaiting document verification.",
  },

  // ── document_verified ────────────────────────────────────────────────────
  {
    id: "document_verified",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS"],
    title: "Document verified",
    message: "Document '{{documentName}}' on {{applicationId}} has been verified.",
  },

  // ── document_rejected ────────────────────────────────────────────────────
  {
    id: "document_rejected",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Document rejected",
    message: "Document '{{documentName}}' on {{applicationId}} was rejected. Please re-upload a valid document.",
  },

  // ── application_verified (docs OK, going to inspection) ─────────────────
  {
    id: "application_verified",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Verification complete",
    message: "Your application {{applicationId}} has been verified. Next step: site inspection.",
  },
  {
    id: "application_verified",
    recipientRole: "fieldInspector",
    channels: ["PUSH"],
    title: "Inspection assigned",
    message: "Application {{applicationId}} ({{businessName}}) is ready for site visit.",
  },

  // ── inspection_completed ────────────────────────────────────────────────
  {
    id: "inspection_completed",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Inspection complete",
    message: "Inspection completed for {{applicationId}}. Awaiting approver decision.",
  },
  {
    id: "inspection_completed",
    recipientRole: "approver",
    channels: ["PUSH"],
    title: "Approval pending",
    message: "Application {{applicationId}} ({{businessName}}) is ready for your approval.",
  },

  // ── application_approved (demand generated) ─────────────────────────────
  {
    id: "application_approved",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Approved — payment due",
    message: "Application {{applicationId}} approved. Pay ₹{{amount}} to receive your business license.",
  },

  // ── application_sent_back ───────────────────────────────────────────────
  {
    id: "application_sent_back",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Action required",
    message: "Application {{applicationId}} was sent back by {{actionBy}}. {{remarks}}",
  },

  // ── application_rejected ────────────────────────────────────────────────
  {
    id: "application_rejected",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Application rejected",
    message: "Application {{applicationId}} has been rejected by {{actionBy}}.",
  },

  // ── payment_successful ──────────────────────────────────────────────────
  {
    id: "payment_successful",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Payment received",
    message: "Payment of ₹{{amount}} received for {{applicationId}}. Your license will be issued shortly.",
  },
  {
    id: "payment_successful",
    recipientRole: "approver",
    channels: ["PUSH"],
    title: "Payment received",
    message: "Application {{applicationId}} has been paid — ready to issue license.",
  },

  // ── license_issued ──────────────────────────────────────────────────────
  {
    id: "license_issued",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "License issued 🎉",
    message:
      "Business license {{licenseNumber}} has been issued for {{businessName}}. Valid till {{validTill}}.",
  },

  // ── renewal_submitted ───────────────────────────────────────────────────
  {
    id: "renewal_submitted",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS"],
    title: "Renewal received",
    message: "Renewal request {{applicationId}} has been submitted.",
  },
  {
    id: "renewal_submitted",
    recipientRole: "documentVerifier",
    channels: ["PUSH"],
    title: "Renewal to verify",
    message: "Renewal {{applicationId}} from {{applicantName}} awaits verification.",
  },

  // ── renewal_completed ───────────────────────────────────────────────────
  {
    id: "renewal_completed",
    recipientRole: "citizen",
    channels: ["PUSH", "SMS", "EMAIL"],
    title: "Renewal complete",
    message: "License {{licenseNumber}} has been renewed. New validity: {{validTill}}.",
  },
];
