import type { ServiceConfig } from "../types";
import {
  TRADE_CATEGORY_OPTIONS,
  TRADE_CATEGORY_MAP,
  CITY_OPTIONS,
  CITY_ZONE_MAP,
  ID_TYPE_OPTIONS,
  OWNERSHIP_OPTIONS,
  HAZARD_TYPE_OPTIONS,
} from "../maps";

export const tradeLicense: ServiceConfig = {
  id: "trade-license",
  arnPrefix: "TL-business-license",
  name: "Business License",
  category: "Business",
  icon: "Store",
  summary:
    "Apply for a municipal business licence to operate a business legally within the city limits.",
  eligibility: [
    "Applicant must be 18 years or older",
    "Business address must be within municipal jurisdiction",
    "Valid identity proof (South African ID / Passport / Driver's Licence)",
  ],
  documentsRequired: [
    { id: "id_proof", label: "ID Proof", required: true, helper: "PDF / JPG / PNG · max 5 MB" },
    { id: "address_proof", label: "Address Proof", required: true, helper: "PDF / JPG / PNG · max 5 MB" },
    { id: "business_proof", label: "Business Proof", required: true, helper: "PDF / JPG / PNG · max 5 MB" },
  ],
  form: [
    {
      id: "applicant",
      title: "Tell us about yourself",
      shortLabel: "Applicant",
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true, validation: { minLength: 2, maxLength: 80 } },
        { id: "mobile", label: "Mobile Number", type: "tel", required: true, validation: { regex: "^[6-8]\\d{8}$", regexMessage: "Enter a 9-digit SA mobile (drop leading 0)" } },
        { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { id: "idType", label: "ID Type", type: "dropdown", required: true, options: ID_TYPE_OPTIONS },
        { id: "idNumber", label: "ID Number", type: "text", required: true },
      ],
    },
    {
      id: "business",
      title: "Add a few more details",
      shortLabel: "Business Details",
      skippable: true,
      fields: [
        { id: "businessName", label: "Business Name", type: "text", required: true, validation: { minLength: 2, maxLength: 120 } },
        { id: "businessCategory", label: "Business Category", type: "dropdown", required: true, options: TRADE_CATEGORY_OPTIONS },
        { id: "subCategory", label: "Sub Category", type: "dropdown", required: true, dependsOn: "businessCategory", dependsValueMap: TRADE_CATEGORY_MAP },
        { id: "ownershipType", label: "Ownership Type", type: "dropdown", required: true, options: OWNERSHIP_OPTIONS },
        { id: "numEmployees", label: "Number of Employees", type: "number", validation: { min: 0, max: 9999 } },
        { id: "annualTurnover", label: "Annual Turnover (R)", type: "number", validation: { min: 0 } },
      ],
    },
    {
      id: "location",
      title: "Where is your business located?",
      subtitle: "Long press to drop a pin, or search by postal code or area.",
      shortLabel: "Business Location",
      skippable: true,
      fields: [
        { id: "addressLine1", label: "Address Line 1", type: "text", required: true, placeholder: "Street, building" },
        { id: "addressLine2", label: "Address Line 2", type: "text", placeholder: "Locality (optional)" },
        { id: "city", label: "City", type: "dropdown", required: true, options: CITY_OPTIONS, placeholder: "Select city" },
        { id: "zone", label: "Zone / Ward", type: "dropdown", required: true, dependsOn: "city", dependsValueMap: CITY_ZONE_MAP, placeholder: "Select a city first" },
        { id: "postalCode", label: "Postal Code", type: "text", required: true, placeholder: "4-digit postal code", validation: { regex: "^\\d{4}$", regexMessage: "Enter a 4-digit postal code" } },
      ],
    },
    {
      id: "operations",
      title: "Operational details",
      shortLabel: "Operational Details",
      fields: [
        { id: "businessStartDate", label: "Business Start Date", type: "date", required: true, validation: { pastDateOnly: true } },
        { id: "shopArea", label: "Shop Area (sq ft)", type: "number", required: true, placeholder: "e.g. 250", helper: "Used to calculate licence fees", validation: { min: 1, max: 100000 } },
        { id: "hazardous", label: "Is Hazardous Activity?", type: "radio", required: true, options: [
          { label: "No", value: "no" }, { label: "Yes", value: "yes" }
        ] },
        { id: "hazardType", label: "Hazard Type", type: "dropdown", required: true, options: HAZARD_TYPE_OPTIONS, showIf: { fieldId: "hazardous", equals: "yes" }, placeholder: "Select hazard type" },
      ],
    },
    {
      id: "documents",
      title: "Upload documents to complete your application",
      shortLabel: "Documents",
      fields: [
        { id: "doc_id_proof", label: "ID Proof", type: "file", required: true, accept: "application/pdf,image/jpeg,image/png", maxSizeMb: 5, helper: "PDF / JPG / PNG · max 5 MB" },
        { id: "doc_address_proof", label: "Address Proof", type: "file", required: true, accept: "application/pdf,image/jpeg,image/png", maxSizeMb: 5, helper: "PDF / JPG / PNG · max 5 MB" },
        { id: "doc_business_proof", label: "Business Proof", type: "file", required: true, accept: "application/pdf,image/jpeg,image/png", maxSizeMb: 5, helper: "PDF / JPG / PNG · max 5 MB" },
      ],
    },
  ],
  workflow: {
    states: [
      { id: "submitted", label: "Submitted", kind: "start", chip: "submitted" },
      { id: "doc_verification", label: "Document Verification", kind: "in_progress", chip: "in_review" },
      { id: "inspection", label: "Field Inspection", kind: "in_progress", chip: "in_review" },
      { id: "payment_due", label: "Payment Due", kind: "in_progress", chip: "payment_required" },
      { id: "approval", label: "Approval", kind: "in_progress", chip: "in_review" },
      { id: "issued", label: "Licence Issued", kind: "end", endStatus: "issued", chip: "issued" },
      { id: "rejected", label: "Rejected", kind: "end", endStatus: "rejected", chip: "rejected" },
    ],
    transitions: [
      { id: "t1", from: "submitted", to: "doc_verification", label: "Send for Verification", notify: "doc_verification" },
      { id: "t2", from: "doc_verification", to: "inspection", label: "Schedule Inspection", notify: "inspection" },
      { id: "t3", from: "inspection", to: "payment_due", label: "Inspection Cleared → Payment", notify: "payment_due" },
      { id: "t4", from: "payment_due", to: "approval", label: "Payment Received → Approval", notify: "payment_received" },
      { id: "t5", from: "approval", to: "issued", label: "Approve & Issue Licence", notify: "issued" },
      { id: "t6", from: "doc_verification", to: "rejected", label: "Reject (documents)", notify: "rejected" },
      { id: "t7", from: "inspection", to: "rejected", label: "Reject (inspection)", notify: "rejected" },
    ],
  },
  fees: [
    { id: "inspection_fee", stageId: "payment_due", label: "Inspection Fee", baseAmount: 1000 },
    { id: "license_fee", stageId: "payment_due", label: "License Fee", baseAmount: 2500, taxPercent: 10 },
  ],
  notifications: [
    { event: "submitted", channel: "sms", title: "Application Submitted", body: "Hi {{applicantName}}, your {{serviceName}} application {{arn}} has been submitted." },
    { event: "doc_verification", channel: "sms", title: "Documents under review", body: "Your application {{arn}} is now under document verification." },
    { event: "inspection", channel: "sms", title: "Inspection scheduled", body: "Field inspection has been scheduled for {{arn}}." },
    { event: "payment_due", channel: "sms", title: "Payment Required", body: "Pay R {{amount}} to proceed with {{arn}}." },
    { event: "payment_received", channel: "sms", title: "Payment Received", body: "Payment of R {{amount}} for {{arn}} received. Thank you." },
    { event: "issued", channel: "sms", title: "Licence Issued", body: "Your business licence {{licenseNo}} has been issued." },
    { event: "rejected", channel: "sms", title: "Application Rejected", body: "Your application {{arn}} has been rejected. Please contact the office." },
  ],
};