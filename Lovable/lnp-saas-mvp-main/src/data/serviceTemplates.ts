import { Building2, HardHat, Shield, Zap, FileText } from "lucide-react";

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "construction" | "safety" | "utilities" | "custom";
  icon: typeof Building2;
  features: string[];
  estimatedSetupTime: string;
}

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: "business-license",
    name: "Business License",
    description: "Standard business registration and licensing permit for new and existing businesses.",
    category: "business",
    icon: Building2,
    features: ["Application form", "Document upload", "Fee collection", "Inspection scheduling"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "trade-license",
    name: "Trade License",
    description: "Permits for specific trade activities and commercial operations.",
    category: "business",
    icon: Building2,
    features: ["Trade classification", "Zone compliance", "Annual renewal", "Fee schedule"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "building-permit",
    name: "Building Permit",
    description: "Construction and building permits with plan review and inspection workflows.",
    category: "construction",
    icon: HardHat,
    features: ["Plan submission", "Multi-stage review", "Site inspections", "Compliance checks"],
    estimatedSetupTime: "8 min",
  },
  {
    id: "demolition-permit",
    name: "Demolition Permit",
    description: "Permits for demolition activities with safety and environmental checks.",
    category: "construction",
    icon: HardHat,
    features: ["Safety assessment", "Environmental review", "Neighbor notification", "Timeline tracking"],
    estimatedSetupTime: "6 min",
  },
  {
    id: "fire-safety",
    name: "Fire Safety Certificate",
    description: "Fire safety compliance certification for buildings and commercial spaces.",
    category: "safety",
    icon: Shield,
    features: ["Safety checklist", "Inspection scheduling", "Compliance scoring", "Certificate generation"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "food-license",
    name: "Food Establishment License",
    description: "Health and safety permits for food service and preparation businesses.",
    category: "safety",
    icon: Shield,
    features: ["Health inspection", "Hygiene scoring", "Periodic renewal", "Violation tracking"],
    estimatedSetupTime: "6 min",
  },
  {
    id: "water-connection",
    name: "Water Connection",
    description: "New water supply connection applications and approvals.",
    category: "utilities",
    icon: Zap,
    features: ["Connection request", "Site survey", "Meter installation", "Billing setup"],
    estimatedSetupTime: "4 min",
  },
  {
    id: "electricity-connection",
    name: "Electricity Connection",
    description: "Power supply connection permits for residential and commercial properties.",
    category: "utilities",
    icon: Zap,
    features: ["Load assessment", "Safety inspection", "Connection approval", "Meter setup"],
    estimatedSetupTime: "5 min",
  },
];

export const categoryLabels: Record<string, string> = {
  business: "Business & Commerce",
  construction: "Construction & Building",
  safety: "Public Safety & Health",
  utilities: "Utilities & Infrastructure",
  custom: "Custom Service",
};

export const categoryIcons: Record<string, typeof Building2> = {
  business: Building2,
  construction: HardHat,
  safety: Shield,
  utilities: Zap,
  custom: FileText,
};
