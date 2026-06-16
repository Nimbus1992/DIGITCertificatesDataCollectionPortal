import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../products';

const MODULES = [
  { to: '', label: 'Dashboard', icon: '⊞' },
  { to: 'exec-summary', label: 'Executive Summary', icon: '📊' },
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
  { to: 'team', label: 'Team', icon: '👥' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = PRODUCTS.find(p => p.slug === productSlug);
  const productName = product?.name ?? 'Product Progress Portal';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-gray-800">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 hover:text-gray-200 transition-colors text-left"
          >
            ← All Products
          </button>
          <h1 className="text-sm font-bold text-white leading-tight">{productName}</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Interface</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {MODULES.map(mod => (
            <NavLink
              key={mod.to}
              to={mod.to === '' ? `/${productSlug}/admin` : `/${productSlug}/admin/${mod.to}`}
              end={mod.to === ''}
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
        </nav>
        <div className="border-t border-gray-800 px-5 py-4">
          <button
            onClick={() => navigate(`/${productSlug}/executive/summary`)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← View Executive Portal
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
