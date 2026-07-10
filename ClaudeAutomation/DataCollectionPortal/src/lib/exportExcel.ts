import * as XLSX from "xlsx";
import type { AccountRecord } from "./supabase";

export function exportAccountToExcel(account: AccountRecord) {
  exportAccountsToExcel([account]);
}

export function exportAccountsToExcel(accounts: AccountRecord[]) {
  const rows = accounts.map((acc) => {
    const cfg = acc.config_data;
    return {
      "Org Name": acc.org_name,
      "Department": acc.department_name ?? "",
      "Country": acc.country ?? "",
      "Super User Email": acc.super_user_email ?? "",
      "Status": acc.status,
      "Step": acc.current_step,
      "Admin Verified": acc.admin_verified ? "Yes" : "No",
      "Admin Notes": acc.admin_notes ?? "",
      "Created At": acc.created_at ? new Date(acc.created_at).toLocaleString() : "",
      "Updated At": acc.updated_at ? new Date(acc.updated_at).toLocaleString() : "",
      // Account
      "State/Province": cfg?.account?.stateProvince ?? "",
      "Mobile Prefix": cfg?.account?.mobilePrefix ?? "",
      "Currency": cfg?.account?.currency ?? "",
      "Language": cfg?.account?.language ?? "",
      "Date Format": cfg?.account?.dateFormat ?? "",
      "Financial Year Start": cfg?.account?.financialYearStart ?? "",
      "Admin Email": cfg?.account?.adminEmail ?? "",
      "Admin Phone": cfg?.account?.adminPhone ?? "",
      "Domain Slug": cfg?.account?.domainSlug ?? "",
      // Branding
      "Portal Name": cfg?.branding?.portalName ?? "",
      "Portal Tagline": cfg?.branding?.portalTagline ?? "",
      "Primary Color": cfg?.branding?.primaryColor ?? "",
      // Deployment
      "Availability Scope": cfg?.deployment?.availabilityScope ?? "",
      "Deployment Areas": cfg?.deployment?.areas?.map((a) => a.city).filter(Boolean).join(", ") ?? "",
      // Form Config
      "ID Types": cfg?.formConfig?.idTypes?.join(", ") ?? "",
      "Trade Categories": cfg?.formConfig?.tradeCategories?.map((t) => t.type).join(", ") ?? "",
      // Fees
      "Application Fee": cfg?.fees?.applicationFee ?? "",
      "Hazard Surcharge": cfg?.fees?.hazardSurcharge ?? "",
      // Payments
      "Payment Gateway": cfg?.paymentsNotifications?.paymentGateway ?? "",
      "Notification Channels": [
        cfg?.paymentsNotifications?.notificationChannels?.email && "Email",
        cfg?.paymentsNotifications?.notificationChannels?.sms && "SMS",
        cfg?.paymentsNotifications?.notificationChannels?.push && "Push",
      ].filter(Boolean).join(", "),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Accounts");

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  const date = new Date().toISOString().slice(0, 10);
  const label = accounts.length === 1
    ? accounts[0].org_name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)
    : "All_Accounts";
  XLSX.writeFile(wb, `LnP_${label}_${date}.xlsx`);
}
