import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/DataStore';
import { SectionTimestamp } from '../../components/SectionTimestamp';
import type { TeamRole } from '../../types';

// Indian fiscal-year quarter: Apr-Jun = Q1, Jul-Sep = Q2, Oct-Dec = Q3, Jan-Mar = Q4
function getCurrentFYQuarter(): string {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  let q: number;
  let fyYear: number;
  if (month >= 4) {
    fyYear = year + 1;
    q = month <= 6 ? 1 : month <= 9 ? 2 : 3;
  } else {
    fyYear = year;
    q = 4;
  }
  return `Q${q} FY${String(fyYear).slice(2)}`;
}

function daysFromNow(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setShow(v => !v); }}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-gray-300 focus:outline-none leading-none"
      >
        i
      </button>
      {show && (
        <div className="absolute bottom-full right-0 mb-2 z-20 w-60 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl leading-relaxed whitespace-pre-line">
          {text}
          <div className="absolute -bottom-1.5 right-1.5 w-3 h-3 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

type TileColor = 'blue' | 'green' | 'amber' | 'red' | 'violet';

const TILE_CFG: Record<TileColor, { bg: string; border: string; hoverBorder: string; val: string; arrow: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   hoverBorder: 'hover:border-blue-300',   val: 'text-blue-900',   arrow: 'text-blue-400' },
  green:  { bg: 'bg-green-50',  border: 'border-green-100',  hoverBorder: 'hover:border-green-300',  val: 'text-green-900',  arrow: 'text-green-400' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  hoverBorder: 'hover:border-amber-300',  val: 'text-amber-900',  arrow: 'text-amber-400' },
  red:    { bg: 'bg-red-50',    border: 'border-red-100',    hoverBorder: 'hover:border-red-300',    val: 'text-red-900',    arrow: 'text-red-400' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', hoverBorder: 'hover:border-violet-300', val: 'text-violet-900', arrow: 'text-violet-400' },
};

function KPITile({
  label, value, unit = '', sublabel, sublabelColor = 'text-gray-400',
  info, onClick, color,
}: {
  label: string; value: string | number; unit?: string;
  sublabel?: string; sublabelColor?: string;
  info?: string; onClick?: () => void; color: TileColor;
}) {
  const cfg = TILE_CFG[color];
  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-5 select-none transition-all duration-200
        ${cfg.bg} ${cfg.border}
        ${onClick ? `cursor-pointer ${cfg.hoverBorder} hover:shadow-md hover:scale-[1.02] active:scale-[0.99]` : ''}`}
    >
      <div className="flex items-start justify-between mb-3 gap-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-snug">{label}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          {info && <InfoTooltip text={info} />}
          {onClick && (
            <span className={`text-lg leading-none font-light transition-transform duration-200 ${cfg.arrow}`}>›</span>
          )}
        </div>
      </div>
      <p className={`text-3xl font-bold leading-none ${cfg.val}`}>
        {value}
        {unit && <span className="text-lg font-medium ml-1">{unit}</span>}
      </p>
      {sublabel && <p className={`text-xs mt-2 leading-snug ${sublabelColor}`}>{sublabel}</p>}
    </div>
  );
}

const AVATAR_BORDER = 'border-gray-300';
const AVATAR_BG = 'bg-gray-100 text-gray-700';
const ROLE_ORDER: TeamRole[] = ['Product Manager', 'Project Manager', 'Architect', 'Engineers', 'DevOps'];

export function S01_ExecSummary() {
  const { data } = useStore();
  const navigate = useNavigate();
  const { productSlug } = useParams<{ productSlug: string }>();
  const team = data.team ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── OKRs Completed (auto-calculated) ──────────────────────────────────
  const currentQ = getCurrentFYQuarter();
  const regularMilestones = (data.milestones ?? []).filter(m => m.rowType !== 'launch');
  const qMilestones = regularMilestones.filter(m => m.quarter === currentQ);
  // Use quarter-tagged milestones if any are tagged; fall back to all milestones
  const baseSet = qMilestones.length > 0 ? qMilestones : regularMilestones;
  const completedCount = baseSet.filter(m => m.status === 'Complete').length;
  const totalCount = baseSet.length;
  const okrPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const hasQOKRs = qMilestones.length > 0;

  // ── Days to Launch (from launch rows) ─────────────────────────────────
  const launchRows = (data.milestones ?? []).filter(m => m.rowType === 'launch');
  const sortedLaunches = launchRows
    .map(m => ({ m, days: daysFromNow(m.revisedDate || m.committedDate) ?? 0 }))
    .sort((a, b) => a.days - b.days);
  const nextLaunch = sortedLaunches.find(l => l.days >= 0) ?? sortedLaunches[0] ?? null;

  const launchDelay = nextLaunch
    ? (() => {
        const { revisedDate, committedDate } = nextLaunch.m;
        if (!revisedDate || !committedDate || revisedDate === committedDate) return null;
        const r = new Date(revisedDate), c = new Date(committedDate);
        if (isNaN(r.getTime()) || isNaN(c.getTime())) return null;
        return Math.round((r.getTime() - c.getTime()) / 86400000);
      })()
    : null;

  // ── Open counts ────────────────────────────────────────────────────────
  const openDecisions = (data.decisions ?? []).filter(d => d.status === 'Open').length;
  const openRisks = (data.risks ?? []).filter(r => r.status === 'Open').length;

  // ── Budget ─────────────────────────────────────────────────────────────
  const budgetRows = data.budget ?? [];
  const totalBudgeted = budgetRows.reduce((s, r) => s + r.budgeted, 0);
  const totalConsumed = budgetRows.reduce((s, r) => s + r.consumed, 0);
  const totalForecast = budgetRows.reduce((s, r) => s + r.forecast, 0);
  const consumedPct  = totalBudgeted > 0 ? Math.round((totalConsumed / totalBudgeted) * 100) : 0;
  const forecastOverrun = totalForecast - totalBudgeted; // negative = saving, positive = overrun
  const overrunPct   = totalBudgeted > 0 ? Math.round((Math.abs(forecastOverrun) / totalBudgeted) * 100) : 0;

  const currency = data.budgetCurrency ?? 'INR';
  function fmtINR(n: number) {
    return currency === 'USD'
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      : n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  }

  // ── Team ───────────────────────────────────────────────────────────────
  const roleCounts = team.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] ?? 0) + 1;
    return acc;
  }, {});
  const roleBreakdown = ROLE_ORDER.filter(r => roleCounts[r]).map(r => `${roleCounts[r]} ${r}`);
  const internalCount = team.filter(m => m.engagement === 'Internal').length;
  const externalCount = team.filter(m => m.engagement === 'External').length;

  // ── Launch KPI color ───────────────────────────────────────────────────
  const launchColor: TileColor = !nextLaunch
    ? 'blue'
    : nextLaunch.days < 0
    ? 'violet'
    : nextLaunch.days <= 14
    ? 'red'
    : nextLaunch.days <= 30
    ? 'amber'
    : 'blue';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Executive Summary</h2>
        <p className="text-gray-500 text-sm">Complete picture in under 60 seconds</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          label={`OKRs Completed · ${currentQ}`}
          value={totalCount > 0 ? okrPct : '—'}
          unit={totalCount > 0 ? '%' : ''}
          sublabel={
            totalCount === 0
              ? 'No OKRs added yet'
              : !hasQOKRs
              ? `${completedCount} of ${totalCount} complete (all quarters)`
              : `${completedCount} of ${totalCount} complete · ${currentQ}`
          }
          sublabelColor={totalCount === 0 ? 'text-gray-400' : okrPct >= 80 ? 'text-green-600 font-medium' : okrPct >= 50 ? 'text-amber-600 font-medium' : 'text-red-500 font-medium'}
          info={`Formula: OKRs with status "Complete" ÷ total OKRs in ${currentQ}.\n\nIf no OKRs are tagged with a quarter, all OKRs are counted.\n\nTag each OKR with "${currentQ}" in the Quarter field in Admin → OKR Manager.`}
          onClick={() => navigate(`/${productSlug}/executive/okrs`)}
          color={totalCount === 0 ? 'blue' : okrPct >= 80 ? 'green' : okrPct >= 50 ? 'amber' : 'red'}
        />

        <KPITile
          label="Open Risks"
          value={openRisks}
          sublabel={openRisks === 0 ? 'No open risks' : `${openRisks} risk${openRisks > 1 ? 's' : ''} need${openRisks === 1 ? 's' : ''} attention`}
          sublabelColor={openRisks > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}
          onClick={() => navigate(`/${productSlug}/executive/risks`)}
          color={openRisks > 0 ? 'red' : 'green'}
        />

        <KPITile
          label="Open Decisions"
          value={openDecisions}
          sublabel={openDecisions === 0 ? 'No pending decisions' : `${openDecisions} decision${openDecisions > 1 ? 's' : ''} pending`}
          sublabelColor={openDecisions > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}
          onClick={() => navigate(`/${productSlug}/executive/decisions`)}
          color="amber"
        />

        <KPITile
          label={nextLaunch ? `Days to Launch · ${nextLaunch.m.title}` : 'Days to Launch'}
          value={nextLaunch ? Math.abs(nextLaunch.days) : '—'}
          unit={nextLaunch ? (nextLaunch.days < 0 ? 'd ago' : 'd') : ''}
          sublabel={
            !nextLaunch
              ? 'No launch date set'
              : launchDelay !== null && launchDelay > 0
              ? `+${launchDelay}d delayed from original target`
              : launchDelay !== null && launchDelay < 0
              ? `${Math.abs(launchDelay)}d ahead of target`
              : nextLaunch.days < 0
              ? 'Launched'
              : undefined
          }
          sublabelColor={launchDelay && launchDelay > 0 ? 'text-red-500 font-medium' : launchDelay && launchDelay < 0 ? 'text-green-600 font-medium' : 'text-gray-400'}
          onClick={() => navigate(`/${productSlug}/executive/okrs`)}
          color={launchColor}
        />
      </div>

      {/* Budget tiles */}
      <div className="grid md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate(`/${productSlug}/executive/budget`)}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-600 mb-2">Budget Consumed</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{fmtINR(totalConsumed)}</p>
          <p className="text-xs text-gray-400 mb-3">of {fmtINR(totalBudgeted)} · {consumedPct}% consumed</p>
          <span className="text-sm font-medium text-blue-600">View →</span>
        </div>

        <div
          onClick={() => navigate(`/${productSlug}/executive/budget`)}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-gray-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <p className="text-sm font-medium text-gray-600 mb-2">Forecast Overrun</p>
          <p className={`text-3xl font-bold mb-1 ${forecastOverrun > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {forecastOverrun > 0 ? '+' : ''}{fmtINR(forecastOverrun)}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {forecastOverrun > 0
              ? `${overrunPct}% above budget · forecast ${fmtINR(totalForecast)}`
              : forecastOverrun < 0
              ? `${overrunPct}% under budget · forecast ${fmtINR(totalForecast)}`
              : `On budget · forecast ${fmtINR(totalForecast)}`}
          </p>
          <span className="text-sm font-medium text-blue-600">View →</span>
        </div>
      </div>

      {/* Team Deployed */}
      {team.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Deployed</h3>
            <div className="flex items-center gap-4 flex-wrap">
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
                <span className="text-2xl font-bold text-gray-900">
                  {team.length} <span className="text-sm font-normal text-gray-400">members</span>
                </span>
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
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full border-[3px] ${AVATAR_BORDER} items-center justify-center text-xs font-bold ${AVATAR_BG} ${member.photoUrl ? 'hidden' : 'flex'}`}>
                    {member.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
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
    </div>
  );
}
