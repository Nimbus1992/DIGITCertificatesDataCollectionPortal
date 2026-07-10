import { useState, useEffect, useCallback } from "react";
import {
  getAllAccounts,
  verifyAccount,
  updateSuperUsers,
  type AccountRecord,
} from "../lib/supabase";
import { exportAccountToExcel } from "../lib/exportExcel";
import CreateAccountModal from "../components/CreateAccountModal";
import {
  Plus,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  LogOut,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  Trash2,
} from "lucide-react";

interface Props {
  onLogout: () => void;
  onOpenAccount: (account: AccountRecord) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-green-50 text-green-700 border-green-200",
  verified: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock size={12} />,
  submitted: <CheckCircle2 size={12} />,
  verified: <Shield size={12} />,
};

type Panel = "verify" | "users";

export default function AdminDashboard({ onLogout, onOpenAccount }: Props) {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Which tile + which panel is open
  const [openPanel, setOpenPanel] = useState<{ id: string; panel: Panel } | null>(null);

  // Verify state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [verifyError, setVerifyError] = useState<Record<string, string>>({});

  // Users state
  const [userListMap, setUserListMap] = useState<Record<string, string[]>>({});
  const [newEmailMap, setNewEmailMap] = useState<Record<string, string>>({});
  const [usersLoadingId, setUsersLoadingId] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<Record<string, string>>({});

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await getAllAccounts();
    setLoading(false);
    if (error) { setLoadError(error); return; }
    setAccounts(data);
    const notes: Record<string, string> = {};
    const users: Record<string, string[]> = {};
    data.forEach((a) => {
      notes[a.id] = a.admin_notes ?? "";
      users[a.id] = a.super_user_emails ?? (a.super_user_email ? [a.super_user_email] : []);
    });
    setNotesMap(notes);
    setUserListMap(users);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  function togglePanel(id: string, panel: Panel) {
    setOpenPanel((prev) =>
      prev?.id === id && prev.panel === panel ? null : { id, panel }
    );
  }

  // ── Verify ──────────────────────────────────────────────────────────────────
  async function handleVerify(account: AccountRecord, verified: boolean) {
    setVerifyingId(account.id);
    setVerifyError((prev) => ({ ...prev, [account.id]: "" }));
    const { error } = await verifyAccount(account.org_name, verified, notesMap[account.id] ?? "");
    setVerifyingId(null);
    if (error) { setVerifyError((prev) => ({ ...prev, [account.id]: error })); return; }
    fetchAccounts();
  }

  // ── Users ───────────────────────────────────────────────────────────────────
  async function handleSaveUsers(account: AccountRecord) {
    const emails = userListMap[account.id] ?? [];
    if (emails.length === 0) {
      setUsersError((prev) => ({ ...prev, [account.id]: "At least one email is required." }));
      return;
    }
    setUsersLoadingId(account.id);
    setUsersError((prev) => ({ ...prev, [account.id]: "" }));
    const { error } = await updateSuperUsers(account.org_name, emails);
    setUsersLoadingId(null);
    if (error) { setUsersError((prev) => ({ ...prev, [account.id]: error })); return; }
    fetchAccounts();
  }

  function addEmailToAccount(accountId: string) {
    const raw = (newEmailMap[accountId] ?? "").trim().toLowerCase();
    if (!raw) return;
    const existing = userListMap[accountId] ?? [];
    if (existing.includes(raw)) {
      setUsersError((prev) => ({ ...prev, [accountId]: "Email already added." }));
      return;
    }
    setUserListMap((prev) => ({ ...prev, [accountId]: [...existing, raw] }));
    setNewEmailMap((prev) => ({ ...prev, [accountId]: "" }));
    setUsersError((prev) => ({ ...prev, [accountId]: "" }));
  }

  function removeEmailFromAccount(accountId: string, email: string) {
    setUserListMap((prev) => ({
      ...prev,
      [accountId]: (prev[accountId] ?? []).filter((e) => e !== email),
    }));
  }

  const draftCount = accounts.filter((a) => a.status === "draft").length;
  const submittedCount = accounts.filter((a) => a.status === "submitted").length;
  const verifiedCount = accounts.filter((a) => a.admin_verified).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">BL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Business License Setup</p>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={14} />
            New Account
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors text-sm"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Accounts", value: accounts.length, color: "text-slate-700" },
            { label: "In Progress", value: draftCount, color: "text-amber-600" },
            { label: "Submitted", value: submittedCount, color: "text-green-600" },
            { label: "Admin Verified", value: verifiedCount, color: "text-blue-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">All Accounts</h2>
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={15} />
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No accounts yet.</p>
            <p className="text-slate-400 text-xs mt-1">Click "New Account" to create the first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const activePanel = openPanel?.id === account.id ? openPanel.panel : null;
              const isVerifying = verifyingId === account.id;
              const isSavingUsers = usersLoadingId === account.id;
              const statusKey = account.status ?? "draft";
              const superUsers = userListMap[account.id] ?? [];

              return (
                <div
                  key={account.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                        {account.org_name}
                      </h3>
                      <span
                        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_COLORS[statusKey] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                      >
                        {STATUS_ICONS[statusKey]}
                        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                      </span>
                    </div>
                    {account.department_name && (
                      <p className="text-xs text-slate-500">{account.department_name}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{account.country}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Super Users</span>
                        <span className="text-slate-700 font-medium">{superUsers.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-700 font-medium">{Math.round((account.current_step / 13) * 100)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Verified</span>
                        {account.admin_verified
                          ? <span className="flex items-center gap-1 text-blue-600 font-medium"><CheckCircle2 size={11} />Yes</span>
                          : <span className="text-slate-400">No</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="px-5 pb-4 flex items-center gap-2">
                    <button
                      onClick={() => onOpenAccount(account)}
                      className="flex-1 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      View / Edit
                    </button>
                    <button
                      onClick={() => exportAccountToExcel(account)}
                      className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                      title="Export to Excel"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => togglePanel(account.id, "users")}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                        activePanel === "users"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Manage super users"
                    >
                      <Users size={12} />
                      {activePanel === "users" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button
                      onClick={() => togglePanel(account.id, "verify")}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                        activePanel === "verify"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Verify
                      {activePanel === "verify" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </div>

                  {/* Users panel */}
                  {activePanel === "users" && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">Manage Super Users</p>
                        <button onClick={() => setOpenPanel(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={13} />
                        </button>
                      </div>

                      {/* Current users list */}
                      {superUsers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No super users assigned.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {superUsers.map((email) => (
                            <li key={email} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-slate-700 truncate">{email}</span>
                              <button
                                onClick={() => removeEmailFromAccount(account.id, email)}
                                className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Add new email */}
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmailMap[account.id] ?? ""}
                          onChange={(e) =>
                            setNewEmailMap((prev) => ({ ...prev, [account.id]: e.target.value }))
                          }
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmailToAccount(account.id); } }}
                          placeholder="new@organisation.gov"
                          className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => addEmailToAccount(account.id)}
                          className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors"
                          title="Add email"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {usersError[account.id] && (
                        <p className="text-xs text-red-600">{usersError[account.id]}</p>
                      )}

                      <button
                        onClick={() => handleSaveUsers(account)}
                        disabled={isSavingUsers}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isSavingUsers ? "Saving…" : "Save Users"}
                      </button>
                    </div>
                  )}

                  {/* Verify panel */}
                  {activePanel === "verify" && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">Admin Verification</p>
                        <button onClick={() => setOpenPanel(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={13} />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={notesMap[account.id] ?? ""}
                        onChange={(e) =>
                          setNotesMap((prev) => ({ ...prev, [account.id]: e.target.value }))
                        }
                        placeholder="Add notes (optional)…"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
                      />
                      {verifyError[account.id] && (
                        <p className="text-xs text-red-600">{verifyError[account.id]}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(account, false)}
                          disabled={isVerifying}
                          className="flex-1 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isVerifying ? "Saving…" : "Mark Unverified"}
                        </button>
                        <button
                          onClick={() => handleVerify(account, true)}
                          disabled={isVerifying}
                          className="flex-1 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {isVerifying ? "Saving…" : "Mark Verified"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchAccounts(); }}
        />
      )}
    </div>
  );
}
