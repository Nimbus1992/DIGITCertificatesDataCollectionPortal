import { TRADE_ROLES } from "@/data/tradeLicenseTemplate";

export interface ServiceRole {
  id: string;
  name: string;
  description: string;
}

const FALLBACK_ROLES: ServiceRole[] = [
  { id: "applicant", name: "Applicant", description: "Citizen who submits the application" },
  { id: "document_verifier", name: "Document Verifier", description: "Reviews and verifies submitted documents" },
  { id: "field_inspector", name: "Field Inspector", description: "Performs on-site inspections" },
  { id: "approver", name: "Approver", description: "Final approving authority" },
];

export function getServiceRoles(_templateId?: string): ServiceRole[] {
  // Trade License is currently the only wired template; return its roles.
  if (TRADE_ROLES?.length) {
    return TRADE_ROLES.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
    }));
  }
  return FALLBACK_ROLES;
}
