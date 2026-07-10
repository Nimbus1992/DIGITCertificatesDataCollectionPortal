import { useState } from "react";
import { getAccountByEmail } from "../lib/supabase";
import type { AccountRecord } from "../lib/supabase";
import { Shield, User, Eye, EyeOff } from "lucide-react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "digitadmin2024";

interface Props {
  onAdminLogin: () => void;
  onSuperUserLogin: (account: AccountRecord) => void;
}

type Tab = "admin" | "superuser";

export default function LoginPage({ onAdminLogin, onSuperUserLogin }: Props) {
  const [tab, setTab] = useState<Tab>("superuser");

  // Admin form
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Super user form
  const [email, setEmail] = useState("");
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      onAdminLogin();
    } else {
      setAdminError("Incorrect password. Please try again.");
    }
  }

  async function handleSuperUserLogin(e: React.FormEvent) {
    e.preventDefault();
    setSuError("");
    setSuLoading(true);
    const { data, error } = await getAccountByEmail(email.trim().toLowerCase());
    setSuLoading(false);
    if (error || !data) {
      setSuError(error ?? "No account found for this email.");
      return;
    }
    onSuperUserLogin(data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4">
      {/* Logo / header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-xl font-bold">BL</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Business License Setup</h1>
        <p className="text-sm text-slate-500 mt-1">Implementation Configuration Portal</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab("superuser")}
            className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === "superuser"
                ? "text-blue-700 bg-blue-50 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <User size={15} />
            Account Login
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === "admin"
                ? "text-blue-700 bg-blue-50 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Shield size={15} />
            Admin Login
          </button>
        </div>

        <div className="p-8">
          {tab === "superuser" && (
            <form onSubmit={handleSuperUserLogin} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-sm text-slate-500">
                  Enter the email address assigned to your account to continue filling in your configuration.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSuError(""); }}
                  placeholder="you@organisation.gov"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                />
              </div>

              {suError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {suError}
                </p>
              )}

              <button
                type="submit"
                disabled={suLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
              >
                {suLoading ? "Looking up account…" : "Continue"}
              </button>
            </form>
          )}

          {tab === "admin" && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Admin access</h2>
                <p className="text-sm text-slate-500">
                  eGov / partner admins can manage all accounts, verify submissions, and export data.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminError(""); }}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {adminError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {adminError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Login as Admin
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Powered by DIGIT · eGovernments Foundation
      </p>
    </div>
  );
}
