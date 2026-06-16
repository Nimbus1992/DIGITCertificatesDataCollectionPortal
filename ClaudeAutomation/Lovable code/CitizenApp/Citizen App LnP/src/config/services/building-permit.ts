import type { ServiceConfig } from "../types";
import { CITY_OPTIONS, CITY_ZONE_MAP, BUILDING_TYPE_OPTIONS, ID_TYPE_OPTIONS } from "../maps";

export const buildingPermit: ServiceConfig = {
  id: "building-permit",
  arnPrefix: "BP",
  name: "Building Permit",
  category: "Construction",
  icon: "Building2",
  comingSoon: true,
  summary: "Obtain municipal approval before constructing, extending, or modifying a building.",
  eligibility: [
    "Plot must be legally owned or leased",
    "Sanctioned plan from licensed architect",
    "Property tax cleared up to date",
  ],
  documentsRequired: [
    { id: "id_proof", label: "ID Proof", required: true, helper: "PDF / JPG / PNG · max 5 MB" },
    { id: "ownership_proof", label: "Plot Ownership Proof", required: true, helper: "PDF · max 5 MB" },
    { id: "site_plan", label: "Site & Building Plan", required: true, helper: "PDF · max 10 MB" },
    { id: "tax_receipt", label: "Latest Property Tax Receipt", required: true, helper: "PDF · max 5 MB" },
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
      id: "plot",
      title: "About the plot",
      shortLabel: "Plot Details",
      fields: [
        { id: "plotNumber", label: "Plot / Survey Number", type: "text", required: true },
        { id: "plotArea", label: "Plot Area (sq ft)", type: "number", required: true, validation: { min: 1 } },
        { id: "city", label: "City", type: "dropdown", required: true, options: CITY_OPTIONS },
        { id: "zone", label: "Zone / Ward", type: "dropdown", required: true, dependsOn: "city", dependsValueMap: CITY_ZONE_MAP },
        { id: "postalCode", label: "Postal Code", type: "text", required: true, validation: { regex: "^\\d{4}$", regexMessage: "Enter a 4-digit postal code" } },
      ],
    },
    {
      id: "construction",
      title: "Construction details",
      shortLabel: "Construction",
      fields: [
        { id: "buildingType", label: "Building Type", type: "dropdown", required: true, options: BUILDING_TYPE_OPTIONS },
        { id: "floors", label: "Number of Floors", type: "number", required: true, validation: { min: 1, max: 40 } },
        { id: "builtUpArea", label: "Total Built-Up Area (sq ft)", type: "number", required: true, validation: { min: 1 } },
        { id: "architectName", label: "Architect Name", type: "text", required: true },
        { id: "architectLicense", label: "Architect Licence No.", type: "text", required: true },
      ],
    },
    {
      id: "documents",
      title: "Upload documents",
      shortLabel: "Documents",
      fields: [
        { id: "doc_id_proof", label: "ID Proof", type: "file", required: true, accept: "application/pdf,image/jpeg,image/png", maxSizeMb: 5 },
        { id: "doc_ownership", label: "Plot Ownership Proof", type: "file", required: true, accept: "application/pdf", maxSizeMb: 5 },
        { id: "doc_site_plan", label: "Site & Building Plan", type: "file", required: true, accept: "application/pdf", maxSizeMb: 10 },
        { id: "doc_tax_receipt", label: "Property Tax Receipt", type: "file", required: true, accept: "application/pdf", maxSizeMb: 5 },
      ],
    },
  ],
  workflow: {
    states: [
      { id: "submitted", label: "Submitted", kind: "start", chip: "submitted" },
      { id: "doc_verification", label: "Document Verification", kind: "in_progress", chip: "in_review" },
      { id: "site_inspection", label: "Site Inspection", kind: "in_progress", chip: "in_review" },
      { id: "payment_due", label: "Permit Fee Due", kind: "in_progress", chip: "payment_required" },
      { id: "approval", label: "Final Approval", kind: "in_progress", chip: "in_review" },
      { id: "issued", label: "Permit Issued", kind: "end", endStatus: "issued", chip: "issued" },
      { id: "rejected", label: "Rejected", kind: "end", endStatus: "rejected", chip: "rejected" },
    ],
    transitions: [
      { id: "t1", from: "submitted", to: "doc_verification", label: "Send for Verification", notify: "doc_verification" },
      { id: "t2", from: "doc_verification", to: "site_inspection", label: "Schedule Site Inspection", notify: "inspection" },
      { id: "t3", from: "site_inspection", to: "payment_due", label: "Inspection Cleared", notify: "payment_due" },
      { id: "t4", from: "payment_due", to: "approval", label: "Payment Received", notify: "payment_received" },
      { id: "t5", from: "approval", to: "issued", label: "Approve & Issue Permit", notify: "issued" },
      { id: "t6", from: "doc_verification", to: "rejected", label: "Reject (documents)", notify: "rejected" },
      { id: "t7", from: "site_inspection", to: "rejected", label: "Reject (inspection)", notify: "rejected" },
    ],
  },
  fees: [
    { id: "permit_fee", stageId: "payment_due", label: "Permit Fee", baseAmount: 2500, taxPercent: 10 },
  ],
  notifications: [
    { event: "submitted", channel: "sms", title: "Application Submitted", body: "Hi {{applicantName}}, your {{serviceName}} application {{arn}} has been submitted." },
    { event: "doc_verification", channel: "sms", title: "Documents under review", body: "Your application {{arn}} is now under verification." },
    { event: "inspection", channel: "sms", title: "Site inspection scheduled", body: "Site inspection scheduled for {{arn}}." },
    { event: "payment_due", channel: "sms", title: "Payment Required", body: "Pay R {{amount}} for permit {{arn}}." },
    { event: "payment_received", channel: "sms", title: "Payment Received", body: "Payment of R {{amount}} for {{arn}} received." },
    { event: "issued", channel: "sms", title: "Permit Issued", body: "Building permit {{licenseNo}} issued for {{arn}}." },
    { event: "rejected", channel: "sms", title: "Application Rejected", body: "Your application {{arn}} has been rejected." },
  ],
};