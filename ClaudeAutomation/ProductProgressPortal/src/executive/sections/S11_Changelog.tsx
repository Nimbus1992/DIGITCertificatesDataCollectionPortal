import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';

const TYPE_COLOR: Record<string, string> = {
  Milestone: 'bg-blue-100 text-blue-800', Budget: 'bg-amber-100 text-amber-800',
  Risk: 'bg-red-100 text-red-800', Roadmap: 'bg-purple-100 text-purple-800',
  Artifact: 'bg-green-100 text-green-800', Conversation: 'bg-teal-100 text-teal-800',
};

export function S11_Changelog() {
  const { data } = useStore();
  const entries = data.changelog;
  const [view, setView] = useState<'timeline' | 'weekly'>('timeline');

  const byMonth = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const month = entry.date ? entry.date.substring(0, 7) : 'Unknown';
    if (!acc[month]) acc[month] = [];
    acc[month]!.push(entry);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Changelog</h2>
          <p className="text-gray-500 text-sm">What changed and when</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(['timeline', 'weekly'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? <EmptyState label="Changelog" adminPath="/admin/changelog" /> : (
        <>
          {view === 'timeline' && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-4 pl-10">
                {entries.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow" />
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-gray-400">{entry.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[entry.changeType] ?? 'bg-gray-100 text-gray-700'}`}>{entry.changeType}</span>
                        {entry.section && <span className="text-xs text-gray-400">{entry.section}</span>}
                      </div>
                      <p className="text-sm text-gray-800">{entry.description}</p>
                      {entry.author && <p className="text-xs text-gray-400 mt-1">{entry.author}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 'weekly' && (
            <div className="space-y-6">
              {Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthEntries]) => (
                <div key={month}>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">{month}</h3>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                    {(monthEntries ?? []).map((entry, idx) => (
                      <div key={idx} className="px-5 py-3 flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLOR[entry.changeType] ?? 'bg-gray-100 text-gray-700'}`}>{entry.changeType}</span>
                        <p className="text-sm text-gray-800 flex-1">{entry.description}</p>
                        <span className="text-xs text-gray-400 shrink-0">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
