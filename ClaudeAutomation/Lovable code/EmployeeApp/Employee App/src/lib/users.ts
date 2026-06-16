import type { RoleId } from "./types";

export type DemoUser = {
  email: string;
  password: string;
  name: string;
  roleId: RoleId;
};

export const DEMO_USERS: DemoUser[] = [
  { email: "verifier@gov.in", password: "verify123", name: "Priya Sharma", roleId: "document_verifier" },
  { email: "inspector@gov.in", password: "inspect123", name: "Rahul Verma", roleId: "field_inspector" },
  { email: "approver@gov.in", password: "approve123", name: "Anita Reddy", roleId: "approver" },
];

export const ROLE_LABELS: Record<RoleId, string> = {
  document_verifier: "Document Verifier",
  field_inspector: "Field Inspector",
  approver: "Approver",
};
