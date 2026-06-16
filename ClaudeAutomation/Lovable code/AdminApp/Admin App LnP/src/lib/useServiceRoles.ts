import { useEffect } from "react";
import { useModuleState } from "./moduleStorage";
import { TRADE_ROLES } from "@/data/tradeLicenseTemplate";
import { RENEWAL_ROLES, isRenewalModule } from "@/data/renewalTemplate";

export interface ServiceRoleRecord {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
}

export const PERMISSIONS: { id: string; label: string }[] = [
  { id: "create_application", label: "Create Application" },
  { id: "edit_application",   label: "Edit Application" },
  { id: "view_application",   label: "View Application" },
  { id: "fill_checklist",     label: "Fill Checklist" },
  { id: "edit_checklist",     label: "Edit Checklist" },
  { id: "view_checklist",     label: "View Checklist" },
];

const CANONICAL_PERMISSION_IDS = new Set(PERMISSIONS.map((p) => p.id));

export const permissionLabel = (id: string) =>
  PERMISSIONS.find((p) => p.id === id)?.label ?? id;

export const buildDefaultRoles = (moduleName = "Issuance"): ServiceRoleRecord[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_ROLES : TRADE_ROLES;
  return src.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isDefault: r.isDefault,
    permissions: [...r.permissions],
  }));
};

/**
 * Per-module role list. A one-time migration moves any legacy
 * `roles:<serviceId>:__shared__` payload into the active module key so users
 * keep custom roles created before modules had separate role lists.
 *
 * Also strips legacy permission ids that aren't in the canonical PERMISSIONS
 * list (older seeds wrote things like `edit_draft`, `approve_scrutiny` that
 * no longer map to anything meaningful in the UI).
 */
export function useServiceRoles(serviceId: string, moduleName = "Issuance") {
  // Lazy migration: copy __shared__ payload into per-module key once.
  if (typeof window !== "undefined" && serviceId) {
    try {
      const moduleKey = `roles:${serviceId}:${moduleName}`;
      const sharedKey = `roles:${serviceId}:__shared__`;
      if (!localStorage.getItem(moduleKey)) {
        const legacy = localStorage.getItem(sharedKey);
        if (legacy) localStorage.setItem(moduleKey, legacy);
      }
    } catch { /* ignore */ }
  }

  const [roles, setRoles] = useModuleState<ServiceRoleRecord[]>(
    "roles", serviceId, moduleName, () => buildDefaultRoles(moduleName),
  );

  // Strip non-canonical permission ids from any persisted data (one-pass).
  useEffect(() => {
    let dirty = false;
    const cleaned = roles.map((r) => {
      const filtered = r.permissions.filter((p) => CANONICAL_PERMISSION_IDS.has(p));
      if (filtered.length !== r.permissions.length) dirty = true;
      return { ...r, permissions: filtered };
    });
    if (dirty) setRoles(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [roles, setRoles] as const;
}

/** Map legacy / camelCase role ids to current canonical ids. */
const LEGACY_ROLE_ID_MAP: Record<string, string> = {
  documentVerifier: "document_verifier",
  fieldInspector: "field_inspector",
};
export const canonicalRoleId = (id: string) => LEGACY_ROLE_ID_MAP[id] ?? id;

/** Citizen-side persona: any role that can create an application. */
export const isCitizenRole = (r: { permissions: string[] }) =>
  r.permissions.includes("create_application");
