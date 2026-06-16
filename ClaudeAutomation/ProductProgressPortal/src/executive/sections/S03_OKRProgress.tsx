import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { ProgressBar } from '../../components/ProgressBar';
import type { OKR, OKRStatus } from '../../types';

const STATUS_STYLE: Record<OKRStatus, string> = {
  'On Track': 'bg-green-100 text-green-800', 'Delayed': 'bg-red-100 text-red-800',
  'Completed': 'bg-blue-100 text-blue-800', 'At Risk': 'bg-amber-100 text-amber-800',
};
const PROGRESS_COLOR: Record<OKRStatus, 'green' | 'red' | 'blue' | 'amber'> = {
  'On Track': 'green', 'Delayed': 'red', 'Completed': 'blue', 'At Risk': 'amber',
};

export function S03_OKRProgress() {
  const { data } = useStore();
  const okrs = data.okrs;
  const [filter, setFilter] = useState<OKRStatus | 'All'>('All');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const grouped = okrs.reduce<Record<string, OKR[]>>((acc, okr) => {
    if (!acc[okr.objective]) acc[okr.objective] = [];
    acc[okr.objective].push(okr);
    return acc;
  }, {});

  const counts = {
    'On Track': okrs.filter(o => o.status === 'On Track').length,
    'Delayed': okrs.filter(o => o.status === 'Delayed').length,
    'Completed': okrs.filter(o => o.status === 'Completed').length,
    'At Risk': okrs.filter(o => o.status === 'At Risk').length,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Progress Against OKRs</h2>
        <p className="text-gray-500 text-sm">Measuring execution</p>
      </div>

      {okrs.length === 0 ? (
        <EmptyState label="OKRs" adminPath="/admin/okrs" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(counts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(filter === status as OKRStatus ? 'All' : status as OKRStatus)}
                className={`rounded-xl border p-4 text-left transition-all ${filter === status ? 'ring-2 ring-blue-500' : ''} ${STATUS_STYLE[status as OKRStatus]}`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium mt-1">{status}</p>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([objective, keyResults]) => {
              const visibleKRs = filter === 'All' ? keyResults : keyResults.filter(kr => kr.status === filter);
              if (visibleKRs.length === 0) return null;
              const avgProgress = Math.round(keyResults.reduce((s, kr) => s + kr.progress, 0) / keyResults.length);
              return (
                <div key={objective} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="font-semibold text-gray-900 text-sm">{objective}</p>
                      <span className="text-xs font-bold text-gray-600 shrink-0">{avgProgress}%</span>
                    </div>
                    <ProgressBar value={avgProgress} color={PROGRESS_COLOR[keyResults[0]?.status ?? 'On Track']} />
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>{['Key Result', 'Target', 'Actual', 'Progress', 'Owner', 'Date', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visibleKRs.map((kr, i) => {
                        const globalIdx = okrs.indexOf(kr);
                        return (
                          <>
                            <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedIdx(expandedIdx === globalIdx ? null : globalIdx)}>
                              <td className="px-4 py-3 text-gray-800 max-w-xs">{kr.keyResult}</td>
                              <td className="px-4 py-3 text-gray-600">{kr.target}</td>
                              <td className="px-4 py-3 text-gray-600">{kr.actual}</td>
                              <td className="px-4 py-3 w-32"><ProgressBar value={kr.progress} color={PROGRESS_COLOR[kr.status]} height="sm" /></td>
                              <td className="px-4 py-3 text-gray-600">{kr.owner}</td>
                              <td className="px-4 py-3 text-gray-600">{kr.targetDate}</td>
                              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[kr.status]}`}>{kr.status}</span></td>
                            </tr>
                            {kr.delayed && expandedIdx === globalIdx && (
                              <tr key={`${i}-detail`} className="bg-red-50">
                                <td colSpan={7} className="px-4 py-3">
                                  <div className="grid md:grid-cols-4 gap-4 text-xs">
                                    {[['Reason', kr.reason], ['Impact', kr.impact], ['Mitigation', kr.mitigation], ['Recovery Plan', kr.recoveryPlan]].map(([label, val]) => (
                                      <div key={label}>
                                        <p className="font-semibold text-red-700 mb-1">{label}</p>
                                        <p className="text-red-800">{val || '—'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ label, adminPath }: { label: string; adminPath: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-gray-400 text-sm mb-2">No {label} added yet</p>
      <a href={adminPath} className="text-sm text-blue-600 hover:underline font-medium">Go to Admin → {label} →</a>
    </div>
  );
}

export { EmptyState };
