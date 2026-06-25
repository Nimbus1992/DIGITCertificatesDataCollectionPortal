import { useState, Fragment } from 'react';
import { useStore } from '../../store/DataStore';
import { BudgetGauge } from '../../components/charts/BudgetGauge';
import { EmptyState } from './S03_OKRProgress';
import type { BudgetRow } from '../../types';

function makeFmt(currency: 'INR' | 'USD') {
  return (n: number) => currency === 'USD'
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

// Group rows: category → workstream → month rows
function groupRows(rows: BudgetRow[]) {
  const map: Record<string, Record<string, BudgetRow[]>> = {};
  for (const row of rows) {
    if (!map[row.category]) map[row.category] = {};
    if (!map[row.category][row.workstream]) map[row.category][row.workstream] = [];
    map[row.category][row.workstream].push(row);
  }
  return map;
}

function WorkstreamBar({ consumed, budgeted, forecast, fmt }: { consumed: number; budgeted: number; forecast: number; fmt: (n: number) => string }) {
  const isOverrun = forecast > budgeted;
  const barMax = Math.max(budgeted, forecast, 1);
  const consumedW = Math.min(consumed, budgeted) / barMax * 100;
  const remainingW = Math.max(0, (isOverrun ? budgeted : forecast) - consumed) / barMax * 100;
  const overrunW = isOverrun ? (forecast - budgeted) / barMax * 100 : 0;
  const budgetLinePct = budgeted / barMax * 100;

  return (
    <div>
      <div className="relative h-3 flex rounded overflow-hidden bg-gray-100">
        <div className="h-full bg-blue-500" style={{ width: `${consumedW}%` }} />
        <div className="h-full bg-blue-100" style={{ width: `${remainingW}%` }} />
        {isOverrun && <div className="h-full bg-red-500" style={{ width: `${overrunW}%` }} />}
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10" style={{ left: `${budgetLinePct}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-gray-400">consumed {fmt(consumed)}</span>
        <span className={isOverrun ? 'text-red-500 font-semibold' : 'text-gray-400'}>
          forecast {fmt(forecast)}
        </span>
      </div>
    </div>
  );
}

export function S05_Budget() {
  const { data } = useStore();
  const rows = data.budget;
  const fmt = makeFmt(data.budgetCurrency ?? 'INR');

  const totalBudgeted = rows.reduce((s, r) => s + r.budgeted, 0);
  const totalConsumed = rows.reduce((s, r) => s + r.consumed, 0);
  const totalForecast = rows.reduce((s, r) => s + r.forecast, 0);
  const totalRemaining = totalBudgeted - totalConsumed;
  const consumedPct = pct(totalConsumed, totalBudgeted);
  const forecastVsBudgetPct = pct(totalForecast, totalBudgeted);
  const isOverForecast = forecastVsBudgetPct > 100;

  const highlights = data.budgetHighlights ?? [];
  const grouped = groupRows(rows);

  // catExpanded[category] — category section open/closed (default open)
  const [catExpanded, setCatExpanded] = useState<Record<string, boolean>>({});
  const isCatOpen = (cat: string) => catExpanded[cat] ?? true;
  const toggleCat = (cat: string) => setCatExpanded(p => ({ ...p, [cat]: !isCatOpen(cat) }));

  // wsExpanded[`cat::ws`] — month drill-down open/closed (default closed)
  const [wsExpanded, setWsExpanded] = useState<Record<string, boolean>>({});
  const wsKey = (cat: string, ws: string) => `${cat}::${ws}`;
  const isWsOpen = (cat: string, ws: string) => wsExpanded[wsKey(cat, ws)] ?? false;
  const toggleWs = (cat: string, ws: string) =>
    setWsExpanded(p => { const k = wsKey(cat, ws); return { ...p, [k]: !p[k] }; });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Budget & Financial Health</h2>
        <p className="text-gray-500 text-sm">Investment utilization</p>
      </div>

      {rows.length === 0 ? <EmptyState label="Budget" adminPath="/admin/budget" /> : (
        <>
          {/* Gauge + Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center min-h-[220px]">
              <BudgetGauge utilized={consumedPct} />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Summary</p>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'Total Budgeted', value: fmt(totalBudgeted), cls: 'font-bold text-gray-900' },
                    { label: 'Consumed',        value: fmt(totalConsumed),  cls: 'font-semibold text-gray-900' },
                    { label: 'Remaining',       value: fmt(totalRemaining), cls: 'font-semibold text-gray-900' },
                    { label: 'Forecast',        value: fmt(totalForecast),  cls: 'font-bold text-gray-900' },
                  ].map(({ label, value, cls }) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-gray-600">{label}</td>
                      <td className={`py-3 text-right ${cls}`}>{value}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 text-gray-600">Forecast vs Budget</td>
                    <td className={`py-3 text-right font-bold ${isOverForecast ? 'text-red-500' : 'text-green-600'}`}>
                      {forecastVsBudgetPct}%{isOverForecast ? ' ▲' : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Highlights */}
          {highlights.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-3">Key Highlights</h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm text-amber-900">
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Breakdown by Workstream */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Breakdown by Workstream</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2.5 rounded-sm bg-blue-500" /> Consumed</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2.5 rounded-sm bg-blue-100" /> Remaining</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2.5 rounded-sm bg-red-500" /> Overrun</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-0.5 h-3.5 bg-gray-700" /> Budget limit</span>
              </div>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ width: '230px' }}>Workstream</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Forecast vs Budget</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ width: '120px' }}>Budgeted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ width: '120px' }}>Forecast</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([category, workstreams]) => {
                  const catBudgeted = Object.values(workstreams).flat().reduce((s, r) => s + r.budgeted, 0);
                  const catForecast = Object.values(workstreams).flat().reduce((s, r) => s + r.forecast, 0);
                  const catWithin = catForecast <= catBudgeted;
                  const catOpen = isCatOpen(category);

                  return (
                    <Fragment key={category}>
                      {/* Category header row */}
                      <tr
                        className="bg-gray-50 cursor-pointer hover:bg-gray-100 border-t border-gray-100"
                        onClick={() => toggleCat(category)}
                      >
                        <td className="px-6 py-3" colSpan={2}>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs select-none">{catOpen ? '▼' : '▶'}</span>
                            <span className="font-semibold text-blue-600">{category}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catWithin ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {catWithin ? '✓ Within budget' : '⚠ Over budget'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500" colSpan={3}>
                          {fmt(catBudgeted)} budgeted · <span className={catWithin ? '' : 'font-semibold text-gray-700'}>{fmt(catForecast)} forecast</span>
                        </td>
                      </tr>

                      {/* Workstream rows (one per workstream, aggregated across months) */}
                      {catOpen && Object.entries(workstreams).map(([ws, monthRows]) => {
                        const wsBudgeted = monthRows.reduce((s, r) => s + r.budgeted, 0);
                        const wsConsumed = monthRows.reduce((s, r) => s + r.consumed, 0);
                        const wsForecast = monthRows.reduce((s, r) => s + r.forecast, 0);
                        const isOverrun  = wsForecast > wsBudgeted;
                        const overrunAmt = wsForecast - wsBudgeted;
                        const drillOpen  = isWsOpen(category, ws);

                        // Sort month rows chronologically (non-month entries like '—' go last)
                        const sortedMonths = [...monthRows].sort((a, b) => {
                          if (a.month === '—') return 1;
                          if (b.month === '—') return -1;
                          return new Date(a.month).getTime() - new Date(b.month).getTime();
                        });

                        return (
                          <Fragment key={ws}>
                            {/* Aggregated workstream row — click to drill into months */}
                            <tr
                              className="border-t border-gray-50 hover:bg-blue-50/40 cursor-pointer"
                              onClick={() => toggleWs(category, ws)}
                            >
                              <td className="px-6 py-3 pl-12">
                                <div className="flex items-center gap-1.5 text-gray-700">
                                  <span className="text-gray-400 text-xs select-none">{drillOpen ? '▼' : '▶'}</span>
                                  {ws}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <WorkstreamBar consumed={wsConsumed} budgeted={wsBudgeted} forecast={wsForecast} fmt={fmt} />
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">{fmt(wsBudgeted)}</td>
                              <td className={`px-4 py-3 text-right font-semibold ${isOverrun ? 'text-red-600' : 'text-green-600'}`}>
                                {fmt(wsForecast)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {isOverrun ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
                                    ▲ +{fmt(overrunAmt)}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                                    ▼ −{fmt(wsBudgeted - wsForecast)}
                                  </span>
                                )}
                              </td>
                            </tr>

                            {/* Month-wise drill-down */}
                            {drillOpen && (
                              <tr className="border-t border-blue-50">
                                <td colSpan={5} className="px-0 py-0">
                                  <div className="bg-blue-50/30 border-l-2 border-blue-200 ml-12">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="bg-blue-50/60 border-b border-blue-100">
                                          <th className="px-6 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Month</th>
                                          <th className="px-4 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Budgeted</th>
                                          <th className="px-4 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Consumed</th>
                                          <th className="px-4 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Utilization</th>
                                          <th className="px-4 py-2 text-right font-semibold text-gray-500 uppercase tracking-wide">Forecast</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sortedMonths.map((mr, idx) => {
                                          const utilPct = pct(mr.consumed, mr.budgeted);
                                          const mOver = mr.forecast > mr.budgeted;
                                          return (
                                            <tr key={idx} className="border-b border-blue-50 last:border-0 hover:bg-blue-50/50">
                                              <td className="px-6 py-2.5 text-gray-600 font-medium">{mr.month}</td>
                                              <td className="px-4 py-2.5 text-right text-gray-600">{fmt(mr.budgeted)}</td>
                                              <td className="px-4 py-2.5 text-right text-gray-600">{fmt(mr.consumed)}</td>
                                              <td className="px-4 py-2.5 text-right">
                                                {mr.budgeted > 0 ? (
                                                  <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                      <div
                                                        className={`h-1.5 rounded-full ${utilPct > 90 ? 'bg-red-500' : utilPct > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                        style={{ width: `${Math.min(utilPct, 100)}%` }}
                                                      />
                                                    </div>
                                                    <span className="text-gray-500 w-8 text-right">{utilPct}%</span>
                                                  </div>
                                                ) : (
                                                  <span className="text-gray-400">—</span>
                                                )}
                                              </td>
                                              <td className={`px-4 py-2.5 text-right font-semibold ${mOver ? 'text-red-600' : 'text-green-600'}`}>
                                                {fmt(mr.forecast)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                        {/* Totals row */}
                                        <tr className="bg-blue-50/70 border-t border-blue-200 font-semibold">
                                          <td className="px-6 py-2.5 text-gray-700">Total</td>
                                          <td className="px-4 py-2.5 text-right text-gray-700">{fmt(wsBudgeted)}</td>
                                          <td className="px-4 py-2.5 text-right text-gray-700">{fmt(wsConsumed)}</td>
                                          <td className="px-4 py-2.5 text-right text-gray-500">{pct(wsConsumed, wsBudgeted)}%</td>
                                          <td className={`px-4 py-2.5 text-right ${isOverrun ? 'text-red-600' : 'text-green-600'}`}>{fmt(wsForecast)}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
