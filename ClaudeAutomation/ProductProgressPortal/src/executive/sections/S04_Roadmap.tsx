import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from './S03_OKRProgress';
import type { RoadmapItem, Status } from '../../types';

const STATUS_STYLE: Record<RoadmapItem['status'], string> = {
  'Completed': 'bg-green-100 text-green-800', 'In Progress': 'bg-blue-100 text-blue-800',
  'Upcoming': 'bg-gray-100 text-gray-700', 'Delayed': 'bg-red-100 text-red-800',
};

export function S04_Roadmap() {
  const { data } = useStore();
  const items = data.roadmap;
  const [view, setView] = useState<'timeline' | 'quarter'>('quarter');
  const quarters = [...new Set(items.map(i => i.quarter).filter(Boolean))].sort();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Roadmap</h2>
          <p className="text-gray-500 text-sm">Where we are and where we're headed</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(['quarter', 'timeline'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? <EmptyState label="Roadmap" adminPath="/admin/roadmap" /> : (
        <>
          {view === 'quarter' && (
            <div className="space-y-6">
              {quarters.map(q => (
                <div key={q}>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 px-1">{q}</h3>
                  <div className="space-y-2">
                    {items.filter(i => i.quarter === q).map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-blue-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{item.item}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>{item.status}</span>
                            <StatusBadge status={item.confidence as Status} size="sm" />
                          </div>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          {item.dependencies && <p className="text-xs text-gray-400 mt-1">Depends on: {item.dependencies}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{item.deliveryWindow}</p>
                          <p className="text-xs text-gray-400">{item.phase}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {view === 'timeline' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Item', 'Phase', 'Quarter', 'Delivery Window', 'Status', 'Confidence', 'Dependencies'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.item}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.phase}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.quarter}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.deliveryWindow}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[item.status]}`}>{item.status}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={item.confidence as Status} size="sm" /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.dependencies || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
