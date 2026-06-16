import type { CitizenApplication, StoredDocument } from "@/context/ApplicationsContext";
import { generateArn, generateLicenseNo } from "@/lib/citizen/arn";

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function specimenDoc(title: string, lines: Array<[string, string]>): string {
  const rows = lines
    .map(
      ([k, v], i) =>
        `<text x="40" y="${170 + i * 34}" font-family="Inter,Arial,sans-serif" font-size="14" fill="#5c6478">${k}</text>` +
        `<text x="240" y="${170 + i * 34}" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#101524">${v}</text>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="640" height="420">
    <rect width="640" height="420" fill="#ffffff" stroke="#d4dae4" stroke-width="2"/>
    <rect x="0" y="0" width="640" height="80" fill="#0e6e6c"/>
    <text x="40" y="40" font-family="Inter,Arial,sans-serif" font-size="11" fill="#ffffff" letter-spacing="2">CITY OF CAPE TOWN</text>
    <text x="40" y="64" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="700" fill="#ffffff">${title}</text>
    <text x="40" y="120" font-family="Inter,Arial,sans-serif" font-size="11" fill="#5c6478" letter-spacing="2">SPECIMEN — FOR DEMO PURPOSES</text>
    ${rows}
    <rect x="40" y="350" width="140" height="40" fill="#f5f7fb" stroke="#d4dae4"/>
    <text x="110" y="376" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="10" fill="#5c6478">SIGNATURE</text>
    <text x="600" y="380" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="10" fill="#5c6478">Issued ${new Date().toLocaleDateString("en-ZA")}</text>
  </svg>`;
  return svgDataUrl(svg);
}

export const DEMO_APPLICANT = {
  fullName: "Thandiwe Mbeki",
  mobile: "821234567",
  email: "thandiwe.mbeki@example.co.za",
  idType: "sa_id",
  idNumber: "8501015800086",
  businessName: "Table Bay Traders",
  businessCategory: "retail",
  subCategory: "general",
  ownershipType: "proprietorship",
  numEmployees: 4,
  annualTurnover: 1250000,
  addressLine1: "12 Long Street",
  addressLine2: "",
  city: "cape_town",
  zone: "cpt_sc16",
  postalCode: "8001",
  businessStartDate: "2026-04-28",
  shopArea: 250,
  hazardous: "no",
} as const;

/** Override the labels rendered in the detail screen for demo realism. */
export const DEMO_LABEL_OVERRIDES: Record<string, string> = {
  businessCategory: "Retail",
  ownershipType: "Individual",
  city: "Cape Town",
  zone: "Subcouncil 16 — CBD / Atlantic Seaboard",
};

export const DEMO_DOCUMENTS: StoredDocument[] = [
  {
    fieldId: "doc_id_proof",
    name: "south-african-id.svg",
    size: 24_500,
    type: "image/svg+xml",
    dataUrl: specimenDoc("South African ID — Specimen", [
      ["Full Name", "Thandiwe Mbeki"],
      ["ID Number", "8501015800086"],
      ["Date of Birth", "01 Jan 1985"],
      ["Nationality", "South African"],
      ["Sex", "F"],
    ]),
    uploadedAt: Date.now(),
  },
  {
    fieldId: "doc_address_proof",
    name: "proof-of-address.svg",
    size: 31_200,
    type: "image/svg+xml",
    dataUrl: specimenDoc("Proof of Address — Specimen", [
      ["Account Holder", "Thandiwe Mbeki"],
      ["Address", "12 Long Street, City Bowl"],
      ["City", "Cape Town, 8001"],
      ["Utility", "City of Cape Town — Electricity"],
      ["Account No.", "CCT-77432891"],
    ]),
    uploadedAt: Date.now(),
  },
  {
    fieldId: "doc_business_proof",
    name: "business-registration.svg",
    size: 41_800,
    type: "image/svg+xml",
    dataUrl: specimenDoc("Business Registration — Specimen", [
      ["Trading Name", "Table Bay Traders"],
      ["CIPC No.", "2024/418205/07"],
      ["Type", "Sole Proprietor"],
      ["Registered Address", "12 Long Street, Cape Town"],
      ["VAT No.", "4760298415"],
    ]),
    uploadedAt: Date.now(),
  },
];

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 3600 * 1000;
}

export function seedDemoApplications(): CitizenApplication[] {
  const base = {
    serviceId: "trade-license",
    applicantName: DEMO_APPLICANT.fullName,
    phone: DEMO_APPLICANT.mobile,
    values: { ...DEMO_APPLICANT },
    documents: DEMO_DOCUMENTS,
    payments: [] as CitizenApplication["payments"],
  };

  const issued: CitizenApplication = {
    ...base,
    id: generateArn("TL-business-license"),
    currentStateId: "issued",
    licenseNo: generateLicenseNo("TL-business-license"),
    history: [
      { stateId: "submitted", at: daysAgo(12), note: "Application submitted" },
      { stateId: "doc_verification", at: daysAgo(11), note: "Send for Verification" },
      { stateId: "inspection", at: daysAgo(9), note: "Schedule Inspection" },
      { stateId: "payment_due", at: daysAgo(7), note: "Inspection Cleared → Payment" },
      { stateId: "approval", at: daysAgo(5), note: "Payment Received → Approval" },
      { stateId: "issued", at: daysAgo(4), note: "Approve & Issue Licence" },
    ],
    payments: [
      {
        stageId: "payment_due",
        amount: 3850,
        paidAt: daysAgo(6),
        receiptId: "RCPT-26052812",
      },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(4),
  };

  const rejected: CitizenApplication = {
    ...base,
    id: generateArn("TL-business-license"),
    currentStateId: "rejected",
    history: [
      { stateId: "submitted", at: daysAgo(6), note: "Application submitted" },
      { stateId: "doc_verification", at: daysAgo(5), note: "Send for Verification" },
      { stateId: "rejected", at: daysAgo(3), note: "Reject (documents)" },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(3),
  };

  return [issued, rejected];
}