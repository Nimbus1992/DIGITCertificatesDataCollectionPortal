import { useStore } from '../../store/DataStore';
import { RiskMatrix } from '../../components/charts/RiskMatrix';
import { EmptyState } from './S03_OKRProgress';
import type { Risk, RiskCategory } from '../../types';

const SEVERITY_STYLE: Record<Risk['severity'], string> = {
  Critical: 'bg-red-100 text-red-900 border-red-200', High: 'bg-orange-100 text-orange-900 border-orange-200',
  Medium: 'bg-amber-100 text-amber-900 border-amber-200', Low: 'bg-green-100 text-green-900 border-green-200',
};

const CAT_STYLE: Record<string, string> = {
  'Adoption': 'bg-blue-100 text-blue-700 border-blue-200',
  'Timeline': 'bg-purple-100 text-purple-700 border-purple-200',
  'Technical': 'bg-gray-100 text-gray-700 border-gray-200',
  'Security & Compliance': 'bg-orange-100 text-orange-700 border-orange-200',
  'Financial': 'bg-green-100 text-green-700 border-green-200',
  'Other': 'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_ORDER: RiskCategory[] = ['Adoption', 'Timeline', 'Technical', 'Security & Compliance', 'Financial', 'Other'];

export function S09_Risks() {
  const { data } = useStore();
  const risks = data.risks;
  const openRisks = risks.filter(r => r.status !== 'Closed');
  const critical = risks.filter(r => r.severity === 'Critical' || r.severity === 'High');

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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Risks & Dependencies</h2>
        <p className="text-gray-500 text-sm">Where intervention is required</p>
      </div>

      {risks.length === 0 ? <EmptyState label="Risks" adminPath="/admin/risks" /> : (
        <>
          {/* Severity summary */}
          <div className="grid md:grid-cols-4 gap-4">
            {(['Critical', 'High', 'Medium', 'Low'] as Risk['severity'][]).map(sev => (
              <div key={sev} className={`rounded-xl border p-4 text-center ${SEVERITY_STYLE[sev]}`}>
                <p className="text-3xl font-bold">{risks.filter(r => r.severity === sev).length}</p>
                <p className="text-xs font-semibold mt-1">{sev}</p>
              </div>
            ))}
          </div>

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

          {/* Matrix + Critical path */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Impact × Probability Matrix</h3>
              <RiskMatrix risks={risks} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {risks.map((risk, idx) => (
                  <div key={idx} className="flex gap-1.5 text-xs text-gray-600">
                    <span className="font-bold text-gray-800 shrink-0">{idx + 1}.</span>
                    <span className="truncate">{risk.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Critical & High Risks</h3>
              {critical.length === 0 ? (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg p-4">No critical or high risks identified.</p>
              ) : (
                <div className="space-y-3">
                  {critical.map((risk, idx) => (
                    <div key={idx} className={`rounded-lg border p-4 ${SEVERITY_STYLE[risk.severity]}`}>
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{risk.severity}</span>
                          {risk.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CAT_STYLE[risk.category] ?? ''}`}>{risk.category}</span>
                          )}
                        </div>
                        <span className="text-xs shrink-0">{risk.owner}</span>
                      </div>
                      <p className="text-sm font-medium mb-2">{risk.description}</p>
                      {risk.mitigation && <p className="text-xs opacity-80"><span className="font-semibold">Mitigation:</span> {risk.mitigation}</p>}
                      {risk.eta && <p className="text-xs opacity-70 mt-1">ETA: {risk.eta}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full risk table grouped by category */}
          {allGroups.map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CAT_STYLE[cat] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>{cat}</span>
                <span className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'risk' : 'risks'}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Description', 'Severity', 'P', 'I', 'Mitigation Strategy', 'Owner', 'ETA', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((risk, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 text-xs max-w-[200px]">{risk.description}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${SEVERITY_STYLE[risk.severity]}`}>{risk.severity}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs text-center">{risk.probability}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs text-center">{risk.impact}</td>
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
          ))}
        </>
      )}
    </div>
  );
}
