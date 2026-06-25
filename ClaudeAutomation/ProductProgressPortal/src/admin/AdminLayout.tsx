import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../products';
import { useAuth } from '../auth/AuthContext';

const MODULES = [
  { to: '', label: 'Dashboard', icon: '⊞' },
  { to: 'product-overview', label: 'Product Overview', icon: '🗺' },
  { to: 'okrs', label: 'OKR Manager', icon: '🎯' },
  { to: 'budget', label: 'Budget Manager', icon: '💰' },
  { to: 'roadmap', label: 'Roadmap Editor', icon: '🛣' },
  { to: 'artifacts', label: 'Asset Repository', icon: '📁' },
  { to: 'conversations', label: 'Conversations', icon: '💬' },
  { to: 'risks', label: 'Risk Registry', icon: '⚠️' },
  { to: 'decisions', label: 'Decision Log', icon: '⚖️' },
  { to: 'metrics', label: 'Metrics Editor', icon: '📈' },
  { to: 'changelog', label: 'Changelog', icon: '📋' },
  { to: 'governance', label: 'Governance', icon: '🏛' },
  { to: 'team', label: 'Team', icon: '👥' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = PRODUCTS.find(p => p.slug === productSlug);
  const productName = product?.name ?? 'Product Progress Portal';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout, isSuperAdmin } = useAuth();

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest hover:text-gray-200 transition-colors text-left"
          >
            ← All Products
          </button>
          <span className="text-gray-700 text-xs">·</span>
          <button
            onClick={() => navigate(`/${productSlug}/executive/summary`)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-200 transition-colors"
          >
            Executive View →
          </button>
        </div>
        <h1 className="text-sm font-bold text-white leading-tight">{productName}</h1>
        <p className="text-xs text-gray-500 mt-0.5">Admin Interface</p>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {MODULES.map(mod => (
          <NavLink
            key={mod.to}
            to={mod.to === '' ? `/${productSlug}/admin` : `/${productSlug}/admin/${mod.to}`}
            end={mod.to === ''}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{mod.icon}</span>
            {mod.label}
          </NavLink>
        ))}
        {isSuperAdmin && (
          <NavLink
            to="/users"
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>👥</span>
            Manage Users
          </NavLink>
        )}
      </nav>
      <div className="border-t border-gray-800 px-5 py-4 space-y-2.5">
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate max-w-[140px]">{user.name || user.email}</span>
            <button
              onClick={() => { logout(); setDrawerOpen(false); }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-2 shrink-0"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gray-900 text-white flex-col shrink-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white flex flex-col transition-transform duration-200 lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 text-white shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-gray-300 hover:text-white p-1"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-white truncate">{productName} — Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
