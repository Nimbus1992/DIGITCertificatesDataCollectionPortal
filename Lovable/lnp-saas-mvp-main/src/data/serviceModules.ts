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
}

export interface ServiceModule {
  id: string;
  name: string;
}

export const defaultModules: ServiceModule[] = [
  { id: "removal", name: "Removal Services" },
  { id: "emergency", name: "Emergency Requests" },
  { id: "equipment", name: "Equipment Allocation" },
  { id: "reporting", name: "Reporting" },
];

export const configTiles: ConfigTile[] = [
  {
    id: "forms",
    icon: FileText,
    title: "Service Application Forms",
    description: "Edit form fields, configure logic, and manage application data.",
    ctaLabel: "Edit Form",
    required: true,
  },
  {
    id: "roles",
    icon: Users,
    title: "Define Roles",
    description: "Manage roles and permissions for this module.",
    ctaLabel: "Manage Roles",
    required: true,
  },
  {
    id: "workflow",
    icon: GitBranch,
    title: "Define Process Flow",
    description: "Design workflows to define how applications move through stages.",
    ctaLabel: "Define Workflow",
    required: true,
  },
  {
    id: "checklists",
    icon: ClipboardCheck,
    title: "Create Checklists",
    description: "Create stage-based checklists for approvals.",
    ctaLabel: "Manage Checklists",
    required: false,
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Create Notifications",
    description: "Configure notifications for workflow events.",
    ctaLabel: "Manage Notifications",
    required: false,
  },
  {
    id: "documents",
    icon: FileType,
    title: "Document Design",
    description: "Design certificates, permits, and acknowledgement documents.",
    ctaLabel: "Design Documents",
    required: false,
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payment Setup",
    description: "Enable and configure payment collection for this module.",
    ctaLabel: "Setup Payments",
    required: false,
  },
  {
    id: "billing",
    icon: Calculator,
    title: "Billing / Calculator",
    description: "Configure fee calculation and billing rules.",
    ctaLabel: "Configure Billing",
    required: false,
  },
  {
    id: "plugins",
    icon: Puzzle,
    title: "Plugins / Extensions",
    description: "Add SLA tracking, escalation rules, audit logs, and more.",
    ctaLabel: "Manage Plugins",
    required: false,
  },
];
