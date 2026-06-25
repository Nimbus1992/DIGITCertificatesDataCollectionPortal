import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { RiskMatrix } from '../../components/charts/RiskMatrix';
import { EmptyState } from './S03_OKRProgress';
import type { Risk, RiskCategory } from '../../types';

const LEVEL_LABEL: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Very High',
};

function LevelBadge({ value }: { value: number }) {
  const label = LEVEL_LABEL[value];
  const colorClass =
    value <= 2 ? 'bg-green-50 text-green-700 border-green-200' :
    value === 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`} title={label}>
      {value}
    </span>
  );
}

const COLUMN_INFO: Record<string, { title: string; body: string }> = {
  Probability: {
    title: 'Probability',
    body: 'Likelihood that the risk will occur, rated 1–5 (1 = Very Low, 5 = Very High). Entered by the Product Manager.',
  },
  Impact: {
    title: 'Impact',
    body: 'Severity of consequences if the risk materialises, rated 1–5 (1 = Very Low, 5 = Very High). Entered by the Product Manager.',
  },
};

function ColInfoIcon({ col }: { col: string }) {
  const [open, setOpen] = useState(false);
  const info = COLUMN_INFO[col];
  if (!info) return null;
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="ml-1 cursor-default text-gray-400 hover:text-gray-600 text-[11px] font-bold leading-none select-none">ⓘ</span>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-5 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left normal-case tracking-normal font-normal text-xs text-gray-700 whitespace-normal">
          <span className="block font-semibold text-gray-900 mb-1">{info.title}</span>
          {info.body}
        </span>
      )}
    </span>
  );
}

const CAT_STYLE: Record<string, string> = {
  'Adoption':             'bg-blue-100 text-blue-700 border-blue-200',
  'Timeline':             'bg-purple-100 text-purple-700 border-purple-200',
  'Technical':            'bg-gray-100 text-gray-700 border-gray-200',
  'Security & Compliance':'bg-orange-100 text-orange-700 border-orange-200',
  'Financial':            'bg-green-100 text-green-700 border-green-200',
  'Other':                'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_ORDER: RiskCategory[] = ['Adoption', 'Timeline', 'Technical', 'Security & Compliance', 'Financial', 'Other'];

function posKey(r: Risk): string {
  const col = Math.min(Math.max(r.probability, 1), 5) - 1;
  const row = 5 - Math.min(Math.max(r.impact, 1), 5);
  return `${col}-${row}`;
}

export function S09_Risks() {
  const { data } = useStore();
  const risks = data.risks;
  const openRisks = risks.filter(r => r.status !== 'Closed');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const grouped = CATEGORY_ORDER.reduce<Record<string, Risk[]>>((acc, cat) => {
    const items = risks.filter(r => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});
  const uncategorised = risks.filter(r => !r.category);
  const allGroups: [string, Risk[]][] = [
    ...Object.entries(grouped),
    ...(uncategorised.length ? [['Uncategorised', uncategorised] as [string, Risk[]]] : []),
  ];

  const filteredGroups: [string, Risk[]][] = selectedKey
    ? allGroups
        .map(([cat, items]) => [cat, items.filter(r => posKey(r) === selectedKey)] as [string, Risk[]])
        .filter(([, items]) => items.length > 0)
    : allGroups;

  function handleMatrixSelect(key: string | null) {
    setSelectedKey(prev => (prev === key ? null : key));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Risks &amp; Dependencies</h2>
        <p className="text-gray-500 text-sm">Where intervention is required</p>
      </div>

      {risks.length === 0 ? <EmptyState label="Risks" adminPath="/admin/risks" /> : (
        <>
          {/* Category summary chips */}
          {allGroups.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allGroups.map(([cat, items]) => (
                <span key={cat} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${CAT_STYLE[cat] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {cat}
                  <span className="font-bold">{items.length}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                Open <span className="font-bold">{openRisks.length}</span>
              </span>
            </div>
          )}

          {/* Matrix */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Impact × Probability Matrix</h3>
              {selectedKey && (
                <button
                  onClick={() => setSelectedKey(null)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
                >
                  ✕ Reset filter
                </button>
              )}
            </div>
            <RiskMatrix risks={risks} selectedKey={selectedKey} onSelect={handleMatrixSelect} />
            {selectedKey && (
              <p className="mt-3 text-xs text-gray-400 text-center">
                Showing {risks.filter(r => posKey(r) === selectedKey).length} risk{risks.filter(r => posKey(r) === selectedKey).length !== 1 ? 's' : ''} at this position — click the circle again or Reset to clear
              </p>
            )}
          </div>

          {/* Full risk table grouped by category */}
          {filteredGroups.map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CAT_STYLE[cat] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>{cat}</span>
                <span className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'risk' : 'risks'}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Description', 'Probability', 'Impact', 'Mitigation Strategy', 'Owner', 'ETA', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <span className="inline-flex items-center gap-0.5">
                            {h}
                            <ColInfoIcon col={h} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((risk, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 text-xs max-w-[200px]">{risk.description}</td>
                        <td className="px-4 py-3 text-xs"><LevelBadge value={risk.probability} /></td>
                        <td className="px-4 py-3 text-xs"><LevelBadge value={risk.impact} /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[240px]">{risk.mitigation || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{risk.owner}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{risk.eta}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${risk.status === 'Closed' ? 'bg-gray-100 text-gray-500' : risk.status === 'Mitigated' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                            {risk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
