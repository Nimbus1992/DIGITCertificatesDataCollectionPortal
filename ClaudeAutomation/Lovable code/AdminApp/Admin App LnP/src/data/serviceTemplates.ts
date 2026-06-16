import {
  Building2,
  Hammer,
  Flame,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Award,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { TRADE_PAYMENT_STAGES } from "./tradeLicenseTemplate";

export interface ServiceTemplate {
  id: string;
  name: string;
  aka?: string[];
  description: string;
  icon: typeof Building2;
  modules: string[];
  features: string[];
  estimatedSetupTime: string;
  comingSoon?: boolean;
  howItWorks?: { icon: LucideIcon; label: string }[];
  flows?: { name: string; steps: string[] }[];
  forms?: { name: string; groups: string[] }[];
  notifications?: string[];
  payments?: { stage: string; fees: string[] }[];
}

export const tradeTemplate: ServiceTemplate = {
  id: "trade-license",
  name: "Business License",
  aka: [
    "Trade License",
    "Business Registration",
    "Single Business Permit",
    "Business Operating Permit",
    "Shop License",
  ],
  description:
    "Set up a complete Business License system to accept applications, review requests, issue licenses, and manage renewals.",
  icon: Building2,
  modules: ["Application", "Renewal"],
  features: ["Application form", "Document upload", "Fee collection", "Inspection scheduling"],
  estimatedSetupTime: "5 min",
  howItWorks: [
    { icon: FileText, label: "Apply" },
    { icon: ShieldCheck, label: "Review" },
    { icon: CheckCircle2, label: "Approve" },
    { icon: Award, label: "Issue" },
    { icon: RefreshCw, label: "Renew" },
  ],
  flows: [
    {
      name: "New Application",
      steps: ["Submit", "Upload docs", "Review", "Decision", "Issue license"],
    },
    {
      name: "Renewal",
      steps: ["Renew", "Verify expiry", "Review", "Approve", "Re-issue"],
    },
  ],
  forms: [
    {
      name: "Application Form",
      groups: ["Business details", "Owner info", "Address", "Documents"],
    },
    {
      name: "Renewal Form",
      groups: ["License No.", "Updates", "Documents"],
    },
  ],
  notifications: [
    "Application submitted",
    "Application approved",
    "Application rejected",
    "License issued",
    "Renewal due",
  ],
  payments: TRADE_PAYMENT_STAGES.map((p) => ({ stage: p.name, fees: p.fees })),
};

export const buildingPermitsTemplate: ServiceTemplate = {
  id: "building-permits",
  name: "Building Permits",
  aka: [
    "Construction Permit",
    "Development Permit",
    "Planning Permission",
    "Works Approval",
  ],
  description:
    "Manage building permit applications, plan reviews, inspections, and approvals end-to-end.",
  icon: Hammer,
  modules: ["Application", "Plan Review", "Inspection"],
  features: ["Plan upload", "Inspection scheduling", "Multi-stage approval"],
  estimatedSetupTime: "Coming soon",
  comingSoon: true,
};

export const fireNocTemplate: ServiceTemplate = {
  id: "fire-noc",
  name: "Fire NOC",
  aka: ["Fire Safety Certificate", "Fire Permit", "Fire Safety Approval"],
  description:
    "Issue and renew Fire No Objection Certificates with inspections, compliance checks, and digital certificates.",
  icon: Flame,
  modules: ["Application", "Inspection", "Renewal"],
  features: ["Compliance checklist", "Site inspection", "Digital NOC"],
  estimatedSetupTime: "Coming soon",
  comingSoon: true,
};

export const allTemplates: ServiceTemplate[] = [
  tradeTemplate,
  buildingPermitsTemplate,
  fireNocTemplate,
];
