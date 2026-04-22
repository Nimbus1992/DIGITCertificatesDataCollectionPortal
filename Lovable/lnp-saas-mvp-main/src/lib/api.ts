import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// ── Input types ────────────────────────────────────────────

export interface OrgData {
  name: string;
  country?: string;
  department?: string;
  language?: string;
  logoUrl?: string;
  themeColor?: string;
}

export interface ServiceData {
  name: string;
  templateId: string;
  approvalLevel: string;
  status: string;
  authMethod: string;
}

export interface DeploymentData {
  availabilityScope: string;
  selectedItems: string[];
}

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type LoadedUserData = {
  org: Tables<"organizations">;
  /** All services for the org, ordered oldest-first. */
  services: Tables<"services">[];
  /** Most recent service (last in services[]); null if org has no services yet. */
  service: Tables<"services"> | null;
  teamMembers: Tables<"team_members">[];
  deployment: Tables<"service_deployment"> | null;
};

// ── Organization ───────────────────────────────────────────

/** Upserts the organization for the current user and returns its id. */
export async function saveOrganization(userId: string, data: OrgData): Promise<string> {
  // ── Pre-flight validation ─────────────────────────────────────────────────
  // Mirrors the DB CHECK constraint so the error surfaces before any network
  // call. Catches null, undefined, "", and whitespace-only values like "   ".
  const trimmedName = (data.name ?? "").trim();
  if (!trimmedName) {
    throw new Error("Organization name is required and cannot be blank.");
  }
  // Persist the trimmed value so " City A " is stored as "City A".
  data = { ...data, name: trimmedName };
  // ─────────────────────────────────────────────────────────────────────────

  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("organizations")
      .update({
        name: data.name,
        country: data.country ?? null,
        department: data.department ?? null,
        language: data.language ?? null,
        logo_url: data.logoUrl ?? null,
        theme_color: data.themeColor ?? null,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("organizations")
    .insert({
      user_id: userId,
      name: data.name,
      country: data.country ?? null,
      department: data.department ?? null,
      language: data.language ?? null,
      logo_url: data.logoUrl ?? null,
      theme_color: data.themeColor ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

// ── Service ────────────────────────────────────────────────

/** Inserts or updates a service and returns its id. */
export async function saveService(
  organizationId: string,
  data: ServiceData,
  existingServiceId?: string
): Promise<string> {
  if (existingServiceId) {
    const { error } = await supabase
      .from("services")
      .update({
        name: data.name,
        template_id: data.templateId,
        approval_level: data.approvalLevel,
        status: data.status,
        auth_method: data.authMethod,
      })
      .eq("id", existingServiceId);
    if (error) throw error;
    return existingServiceId;
  }

  const { data: created, error } = await supabase
    .from("services")
    .insert({
      organization_id: organizationId,
      name: data.name,
      template_id: data.templateId,
      approval_level: data.approvalLevel,
      status: data.status,
      auth_method: data.authMethod,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

/** Updates only the status field of a service. */
export async function updateServiceStatus(serviceId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", serviceId);
  if (error) throw error;
}

// ── Deployment ─────────────────────────────────────────────

/** Upserts deployment config for a service (one-to-one). */
export async function saveDeployment(serviceId: string, data: DeploymentData): Promise<void> {
  const { error } = await supabase
    .from("service_deployment")
    .upsert(
      {
        service_id: serviceId,
        availability_scope: data.availabilityScope,
        selected_items: data.selectedItems,
      },
      { onConflict: "service_id" }
    );
  if (error) throw error;
}

// ── Team members ───────────────────────────────────────────

/** Replaces all team members for an organization. */
export async function saveTeamMembers(
  organizationId: string,
  members: TeamMemberData[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("organization_id", organizationId);
  if (deleteError) throw deleteError;

  if (members.length === 0) return;

  const { error } = await supabase.from("team_members").insert(
    members.map((m) => ({
      organization_id: organizationId,
      name: m.name,
      email: m.email,
      role: m.role,
    }))
  );
  if (error) throw error;
}

// ── Service configs (forms / roles / notifications / etc.) ─

/** Upserts a config blob for a service module + type. */
export async function saveServiceConfig(
  serviceId: string,
  moduleName: string,
  configType: string,
  configData: unknown
): Promise<void> {
  const { error } = await supabase
    .from("service_configs")
    .upsert(
      {
        service_id: serviceId,
        module_name: moduleName,
        config_type: configType,
        config_data: configData as import("@/integrations/supabase/types").Json,
      },
      { onConflict: "service_id,module_name,config_type" }
    );
  if (error) throw error;
}

// ── Org ↔ Template link verification ──────────────────────

/**
 * Confirms a service record exists, belongs to the current user's org,
 * and has a non-empty template_id.  Returns the service row on success,
 * null if verification fails (unowned, missing, or deleted).
 *
 * Called by ServiceConfig on mount before rendering any sensitive config.
 */
export async function verifyOrgTemplateLink(
  serviceId: string,
  orgId: string
): Promise<Tables<"services"> | null> {
  // Supabase RLS already prevents cross-org reads, but we also filter
  // explicitly so the function is safe even if RLS is misconfigured.
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("organization_id", orgId)
    .not("template_id", "is", null)
    .maybeSingle();

  if (error) {
    console.error("[verifyOrgTemplateLink]", error.message);
    return null;
  }
  return data ?? null;
}

// ── Services list ──────────────────────────────────────────

/** Returns all services for an org, ordered oldest-first. */
export async function fetchServicesForOrg(orgId: string): Promise<Tables<"services">[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ── Load all data for a returning user ─────────────────────

/** Returns the full data set for a user, or null if they have no org yet. */
export async function loadUserData(userId: string): Promise<LoadedUserData | null> {
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!org) return null;

  // Load ALL services for the org (oldest first) so the dashboard can show them all.
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: true });

  const services = allServices ?? [];
  // Most recent service — used for single-service wizard compat.
  const latestService = services.length > 0 ? services[services.length - 1] : null;

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*")
    .eq("organization_id", org.id);

  let deployment: Tables<"service_deployment"> | null = null;
  if (latestService) {
    const { data: dep } = await supabase
      .from("service_deployment")
      .select("*")
      .eq("service_id", latestService.id)
      .maybeSingle();
    deployment = dep ?? null;
  }

  return {
    org,
    services,
    service: latestService,
    teamMembers: teamMembers ?? [],
    deployment,
  };
}
