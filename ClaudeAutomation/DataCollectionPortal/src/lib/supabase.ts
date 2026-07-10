import { createClient } from "@supabase/supabase-js";
import type { ImplementationConfig } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface AccountRecord {
  id: string;
  org_name: string;
  department_name: string | null;
  country: string | null;
  super_user_email: string | null;
  super_user_emails: string[] | null;
  status: string;
  current_step: number;
  admin_verified: boolean;
  admin_notes: string | null;
  updated_at: string;
  created_at: string;
  config_data: ImplementationConfig;
}

// ── Admin: fetch all accounts ────────────────────────────────────────────────
export async function getAllAccounts(): Promise<{ data: AccountRecord[]; error: string | null }> {
  if (!supabase) return { data: [], error: null };
  const { data, error } = await supabase
    .from("implementation_configs")
    .select("id,org_name,department_name,country,super_user_email,super_user_emails,status,current_step,admin_verified,admin_notes,updated_at,created_at,config_data")
    .order("updated_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as AccountRecord[], error: null };
}

// ── Admin: create a new account tile ────────────────────────────────────────
export async function createAccountTile(
  orgName: string,
  departmentName: string,
  country: string,
  superUserEmails: string[],
  seedConfig: ImplementationConfig,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured." };
  const emails = superUserEmails.map((e) => e.toLowerCase().trim()).filter(Boolean);
  const { error } = await supabase.from("implementation_configs").insert({
    org_name: orgName,
    department_name: departmentName || null,
    country: country || null,
    super_user_email: emails[0] ?? null,
    super_user_emails: emails,
    config_data: { ...seedConfig, account: { ...seedConfig.account, organizationName: orgName, departmentName, country } },
    status: "draft",
    current_step: 1,
    admin_verified: false,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ── Admin: update super users list ──────────────────────────────────────────
export async function updateSuperUsers(
  orgName: string,
  emails: string[],
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured." };
  const clean = emails.map((e) => e.toLowerCase().trim()).filter(Boolean);
  const { error } = await supabase
    .from("implementation_configs")
    .update({
      super_user_emails: clean,
      super_user_email: clean[0] ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("org_name", orgName);
  if (error) return { error: error.message };
  return { error: null };
}

// ── Admin: verify an account ─────────────────────────────────────────────────
export async function verifyAccount(
  orgName: string,
  verified: boolean,
  notes: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured." };
  const { error } = await supabase
    .from("implementation_configs")
    .update({ admin_verified: verified, admin_notes: notes, updated_at: new Date().toISOString() })
    .eq("org_name", orgName);
  if (error) return { error: error.message };
  return { error: null };
}

// ── Super user: find account by email ───────────────────────────────────────
export async function getAccountByEmail(
  email: string,
): Promise<{ data: AccountRecord | null; error: string | null }> {
  if (!supabase) return { data: null, error: "Supabase not configured." };
  const normalised = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from("implementation_configs")
    .select("*")
    .contains("super_user_emails", [normalised])
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return { data: null, error: "No account found for this email." };
    return { data: null, error: error.message };
  }
  return { data: data as AccountRecord, error: null };
}

// ── Save / update config ─────────────────────────────────────────────────────
export async function saveConfig(
  config: ImplementationConfig,
  currentStep: number,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase not configured." };

  const configToSave = {
    ...config,
    account: { ...config.account, logoDataUrl: config.account.logoDataUrl ? "__has_logo__" : "" },
    branding: {
      ...config.branding,
      logoUrl: config.branding.logoUrl?.startsWith("data:") ? "__has_logo__" : config.branding.logoUrl,
    },
    metadata: { ...config.metadata, lastStep: currentStep },
  };

  const { error } = await supabase.from("implementation_configs").upsert(
    {
      org_name: config.account.organizationName || "unnamed",
      department_name: config.account.departmentName || null,
      country: config.account.country || null,
      config_data: configToSave,
      status: config.metadata.status,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "org_name" },
  );

  if (error) {
    if (error.message.includes("schema cache") || error.code === "PGRST205")
      return { error: "Table not found — run setup SQL in Supabase." };
    return { error: error.message };
  }
  return { error: null };
}

// ── Legacy: used by welcome page ─────────────────────────────────────────────
export type DraftSummary = AccountRecord;
export async function getDrafts() { return getAllAccounts(); }
