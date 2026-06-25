import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/DataStore';
import type { OKRMilestone, OKRTask, MilestoneStatus } from '../../types';

// ── Gantt configuration ────────────────────────────────────────────────────

const GANTT_START = new Date('2026-04-01');
const TOTAL_DAYS = 183; // Apr(30)+May(31)+Jun(30)+Jul(31)+Aug(31)+Sep(30)

const MONTHS = [
  { label: 'Apr', startDay: 0,   days: 30 },
  { label: 'May', startDay: 30,  days: 31 },
  { label: 'Jun', startDay: 61,  days: 30 },
  { label: 'Jul', startDay: 91,  days: 31 },
  { label: 'Aug', startDay: 122, days: 31 },
  { label: 'Sep', startDay: 153, days: 30 },
];

function toPct(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const days = (d.getTime() - GANTT_START.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.min(100, (days / TOTAL_DAYS) * 100));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calcDelay(committed: string, revised: string): number | null {
  if (!committed || !revised) return null;
  const c = new Date(committed), r = new Date(revised);
  if (isNaN(c.getTime()) || isNaN(r.getTime())) return null;
  return Math.round((r.getTime() - c.getTime()) / (1000 * 60 * 60 * 24));
}

const TODAY_PCT = (() => {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.max(0, Math.min(100, (t.getTime() - GANTT_START.getTime()) / (1000 * 60 * 60 * 24) / TOTAL_DAYS * 100));
})();

// ── Styles ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Complete':    'bg-green-100 text-green-700',
  'Delayed':     'bg-red-100 text-red-700',
  'At Risk':     'bg-amber-100 text-amber-700',
};

// ── Gantt bar ──────────────────────────────────────────────────────────────

function GanttBar({ committedDate, revisedDate, sm = false }: {
  committedDate: string; revisedDate: string; sm?: boolean;
}) {
  const cp = toPct(committedDate);
  const rp = toPct(revisedDate);
  const delay = calcDelay(committedDate, revisedDate);
  const isDelayed = delay !== null && delay > 0;
  const isEarly  = delay !== null && delay < 0;
  const dot = sm ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="absolute inset-y-0 left-3 right-3 flex items-center">
      {MONTHS.map(m => (
        <div key={m.label} className="absolute top-0 bottom-0 border-l border-gray-100"
             style={{ left: `${(m.startDay / TOTAL_DAYS) * 100}%` }} />
      ))}
      <div className="absolute left-0 right-0 h-px bg-gray-100" />
      <div className="absolute top-0 bottom-0 w-px bg-red-400/50" style={{ left: `${TODAY_PCT}%` }} />

      {cp !== null && rp !== null && Math.abs(rp - cp) > 0.3 && (
        <div className={`absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full ${isDelayed ? 'bg-red-300' : isEarly ? 'bg-green-300' : 'bg-gray-200'}`}
             style={{ left: `${Math.min(cp, rp)}%`, width: `${Math.abs(rp - cp)}%` }} />
      )}

      {cp !== null && (
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
             style={{ left: `${cp}%` }}>
          <div className={`rounded-full bg-blue-500 border-2 border-white shadow ${dot}`} />
        </div>
      )}

      {rp !== null && (
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
             style={{ left: `${rp}%` }}>
          <div className={`rotate-45 border-2 border-white shadow ${dot} ${
            isDelayed ? 'bg-red-500' : isEarly ? 'bg-green-500' : cp === null ? 'bg-gray-400' : 'bg-blue-400'
          }`} />
        </div>
      )}
    </div>
  );
}

// ── Subtask row ────────────────────────────────────────────────────────────

function SubtaskRow({ task }: { task: OKRTask }) {
  const delay = calcDelay(task.committedDate, task.revisedDate);

  return (
    <div className="flex border-b border-gray-50 bg-gray-50/30">
      <div className="w-40 sm:w-80 flex-none px-4 py-1.5 pl-20">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs text-gray-300 shrink-0">{task.id}</span>
          <p className="text-xs text-gray-600 leading-snug line-clamp-2">{task.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status]}`}>{task.status}</span>
          <span className="text-xs text-gray-400">{task.owner}</span>
          {task.revisedDate && <span className="text-xs text-gray-400">→ {formatDate(task.revisedDate)}</span>}
          {delay !== null && Math.abs(delay) > 0 && (
            <span className={`text-xs font-semibold ${delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {delay > 0 ? `+${delay}d` : `${delay}d`}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 px-3 min-h-[40px] relative">
        <GanttBar committedDate={task.committedDate} revisedDate={task.revisedDate} sm />
      </div>
    </div>
  );
}

