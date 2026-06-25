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

function Pill({ text, color }: { text: string; color: CmsItemColor }) {
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded font-medium leading-snug ${COLOR_CLASS[color]}`}>
      {text}
    </span>
  );
}

// ── Seed / fallback data ──────────────────────────────────────────────────────

const STUDIO_SEED: CmsRoadmapData = {
  releases: [
    { id: 'r0',  name: 'Month 0',       timeframe: 'May 31, 2026',    isCurrent: false, hasStar: false },
    { id: 'r05', name: 'Release 0.5 ★', timeframe: 'June 30, 2026',   isCurrent: true,  hasStar: true  },
    { id: 'r07', name: 'Release 0.7 ★', timeframe: 'July 31, 2026',   isCurrent: false, hasStar: true  },
    { id: 'r09', name: 'Release 0.9 ★', timeframe: 'August 31, 2026', isCurrent: false, hasStar: true  },
    { id: 'r10', name: 'Release 1.0 ★', timeframe: 'Pre Go Live',     isCurrent: false, hasStar: true  },
  ],
  themes: [
    { color: 'teal',   label: 'Studio Installation' },
    { color: 'green',  label: 'Build, Test, Deploy a Service' },
    { color: 'purple', label: 'End User App' },
    { color: 'orange', label: 'Usability' },
    { color: 'navy',   label: 'Tech Debt' },
  ],
  goals: [
    { id: 'g0',  text: 'Enable Studio setup and deployment without developer support',                                    color: 'teal',  releaseId: 'r0'  },
    { id: 'g05', text: 'Enable business user-led service configuration for standard permit workflows',                    color: 'green', releaseId: 'r05' },
    { id: 'g07', text: 'Improve scalability and standardization of service configuration through reusable templates',     color: 'green', releaseId: 'r07' },
    { id: 'g09', text: 'Accelerate service creation and deployment with governance and globalisation UIs',                color: 'green', releaseId: 'r09' },
    { id: 'g10', text: 'Achieve production-grade stability, compliance, and migration readiness',                         color: 'navy',  releaseId: 'r10' },
  ],
  valueBundles: [
    { releaseId: 'r0',  items: ['Faster environment setup and deployment following steps from documentation'] },
    { releaseId: 'r05', items: ['Reduced dependency on engineering for service setup and multiple modules in a service'] },
    { releaseId: 'r07', items: ['Faster configuration cycle with availability of pre-configured templates'] },
    { releaseId: 'r09', items: ['Rapid service bootstrap with centralized templates and admin controls'] },
    { releaseId: 'r10', items: ['Lower production risk and easier long-term platform operations'] },
  ],
  successMetrics: [
    { releaseId: 'r0',  items: ['Studio deployed locally in <30 mins'] },
    { releaseId: 'r05', items: ['1 permit service configured with payments and multiple modules with minimal engineering dependency in <2 hours'] },
    { releaseId: 'r07', items: ['At least 5 services configured using templates in <1 hour without engineering support'] },
    { releaseId: 'r09', items: ["All Djibouti's permit services configured and deployed in a demo environment without engineering support in a day"] },
    { releaseId: 'r10', items: ['0 high severity issues during production readiness validation'] },
  ],
  moduleGroups: [
    { id: 'mg1', modules: ['Studio Installation and Setup'], actors: [], items: [
      { id: 'f1', text: 'Local Laptop Deployment',  color: 'teal', releaseId: 'r0'  },
      { id: 'f2', text: 'One Click Deployment',      color: 'teal', releaseId: 'r0'  },
      { id: 'f3', text: 'Theme UI',                  color: 'teal', releaseId: 'r07' },
      { id: 'f4', text: 'MDMS UI',                   color: 'teal', releaseId: 'r09' },
      { id: 'f5', text: 'Boundary UI',               color: 'teal', releaseId: 'r09' },
    ]},
    { id: 'mg2', modules: ['Template'], actors: [], items: [
      { id: 'f6', text: 'Pre-configured Templates',   color: 'green', releaseId: 'r07' },
      { id: 'f7', text: 'Template Introduction Page', color: 'green', releaseId: 'r07' },
    ]},
    { id: 'mg3', modules: ['Configuring Service'], actors: [], items: [
      { id: 'f8',  text: 'Payments Configuration UI',                                               color: 'green', releaseId: 'r05' },
      { id: 'f9',  text: 'Billing Calculator UI — Fixed + User Entered + API as plugins',           color: 'green', releaseId: 'r05' },
      { id: 'f10', text: 'Multiple Modules in one Service + Logic for connectivity between modules', color: 'green', releaseId: 'r05' },
      { id: 'f11', text: '2–3 PDF Templates without configurability',                               color: 'green', releaseId: 'r05' },
      { id: 'f12', text: 'PDF Configuration UI',                                                    color: 'green', releaseId: 'r07' },
      { id: 'f13', text: 'Multi-language Support',                                                  color: 'green', releaseId: 'r09' },
      { id: 'f14', text: 'Workflow Revamp',                                                         color: 'green', releaseId: 'r09' },
      { id: 'f15', text: 'Make Roles More Intuitive',                                               color: 'green', releaseId: 'r09' },
    ]},
    { id: 'mg4', modules: ['Performance & Scale'], actors: [], items: [
      { id: 'f16', text: 'Dashboards', color: 'green', releaseId: 'r07' },
    ]},
    { id: 'mg5', modules: ['Citizen Interface'], actors: [], items: [
      { id: 'f17', text: 'Citizen Service Catalogue',                   color: 'purple', releaseId: 'r09' },
      { id: 'f18', text: 'Rendering of Catalogue from Another Website', color: 'purple', releaseId: 'r09' },
    ]},
    { id: 'mg6', modules: ['Performance of Studio'], actors: [], items: [
      { id: 'f19', text: 'Accessibility Report',          color: 'orange', releaseId: 'r0'  },
      { id: 'f20', text: 'Performance Report — Load + UI', color: 'orange', releaseId: 'r0'  },
      { id: 'f21', text: 'Security Report',               color: 'orange', releaseId: 'r0'  },
      { id: 'f22', text: 'Accessibility Fixes',           color: 'orange', releaseId: 'r10' },
      { id: 'f23', text: 'Performance Fixes — Load + UI', color: 'orange', releaseId: 'r10' },
      { id: 'f24', text: 'Security Fixes',                color: 'orange', releaseId: 'r10' },
    ]},
    { id: 'mg7', modules: ['Tech Debt'], actors: [], items: [
      { id: 'f25', text: 'Code Review Report',         color: 'navy', releaseId: 'r0'  },
      { id: 'f26', text: 'Architecture Review Report', color: 'navy', releaseId: 'r0'  },
      { id: 'f27', text: 'Code Review Fixes',          color: 'navy', releaseId: 'r10' },
      { id: 'f28', text: 'Architecture Review Fixes',  color: 'navy', releaseId: 'r10' },
      { id: 'f29', text: 'Migration to 3.0',           color: 'navy', releaseId: 'r10' },
    ]},
  ],
  masterModules: [
    'Studio Installation and Setup', 'Template', 'Configuring Service',
    'Testing & Iterating the Service', 'Deploying the Service', 'User Creation and Management',
    'Upgrading & Managing Upgrades', 'Performance & Scale', 'Citizen Interface',
    'Consent Management', 'Performance of Studio', 'Tech Debt',
  ],
  masterActors: [],
  updateLog: [],
};

// ── Component ────────────────────────────────────────────────────────────────

export function StudioRoadmap() {
  const { data } = useStore();
  const stored = data.studioRoadmap;
  const rm: CmsRoadmapData = stored.releases.length > 0 ? stored : STUDIO_SEED;

  const [showNotes, setShowNotes] = useState(false);

  const LEFT = 'w-44 min-w-[11rem] flex-none';
  const COL  = 'min-w-[180px] flex-1';

  function forRelease<T extends { releaseId: string }>(items: T[], id: string) {
    return items.filter(i => i.releaseId === id);
  }
  function bundleFor(arr: { releaseId: string; items: string[] }[], id: string) {
    return arr.find(b => b.releaseId === id)?.items ?? [];
  }

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
          <p className="text-gray-500 text-sm">DIGIT Studio — Faster Permit Deployments Through No-Code Enablement</p>
        </div>
        {/* Legend */}
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
      </div>

      {/* Main grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="min-w-[1000px]">

          {/* Release column headers */}
          <div className="flex border-b border-gray-200 bg-gray-900">
            <div className={`${LEFT} px-4 py-3`} />
            {rm.releases.map(r => (
              <div key={r.id} className={`${COL} px-3 py-3 border-l border-gray-700 relative`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs font-bold text-white leading-tight">{r.name}</p>
                </div>
                <p className="text-xs text-gray-400">{r.timeframe}</p>
                {r.isCurrent && (
                  <span className="absolute top-1 right-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">Current</span>
                )}
              </div>
            ))}
          </div>

          {/* Goal Roadmap */}
          <div className="flex border-b border-gray-100">
            <div className={`${LEFT} px-4 py-4 bg-gray-800 flex items-center`}>
              <p className="text-xs font-bold text-white uppercase tracking-wide leading-snug">Goal roadmap</p>
            </div>
            {rm.releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-3 border-l border-gray-100 flex flex-col gap-1.5">
                {forRelease(rm.goals, r.id).map((g, i) => (
                  <Pill key={i} text={g.text} color={g.color} />
                ))}
              </div>
            ))}
          </div>

          {/* Value Bundle */}
          <div className="flex border-b border-gray-100">
            <div className={`${LEFT} px-4 py-4 bg-gray-100 flex items-center`}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-snug">Value bundle</p>
            </div>
            {rm.releases.map(r => (
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

          {/* Success Metric */}
          <div className="flex border-b border-gray-200">
            <div className={`${LEFT} px-4 py-4 bg-gray-100 flex items-center`}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-snug">Success metric</p>
            </div>
            {rm.releases.map(r => (
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

          {/* Feature Roadmap header */}
          <div className="flex border-b border-gray-200 bg-gray-900">
            <div className="w-full px-4 py-2.5 flex items-center gap-3">
              <p className="text-sm font-bold text-white">Feature roadmap</p>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
          </div>

          {/* Feature sub-headers */}
          <div className="flex border-b border-gray-200 bg-gray-800/60">
            <div className={`${LEFT} px-4 py-2`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Module</p>
            </div>
            {rm.releases.map(r => (
              <div key={r.id} className="flex-1 min-w-[180px] px-3 py-2 border-l border-gray-700">
                <p className="text-xs font-semibold text-gray-400">{r.timeframe}</p>
              </div>
            ))}
          </div>

          {/* Module rows */}
          {rm.moduleGroups.map((mg, idx) => (
            <div key={mg.id} className={`flex border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className={`${LEFT} px-3 py-3 border-r border-gray-100`}>
                {mg.modules.map((m, i) => (
                  <p key={i} className="text-xs font-semibold text-gray-800 leading-snug">{m}</p>
                ))}
              </div>
              {rm.releases.map(r => (
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

      {/* Source note collapsible */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowNotes(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <span className="font-semibold text-sm">Roadmap notes</span>
          {showNotes ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {showNotes && (
          <div className="px-6 py-5 space-y-2 text-xs text-gray-600">
            <p>• Source: DIGIT Studio Roadmap — June to August</p>
            <p>• Release 0.5 is the current release (June 30, 2026)</p>
            <p>• Month 0 (End of May) covers baseline setup and audit reports</p>
            <p>• Release 1.0 (Pre Go Live) includes production-grade fixes and Migration to 3.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
