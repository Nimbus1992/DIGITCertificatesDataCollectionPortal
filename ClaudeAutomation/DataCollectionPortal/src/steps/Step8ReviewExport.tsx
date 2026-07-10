import { useState } from "react";
import type { ImplementationConfig } from "../types";
import { exportAsJson, exportAsPdf } from "../lib/exportUtils";
import { saveConfig } from "../lib/supabase";
import {
  CheckCircle2, FileJson, FileText,
  Cloud, Pencil, ArrowLeft, Send
} from "lucide-react";

interface Props {
  config: ImplementationConfig;
  onBack: () => void;
  onGoToStep: (step: number) => void;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
}

function Section({
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

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return value ? (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-500 w-44 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  ) : null;
}

export default function Step8ReviewExport({ config, onBack, onGoToStep, updateConfig }: Props) {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [exporting, setExporting] = useState(false);

  const { account: a, branding: b, deployment: d, formConfig: f, roles, fees, paymentsNotifications: pn } = config;
  const sym = fees.currencySymbol;

  const handleSaveToSupabase = async () => {
    setSaving(true);
    setSaveStatus("idle");
    const updated: ImplementationConfig = {
      ...config,
      metadata: { ...config.metadata, status: "submitted", updatedAt: new Date().toISOString() },
    };
    updateConfig("metadata", updated.metadata);

    const { error } = await saveConfig(updated, 8);
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

  const completionChecks = [
    { label: "Organisation name entered", ok: !!a.organizationName.trim() },
    { label: "Admin email entered", ok: !!a.adminEmail.trim() },
    { label: "Deployment area configured", ok: d.availabilityScope === "entire_state" || d.areas.some((ar) => ar.city.trim()) },
    { label: "Trade categories set", ok: f.tradeCategories.some((c) => c.type.trim()) },
    { label: "Staff assigned to key roles", ok: roles.filter((r) => r.id !== "citizen").some((r) => r.staffEmails.length > 0) },
    { label: "Application fee set", ok: fees.applicationFee > 0 },
  ];

  const completionScore = completionChecks.filter((c) => c.ok).length;
  const isComplete = completionScore === completionChecks.length;

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

      {/* Completion checklist */}
      <div className={`rounded-xl border p-5 mb-6 ${isComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-sm font-semibold ${isComplete ? "text-green-800" : "text-amber-800"}`}>
            {isComplete ? "✓ Configuration complete" : `${completionScore}/${completionChecks.length} required fields complete`}
          </p>
          <div className="w-32 bg-white rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${(completionScore / completionChecks.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {completionChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-xs">
              <CheckCircle2
                size={14}
                className={check.ok ? "text-green-500" : "text-slate-300"}
              />
              <span className={check.ok ? "text-slate-700" : "text-slate-400"}>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary sections */}
      <div className="space-y-4 mb-8">
        <Section title="1. Account Profile" onEdit={() => onGoToStep(1)}>
          <Row label="Account Name" value={a.organizationName} />
          <Row label="Department" value={a.departmentName} />
          <Row label="Country" value={`${a.country}${a.stateProvince ? `, ${a.stateProvince}` : ""}`} />
          <Row label="Currency" value={`${a.currency} (${sym})`} />
          <Row label="Language" value={a.language} />
          <Row label="Mobile Prefix" value={a.mobilePrefix} />
          <Row label="Admin Email" value={a.adminEmail} />
          <Row label="Admin Phone" value={a.adminPhone ? `${a.mobilePrefix} ${a.adminPhone}` : null} />
          <Row label="Domain" value={a.domainSlug ? `www.digitcertificates.com/${a.domainSlug}` : null} />
        </Section>

        <Section title="2. Branding"onEdit={() => onGoToStep(2)}>
          <Row label="Portal Name" value={b.portalName} />
          <Row label="Tagline" value={b.portalTagline} />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 w-44 shrink-0">Primary Colour</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: b.primaryColor }} />
              <span className="text-slate-800 font-medium">{b.primaryColor}</span>
            </div>
          </div>
        </Section>

        <Section title="3. Deployment"onEdit={() => onGoToStep(3)}>
          <Row label="Scope" value={d.availabilityScope.replace("_", " ")} />
          {d.availabilityScope !== "entire_state" &&
            d.areas
              .filter((ar) => ar.city.trim())
              .map((ar, i) => (
                <Row
                  key={i}
                  label={i === 0 ? "Areas" : ""}
                  value={`${ar.city}${ar.zones.filter(Boolean).length > 0 ? ` — ${ar.zones.filter(Boolean).join(", ")}` : ""}`}
                />
              ))}
        </Section>

        <Section title="4. Application Form"onEdit={() => onGoToStep(4)}>
          <Row label="ID Types" value={f.idTypes.join(", ")} />
          <Row label="Trade Categories" value={f.tradeCategories.map((c) => c.type).filter(Boolean).join(", ")} />
          <Row
            label="Required Documents"
            value={f.documents.filter((d) => d.required).map((d) => d.name).join(", ")}
          />
        </Section>

        <Section title="5. Roles & Staff"onEdit={() => onGoToStep(5)}>
          {roles.map((role) => (
            <Row
              key={role.id}
              label={role.name}
              value={
                role.id === "citizen"
                  ? "Public (self-registration)"
                  : role.staffEmails.length > 0
                  ? role.staffEmails.join(", ")
                  : "⚠ No staff assigned"
              }
            />
          ))}
        </Section>

        <Section title="6. Fees"onEdit={() => onGoToStep(6)}>
          <Row label="Application Fee" value={`${sym}${fees.applicationFee.toLocaleString()}`} />
          {fees.inspectionFeeSlabs.map((s, i) => (
            <Row key={i} label={`Inspection (${s.label || `Slab ${i + 1}`})`} value={`${sym}${s.amount.toLocaleString()}`} />
          ))}
          <Row label="Hazard Surcharge" value={`${sym}${fees.hazardSurcharge.toLocaleString()}`} />
          <Row label="License Fee Rate" value={`${sym}${fees.licenseFeeRatePerSqFt} per sq ft`} />
        </Section>

        <Section title="7. Payments & Notifications"onEdit={() => onGoToStep(7)}>
          <Row
            label="Payment Gateway"
            value={pn.paymentGateway === "custom" ? pn.customGatewayName : pn.paymentGateway}
          />
          <Row label="Counter Payments" value={pn.counterPaymentsEnabled ? "Enabled" : "Disabled"} />
          <Row
            label="Notification Channels"
            value={Object.entries(pn.notificationChannels).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(", ") || "None"}
          />
          <Row label="Admin Email" value={pn.adminEmail} />
        </Section>
      </div>

      {/* Export / Save actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-800 mb-1">Export & Save</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Back button */}
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
