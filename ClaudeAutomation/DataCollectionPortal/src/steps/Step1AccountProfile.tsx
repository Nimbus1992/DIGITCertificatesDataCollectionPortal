import { useState } from "react";
import type { ImplementationConfig, AccountProfile } from "../types";
import {
  COUNTRY_OPTIONS, CURRENCY_OPTIONS,
  MOBILE_PREFIX_OPTIONS, COUNTRY_TO_PREFIX,
} from "../defaults";
import { StepWrapper } from "./StepWrapper";
import { Info } from "lucide-react";

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

function Field({
  label, required, children, hint,
}: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{" "}
        {required
          ? <span className="text-red-500">*</span>
          : <span className="text-slate-400 font-normal text-xs">(optional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

const DOMAIN_BASE = "www.digitcertificates.com/";

export default function Step1AccountProfile({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof AccountProfile, string>>>({});
  const a = config.account;

  const set = (field: keyof AccountProfile, value: string) => {
    updateConfig("account", { ...a, [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  // Auto-set mobile prefix when country changes
  const handleCountryChange = (country: string) => {
    const prefix = COUNTRY_TO_PREFIX[country] ?? a.mobilePrefix;
    updateConfig("account", { ...a, country, mobilePrefix: prefix });
  };

  const handleCurrencyChange = (code: string) => {
    const opt = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (opt) {
      updateConfig("account", { ...a, currency: opt.code, currencySymbol: opt.symbol });
      updateConfig("fees", { ...config.fees, currency: opt.code, currencySymbol: opt.symbol });
    }
  };


  const validate = () => {
    const errs: Partial<Record<keyof AccountProfile, string>> = {};
    if (!a.organizationName.trim()) errs.organizationName = "Required";
    if (!a.adminEmail.trim()) errs.adminEmail = "Required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.adminEmail)) errs.adminEmail = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.code === a.currency);

  return (
    <StepWrapper
      step={1}
      title="Account Profile"
      subtitle="Set up your account on the DIGIT platform."
      onNext={() => { if (validate()) onNext(); }}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
    >
      <div className="space-y-5">

        {/* ── 1. Account Identity ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">

          {/* Info banner */}
          <div className="flex gap-2.5 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Your <strong>Account Name</strong> will be used to create your account in the system
              and will appear in the portal header seen by citizens and staff.
            </p>
          </div>

          <Field label="Account Name" required>
            <input
              type="text"
              className={`${inputCls} ${errors.organizationName ? "border-red-400" : ""}`}
              placeholder="e.g. Municipal Corporation of Mumbai"
              value={a.organizationName}
              onChange={(e) => set("organizationName", e.target.value)}
            />
            {errors.organizationName && (
              <p className="text-xs text-red-500 mt-1">{errors.organizationName}</p>
            )}
          </Field>

          <Field label="Department Name">
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Trade License Department"
              value={a.departmentName}
              onChange={(e) => set("departmentName", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Country" required>
              <select
                className={inputCls}
                value={a.country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Mobile Number Prefix" hint="Auto-selected from country — change if needed">
              <select
                className={inputCls}
                value={a.mobilePrefix}
                onChange={(e) => set("mobilePrefix", e.target.value)}
              >
                {MOBILE_PREFIX_OPTIONS.map((o) => (
                  <option key={o.prefix} value={o.prefix}>
                    {o.prefix} — {o.country}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="State / Province">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Maharashtra"
                value={a.stateProvince}
                onChange={(e) => set("stateProvince", e.target.value)}
              />
            </Field>
          </div>

        </div>

        {/* ── 2. Regional Settings ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regional Settings</p>
            <span className="suggested-badge">Suggested</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Currency">
              <select
                className={inputCls}
                value={a.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Symbol: {selectedCurrency?.symbol}</p>
            </Field>

            <Field label="Date Format">
              <select
                className={inputCls}
                value={a.dateFormat}
                onChange={(e) => set("dateFormat", e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </Field>

            <Field label="Financial Year Start">
              <select
                className={inputCls}
                value={a.financialYearStart}
                onChange={(e) => set("financialYearStart", e.target.value)}
              >
                {["January","February","March","April","May","June",
                  "July","August","September","October","November","December",
                ].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>

          </div>
        </div>

        {/* ── 3. System Admin ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">System Admin</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              The System Admin is the primary contact for this account and has full access to configure and manage all services.
              This person will receive system alerts, password reset emails, and important notifications.
            </p>
          </div>

          <Field label="Admin Email Address" required>
            <input
              type="email"
              className={`${inputCls} ${errors.adminEmail ? "border-red-400" : ""}`}
              placeholder="admin@municipality.gov.in"
              value={a.adminEmail}
              onChange={(e) => set("adminEmail", e.target.value)}
            />
            {errors.adminEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>
            )}
          </Field>

          <Field label="Admin Phone">
            <div className="flex gap-2">
              <div className="w-28 shrink-0">
                <div className="flex items-center h-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-600 font-medium">
                  {a.mobilePrefix}
                </div>
              </div>
              <input
                type="tel"
                className={`${inputCls} flex-1`}
                placeholder="Enter phone number"
                value={a.adminPhone}
                onChange={(e) => set("adminPhone", e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Country code {a.mobilePrefix} is applied automatically from your Mobile Prefix setting above
            </p>
          </Field>

          <Field label="Preferred Domain Name">
            <div className="flex items-stretch rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <span className="flex items-center px-3 bg-slate-100 text-slate-500 text-xs font-medium border-r border-slate-300 whitespace-nowrap">
                {DOMAIN_BASE}
              </span>
              <input
                type="text"
                className="flex-1 px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none"
                placeholder="your-city-name"
                value={a.domainSlug}
                onChange={(e) => set("domainSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              />
            </div>
            {a.domainSlug && (
              <p className="text-xs text-blue-600 mt-1">
                Your portal will be available at: <strong>{DOMAIN_BASE}{a.domainSlug}</strong>
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Only lowercase letters, numbers, and hyphens. Leave blank to use a default.
            </p>
          </Field>
        </div>

      </div>
    </StepWrapper>
  );
}
