import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { PRODUCTS } from '../products';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../store/DataStore';
import type { SectionVisibility } from '../types';

const NAV: { to: string; label: string; visKey: keyof SectionVisibility }[] = [
  { to: 'summary',       label: '1. Executive Summary',       visKey: 'execSummary' },
  { to: 'overview',      label: '2. Product Overview & Metrics', visKey: 'productOverview' },
  { to: 'okrs',          label: '3. OKRs',                    visKey: 'okrs' },
  { to: 'roadmap',       label: '4. Roadmap',                 visKey: 'roadmap' },
  { to: 'budget',        label: '5. Budget',                  visKey: 'budget' },
  { to: 'deliverables',  label: '6. Assets',                  visKey: 'deliverables' },
  { to: 'conversations', label: '7. Conversations',           visKey: 'conversations' },
  { to: 'risks',         label: '8. Risks',                   visKey: 'risks' },
  { to: 'decisions',     label: '9. Decision Log',            visKey: 'decisions' },
  { to: 'changelog',     label: '10. Changelog',              visKey: 'changelog' },
  { to: 'governance',    label: '11. Governance',             visKey: 'governance' },
  { to: 'appendix',      label: '12. Appendix',               visKey: 'appendix' },
];

// Maps each exec section to its admin module path (null = no admin page for this section)
const SECTION_ADMIN_MAP: Record<string, string | null> = {
  summary:       null,
  overview:      'product-overview',
  okrs:          'okrs',
  roadmap:       'roadmap',
  budget:        'budget',
  deliverables:  'artifacts',
  conversations: 'conversations',
  risks:         'risks',
  decisions:     'decisions',
  changelog:     'changelog',
  governance:    'governance',
  appendix:      null,
};

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// Top-right action bar: edit button + sign in / user menu
function TopActions({ productSlug, dark = false }: { productSlug: string; dark?: boolean }) {
  const { user, logout, isAdminFor, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const section = location.pathname.split('/').pop() ?? '';
  const adminPath = SECTION_ADMIN_MAP[section];
  const canEdit = user && (isSuperAdmin || isAdminFor(productSlug)) && adminPath != null;

  const textCls  = dark ? 'text-blue-200 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const btnCls   = dark
    ? 'flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors'
    : 'flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors';
  const signInCls = dark
    ? 'text-xs font-semibold bg-white text-blue-900 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors'
    : 'text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors';

  return (
    <div className="flex items-center gap-2 shrink-0">
      {canEdit && (
        <button
          onClick={() => navigate(`/${productSlug}/admin/${adminPath}`)}
          className={btnCls}
        >
          <EditIcon />
          <span>Edit</span>
        </button>
      )}

      {!user ? (
        <button onClick={() => navigate('/login')} className={signInCls}>
          Sign In
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className={`flex items-center gap-1.5 text-xs font-medium ${textCls} transition-colors`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{user.name || user.email}</span>
            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 text-sm">
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">{user.email}</div>
              {(isSuperAdmin) && (
                <button
                  onClick={() => { navigate('/users'); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Manage Users
                </button>
              )}
              {(isSuperAdmin || isAdminFor(productSlug)) && (
                <button
                  onClick={() => { navigate(`/${productSlug}/admin`); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ⚙ Admin Interface
                </button>
              )}
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotPublishedState({ productSlug, productName }: { productSlug: string; productName: string }) {
  const navigate = useNavigate();
  const { user, isAdminFor, isSuperAdmin } = useAuth();
  const canAdmin = user && (isSuperAdmin || isAdminFor(productSlug));
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Not yet published</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-4">
        {productName} hasn't been published yet. The admin needs to publish the data before it's visible here.
      </p>
      {canAdmin && (
        <button
          onClick={() => navigate(`/${productSlug}/admin`)}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Admin →
        </button>
      )}
    </div>
  );
}

export function ExecLayout() {
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = PRODUCTS.find(p => p.slug === productSlug);
  const productName = product?.name ?? 'Product Progress Portal';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, hasRemoteData } = useStore();

  const slug = productSlug ?? '';
  const vis = data.sectionVisibility;
  const visibleNav = NAV.filter(item => vis[item.visKey] ?? true);

  // Redirect to first visible section if current section is hidden
  useEffect(() => {
    const currentSection = location.pathname.split('/').pop() ?? '';
    const currentNavItem = NAV.find(n => n.to === currentSection);
    if (currentNavItem && !(vis[currentNavItem.visKey] ?? true) && visibleNav.length > 0) {
      navigate(`/${slug}/executive/${visibleNav[0].to}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-blue-900">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1 hover:text-blue-200 transition-colors text-left"
        >
          ← All Products
        </button>
        <h1 className="text-sm font-bold text-white leading-tight">{productName}</h1>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `block text-xs px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-700 text-white font-medium' : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-blue-950 text-white flex-col shrink-0 overflow-y-auto">
        {sidebarContent}
        <div className="border-t border-blue-900 px-5 py-4">
          <TopActions productSlug={slug} dark />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-blue-950 text-white flex flex-col transition-transform duration-200 lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 text-blue-300 hover:text-white text-xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-blue-950 text-white shrink-0">
          <button onClick={() => setDrawerOpen(true)} className="text-blue-200 hover:text-white p-1" aria-label="Open menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-white truncate flex-1">{productName}</span>
          <TopActions productSlug={slug} dark />
        </div>

        <main className="flex-1 overflow-y-auto flex flex-col">
          {hasRemoteData === false ? (
            <NotPublishedState productSlug={productSlug ?? ''} productName={productName} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
