import {
  FileText,
  Users,
  GitBranch,
  ClipboardCheck,
  Bell,
  FileType,
  CreditCard,
  Calculator,
  Puzzle,
  type LucideIcon,
} from "lucide-react";

export interface ConfigTile {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  required: boolean;
  group: "core" | "additional";
}

export interface ServiceModule {
  id: string;
  name: string;
}

export const defaultModules: ServiceModule[] = [
  { id: "removal", name: "Removal Applications" },
  { id: "emergency", name: "Emergency Requests" },
  { id: "equipment", name: "Equipment Allocation" },
  { id: "reporting", name: "Reporting" },
];

export const configTiles: ConfigTile[] = [
  {
     id: "forms",
     icon: FileText,
     title: "Forms",
     description: "Design workflows to define how forms and data move through stages.",
     ctaLabel: "Edit Form",
    required: true,
    group: "core",
  },
  {
    id: "roles",
    icon: Users,
    title: "Define Roles",
    description: "Manage roles and permissions for this flow.",
    ctaLabel: "Manage Roles",
    required: true,
    group: "core",
  },
  {
    id: "workflow",
    icon: GitBranch,
    title: "Define Process Flow",
    description: "Design workflows to define how applications move through stages.",
    ctaLabel: "Define Workflow",
    required: true,
    group: "core",
  },
  {
    id: "checklists",
    icon: ClipboardCheck,
    title: "Create Checklists",
    description: "Create stage-based checklists for approvals.",
    ctaLabel: "Manage Checklists",
    required: false,
    group: "additional",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Create Notifications",
    description: "Configure notifications for workflow events.",
    ctaLabel: "Manage Notifications",
    required: false,
    group: "additional",
  },
  {
    id: "documents",
    icon: FileType,
    title: "Document Design",
    description: "Design certificates, permits, and acknowledgement documents.",
    ctaLabel: "Design Documents",
    required: false,
    group: "additional",
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payment Setup",
    description: "Enable and configure payment collection for this flow.",
    ctaLabel: "Setup Payments",
    required: false,
    group: "additional",
  },
  {
    id: "billing",
    icon: Calculator,
    title: "Billing / Calculator",
    description: "Configure fee calculation and billing rules.",
    ctaLabel: "Configure Billing",
    required: false,
    group: "additional",
  },
  {
    id: "plugins",
    icon: Puzzle,
    title: "Plugins / Extensions",
    description: "Add SLA tracking, escalation rules, audit logs, and more.",
    ctaLabel: "Manage Plugins",
    required: false,
    group: "additional",
  },
];
