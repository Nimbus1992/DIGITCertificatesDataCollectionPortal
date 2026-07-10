import { useState } from "react";
import type { ImplementationConfig, IntegrationsConfig } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Info, Plus, Trash2 } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}


export default function StepIntegrations({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const intg = config.integrations;
  const [newName, setNewName] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");

  function update<K extends keyof IntegrationsConfig>(key: K, value: IntegrationsConfig[K]) {
    updateConfig("integrations", { ...intg, [key]: value });
  }

  function addCustom() {
    if (!newName.trim()) return;
    update("customIntegrations", [
      ...intg.customIntegrations,
      { name: newName.trim(), endpoint: newEndpoint.trim() },
    ]);
    setNewName("");
    setNewEndpoint("");
  }

  function removeCustom(index: number) {
    update("customIntegrations", intg.customIntegrations.filter((_, i) => i !== index));
  }

  const paymentGatewayValue = !intg.onlinePaymentEnabled
    ? "No (offline)"
    : intg.paymentGatewayPreference === "egov_choice"
    ? "Yes — eGov will choose"
    : intg.paymentGatewayPreference === "specify"
    ? `Yes — ${intg.paymentGatewayDetails ? intg.paymentGatewayDetails.slice(0, 60) + (intg.paymentGatewayDetails.length > 60 ? "…" : "") : "gateway specified"}`
    : "Yes";

  const integrationsSummaryItems = [
    { label: "SMS (Amazon SNS)", value: "Enabled (default)" },
    { label: "Email (Amazon SES)", value: "Enabled (default)" },
    { label: "Verifiable Credentials", value: "Enabled (default)" },
    { label: "Online Payments", value: paymentGatewayValue },
    {
      label: "Custom Integrations",
      value: intg.customIntegrations.length > 0
        ? intg.customIntegrations.map((ci) => ci.name)
        : ["None added"],
    },
  ];

  return (
    <StepWrapper
      step={4}
      title="Integrations"
      subtitle="Choose which external services your portal will connect to."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      summaryItems={integrationsSummaryItems}
      nextSectionLabel="Start Application Configuration"
    >
      <div className="space-y-8">

        {/* Messaging & Notifications — always-on defaults */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
            Messaging & Notifications
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            These services are provided by eGov and are enabled by default for all portals.
          </p>
          <div className="space-y-2">
            {[
              {
                icon: "💬",
                label: "SMS — Amazon SNS (Simple Notification Service)",
                detail: "Used by default to send SMS notifications to citizens and staff at each workflow stage.",
              },
              {
                icon: "📧",
                label: "Email — Amazon SES (Simple Email Service)",
                detail: "Used by default to send email notifications and application receipts.",
              },
              {
                icon: "📟",
                label: "USSD — Africa's Talking",
                detail: "Used by default to deliver USSD-based notifications and status updates for feature phone users.",
              },
            ].map((svc) => (
              <div key={svc.label} className="flex items-start gap-3 p-3.5 rounded-xl border border-green-200 bg-green-50">
                <span className="text-base mt-0.5 shrink-0">{svc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">{svc.label}</p>
                  <p className="text-xs text-green-700 mt-0.5">{svc.detail}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                  Default
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verifiable Credentials */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
            Verifiable Credentials
          </h3>
          <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
            <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed space-y-1">
              <p>
                <strong>Verifiable Credentials (VCs)</strong> are tamper-proof digital certificates issued to citizens — for example, a Business License issued as a VC can be instantly verified by any third party (a bank, landlord, or another government department) without calling your office.
              </p>
              <p>
                VCs follow the W3C open standard and can be stored in a citizen's digital wallet. They eliminate the need for physical certificates and manual verification.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-green-200 bg-green-50">
            <span className="text-base mt-0.5 shrink-0">🔏</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">Verifiable Credentials — Vault</p>
              <p className="text-xs text-green-700 mt-0.5">Used by default to issue and manage verifiable credentials for licences and certificates.</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
              Default
            </span>
          </div>
        </div>

        {/* Payments */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
            Payments
          </h3>
          <p className="text-sm font-medium text-slate-700 mb-3">
            Do you want to collect online payment through the portal?
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { val: true,  label: "Yes — collect payments online" },
              { val: false, label: "No — payments handled offline" },
            ].map(({ val, label }) => (
              <div
                key={String(val)}
                onClick={() => update("onlinePaymentEnabled", val)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  intg.onlinePaymentEnabled === val
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <p className={`text-sm font-medium ${intg.onlinePaymentEnabled === val ? "text-blue-800" : "text-slate-800"}`}>
                  {label}
                </p>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  intg.onlinePaymentEnabled === val ? "border-blue-500 bg-blue-500" : "border-slate-300"
                }`}>
                  {intg.onlinePaymentEnabled === val && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>

          {intg.onlinePaymentEnabled && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Do you have a preferred payment gateway?
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { val: "specify",    label: "Yes — I'll specify the gateway", desc: "You know which provider you'd like to use." },
                  { val: "egov_choice", label: "Let eGov choose for us",        desc: "Our team will recommend the best fit for your region and volume." },
                ].map(({ val, label, desc }) => (
                  <div
                    key={val}
                    onClick={() => update("paymentGatewayPreference", val as IntegrationsConfig["paymentGatewayPreference"])}
                    className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      intg.paymentGatewayPreference === val
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${intg.paymentGatewayPreference === val ? "text-blue-800" : "text-slate-800"}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                      intg.paymentGatewayPreference === val ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}>
                      {intg.paymentGatewayPreference === val && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>

              {intg.paymentGatewayPreference === "specify" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Payment gateway details
                  </label>
                  <textarea
                    rows={3}
                    value={intg.paymentGatewayDetails}
                    onChange={(e) => update("paymentGatewayDetails", e.target.value)}
                    placeholder="e.g. We use Razorpay. Account ID: rzp_live_xxxx. Contact: finance@city.gov"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Integrations */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1 pb-2 border-b border-slate-100">
            Other Integrations
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Add any other systems your portal needs to connect to (e.g. land records, treasury, state portals).
          </p>

          {intg.customIntegrations.length > 0 && (
            <div className="space-y-2 mb-3">
              {intg.customIntegrations.map((ci, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{ci.name}</p>
                    {ci.endpoint && <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">{ci.endpoint}</p>}
                  </div>
                  <button
                    onClick={() => removeCustom(i)}
                    className="shrink-0 text-slate-300 hover:text-red-500 transition-colors mt-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Integration Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. State Land Records"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Details <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={newEndpoint}
                onChange={(e) => setNewEndpoint(e.target.value)}
                placeholder="Describe the integration, what it does, or any relevant contact or reference."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-slate-400 resize-none"
              />
            </div>
            <button
              onClick={addCustom}
              disabled={!newName.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
              Add Integration
            </button>
          </div>
        </div>

      </div>
    </StepWrapper>
  );
}
