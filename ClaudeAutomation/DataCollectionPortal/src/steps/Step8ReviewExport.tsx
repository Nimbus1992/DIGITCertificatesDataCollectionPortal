import { useState } from "react";
import type { ImplementationConfig } from "../types";
import { exportAsJson, exportAsPdf } from "../lib/exportUtils";
import { exportConfigToExcel } from "../lib/exportExcel";
import { saveConfig } from "../lib/supabase";
import {
  CheckCircle2, FileJson, FileText, FileSpreadsheet,
  Cloud, Pencil, ArrowLeft, Send, AlertCircle, Download,
  XCircle,
} from "lucide-react";

interface Props {
  config: ImplementationConfig;
  onBack: () => void;
  onGoToStep: (step: number) => void;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  accountId?: string;
}

function ReviewSection({
  title, onEdit, children,
}: {
  title: string; onEdit: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  );
}

function DR({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-500 w-48 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

function DRBool({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-500 w-48 shrink-0">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          value ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {value ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

function SubHeading({ text }: { text: string }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3 pb-1 border-t border-slate-100 mt-2 first:border-t-0 first:mt-0">
      {text}
    </p>
  );
}

function TagList({ items }: { items: string[] }) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {filtered.map((item, i) => (
        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
          {item}
        </span>
      ))}
    </div>
  );
}

function MiniTable({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <span className="text-xs text-slate-400">None configured</span>;
  return (
    <table className="w-full text-xs border-collapse mt-1">
      <thead>
        <tr className="bg-slate-50">
          {cols.map((c, i) => (
            <th key={i} className="text-left px-2 py-1.5 text-slate-500 font-semibold border-b border-slate-200">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
            {row.map((cell, j) => (
              <td key={j} className="px-2 py-1.5 text-slate-700 border-b border-slate-100">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AlwaysOn({ label, detail }: { label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
      <div>
        <span className="text-slate-800 font-medium">{label}</span>
        {detail && <span className="text-slate-500 text-xs ml-2">{detail}</span>}
      </div>
    </div>
  );
}

export default function Step8ReviewExport({
  config, onBack, onGoToStep, updateConfig, accountId,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [exporting, setExporting] = useState(false);

  const { account: a, branding: b, deployment: d, formConfig: f, roles, fees, paymentsNotifications: pn, integrations: integ, overall: oc, workflow: wf } = config;
  const sym = fees.currencySymbol || a.currencySymbol || "₹";

  // ── Completion checker grouped by section ────────────────────────────────────
  const requiredSections = [
    {
      step: 1,
      section: "Account Settings",
      fields: [
        { label: "Organisation Name", ok: !!a.organizationName.trim() },
        { label: "Admin Email", ok: !!a.adminEmail.trim() },
        { label: "Country", ok: !!a.country.trim() },
      ],
    },
    {
      step: 3,
      section: "Boundary",
      fields: [
        { label: "Hierarchy name", ok: !!d.hierarchyName.trim() },
        {
          label: "Hierarchy levels defined",
          ok: d.hierarchyLevels.length > 0 && d.hierarchyLevels.every((l) => l.name.trim()),
        },
      ],
    },
    {
      step: 5,
      section: "Overall Configuration",
      fields: [
        { label: "Categories configured", ok: oc.categories.length > 0 },
      ],
    },
    {
      step: 7,
      section: "Roles",
      fields: [
        {
          label: "Staff assigned to at least one role",
          ok: roles
            .filter((r) => r.id !== "citizen")
            .some((r) => (r.staffMembers?.length ?? 0) > 0 || r.staffEmails.length > 0),
        },
      ],
    },
    {
      step: 8,
      section: "Fees",
      fields: [
        {
          label: "Application fee configured",
          ok:
            fees.feeMode === "flat"
              ? (fees.flatFeeAmount ?? 0) > 0
              : fees.customFeeTable.length > 0,
        },
      ],
    },
    {
      step: 9,
      section: "Workflow",
      fields: [
        { label: "Workflow stages defined", ok: wf.stages.length > 0 },
      ],
    },
  ];

  const missingBySection = requiredSections.map((s) => ({
    ...s,
    missing: s.fields.filter((f) => !f.ok),
  })).filter((s) => s.missing.length > 0);

  const totalFields = requiredSections.flatMap((s) => s.fields).length;
  const doneFields  = requiredSections.flatMap((s) => s.fields).filter((f) => f.ok).length;
  const isComplete  = missingBySection.length === 0;

  // ── Supabase save ────────────────────────────────────────────────────────────
  const handleSaveToSupabase = async () => {
    setSaving(true);
    setSaveStatus("idle");
    const updated: ImplementationConfig = {
      ...config,
      metadata: { ...config.metadata, status: "submitted", updatedAt: new Date().toISOString() },
    };
    updateConfig("metadata", updated.metadata);
    const { error } = await saveConfig(updated, 13, accountId);
    setSaving(false);
    if (error) {
      setSaveStatus("error");
      setSaveMessage(`Save failed: ${error}`);
    } else {
      setSaveStatus("success");
      setSaveMessage("Configuration saved successfully to the database.");
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    await exportAsPdf(config);
    setExporting(false);
  };

  // ── Category deduplication for display ───────────────────────────────────────
  const visibleLevels = oc.categoryLevels ?? 2;
  const uniqueCategories = (() => {
    const seen = new Set<string>();
    return oc.categories.filter((c) => {
      const parts = [c.level1, c.level2, c.level3].slice(0, visibleLevels);
      const key = parts.map((v) => v.trim().toLowerCase()).join("\0");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // ── Workflow notifications (collected from all stages) ───────────────────────
  const wfNotifRows = wf.stages.flatMap((stage) =>
    stage.notifications.map((n) => [
      stage.name,
      n.event ?? stage.name,
      n.channel.toUpperCase(),
      n.recipient,
      n.subject,
    ])
  );

  // ── Custom fee table columns ─────────────────────────────────────────────────
  const feeTableCols =
    fees.customFeeTable.length > 0 ? Object.keys(fees.customFeeTable[0]) : [];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            Final Step
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Review & Export</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your configuration, then save it to the database or download a copy.
        </p>
      </div>

      {/* Completion checker */}
      <div
        className={`rounded-xl border p-5 mb-6 ${
          isComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${isComplete ? "text-green-800" : "text-amber-800"}`}>
            {isComplete
              ? "✓ All required fields complete"
              : `${doneFields}/${totalFields} required fields complete`}
          </p>
          <div className="w-32 bg-white rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${(doneFields / totalFields) * 100}%` }}
            />
          </div>
        </div>

        {isComplete ? (
          <p className="text-xs text-green-700">All required sections are complete. You can submit the configuration.</p>
        ) : (
          <div className="space-y-3">
            {missingBySection.map((sec) => (
              <div key={sec.section}>
                <button
                  onClick={() => onGoToStep(sec.step)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 mb-1 block"
                >
                  {sec.section} →
                </button>
                <div className="pl-3 space-y-1">
                  {sec.missing.map((field) => (
                    <div key={field.label} className="flex items-center gap-2 text-xs text-amber-700">
                      <XCircle size={12} className="text-amber-500 shrink-0" />
                      <span>{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Summary sections ─────────────────────────────────────────────────── */}
      <div className="space-y-4 mb-8">

        {/* 1. Account Profile */}
        <ReviewSection title="1. Account Settings" onEdit={() => onGoToStep(1)}>
          <DR label="Organisation Name" value={a.organizationName} />
          <DR label="Department" value={a.departmentName} />
          <DR label="Country" value={`${a.country}${a.stateProvince ? `, ${a.stateProvince}` : ""}`} />
          <DR label="Currency" value={`${a.currency} (${sym})`} />
          <DR label="Date Format" value={a.dateFormat} />
          <DR label="Financial Year Start" value={a.financialYearStart} />
          <DR label="Mobile Prefix" value={a.mobilePrefix} />
          <DR label="Admin Email" value={a.adminEmail} />
          <DR label="Admin Phone" value={a.adminPhone ? `${a.mobilePrefix} ${a.adminPhone}` : null} />
          <DR label="Domain" value={a.domainSlug ? `www.digitcertificates.com/${a.domainSlug}` : null} />
        </ReviewSection>

        {/* 2. Branding */}
        <ReviewSection title="2. Branding" onEdit={() => onGoToStep(2)}>
          <DR label="Portal Name" value={b.portalName} />
          <DR label="Tagline" value={b.portalTagline} />
          <DR label="Copyright" value={b.copyrightText} />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 w-48 shrink-0">Primary Colour</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: b.primaryColor }} />
              <span className="text-slate-800 font-medium">{b.primaryColor}</span>
            </div>
          </div>
          {b.logoUrl && b.logoUrl !== "__has_logo__" && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-slate-500 w-48 shrink-0">Logo</span>
              <img
                src={b.logoUrl}
                alt="Portal logo"
                className="h-12 object-contain border border-slate-100 rounded"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          {b.logoUrl === "__has_logo__" && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-slate-500 w-48 shrink-0">Logo</span>
              <span className="text-xs text-slate-500 italic">Logo saved (reload page to preview)</span>
            </div>
          )}
        </ReviewSection>

        {/* 3. Boundary */}
        <ReviewSection title="3. Boundary" onEdit={() => onGoToStep(3)}>
          <DR label="Hierarchy Name" value={d.hierarchyName} />
          {d.hierarchyLevels.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-slate-500 w-48 shrink-0">Hierarchy Levels</span>
              <div className="flex flex-wrap gap-1.5">
                {d.hierarchyLevels.map((lvl, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    L{i + 1}: {lvl.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {d.operatingLevel > 0 && d.hierarchyLevels[d.operatingLevel] && (
            <DR
              label="Operating Level"
              value={`L${d.operatingLevel + 1}: ${d.hierarchyLevels[d.operatingLevel]?.name ?? ""}`}
            />
          )}
          <DR label="Upload Method" value={d.uploadMethod || null} />
          {d.shapefileName && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-slate-500 w-48 shrink-0">Boundary Shapefile</span>
              {d.shapefileDataUrl ? (
                <a
                  href={d.shapefileDataUrl}
                  download={d.shapefileName}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-xs"
                >
                  <Download size={13} />
                  {d.shapefileName}
                </a>
              ) : (
                <span className="text-slate-700 font-medium text-xs">{d.shapefileName}</span>
              )}
            </div>
          )}
          {d.boundaryRows.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-slate-500 w-48 shrink-0">Boundary Rows</span>
              <span className="text-slate-700 font-medium">{d.boundaryRows.length} rows loaded</span>
            </div>
          )}
        </ReviewSection>

        {/* 4. Integrations */}
        <ReviewSection title="4. Integrations" onEdit={() => onGoToStep(4)}>
          <SubHeading text="Always-On (Platform Services)" />
          <AlwaysOn label="Messaging & Notifications" detail="Email, SMS, Push via mSeva" />
          <AlwaysOn label="Verifiable Credentials" detail="DIVOC-based credential issuance" />

          <SubHeading text="Configured Integrations" />
          <DRBool label="eSign" value={integ.eSignEnabled} />
          {integ.eSignEnabled && integ.eSignProvider && (
            <DR label="eSign Provider" value={integ.eSignProvider} />
          )}
          <DRBool label="DigiLocker" value={integ.digiLockerEnabled} />
          <DRBool label="GSTIN Verification" value={integ.gstinVerificationEnabled} />
          <DRBool label="Aadhaar OTP" value={integ.aadhaarOtpEnabled} />
          <DRBool label="Online Payment" value={integ.onlinePaymentEnabled} />
          {integ.onlinePaymentEnabled && integ.paymentGatewayPreference && (
            <DR label="Payment Gateway Preference" value={integ.paymentGatewayPreference} />
          )}
          {integ.onlinePaymentEnabled && integ.paymentGatewayDetails && (
            <DR label="Payment Gateway Details" value={integ.paymentGatewayDetails} />
          )}

          {integ.customIntegrations.length > 0 && (
            <>
              <SubHeading text="Custom Integrations" />
              <MiniTable
                cols={["Name", "Endpoint"]}
                rows={integ.customIntegrations.map((ci) => [ci.name, ci.endpoint])}
              />
            </>
          )}
        </ReviewSection>

        {/* 5. Overall Configuration */}
        <ReviewSection title="5. Overall Configuration" onEdit={() => onGoToStep(5)}>
          <SubHeading text="License Validity" />
          <DR label="Validity Mode" value={oc.licenseValidityMode === "fixed" ? "Fixed duration" : "Financial year"} />
          {oc.licenseValidityMode === "fixed" && (
            <DR label="Validity Duration" value={`${oc.licenseValidityMonths} month${oc.licenseValidityMonths !== 1 ? "s" : ""}`} />
          )}
          <DRBool label="Allow Past Years" value={oc.allowPastYears} />
          {oc.allowPastYears && (
            <DR label="Past Years Allowed" value={String(oc.pastYearsAllowed)} />
          )}

          <SubHeading text="ID Formats" />
          <DR label="Issuance ID Format" value={oc.issuanceIdFormat} />
          {!oc.licenseIdSameAsApplication && (
            <DR label="License ID Format" value={oc.licenseIdFormat} />
          )}
          <DR label="Renewal ID Format" value={oc.renewalIdFormat} />
          <DRBool label="License ID = Application ID" value={oc.licenseIdSameAsApplication} />

          <SubHeading text="Renewal" />
          <DRBool label="Renewal Enabled" value={oc.renewalEnabled} />
          {oc.renewalEnabled && (
            <>
              <DR
                label="Approval Mode"
                value={
                  oc.renewalApprovalMode === "auto_all"
                    ? "Auto-approve all renewals"
                    : oc.renewalApprovalMode === "auto_if_unchanged"
                    ? "Auto-approve if no changes"
                    : "Always run full workflow"
                }
              />
              <DR label="Trigger (days before expiry)" value={String(oc.renewalTriggerDays)} />
              <DR label="Grace Period (days)" value={String(oc.renewalGracePeriodDays)} />
            </>
          )}

          <SubHeading text="Category Hierarchy" />
          <DR label="Hierarchy Levels" value={String(oc.categoryLevels)} />
          <div className="flex items-start gap-3 text-sm">
            <span className="text-slate-500 w-48 shrink-0">Level Labels</span>
            <TagList items={oc.categoryLevelLabels.slice(0, oc.categoryLevels)} />
          </div>

          {uniqueCategories.length > 0 && (
            <>
              <p className="text-xs text-slate-500 mt-2">
                {uniqueCategories.length} categor{uniqueCategories.length === 1 ? "y" : "ies"} configured
              </p>
              <MiniTable
                cols={oc.categoryLevelLabels.slice(0, oc.categoryLevels)}
                rows={uniqueCategories.map((c) => [c.level1, c.level2, c.level3].slice(0, oc.categoryLevels))}
              />
            </>
          )}
        </ReviewSection>

        {/* 6. Application Form */}
        <ReviewSection title="6. Application Form" onEdit={() => onGoToStep(6)}>
          <SubHeading text="Identity" />
          <div className="flex items-start gap-3 text-sm">
            <span className="text-slate-500 w-48 shrink-0">Accepted ID Types</span>
            <TagList items={f.idTypes} />
          </div>
          <DRBool label="Declaration OTP (Mobile)" value={f.declarationMobileOtpEnabled} />

          <SubHeading text="Documents" />
          {f.documents.length === 0 ? (
            <span className="text-xs text-slate-400">No documents configured</span>
          ) : (
            <MiniTable
              cols={["Document", "Required", "Formats", "Sub-types"]}
              rows={f.documents.map((doc) => [
                doc.name,
                doc.required ? "Yes" : "No",
                doc.formats.join(", "),
                doc.hasDocTypeDropdown && doc.docTypes.length > 0
                  ? doc.docTypes.join(", ")
                  : "—",
              ])}
            />
          )}

          {f.customFields.length > 0 && (
            <>
              <SubHeading text="Custom Fields" />
              <MiniTable
                cols={["Field", "Section", "Type", "Required"]}
                rows={f.customFields.map((cf) => [
                  cf.name,
                  cf.subsectionName || cf.sectionId,
                  cf.fieldType,
                  cf.mandatory ? "Yes" : "No",
                ])}
              />
            </>
          )}
        </ReviewSection>

        {/* 7. Roles & Staff */}
        <ReviewSection title="7. Roles & Staff" onEdit={() => onGoToStep(7)}>
          {roles.map((role) => {
            const members = role.staffMembers ?? [];
            const emails  = role.staffEmails ?? [];
            const hasStaff = members.length > 0 || emails.length > 0;
            return (
              <div key={role.id}>
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-slate-500 w-48 shrink-0 font-medium">{role.name}</span>
                  {role.id === "citizen" ? (
                    <span className="text-slate-600 text-xs italic">Public (self-registration)</span>
                  ) : hasStaff ? (
                    <div className="flex flex-col gap-0.5">
                      {members.map((m, i) => (
                        <span key={i} className="text-slate-700 text-xs">
                          {m.name} — {m.email}
                        </span>
                      ))}
                      {emails.filter((e) => !members.find((m) => m.email === e)).map((e, i) => (
                        <span key={`e${i}`} className="text-slate-700 text-xs">{e}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">⚠ No staff assigned</span>
                  )}
                </div>
              </div>
            );
          })}
        </ReviewSection>

        {/* 8. Fees */}
        <ReviewSection title="8. Fees" onEdit={() => onGoToStep(8)}>
          <DR label="Currency" value={`${fees.currency} (${sym})`} />

          <SubHeading text="Application Fee" />
          <DR label="Fee Mode" value={fees.feeMode === "flat" ? "Flat" : "Custom logic"} />
          {fees.feeMode === "flat" ? (
            <DR label="Amount" value={`${sym}${(fees.flatFeeAmount ?? 0).toLocaleString()}`} />
          ) : (
            <>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-slate-500 w-48 shrink-0">Fee Fields</span>
                <TagList items={fees.customFeeFields} />
              </div>
              {fees.customFeeTable.length > 0 && (
                <MiniTable
                  cols={feeTableCols}
                  rows={fees.customFeeTable.map((row) => feeTableCols.map((c) => row[c] ?? ""))}
                />
              )}
            </>
          )}
          {fees.additionalFeeComponents.length > 0 && (
            <>
              <p className="text-xs text-slate-500 mt-1">Additional components:</p>
              <MiniTable
                cols={["Label", "Type", "Value"]}
                rows={fees.additionalFeeComponents.map((ac) => [
                  ac.label,
                  ac.type,
                  ac.type === "percentage" ? `${ac.value}%` : `${sym}${ac.value}`,
                ])}
              />
            </>
          )}

          {oc.renewalEnabled && (
            <>
              <SubHeading text="Renewal Fee" />
              <DR label="Fee Mode" value={fees.renewalFeeMode === "flat" ? "Flat" : "Custom logic"} />
              {fees.renewalFeeMode === "flat" ? (
                <DR label="Amount" value={`${sym}${(fees.renewalFlatFeeAmount ?? 0).toLocaleString()}`} />
              ) : (
                <>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-slate-500 w-48 shrink-0">Fee Fields</span>
                    <TagList items={fees.renewalCustomFeeFields} />
                  </div>
                  {fees.renewalCustomFeeTable.length > 0 && (
                    <MiniTable
                      cols={Object.keys(fees.renewalCustomFeeTable[0])}
                      rows={fees.renewalCustomFeeTable.map((row) =>
                        Object.keys(fees.renewalCustomFeeTable[0]).map((c) => row[c] ?? "")
                      )}
                    />
                  )}
                </>
              )}
              {fees.renewalAdditionalFeeComponents.length > 0 && (
                <MiniTable
                  cols={["Label", "Type", "Value"]}
                  rows={fees.renewalAdditionalFeeComponents.map((ac) => [
                    ac.label,
                    ac.type,
                    ac.type === "percentage" ? `${ac.value}%` : `${sym}${ac.value}`,
                  ])}
                />
              )}
            </>
          )}
        </ReviewSection>

        {/* 9. Workflow */}
        <ReviewSection title="9. Workflow" onEdit={() => onGoToStep(9)}>
          <SubHeading text="Issuance Workflow" />
          {wf.stages.length === 0 ? (
            <span className="text-xs text-amber-600">No stages configured</span>
          ) : (
            <MiniTable
              cols={["Stage", "Actor", "Actions", "SLA (hrs)"]}
              rows={wf.stages.map((s) => [
                s.name + (s.isStart ? " [Start]" : s.isEnd ? " [End]" : ""),
                s.actor,
                s.actions.map((a) => a.label).join(", ") || "—",
                s.slaHours === 0 ? "—" : String(s.slaHours),
              ])}
            />
          )}

          {/* Named checklists */}
          {(wf.checklists ?? []).length > 0 && (
            <>
              <SubHeading text="Checklists" />
              <div className="space-y-3 mt-1">
                {(wf.checklists ?? []).map((cl) => {
                  const stage = wf.stages.find((s) => s.id === cl.stageId);
                  return (
                    <div key={cl.id} className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        {cl.name}
                        {stage && (
                          <span className="text-slate-400 font-normal ml-2">({stage.name})</span>
                        )}
                      </p>
                      {cl.questions.length === 0 ? (
                        <span className="text-xs text-slate-400">No questions</span>
                      ) : (
                        <ul className="space-y-1">
                          {cl.questions.map((q, qi) => (
                            <li key={qi} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="text-slate-400">{qi + 1}.</span>
                              <span>{q.label}</span>
                              <span className="text-slate-400">({q.fieldType})</span>
                              {q.required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Fallback to flat checklistItems if no named checklists */}
          {(wf.checklists ?? []).length === 0 && wf.checklistItems.length > 0 && (
            <>
              <SubHeading text="Checklist Items" />
              <MiniTable
                cols={["Stage", "Item", "Type", "Required"]}
                rows={wf.checklistItems.map((ci) => {
                  const stage = wf.stages.find((s) => s.id === ci.stageId);
                  return [stage?.name ?? ci.stageId, ci.label, ci.fieldType, ci.required ? "Yes" : "No"];
                })}
              />
            </>
          )}

          {oc.renewalEnabled && (wf.renewalStages ?? []).length > 0 && (
            <>
              <SubHeading text="Renewal Workflow" />
              <MiniTable
                cols={["Stage", "Actor", "Actions", "SLA (hrs)"]}
                rows={(wf.renewalStages ?? []).map((s) => [
                  s.name + (s.isStart ? " [Start]" : s.isEnd ? " [End]" : ""),
                  s.actor,
                  s.actions.map((a) => a.label).join(", ") || "—",
                  s.slaHours === 0 ? "—" : String(s.slaHours),
                ])}
              />
            </>
          )}
        </ReviewSection>

        {/* 10. Notifications */}
        <ReviewSection title="10. Notifications" onEdit={() => onGoToStep(10)}>
          <SubHeading text="Payment Gateway" />
          <DR
            label="Gateway"
            value={pn.paymentGateway === "custom" ? pn.customGatewayName : pn.paymentGateway}
          />
          <DRBool label="Counter Payments" value={pn.counterPaymentsEnabled} />
          <DR label="Admin Email" value={pn.adminEmail} />
          <DR label="SMS Sender ID" value={pn.smsSenderId} />
          <div className="flex items-start gap-3 text-sm">
            <span className="text-slate-500 w-48 shrink-0">Notification Channels</span>
            <TagList
              items={Object.entries(pn.notificationChannels)
                .filter(([, v]) => v)
                .map(([k]) => k.toUpperCase())}
            />
          </div>

          {pn.notificationTemplates.length > 0 && (
            <>
              <SubHeading text="Notification Templates" />
              <MiniTable
                cols={["Event", "Channel", "Recipient", "Subject"]}
                rows={pn.notificationTemplates.map((t) => [
                  t.event,
                  t.channel.toUpperCase(),
                  t.recipient,
                  t.subject,
                ])}
              />
            </>
          )}

          {wfNotifRows.length > 0 && (
            <>
              <SubHeading text="Workflow Notifications" />
              <MiniTable
                cols={["Stage", "Event", "Channel", "Recipient", "Message"]}
                rows={wfNotifRows}
              />
            </>
          )}
        </ReviewSection>
      </div>

      {/* Export / Save actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-800 mb-1">Export & Save</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => exportAsJson(config)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-700"
          >
            <FileJson size={18} className="text-blue-500" />
            Download JSON
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <FileText size={18} className="text-purple-500" />
            {exporting ? "Generating..." : "Download PDF"}
          </button>

          <button
            onClick={() => exportConfigToExcel(config)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-sm font-medium text-slate-700"
          >
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Export as Excel
          </button>

          <button
            onClick={handleSaveToSupabase}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Cloud size={16} className="animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit to Database
              </>
            )}
          </button>
        </div>

        {saveStatus === "success" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <CheckCircle2 size={16} />
            {saveMessage}
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} />
            {saveMessage}
          </div>
        )}
      </div>

      {/* Back */}
      <div className="flex mt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}
