import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { PRODUCTS } from '../products';

const NAV = [
  { to: 'summary', label: '1. Executive Summary' },
  { to: 'overview', label: '2. Product Overview & Metrics' },
  { to: 'okrs', label: '3. OKRs' },
  { to: 'roadmap', label: '4. Roadmap' },
  { to: 'budget', label: '5. Budget' },
  { to: 'deliverables', label: '6. Assets' },
  { to: 'conversations', label: '7. Conversations' },
  { to: 'risks', label: '8. Risks' },
  { to: 'decisions', label: '9. Decision Log' },
  { to: 'changelog', label: '10. Changelog' },
  { to: 'appendix', label: '11. Appendix' },
];

export function ExecLayout() {
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const product = PRODUCTS.find(p => p.slug === productSlug);
  const productName = product?.name ?? 'Product Progress Portal';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-60 bg-blue-950 text-white flex flex-col shrink-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-blue-900">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1 hover:text-blue-200 transition-colors text-left"
          >
            ← All Products
          </button>
          <h1 className="text-sm font-bold text-white leading-tight">{productName}</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
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
        <div className="border-t border-blue-900 px-5 py-4">
          <button
            onClick={() => navigate(`/${productSlug}/admin`)}
            className="block text-xs text-blue-300 hover:text-white transition-colors"
          >
            ⚙ Admin Interface
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
