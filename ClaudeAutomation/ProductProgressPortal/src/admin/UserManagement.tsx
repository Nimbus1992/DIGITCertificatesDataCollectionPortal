import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PRODUCTS, PRODUCT_COLORS } from '../products';
import { migrateData } from '../store/DataStore';
import { Modal } from '../components/Modal';
import { Field, Input } from '../components/Field';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  product_slugs: string[];
  is_super_admin: boolean;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVE_PRODUCTS = PRODUCTS.filter(p => !p.comingSoon);

function fmtDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function ProductChip({ slug }: { slug: string }) {
  const product = PRODUCTS.find(p => p.slug === slug);
  if (!product) return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 border border-gray-200">
      {slug}
    </span>
  );
  const colors = PRODUCT_COLORS[product.color];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${colors.badge} border-transparent`}>
      {product.name}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-gray-400 text-sm mb-3">No admin users yet</p>
      <button onClick={onAdd} className="text-sm text-blue-600 hover:underline font-medium">
        + Add first admin
      </button>
    </div>
  );
}

// ── Product checkbox list ─────────────────────────────────────────────────────

function ProductCheckboxes({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  function toggle(slug: string) {
    onChange(
      selected.includes(slug) ? selected.filter(s => s !== slug) : [...selected, slug]
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ACTIVE_PRODUCTS.map(p => {
        const checked = selected.includes(p.slug);
        const colors = PRODUCT_COLORS[p.color];
        return (
          <label
            key={p.slug}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
              checked
                ? `${colors.border} ${colors.bg}`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(p.slug)}
              className="accent-blue-600"
            />
            <span className={`text-sm font-medium ${checked ? colors.text : 'text-gray-700'}`}>
              {p.name}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit';

const EMPTY_FORM = { email: '', product_slugs: [] as string[] };

export function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{ slug: string; status: 'ok' | 'skipped' | 'error'; note: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<{ email: string; product_slugs: string[] }>(EMPTY_FORM);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Sync all products ──────────────────────────────────────────────────────

  async function syncAllProducts() {
    setSyncing(true);
    setSyncResults([]);
    const activeProducts = PRODUCTS.filter(p => !p.comingSoon);
    const results: typeof syncResults = [];

    for (const product of activeProducts) {
      try {
        const { data: row, error } = await supabase
          .from('portal_state')
          .select('data')
          .eq('id', product.slug)
          .maybeSingle();

        if (error) {
          results.push({ slug: product.slug, status: 'error', note: error.message });
          continue;
        }

        if (!row?.data || Object.keys(row.data).length === 0) {
          results.push({ slug: product.slug, status: 'skipped', note: 'No saved data — defaults will apply on first open' });
          continue;
        }

        const migrated = migrateData(row.data);
        const { error: saveErr } = await supabase
          .from('portal_state')
          .upsert({ id: product.slug, data: migrated, updated_at: new Date().toISOString() });

        if (saveErr) {
          results.push({ slug: product.slug, status: 'error', note: saveErr.message });
        } else {
          results.push({ slug: product.slug, status: 'ok', note: 'Migrated and saved' });
        }
      } catch (e) {
        results.push({ slug: product.slug, status: 'error', note: String(e) });
      }
    }

    setSyncResults(results);
    setSyncing(false);
  }

  // ── Data loading ────────────────────────────────────────────────────────────

  async function loadUsers() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at');
    if (err) {
      setError(err.message);
    } else {
      setUsers(data as AdminUser[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  // ── Modal handlers ──────────────────────────────────────────────────────────

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalMode('add');
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEdit(user: AdminUser) {
    setForm({ email: user.email, product_slugs: user.product_slugs ?? [] });
    setModalMode('edit');
    setEditingUser(user);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
  }

  async function handleSave() {
    const email = form.email.trim().toLowerCase();
    if (!email) return;

    setSaving(true);
    setError(null);

    if (modalMode === 'add') {
      const { error: err } = await supabase
        .from('admin_users')
        .insert({ email, product_slugs: form.product_slugs, is_super_admin: false });
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else if (modalMode === 'edit' && editingUser) {
      const { error: err } = await supabase
        .from('admin_users')
        .update({ product_slugs: form.product_slugs })
        .eq('id', editingUser.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeModal();
    loadUsers();
  }

  // ── Delete handlers ─────────────────────────────────────────────────────────

  function promptDelete(user: AdminUser) {
    setDeleteTarget(user);
    setDeleteConfirmOpen(true);
  }

  function cancelDelete() {
    setDeleteTarget(null);
    setDeleteConfirmOpen(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', deleteTarget.id);
    if (err) {
      setError(err.message);
    } else {
      cancelDelete();
      loadUsers();
    }
    setDeleting(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-5 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-white transition-colors">
          ← Back
        </button>
        <span className="text-gray-700 text-xs">·</span>
        <span className="text-sm font-semibold text-white">User Management</span>
      </div>
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">User Management</h2>
          <p className="text-gray-500 text-sm">
            {loading ? 'Loading…' : `${users.length} admin ${users.length === 1 ? 'user' : 'users'}`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Admin
        </button>
      </div>

      {/* Sync all products */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sync All Products</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Runs all data migrations (thread names, variance formula, section defaults) against every product in Supabase. Safe to run multiple times.
            </p>
          </div>
          <button
            onClick={syncAllProducts}
            disabled={syncing}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {syncing ? 'Syncing…' : '⟳ Sync All Products'}
          </button>
        </div>

        {syncResults.length > 0 && (
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            {syncResults.map(r => (
              <div key={r.slug} className="flex items-center gap-3 text-xs">
                <span className={`w-16 font-semibold ${
                  r.status === 'ok' ? 'text-green-600' : r.status === 'skipped' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {r.status === 'ok' ? '✓ Done' : r.status === 'skipped' ? '— Skip' : '✕ Error'}
                </span>
                <span className="font-medium text-gray-700 w-20">{r.slug}</span>
                <span className="text-gray-500">{r.note}</span>
              </div>
            ))}
            {syncResults.every(r => r.status !== 'error') && (
              <p className="text-xs text-green-600 font-medium pt-1">All products synced successfully.</p>
            )}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <span className="font-semibold">Error:</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Table or empty state */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <Empty onAdd={openAdd} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Email', 'Products', 'Super Admin', 'Added', ''].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">

                  {/* Email */}
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {user.email}
                  </td>

                  {/* Product chips */}
                  <td className="px-4 py-3">
                    {(user.product_slugs ?? []).length === 0 ? (
                      <span className="text-xs text-gray-400 italic">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(user.product_slugs ?? []).map(slug => (
                          <ProductChip key={slug} slug={slug} />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Super admin badge */}
                  <td className="px-4 py-3">
                    {user.is_super_admin ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Created date */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {fmtDate(user.created_at)}
                  </td>

                  {/* Row actions */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {!user.is_super_admin && (
                        <button
                          onClick={() => promptDelete(user)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <Modal
          title={modalMode === 'add' ? 'Add Admin User' : 'Edit Product Assignments'}
          onClose={closeModal}
          onSave={handleSave}
        >
          <Field
            label="Email address"
            hint={modalMode === 'edit' ? 'Email cannot be changed after creation.' : undefined}
          >
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@egovernments.org"
              disabled={modalMode === 'edit'}
            />
          </Field>

          <Field label="Product access" hint="User will only see products checked below.">
            <ProductCheckboxes
              selected={form.product_slugs}
              onChange={slugs => setForm(f => ({ ...f, product_slugs: slugs }))}
            />
          </Field>

          {saving && (
            <p className="text-xs text-gray-400 text-right">Saving…</p>
          )}
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Remove admin access?</h3>
            <p className="text-sm text-gray-600">
              This will permanently remove{' '}
              <span className="font-medium text-gray-900">{deleteTarget.email}</span> from the
              portal. They will no longer be able to sign in as an admin.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Removing…' : 'Remove admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