// ── Task row ───────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: OKRTask }) {
  const [expanded, setExpanded] = useState(false);
  const delay = calcDelay(task.committedDate, task.revisedDate);
  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;

  return (
    <>
      <div
        className={`flex border-b border-gray-50 bg-gray-50/50 transition-colors ${hasSubtasks ? 'cursor-pointer hover:bg-blue-50/60' : ''}`}
        onClick={() => hasSubtasks && setExpanded(e => !e)}
      >
        <div className="w-40 sm:w-80 flex-none px-4 py-2 pl-12">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`shrink-0 ${hasSubtasks ? 'text-blue-500' : 'text-gray-200'}`}>
              {hasSubtasks
                ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
                : <span className="inline-block w-3" />}
            </span>
            <span className="font-mono text-xs text-gray-400 shrink-0">{task.id}</span>
            <p className="text-xs text-gray-700 leading-snug line-clamp-2">{task.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 pl-4">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status]}`}>{task.status}</span>
            <span className="text-xs text-gray-400">{task.owner}</span>
            {task.revisedDate && <span className="text-xs text-gray-400">→ {formatDate(task.revisedDate)}</span>}
            {delay !== null && Math.abs(delay) > 0 && (
              <span className={`text-xs font-semibold ${delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {delay > 0 ? `+${delay}d` : `${delay}d`}
              </span>
            )}
            {hasSubtasks && (
              <span className="text-xs text-gray-400">{task.subtasks!.length} subtask{task.subtasks!.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 px-3 min-h-[48px] relative">
          <GanttBar committedDate={task.committedDate} revisedDate={task.revisedDate} sm />
        </div>
      </div>

      {expanded && task.subtasks?.map(st => <SubtaskRow key={st.id} task={st} />)}
    </>
  );
}

// ── Milestone row ──────────────────────────────────────────────────────────

function MilestoneRow({ milestone }: { milestone: OKRMilestone }) {
  const [expanded, setExpanded] = useState(false);
  const delay = calcDelay(milestone.committedDate, milestone.revisedDate);
  const hasTasks = milestone.tasks.length > 0;

  return (
    <>
      <div
        className={`flex border-b border-gray-100 transition-colors ${hasTasks ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-gray-50/50'}`}
        onClick={() => hasTasks && setExpanded(e => !e)}
      >
        <div className="w-40 sm:w-80 flex-none px-4 py-3">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 text-gray-400 shrink-0">
              {hasTasks
                ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
                : <span className="inline-block w-3.5" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-blue-600 shrink-0">#{milestone.id}</span>
                <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{milestone.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[milestone.status]}`}>{milestone.status}</span>
                <span className="text-xs text-gray-500">{milestone.owner}</span>
                {(milestone.committedDate || milestone.revisedDate) && (
                  <span className="text-xs text-gray-400">
                    {formatDate(milestone.committedDate)} → {formatDate(milestone.revisedDate)}
                  </span>
                )}
                {delay !== null && Math.abs(delay) > 0 && (
                  <span className={`text-xs font-bold ${delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {delay > 0 ? `+${delay}d` : `${Math.abs(delay)}d early`}
                  </span>
                )}
                {hasTasks && (
                  <span className="text-xs text-gray-400">{milestone.tasks.length} task{milestone.tasks.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 px-3 min-h-[64px] relative">
          <GanttBar committedDate={milestone.committedDate} revisedDate={milestone.revisedDate} />
        </div>
      </div>

      {expanded && milestone.tasks.map(t => <TaskRow key={t.id} task={t} />)}
    </>
  );
}

// ── Key Result group ───────────────────────────────────────────────────────

function KeyResultGroup({ keyResult, milestones }: { keyResult: string; milestones: OKRMilestone[] }) {
  return (
    <>
      <div className="flex border-b border-gray-200 bg-indigo-50/60">
        <div className="w-40 sm:w-80 flex-none px-4 py-2">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">KR · {keyResult}</p>
          <p className="text-xs text-indigo-500 mt-0.5">{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 min-w-0 px-3 min-h-[40px] relative">
          {MONTHS.map(m => (
            <div key={m.label} className="absolute top-0 bottom-0 border-l border-indigo-100"
                 style={{ left: `${(m.startDay / TOTAL_DAYS) * 100}%` }} />
          ))}
          <div className="absolute top-0 bottom-0 w-px bg-red-400/50" style={{ left: `${TODAY_PCT}%` }} />
        </div>
      </div>
      {milestones.map(m => <MilestoneRow key={m.id} milestone={m} />)}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function S03_OKRProgress() {
  const { data } = useStore();
  const milestones = (data.milestones ?? []).filter(m => m.rowType !== 'launch');
  const [krFilter, setKrFilter] = useState('All');

  const keyResults = ['All', ...Array.from(new Set(milestones.map(m => m.keyResult)))];
  const filtered = krFilter === 'All' ? milestones : milestones.filter(m => m.keyResult === krFilter);

  const counts: Partial<Record<MilestoneStatus, number>> = {};
  for (const m of milestones) counts[m.status] = (counts[m.status] ?? 0) + 1;

  if (milestones.length === 0) {
    return (
      <div className="w-full p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Milestone Tracker</h2>
          <p className="text-gray-500 text-sm">Gantt view of milestones and tasks</p>
        </div>
        <EmptyState label="Milestones" adminPath="/admin/okrs" />
      </div>
    );
  }

  // Group filtered milestones by Key Result, preserving order of first occurrence
  const krOrder = Array.from(new Set(filtered.map(m => m.keyResult)));
  const grouped = krOrder.map(kr => ({
    keyResult: kr,
    milestones: filtered.filter(m => m.keyResult === kr),
  }));

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Milestone Tracker</h2>
        <p className="text-gray-500 text-sm">Click a milestone to expand tasks · click a task to expand subtasks</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(counts) as [MilestoneStatus, number][]).map(([status, count]) => (
          <div key={status} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${STATUS_COLOR[status]}`}>
            <span className="text-lg font-bold leading-none">{count}</span>
            <span className="text-xs font-medium">{status}</span>
          </div>
        ))}
      </div>

      {/* Key Result filter */}
      {keyResults.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {keyResults.map(kr => (
            <button key={kr} onClick={() => setKrFilter(kr)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                krFilter === kr ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {kr}
            </button>
          ))}
        </div>
      )}

      {/* Gantt */}
      <div className="overflow-x-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Legend */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Committed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rotate-45 bg-red-500 inline-block" /> Revised (delayed)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rotate-45 bg-green-500 inline-block" /> Revised (early)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-px h-4 bg-red-400" /> Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
        </div>

        {/* Month header */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <div className="w-40 sm:w-80 flex-none px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Milestone / Task</div>
          <div className="flex-1 relative h-9">
            {MONTHS.map(m => (
              <div key={m.label}
                   className="absolute top-0 bottom-0 border-l border-gray-200 flex items-center pl-1.5"
                   style={{ left: `${(m.startDay / TOTAL_DAYS) * 100}%`, width: `${(m.days / TOTAL_DAYS) * 100}%` }}>
                <span className="text-xs font-semibold text-gray-400">{m.label}</span>
              </div>
            ))}
            <div className="absolute top-0 bottom-0 w-px bg-red-400" style={{ left: `${TODAY_PCT}%` }} />
          </div>
        </div>

        {/* Rows grouped by Key Result */}
        {grouped.map(g => (
          <KeyResultGroup key={g.keyResult} keyResult={g.keyResult} milestones={g.milestones} />
        ))}
      </div>
      </div>
    </div>
  );
}

export function EmptyState({ label, adminPath }: { label: string; adminPath: string }) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const fullPath = `/${productSlug}${adminPath}`;
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <p className="text-gray-400 text-sm mb-2">No {label} added yet</p>
      <a href={fullPath} className="text-sm text-blue-600 hover:underline font-medium">Go to Admin → {label} →</a>
    </div>
  );
}
