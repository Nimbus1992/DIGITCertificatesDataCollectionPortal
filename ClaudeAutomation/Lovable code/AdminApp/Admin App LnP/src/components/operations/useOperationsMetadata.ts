import { useMemo } from "react";
import type { ServiceItem } from "@/contexts/OnboardingContext";

export interface WorkflowStageMeta {
  id: string;
  name: string;
  slaHours: number;
}

export interface OperationsMetadata {
  serviceName: string;
  status: "draft" | "published" | "live";
  hasCategories: boolean;
  hasSubcategories: boolean;
  categories: string[];
  subcategories: { name: string; parent: string }[];
  hasRenewals: boolean;
  renewalByCategory: boolean;
  hasGeography: boolean;
  zones: string[];
  hasSLA: boolean;
  workflowStages: WorkflowStageMeta[];
}

const DEFAULT_STAGES: WorkflowStageMeta[] = [
  { id: "submission", name: "Submission", slaHours: 2 },
  { id: "verification", name: "Document Verification", slaHours: 24 },
  { id: "inspection", name: "Field Inspection", slaHours: 72 },
  { id: "approval", name: "Approval", slaHours: 48 },
  { id: "issuance", name: "Issuance", slaHours: 6 },
];

export function useOperationsMetadata(service: ServiceItem | undefined): OperationsMetadata {
  return useMemo(() => {
    const setup = service?.templateSetup;
    const renewal = service?.renewalPolicy;
    const categories = setup?.categoriesList ?? [];
    const subcategories = setup?.subcategoriesList ?? [];
    const hasCategories = !!setup?.hasCategories && categories.length > 0;
    const hasSubcategories = !!setup?.hasSubcategories && subcategories.length > 0;
    const hasRenewals = !!renewal && renewal.globalMonths > 0;
    const renewalByCategory = !!renewal && renewal.mode !== "global";

    const dep = service?.deployment;
    const hasGeography =
      !!dep && dep.availabilityScope !== "entire_state" && (dep.selectedItems?.length ?? 0) > 0;
    const zones = dep?.selectedItems ?? [];

    return {
      serviceName: service?.name ?? "Service",
      status: service?.isLive ? "live" : service?.isPublished ? "published" : "draft",
      hasCategories,
      hasSubcategories,
      categories,
      subcategories,
      hasRenewals,
      renewalByCategory,
      hasGeography,
      zones,
      hasSLA: true,
      workflowStages: DEFAULT_STAGES,
    };
  }, [service]);
}
