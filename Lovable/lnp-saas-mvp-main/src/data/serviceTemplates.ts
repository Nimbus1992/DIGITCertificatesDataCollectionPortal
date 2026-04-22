import { Building2, HardHat, Shield, Zap, FileText, Hammer, Flame, Droplets, Utensils, Store } from "lucide-react";

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "construction" | "safety" | "utilities" | "custom";
  departments: string[];
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
    departments: ["Revenue", "Urban Development", "Commerce"],
    icon: Building2,
    features: ["Application form", "Document upload", "Fee collection", "Inspection scheduling"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "trade-license",
    name: "Trade License",
    description: "Permits for specific trade activities and commercial operations.",
    category: "business",
    departments: ["Revenue", "Commerce", "Urban Development"],
    icon: Store,
    features: ["Trade classification", "Zone compliance", "Annual renewal", "Fee schedule"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "building-permit",
    name: "Building Permit",
    description: "Construction and building permits with plan review and inspection workflows.",
    category: "construction",
    departments: ["Urban Development", "Public Works", "Housing"],
    icon: HardHat,
    features: ["Plan submission", "Multi-stage review", "Site inspections", "Compliance checks"],
    estimatedSetupTime: "8 min",
  },
  {
    id: "demolition-permit",
    name: "Demolition Permit",
    description: "Permits for demolition activities with safety and environmental checks.",
    category: "construction",
    departments: ["Public Works", "Urban Development", "Environment"],
    icon: Hammer,
    features: ["Safety assessment", "Environmental review", "Neighbor notification", "Timeline tracking"],
    estimatedSetupTime: "6 min",
  },
  {
    id: "fire-safety",
    name: "Fire Safety Certificate",
    description: "Fire safety compliance certification for buildings and commercial spaces.",
    category: "safety",
    departments: ["Public Safety", "Health", "Urban Development"],
    icon: Flame,
    features: ["Safety checklist", "Inspection scheduling", "Compliance scoring", "Certificate generation"],
    estimatedSetupTime: "5 min",
  },
  {
    id: "food-license",
    name: "Food Establishment License",
    description: "Health and safety permits for food service and preparation businesses.",
    category: "safety",
    departments: ["Health", "Revenue", "Commerce"],
    icon: Utensils,
    features: ["Health inspection", "Hygiene scoring", "Periodic renewal", "Violation tracking"],
    estimatedSetupTime: "6 min",
  },
  {
    id: "water-connection",
    name: "Water Connection",
    description: "New water supply connection applications and approvals.",
    category: "utilities",
    departments: ["Public Works", "Utilities", "Urban Development"],
    icon: Droplets,
    features: ["Connection request", "Site survey", "Meter installation", "Billing setup"],
    estimatedSetupTime: "4 min",
  },
  {
    id: "electricity-connection",
    name: "Electricity Connection",
    description: "Power supply connection permits for residential and commercial properties.",
    category: "utilities",
    departments: ["Utilities", "Public Works", "Urban Development"],
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

export const categoryColors: Record<string, string> = {
  business:     "bg-blue-100 text-blue-700",
  construction: "bg-orange-100 text-orange-700",
  safety:       "bg-red-100 text-red-700",
  utilities:    "bg-teal-100 text-teal-700",
  custom:       "bg-muted text-muted-foreground",
};

export const departmentColors: Record<string, string> = {
  "Revenue":          "bg-green-100 text-green-700",
  "Urban Development":"bg-purple-100 text-purple-700",
  "Commerce":         "bg-blue-100 text-blue-700",
  "Public Works":     "bg-orange-100 text-orange-700",
  "Housing":          "bg-pink-100 text-pink-700",
  "Environment":      "bg-emerald-100 text-emerald-700",
  "Public Safety":    "bg-red-100 text-red-700",
  "Health":           "bg-rose-100 text-rose-700",
  "Utilities":        "bg-teal-100 text-teal-700",
};

export const categoryIcons: Record<string, typeof Building2> = {
  business: Building2,
  construction: HardHat,
  safety: Shield,
  utilities: Zap,
  custom: FileText,
};

// All unique departments across all templates
export const allDepartments = [...new Set(serviceTemplates.flatMap((t) => t.departments))].sort();
