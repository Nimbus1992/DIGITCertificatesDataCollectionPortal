import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/DataStore';
import type { CmsItemColor, CmsRoadmapData } from '../../types';

const COLOR_CLASS: Record<CmsItemColor, string> = {
  teal:   'bg-teal-500 text-white',
  sky:    'bg-sky-400 text-white',
  green:  'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
  orange: 'bg-orange-500 text-white',
  navy:   'bg-slate-800 text-white',
  maroon: 'bg-red-800 text-white',
};

// Pill component for colored items
function Pill({ text, color }: { text: string; color: CmsItemColor }) {
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded font-medium leading-snug ${COLOR_CLASS[color]}`}>
      {text}
    </span>
  );
}

export function CmsRoadmap() {
  const { data } = useStore();
  const rm: CmsRoadmapData = data.cmsRoadmap;
  const [showLog, setShowLog] = useState(false);

  const releases = rm.releases;

  // Helper: get items for a release from an array of items with releaseId
  function forRelease<T extends { releaseId: string }>(items: T[], releaseId: string): T[] {
    return items.filter(i => i.releaseId === releaseId);
  }

  // Helper: get bundle/metrics for a release
  function bundleFor(arr: { releaseId: string; items: string[] }[], releaseId: string): string[] {
    return arr.find(b => b.releaseId === releaseId)?.items ?? [];
  }

  // Left column width class
  const LEFT = 'w-44 min-w-[11rem] flex-none';
  // Each release column width
  const COL = 'min-w-[180px] flex-1';

  return (
    <div className="p-4 md:p-6 max-w-full space-y-6">
      {/* Roadmap comment banner */}
      {(data.roadmapComment ?? '') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Note from Product Team</p>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{data.roadmapComment}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Product Roadmap</h2>
          <p className="text-gray-500 text-sm">Complaint Management System — Goal, Value &amp; Feature roadmap</p>
        </div>
        {/* Colour legend — driven by admin-managed themes */}
        {rm.themes.length > 0 && (
          <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Legend</p>
            <div className="space-y-1.5">
              {rm.themes.map(({ color, label }) => (
                <div key={color} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm shrink-0 ${COLOR_CLASS[color].split(' ')[0]}`} />
                  <span className="text-xs text-gray-700 whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="min-w-[1000px]">

          {/* ── Release column headers ── */}
          <div className="flex border-b border-gray-200 bg-gray-900">
            <div className={`${LEFT} px-4 py-3`} />
            {releases.map(r => (
              <div key={r.id} className={`${COL} px-3 py-3 border-l border-gray-700 relative`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {r.hasStar && <span className="text-yellow-400 text-sm">★</span>}
                  <p className="text-xs font-bold text-white leading-tight">{r.name}</p>
                </div>
                <p className="text-xs text-gray-400">{r.timeframe}</p>
                {r.isCurrent && (
                  <span className="absolute top-1 right-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">Current</span>
                )}
              </div>
            ))}
          </div>

          {/* ── Goal Roadmap section ── */}
          <div className="flex border-b border-gray-100">
            <div className={`${LEFT} px-4 py-4 bg-gray-800 flex items-center`}>
              <p className="text-xs font-bold text-white uppercase tracking-wide leading-snug">Goal roadmap</p>
            </div>
            {releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-3 border-l border-gray-100 flex flex-col gap-1.5">
                {forRelease(rm.goals, r.id).map(g => (
                  <Pill key={g.id} text={g.text} color={g.color} />
                ))}
              </div>
            ))}
          </div>

          {/* ── Value Bundle section ── */}
          <div className="flex border-b border-gray-100">
            <div className={`${LEFT} px-4 py-4 bg-gray-100 flex items-center`}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-snug">Value bundle</p>
            </div>
            {releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-3 border-l border-gray-100">
                <ul className="space-y-1">
                  {bundleFor(rm.valueBundles, r.id).map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5 items-start">
                      <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Success Metric section ── */}
          <div className="flex border-b border-gray-200">
            <div className={`${LEFT} px-4 py-4 bg-gray-100 flex items-center`}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-snug">Success metric</p>
            </div>
            {releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-3 border-l border-gray-100">
                <ul className="space-y-1">
                  {bundleFor(rm.successMetrics, r.id).map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5 items-start">
                      <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Feature Roadmap header ── */}
          <div className="flex border-b border-gray-200 bg-gray-900">
            <div className="w-full px-4 py-2.5 flex items-center gap-3">
              <p className="text-sm font-bold text-white">Feature roadmap</p>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
          </div>

          {/* ── Feature column sub-headers ── */}
          <div className="flex border-b border-gray-200 bg-gray-800/60">
            <div className={`${LEFT} px-4 py-2`}>
              <div className="flex gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>Module</span>
                <span>/</span>
                <span>Actor</span>
              </div>
            </div>
            {releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-2 border-l border-gray-700">
                <p className="text-xs font-semibold text-gray-400">{r.timeframe}</p>
              </div>
            ))}
          </div>

          {/* ── Module group rows ── */}
          {rm.moduleGroups.map((mg, mgIdx) => (
            <div key={mg.id} className={`flex border-b border-gray-100 ${mgIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              {/* Left: module names + actor badges */}
              <div className={`${LEFT} px-3 py-3 border-r border-gray-100`}>
                <div className="space-y-0.5 mb-2">
                  {mg.modules.map((m, i) => (
                    <p key={i} className="text-xs font-semibold text-gray-800 leading-snug">{m}</p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {mg.actors.map((a, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded font-medium">{a}</span>
                  ))}
                </div>
              </div>
              {/* Right: feature items per release */}
              {releases.map(r => (
                <div key={r.id} className="flex-1 min-w-[180px] px-3 py-3 border-l border-gray-100 flex flex-col gap-1.5">
                  {forRelease(mg.items, r.id).map(item => (
                    <Pill key={item.id} text={item.text} color={item.color} />
                  ))}
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>

      {/* ── Update Log collapsible ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowLog(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <span className="font-semibold text-sm">Update log ({rm.updateLog.length} entries)</span>
          {showLog ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {showLog && (
          <div className="px-6 py-5 space-y-5">
            {rm.updateLog.map(entry => (
              <div key={entry.id}>
                <p className="text-xs font-bold text-gray-800 mb-1.5">Changes affected on {entry.date}</p>
                <ul className="space-y-0.5">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2 items-start">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
