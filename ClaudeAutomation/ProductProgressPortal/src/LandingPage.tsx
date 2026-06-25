import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { PRODUCTS } from './products';
import { useAuth } from './auth/AuthContext';
import type { PortalData } from './store/DataStore';

type ProductKPI = {
  okrsOnTrack: number;
  daysToLaunch: number | null;
  openDecisions: number;
  publishedVersion?: string;
} | null;

function calcDaysToLaunch(launchDate?: string): number | null {
  if (!launchDate) return null;
  const diff = new Date(launchDate).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86_400_000);
}

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
    // Read from published slots (_pub) so landing page reflects live published data
    const pubIds = active.map(s => `${s}_pub`);
    supabase
      .from('portal_state')
      .select('id, data')
      .in('id', pubIds)
      .then(({ data: rows }) => {
        const map: Record<string, ProductKPI> = {};
        for (const slug of active) {
          const row = rows?.find(r => r.id === `${slug}_pub`);
          if (!row?.data) { map[slug] = null; continue; }
          const d = row.data as PortalData;
          map[slug] = {
            okrsOnTrack: d.execSummary?.okrsOnTrack ?? 0,
            daysToLaunch: calcDaysToLaunch(d.execSummary?.launchDate),
            openDecisions: (d.decisions ?? []).filter(dec => dec.status === 'Open').length,
            publishedVersion: d._versionMeta?.publishedVersion,
          };
        }
        setKpis(map);
        setLoading(false);
      });
  }, []);

  function handleDashboard(slug: string) {
    navigate(`/${slug}/executive/summary`);
  }

  function handleAdmin(slug: string) {
    navigate(`/${slug}/admin`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eGov logo — place egov-logo.png or egov-logo.svg in /public */}
            <img
              src="/egov-logo.png"
              alt="eGov Foundation"
              className="h-8 w-auto shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-0.5">eGov Foundation</p>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">DIGIT Product Progress Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="hidden sm:block text-sm text-gray-600">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Products</h2>
        <p className="text-gray-500 text-sm">Select a product to view its progress dashboard or manage its data.</p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {PRODUCTS.map(product => {
            const kpi = kpis[product.slug];
            const isLoading = loading && !product.comingSoon;

            if (isLoading) return <SkeletonCard key={product.slug} />;

            return (
              <div
                key={product.slug}
                className={`flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden ${product.comingSoon ? 'opacity-60' : 'shadow-sm hover:shadow-md transition-shadow'}`}
              >
                {/* Card header */}
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.description}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {product.comingSoon ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          Coming Soon
                        </span>
                      ) : kpi?.publishedVersion ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                          V{kpi.publishedVersion}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          Not published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KPI Strip — grows to fill space */}
                  <div className="flex-1 flex flex-col justify-end">
                    {!product.comingSoon && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {kpi ? (
                          <>
                            <div className="rounded-lg p-3 bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">Days to launch</p>
                              {kpi.daysToLaunch === null ? (
                                <p className="text-xs text-gray-400 italic">Not set</p>
                              ) : kpi.daysToLaunch <= 0 ? (
                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Launched</span>
                              ) : (
                                <p className="text-lg font-bold text-gray-900">{kpi.daysToLaunch}<span className="text-xs font-normal text-gray-500 ml-0.5">d</span></p>
                              )}
                            </div>
                            <div className="rounded-lg p-3 bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">OKRs on track</p>
                              <p className="text-lg font-bold text-gray-900">{kpi.okrsOnTrack}<span className="text-xs font-normal text-gray-500 ml-0.5">%</span></p>
                            </div>
                            <div className="rounded-lg p-3 bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">Open decisions</p>
                              <p className="text-lg font-bold text-gray-900">{kpi.openDecisions}</p>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-3 rounded-lg p-3 bg-gray-50 text-center">
                            <p className="text-xs text-gray-400">Not published — visit Admin to get started</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions — pinned to bottom */}
                <div className="px-6 pb-6 flex gap-2">
                  <button
                    onClick={() => !product.comingSoon && handleDashboard(product.slug)}
                    disabled={product.comingSoon}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      product.comingSoon
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    View Dashboard
                  </button>
                  {user && (
                    <button
                      onClick={() => !product.comingSoon && handleAdmin(product.slug)}
                      disabled={product.comingSoon}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        product.comingSoon
                          ? 'border-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      Admin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
