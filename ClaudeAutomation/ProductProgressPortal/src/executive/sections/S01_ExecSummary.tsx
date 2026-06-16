import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/DataStore';
import { StatusBadge } from '../../components/StatusBadge';
import { KPICard } from '../../components/KPICard';
import type { Status, TeamRole } from '../../types';

const AVATAR_BORDER = 'border-gray-300';
const AVATAR_BG = 'bg-gray-100 text-gray-700';

const ROLE_ORDER: TeamRole[] = ['Product Manager', 'Project Manager', 'Architect', 'Engineers', 'DevOps'];

export function S01_ExecSummary() {
  const { data } = useStore();
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const d = data.execSummary;
  const team = data.team ?? [];
  const openDecisions = data.decisions.filter(dec => dec.status === 'Open').length;

  // Live budget KPIs derived from budget rows
  const budgetRows = data.budget ?? [];
  const totalBudgeted = budgetRows.reduce((s, r) => s + r.budgeted, 0);
  const totalConsumed = budgetRows.reduce((s, r) => s + r.consumed, 0);
  const totalForecast = budgetRows.reduce((s, r) => s + r.forecast, 0);
  const consumedPct   = totalBudgeted > 0 ? Math.round((totalConsumed / totalBudgeted) * 100) : 0;
  const forecastOverrun = Math.max(0, totalForecast - totalBudgeted);
  const overrunPct    = totalBudgeted > 0 ? Math.round((forecastOverrun / totalBudgeted) * 100) : 0;

  function fmtINR(n: number) {
    return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  }

  // Role counts and breakdown
  const roleCounts = team.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] ?? 0) + 1;
    return acc;
  }, {});
  const roleBreakdown = ROLE_ORDER.filter(r => roleCounts[r]).map(r => `${roleCounts[r]} ${r}`);

  // Internal / External counts
  const internalCount = team.filter(m => m.engagement === 'Internal').length;
  const externalCount = team.filter(m => m.engagement === 'External').length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Executive Summary</h2>
        <p className="text-gray-500 text-sm">Complete picture in under 60 seconds</p>
      </div>

      {/* Status Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Confidence Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            ['Overall Status', d.overallStatus],
            ['Delivery', d.deliveryConfidence],
            ['Budget', d.budgetConfidence],
            ['Timeline', d.timelineConfidence],
          ] as [string, Status][]).map(([label, status]) => (
            <div key={label} className="text-center">
              <p className="text-xs text-gray-500 mb-2">{label}</p>
              <StatusBadge status={status} size="md" />
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="OKRs On Track" value={d.okrsOnTrack} unit="%" color="green" />
        <KPICard label="Milestones Completed" value={d.milestonesCompleted} color="blue" />
        <KPICard label="Roadmap Progress" value={d.roadmapProgress} unit="%" color="purple" />
        <KPICard label="Metric Progress" value={d.successMetricProgress} unit="%" color="green" />
        <button onClick={() => navigate(`/${productSlug}/executive/decisions`)} className="text-left cursor-pointer focus:outline-none">
          <KPICard label="Open Decisions" value={openDecisions} color="amber" />
        </button>
      </div>

      {/* Budget KPI Tiles — live from budget data */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Budget Consumed */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
          <p className="text-sm font-medium text-gray-600 mb-2">Budget Consumed</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{fmtINR(totalConsumed)}</p>
          <p className="text-xs text-gray-400 mb-3">
            of {fmtINR(totalBudgeted)} · {consumedPct}% consumed
          </p>
          <button
            onClick={() => navigate(`/${productSlug}/executive/budget`)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View →
          </button>
        </div>

        {/* Forecast Overrun */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
          <p className="text-sm font-medium text-gray-600 mb-2">Forecast Overrun</p>
          <p className={`text-3xl font-bold mb-1 ${forecastOverrun > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {fmtINR(forecastOverrun)}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {forecastOverrun > 0
              ? `${overrunPct}% above budget · forecast ${fmtINR(totalForecast)}`
              : `Within budget · forecast ${fmtINR(totalForecast)}`}
          </p>
          <button
            onClick={() => navigate(`/${productSlug}/executive/budget`)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View →
          </button>
        </div>
      </div>

      {/* Team Deployed */}
      {team.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Deployed</h3>
            <div className="flex items-center gap-4">
              {roleBreakdown.map(r => (
                <span key={r} className="text-xs font-medium text-gray-500">{r}</span>
              ))}
              <div className="flex items-center gap-2 ml-1">
                {internalCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                    {internalCount} INT
                  </span>
                )}
                {externalCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                    {externalCount} EXT
                  </span>
                )}
                <span className="text-2xl font-bold text-gray-900">{team.length} <span className="text-sm font-normal text-gray-400">members</span></span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            {team.map((member, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className={`w-12 h-12 rounded-full object-cover border-[3px] ${AVATAR_BORDER}`}
                      onError={e => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full border-[3px] ${AVATAR_BORDER} items-center justify-center text-xs font-bold ${AVATAR_BG} ${member.photoUrl ? 'hidden' : 'flex'}`}>
                    {member.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  {/* Engagement badge */}
                  <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full border leading-none ${member.engagement === 'External' ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
                    {member.engagement === 'External' ? 'EXT' : 'INT'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium leading-none">{member.name.split(' ')[0]}</span>
                <span className={`text-[10px] font-semibold leading-none ${(member.utilization ?? 100) >= 80 ? 'text-green-600' : (member.utilization ?? 100) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {member.utilization ?? 100}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: '🏆', label: 'Biggest Win', content: d.biggestWin, bg: 'bg-green-50 border-green-100' },
          { icon: '⚠️', label: 'Biggest Risk', content: d.biggestRisk, bg: 'bg-red-50 border-red-100' },
          { icon: '📢', label: 'Most Important Update', content: d.mostImportantUpdate, bg: 'bg-blue-50 border-blue-100' },
        ].map(({ icon, label, content, bg }) => (
          <div key={label} className={`rounded-xl border p-5 ${bg}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{icon} {label}</p>
            <p className="text-sm text-gray-800">{content || <span className="text-gray-400 italic">Not set — update in Admin</span>}</p>
          </div>
        ))}
      </div>

      {/* Action Required */}
      {(d.decisionsNeeded.length > 0 || d.leadershipSupport.length > 0 || d.escalations.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Action Required</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Decisions Needed', items: d.decisionsNeeded, color: 'text-orange-700 bg-orange-50' },
              { label: 'Leadership Support', items: d.leadershipSupport, color: 'text-blue-700 bg-blue-50' },
              { label: 'Escalations', items: d.escalations, color: 'text-red-700 bg-red-50' },
            ].map(({ label, items, color }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
                {items.length === 0 ? <p className="text-xs text-gray-400">None</p> : (
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className={`text-xs px-2 py-1.5 rounded ${color}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
