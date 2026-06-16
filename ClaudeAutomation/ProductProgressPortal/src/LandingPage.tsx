import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { PRODUCTS, PRODUCT_COLORS } from './products';
import { useAuth } from './auth/AuthContext';
import type { PortalData } from './store/DataStore';

type ProductKPI = {
  overallStatus: string;
  okrsOnTrack: number;
  budgetUtilized: number;
  openDecisions: number;
} | null;

const STATUS_COLORS: Record<string, string> = {
  Green: 'bg-green-100 text-green-700',
  Amber: 'bg-amber-100 text-amber-700',
  Red:   'bg-red-100 text-red-700',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[0,1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
      </div>
      <div className="h-9 bg-gray-200 rounded-lg" />
    </div>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, ProductKPI>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const active = PRODUCTS.filter(p => !p.comingSoon).map(p => p.slug);
    supabase
      .from('portal_state')
      .select('id, data')
      .in('id', active)
      .then(({ data: rows }) => {
        const map: Record<string, ProductKPI> = {};
        for (const slug of active) {
          const row = rows?.find(r => r.id === slug);
          if (!row?.data) { map[slug] = null; continue; }
          const d = row.data as PortalData;
          map[slug] = {
            overallStatus: d.execSummary?.overallStatus ?? 'Green',
            okrsOnTrack: d.execSummary?.okrsOnTrack ?? 0,
            budgetUtilized: d.execSummary?.budgetUtilized ?? 0,
            openDecisions: (d.decisions ?? []).filter(dec => dec.status === 'Open').length,
          };
        }
        setKpis(map);
        setLoading(false);
      });
  }, []);

  function handleDashboard(slug: string) {
    if (!user) { navigate('/login'); return; }
    navigate(`/${slug}/executive/summary`);
  }

  function handleAdmin(slug: string) {
    if (!user) { navigate('/login'); return; }
    navigate(`/${slug}/admin`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-0.5">eGov Foundation</p>
            <h1 className="text-xl font-bold text-gray-900">DIGIT Product Progress Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-600">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Products</h2>
        <p className="text-gray-500 text-sm">Select a product to view its progress dashboard or manage its data.</p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map(product => {
            const colors = PRODUCT_COLORS[product.color];
            const kpi = kpis[product.slug];
            const isLoading = loading && !product.comingSoon;

            if (isLoading) return <SkeletonCard key={product.slug} />;

            return (
              <div
                key={product.slug}
                className={`relative bg-white rounded-2xl border-l-4 border border-gray-200 ${colors.border} overflow-hidden ${product.comingSoon ? 'opacity-60' : ''}`}
              >
                {product.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div className="pr-24">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.description}</p>
                  </div>

                  {/* KPI Strip */}
                  {!product.comingSoon && (
                    <div className="grid grid-cols-3 gap-2">
                      {kpi ? (
                        <>
                          <div className={`rounded-lg p-3 ${colors.bg}`}>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[kpi.overallStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                              {kpi.overallStatus}
                            </span>
                          </div>
                          <div className={`rounded-lg p-3 ${colors.bg}`}>
                            <p className="text-xs text-gray-500 mb-1">OKRs on track</p>
                            <p className={`text-lg font-bold ${colors.text}`}>{kpi.okrsOnTrack}<span className="text-xs font-normal ml-0.5">%</span></p>
                          </div>
                          <div className={`rounded-lg p-3 ${colors.bg}`}>
                            <p className="text-xs text-gray-500 mb-1">Budget used</p>
                            <p className={`text-lg font-bold ${colors.text}`}>{kpi.budgetUtilized}<span className="text-xs font-normal ml-0.5">%</span></p>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-3 rounded-lg p-3 bg-gray-50 text-center">
                          <p className="text-xs text-gray-400">No data yet — visit Admin to get started</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => !product.comingSoon && handleDashboard(product.slug)}
                      disabled={product.comingSoon}
                      className={`flex-1 py-2 text-sm font-medium text-white rounded-lg transition-colors ${product.comingSoon ? 'bg-gray-300 cursor-not-allowed' : `${colors.button} cursor-pointer`}`}
                    >
                      View Dashboard
                    </button>
                    <button
                      onClick={() => !product.comingSoon && handleAdmin(product.slug)}
                      disabled={product.comingSoon}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${product.comingSoon ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
