import { useStore } from '../../store/DataStore';
import type { Metric } from '../../types';

const THEME_CONFIG = [
  {
    key: 'Adoption',
    color: 'blue' as const,
    goals: [
      'Rapid onboarding of jurisdictions (cities/departments)',
      'Multiple license and permit types activated per customer',
      'Partners can independently drive the sales and onboarding cycle',
      'Partners can independently host and manage the product',
    ],
  },
  {
    key: 'Feature Completeness',
    color: 'purple' as const,
    goals: [
      'Variety of license and permit use cases supported',
      'Variation of a use case across countries supported',
    ],
  },
  {
    key: 'Product Impact & Experience',
    color: 'green' as const,
    goals: [
      'Ensure predictable service delivery timelines',
      'Minimize friction in usability',
      'Ensure product is accessible by all types of users',
    ],
  },
  {
    key: 'Performance, Security & Cost',
    color: 'amber' as const,
    goals: [
      'Ensure high availability',
      'Optimize cost to serve for governments (Infra + Support Costs)',
      'Maintain strong data security and compliance',
      "Ensure a specific implementation can be migrated to government's own infra",
    ],
  },
];

const TREND_ICON: Record<Metric['trend'], string> = { Up: '↑', Down: '↓', Stable: '→' };
const TREND_COLOR: Record<Metric['trend'], string> = { Up: 'text-green-600', Down: 'text-red-600', Stable: 'text-gray-500' };

export function S02_ProductOverview() {
  const { data } = useStore();
  const d = data.productOverview;
  const metrics = data.metrics;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Product Overview & Success Metrics</h2>
        <p className="text-gray-500 text-sm">Why this work exists and how we measure success</p>
      </div>

      {/* Product Overview */}
      <section className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <InfoBlock title="Problem" content={d.problem} />
          <InfoBlock title="Vision" content={d.vision} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ListBlock title="Objectives" items={d.objectives} color="blue" />
          <ListBlock title="Target Users" items={d.targetUsers} color="purple" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <ListBlock title="In Scope" items={d.inScope} color="green" />
          <ListBlock title="Out of Scope" items={d.outOfScope} color="red" />
          <ListBlock title="Strategic Alignment" items={d.strategicAlignment} color="amber" />
        </div>
      </section>

      {/* Product Goals */}
      <section>
        <h3 className="text-base font-bold text-gray-800 mb-3">Product Goals</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <GoalCard period="2030 Goal" goal="Light up 24 Countries" color="indigo" />
          <GoalCard period="1 Year Goal" goal="1 go live · 1 partner hosting SaaS" color="blue" />
        </div>
      </section>

      {/* Success Metrics by Theme */}
      <section>
        <h3 className="text-base font-bold text-gray-800 mb-4">Success Metrics</h3>
        <div className="space-y-5">
          {THEME_CONFIG.map(theme => (
            <ThemeBlock
              key={theme.key}
              theme={theme}
              metrics={metrics.filter(m => m.theme === theme.key)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalCard({ period, goal, color }: { period: string; goal: string; color: 'indigo' | 'blue' }) {
  const bg = color === 'indigo' ? 'bg-indigo-600' : 'bg-blue-600';
  return (
    <div className={`${bg} rounded-xl p-5 text-white`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{period}</p>
      <p className="text-xl font-bold">{goal}</p>
    </div>
  );
}

type ThemeColor = 'blue' | 'purple' | 'green' | 'amber';

const THEME_STYLES: Record<ThemeColor, { bg: string; border: string; dot: string; badge: string; metricBorder: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700',   metricBorder: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700', metricBorder: 'border-purple-100' },
  green:  { bg: 'bg-green-50',  border: 'border-green-100',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700',  metricBorder: 'border-green-100' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700',  metricBorder: 'border-amber-100' },
};

function ThemeBlock({ theme, metrics }: { theme: typeof THEME_CONFIG[0]; metrics: Metric[] }) {
  const s = THEME_STYLES[theme.color];
  return (
    <div className={`rounded-xl border ${s.bg} ${s.border} p-6`}>
      <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${s.badge}`}>{theme.key}</span>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Goals</p>
          <ul className="space-y-1.5">
            {theme.goals.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                {g}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What We Measure</p>
          {metrics.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No metrics — update in Admin → Metrics</p>
          ) : (
            <div className="space-y-2">
              {metrics.map((m, i) => (
                <div key={i} className={`rounded-lg border bg-white p-3 ${s.metricBorder}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-gray-800 leading-tight">{m.name}</p>
                    <span className={`text-sm font-bold shrink-0 ${TREND_COLOR[m.trend]}`}>{TREND_ICON[m.trend]}</span>
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-xs text-gray-500">Target: <span className="font-medium text-gray-700">{m.target || '—'}</span></span>
                    {m.actual && <span className="text-xs text-gray-500">Actual: <span className="font-medium text-gray-900">{m.actual}</span></span>}
                    {m.period && <span className="text-xs text-gray-400">{m.period}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <p className="text-sm text-gray-800 leading-relaxed">
        {content || <span className="text-gray-400 italic">Not set — update in Admin</span>}
      </p>
    </div>
  );
}

function ListBlock({ title, items, color }: { title: string; items: string[]; color: string }) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100', purple: 'bg-purple-50 border-purple-100',
    green: 'bg-green-50 border-green-100', red: 'bg-red-50 border-red-100', amber: 'bg-amber-50 border-amber-100',
  };
  const dot: Record<string, string> = {
    blue: 'bg-blue-400', purple: 'bg-purple-400', green: 'bg-green-500', red: 'bg-red-400', amber: 'bg-amber-400',
  };
  return (
    <div className={`rounded-xl border p-5 ${bg[color]}`}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Not set — update in Admin</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-800">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot[color]}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
