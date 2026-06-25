import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import type { GovernanceLevel, GovernanceSession } from '../../types';

interface LevelMeta {
  label: string;
  frequency: string;
  what: string[];
  why: string[];
  who: string[];
  accent: string;       // Tailwind bg color for icon bg
  accentText: string;   // text color
  accentBorder: string; // border color
  badgeBg: string;
  dotColor: string;
  icon: string;
}

const LEVEL_META: Record<GovernanceLevel, LevelMeta> = {
  daily: {
    label: 'Daily Standup',
    frequency: 'Daily',
    what: ['Roadmap (start of sprint)', 'Sprint Goals', 'Features', 'User stories'],
    why: ['Pod knowing their pace of work and alignment', 'Trade offs, extensions, story splits, operational flux'],
    who: ['Open to all'],
    accent: 'bg-slate-100',
    accentText: 'text-slate-600',
    accentBorder: 'border-slate-300',
    badgeBg: 'bg-slate-100 text-slate-600',
    dotColor: 'bg-slate-400',
    icon: '☀️',
  },
  fortnightly: {
    label: 'Fortnightly Showcase',
    frequency: 'Every 2 Weeks',
    what: ['Roadmap', 'Sprint Goals', 'Sprint Demo', 'Learnings'],
    why: [
      'Reiterating Product Goals and Key Decisions',
      'Showcasing progress against the roadmap',
      'Showcasing what has been done in the sprint',
      'Key Learnings',
    ],
    who: ['Open to all'],
    accent: 'bg-blue-50',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-700',
    dotColor: 'bg-blue-500',
    icon: '🔁',
  },
  exco: {
    label: 'ExCo Alignment',
    frequency: 'Every 4–6 Weeks',
    what: [
      'Budget Utilization',
      'Progress on Roadmap (delays, changes, risks)',
      'Success Metrics & Product Data',
      'Progress against OKRs',
      'Gating decisions',
    ],
    why: ['Showcasing value created with the resources allocated'],
    who: ['Viraj', 'Santhosh', 'Chandar', 'Varun Basu', 'Jojo'],
    accent: 'bg-purple-50',
    accentText: 'text-purple-600',
    accentBorder: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-700',
    dotColor: 'bg-purple-500',
    icon: '🎯',
  },
  quarterly: {
    label: 'Ecosystem Showcase',
    frequency: 'Quarterly',
    what: [
      'Showcase of previous quarter work and relevance to partners',
      'Feedback: quarterly review + market delta',
    ],
    why: [
      'Showcasing what we are building',
      'Receiving feedback from go-to-market partners',
      'Understanding market gap',
      'Updating Roadmap for the quarter',
    ],
    who: ['All partner PoCs', 'Internal partnership team', 'Product Owner + CPO', 'Principal architect'],
    accent: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    dotColor: 'bg-emerald-500',
    icon: '🌍',
  },
};

const LEVEL_ORDER: GovernanceLevel[] = ['daily', 'fortnightly', 'exco', 'quarterly'];

function fmtDate(d: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function InfoTooltip({ meta }: { meta: LevelMeta }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`Info about ${meta.label}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-6 top-0 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-left">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">{meta.label}</p>
          {[
            { label: 'What', items: meta.what },
            { label: 'Why', items: meta.why },
            { label: 'Who', items: meta.who },
          ].map(({ label, items }) => (
            <div key={label} className="mb-2.5 last:mb-0">
              <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
              <ul className="space-y-0.5">
                {items.map((w, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  level,
  sessions,
}: {
  level: GovernanceLevel;
  sessions: GovernanceSession[];
}) {
  const meta = LEVEL_META[level];
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const count = sessions.length;

  return (
    <div className={`rounded-xl border ${meta.accentBorder} ${meta.accent} p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <p className={`text-sm font-bold ${meta.accentText}`}>{meta.label}</p>
            <p className="text-xs text-gray-500">{meta.frequency}</p>
          </div>
        </div>
        <InfoTooltip meta={meta} />
      </div>
      <div className="border-t border-gray-200 pt-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Last session</p>
          <p className="text-sm font-semibold text-gray-800">
            {last ? fmtDate(last.date) : <span className="text-gray-400 font-normal">None yet</span>}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badgeBg}`}>
          {count} {count === 1 ? 'session' : 'sessions'}
        </span>
      </div>
    </div>
  );
}

function SessionEntry({ session, isLast }: { session: GovernanceSession; isLast?: boolean }) {
  const meta = LEVEL_META[session.level];
  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-3 h-3 rounded-full mt-1 ring-2 ring-white ${meta.dotColor}`} />
        {!isLast && <div className="flex-1 w-px bg-gray-200 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badgeBg}`}>
            {meta.label}
          </span>
          <span className="text-sm font-medium text-gray-700">{fmtDate(session.date)}</span>
          {session.presentationLink && (
            <a
              href={session.presentationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Slides
            </a>
          )}
        </div>

        {session.keyPoints.length > 0 && (
          <ul className="space-y-1 mb-1.5">
            {session.keyPoints.map((pt, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotColor} opacity-70`} />
                {pt}
              </li>
            ))}
          </ul>
        )}

        {session.attendees && (
          <p className="text-xs text-gray-400">
            <span className="font-medium text-gray-500">Attendees:</span> {session.attendees}
          </p>
        )}
      </div>
    </div>
  );
}

export function S_Governance() {
  const { data } = useStore();
  const sessions = data.governanceSessions ?? [];
  const allSorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="w-full p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Governance</h2>
        <p className="text-gray-500 text-sm">
          Tracking governance cadence across daily standups to quarterly ecosystem showcases.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {LEVEL_ORDER.map(level => (
          <SummaryTile
            key={level}
            level={level}
            sessions={sessions.filter(s => s.level === level)}
          />
        ))}
      </div>

      {/* Session log */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Session Log
        </h3>

        {allSorted.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-400 text-sm">No sessions recorded yet.</p>
            <p className="text-gray-400 text-xs mt-1">Sessions added in the admin portal will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 px-6 pt-5 pb-1">
            {allSorted.map((s, i) => (
              <SessionEntry key={s.id} session={s} isLast={i === allSorted.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
