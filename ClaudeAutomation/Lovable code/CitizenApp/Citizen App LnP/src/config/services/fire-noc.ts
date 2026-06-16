import type { ServiceConfig } from "../types";
import { CITY_OPTIONS, CITY_ZONE_MAP, OCCUPANCY_OPTIONS, ID_TYPE_OPTIONS } from "../maps";

export const fireNoc: ServiceConfig = {
  id: "fire-noc",
  arnPrefix: "FN",
  name: "Fire NOC",
  category: "Safety",
  icon: "Flame",
  comingSoon: true,
  summary: "No-Objection Certificate from the Fire Department confirming building fire safety compliance.",
  eligibility: [
    "Building must have fire safety equipment installed",
    "Approved building plan available",
    "Occupancy type clearly classified",
  ],
  documentsRequired: [
    { id: "id_proof", label: "ID Proof", required: true },
    { id: "building_plan", label: "Approved Building Plan", required: true },
    { id: "fire_equipment_list", label: "Fire Equipment Installation Report", required: true },
  ],
  form: [
    {
      id: "applicant",
      title: "Applicant details",
      shortLabel: "Applicant",
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        { id: "mobile", label: "Mobile Number", type: "tel", required: true, validation: { regex: "^[6-9]\\d{9}$", regexMessage: "Enter a 10-digit mobile" } },
        { id: "email", label: "Email", type: "email" },
        { id: "idType", label: "ID Type", type: "dropdown", required: true, options: ID_TYPE_OPTIONS },
        { id: "idNumber", label: "ID Number", type: "text", required: true },
      ],
    },
    {
      id: "premises",
      title: "About the premises",
      shortLabel: "Premises",
      fields: [
        { id: "buildingName", label: "Building Name", type: "text", required: true },
        { id: "occupancyType", label: "Occupancy Type", type: "dropdown", required: true, options: OCCUPANCY_OPTIONS },
        { id: "floors", label: "Number of Floors", type: "number", required: true, validation: { min: 1, max: 40 } },
        { id: "totalArea", label: "Total Floor Area (sq m)", type: "number", required: true, validation: { min: 1 } },
        { id: "city", label: "City", type: "dropdown", required: true, options: CITY_OPTIONS },
        { id: "zone", label: "Zone / Ward", type: "dropdown", required: true, dependsOn: "city", dependsValueMap: CITY_ZONE_MAP },
        { id: "postalCode", label: "Postal Code", type: "text", required: true, validation: { regex: "^\\d{4}$", regexMessage: "Enter a 4-digit postal code" } },
      ],
    },
    {
      id: "safety",
      title: "Fire safety equipment",
      shortLabel: "Safety",
      fields: [
        { id: "hasSprinklers", label: "Sprinkler system installed?", type: "radio", required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
        { id: "hasAlarms", label: "Smoke / fire alarms installed?", type: "radio", required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
        { id: "hasExtinguishers", label: "Fire extinguishers count", type: "number", required: true, validation: { min: 0 } },
        { id: "emergencyExits", label: "Number of emergency exits", type: "number", required: true, validation: { min: 1 } },
      ],
    },
    {
      id: "documents",
      title: "Upload documents",
      shortLabel: "Documents",
      fields: [
        { id: "doc_id_proof", label: "ID Proof", type: "file", required: true, accept: "application/pdf,image/jpeg,image/png", maxSizeMb: 5 },
        { id: "doc_building_plan", label: "Approved Building Plan", type: "file", required: true, accept: "application/pdf", maxSizeMb: 10 },
        { id: "doc_fire_equipment", label: "Fire Equipment Report", type: "file", required: true, accept: "application/pdf", maxSizeMb: 5 },
      ],
    },
  ],
  workflow: {
    states: [
      { id: "submitted", label: "Submitted", kind: "start", chip: "submitted" },
      { id: "inspection", label: "Fire Safety Inspection", kind: "in_progress", chip: "in_review" },
      { id: "payment_due", label: "NOC Fee Due", kind: "in_progress", chip: "payment_required" },
      { id: "approval", label: "Final Approval", kind: "in_progress", chip: "in_review" },
      { id: "issued", label: "NOC Issued", kind: "end", endStatus: "issued", chip: "issued" },
      { id: "rejected", label: "Rejected", kind: "end", endStatus: "rejected", chip: "rejected" },
    ],
    transitions: [
      { id: "t1", from: "submitted", to: "inspection", label: "Schedule Inspection", notify: "inspection" },
      { id: "t2", from: "inspection", to: "payment_due", label: "Inspection Cleared", notify: "payment_due" },
      { id: "t3", from: "payment_due", to: "approval", label: "Payment Received", notify: "payment_received" },
      { id: "t4", from: "approval", to: "issued", label: "Approve & Issue NOC", notify: "issued" },
      { id: "t5", from: "inspection", to: "rejected", label: "Reject", notify: "rejected" },
    ],
  },
  fees: [
    { id: "noc_fee", stageId: "payment_due", label: "NOC Fee", baseAmount: 1200, taxPercent: 10 },
  ],
  notifications: [
    { event: "submitted", channel: "sms", title: "Application Submitted", body: "Hi {{applicantName}}, your {{serviceName}} application {{arn}} has been submitted." },
    { event: "inspection", channel: "sms", title: "Fire inspection scheduled", body: "Fire inspection scheduled for {{arn}}." },
    { event: "payment_due", channel: "sms", title: "Payment Required", body: "Pay R {{amount}} for NOC {{arn}}." },
    { event: "payment_received", channel: "sms", title: "Payment Received", body: "Payment of R {{amount}} for {{arn}} received." },
    { event: "issued", channel: "sms", title: "NOC Issued", body: "Fire NOC {{licenseNo}} issued for {{arn}}." },
    { event: "rejected", channel: "sms", title: "Application Rejected", body: "Your application {{arn}} has been rejected." },
  ],
};