import { useState } from 'react';
import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { Conversation, ConversationStage } from '../../types';

const STAGES: ConversationStage[] = ['Discover', 'Sign Up', 'Implement', 'Use', 'Expand'];

const STAGE_CFG: Record<ConversationStage, { bg: string; light: string; border: string; text: string; pill: string }> = {
  'Discover':   { bg: 'bg-violet-600', light: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700',  pill: 'bg-violet-100 text-violet-700' },
  'Sign Up':    { bg: 'bg-blue-600',   light: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    pill: 'bg-blue-100 text-blue-700' },
  'Implement':  { bg: 'bg-amber-500',  light: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   pill: 'bg-amber-100 text-amber-700' },
  'Use':        { bg: 'bg-teal-600',   light: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',    pill: 'bg-teal-100 text-teal-700' },
  'Expand':     { bg: 'bg-emerald-600',light: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-700' },
};

function ConvCard({ conv, onSelect, selected }: {
  conv: Conversation;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <div onClick={onSelect}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${selected ? 'border-gray-400 shadow-md bg-white' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
      <p className="font-semibold text-gray-900 text-sm leading-snug mb-0.5">{conv.organization}</p>
      {conv.partner && <p className="text-xs text-blue-600 mb-0.5">Partner: {conv.partner}</p>}
      <p className="text-xs text-gray-400 mb-1">{conv.owner}</p>
      {conv.lastUpdateDate && (
        <p className="text-xs text-gray-400 mb-2">Updated: {conv.lastUpdateDate}</p>
      )}
      {conv.objective && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{conv.objective}</p>
      )}
      {conv.nextStep && (
        <p className="text-xs bg-gray-50 rounded px-2 py-1 text-gray-500 truncate">
          <span className="font-medium text-gray-600">Next: </span>{conv.nextStep}
        </p>
      )}
    </div>
  );
}

function DetailPanel({ conv, onClose }: { conv: Conversation; onClose: () => void }) {
  const cfg = STAGE_CFG[conv.stage] ?? STAGE_CFG['Discover'];
  const history = conv.stageHistory ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{conv.organization}</p>
          {conv.partner && <p className="text-sm text-blue-600 mt-0.5">Partner: {conv.partner}</p>}
          <p className="text-sm text-gray-500 mt-0.5">{conv.owner}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.pill}`}>{conv.stage}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
      </div>

      {conv.objective && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Objective</p>
          <p className="text-sm text-gray-700">{conv.objective}</p>
        </div>
      )}

      {conv.latestUpdate && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Latest Update {conv.lastUpdateDate && <span className="font-normal text-gray-400 normal-case">— {conv.lastUpdateDate}</span>}
          </p>
          <p className="text-sm text-gray-700">{conv.latestUpdate}</p>
        </div>
      )}

      {conv.nextStep && (
        <div className={`rounded-lg ${cfg.light} border ${cfg.border} px-4 py-3`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${cfg.text}`}>Next Step</p>
          <p className="text-sm text-gray-700">{conv.nextStep}</p>
        </div>
      )}

      {/* Stage history timeline */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stage Journey</p>
          <div className="relative">
            {history.map((entry, i) => {
              const entryCfg = STAGE_CFG[entry.stage] ?? STAGE_CFG['Discover'];
              const isLast = i === history.length - 1;
              return (
                <div key={i} className="flex gap-3 mb-3 last:mb-0">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${isLast ? entryCfg.bg.replace('bg-', 'bg-') : 'bg-gray-300'}`} />
                    {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  {/* Content */}
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entryCfg.pill}`}>{entry.stage}</span>
                      {entry.date && <span className="text-xs text-gray-400">{entry.date}</span>}
                    </div>
                    {entry.comment && <p className="text-xs text-gray-600 leading-relaxed">{entry.comment}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function S08_Conversations() {
  const { data } = useStore();
  const convs = data.conversations;
  const [activeStage, setActiveStage] = useState<ConversationStage | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const count = (s: ConversationStage) => convs.filter(c => c.stage === s).length;
  const maxCount = Math.max(...STAGES.map(count), 1);

  const visibleStages = activeStage ? [activeStage] : STAGES;

  return (
    <div className="p-4 md:p-8 max-w-full space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">External Conversations</h2>
          <p className="text-gray-500 text-sm">Market and ecosystem engagement — {convs.length} tracked</p>
        </div>
        {activeStage && (
          <button onClick={() => { setActiveStage(null); setSelectedConv(null); }}
            className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5">
            Show all stages
          </button>
        )}
      </div>

      {convs.length === 0 ? <EmptyState label="Conversations" adminPath="/admin/conversations" /> : (
        <>
          {/* ── Pipeline stage count pills ── */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {STAGES.map(stage => {
              const n = count(stage);
              const cfg = STAGE_CFG[stage];
              const isActive = activeStage === stage;
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(s => s === stage ? null : stage)}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    isActive ? `${cfg.light} ${cfg.border}` : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-2xl font-bold ${isActive ? cfg.text : 'text-gray-900'}`}>{n}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${isActive ? cfg.text : 'text-gray-500'}`}>{stage}</p>
                </button>
              );
            })}
          </div>

          {/* ── Funnel visualization ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">Funnel — click a stage to filter</p>

            <div className="space-y-2 mb-6">
              {STAGES.map((stage, i) => {
                const n = count(stage);
                const prev = i > 0 ? count(STAGES[i - 1]) : null;
                const pct = prev && prev > 0 ? Math.round((n / prev) * 100) : null;
                const barW = Math.max((n / maxCount) * 100, n > 0 ? 8 : 2);
                const cfg = STAGE_CFG[stage];
                const isActive = activeStage === stage;

                return (
                  <button key={stage} onClick={() => setActiveStage(s => s === stage ? null : stage)}
                    className={`w-full flex items-center gap-4 group rounded-lg px-3 py-2 transition-colors ${isActive ? cfg.light : 'hover:bg-gray-50'}`}>
                    <span className={`w-16 sm:w-24 text-right text-xs font-semibold shrink-0 ${isActive ? cfg.text : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {stage}
                    </span>
                    <div className="flex-1 h-9 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${cfg.bg} rounded-lg transition-all duration-300 flex items-center justify-end pr-3`}
                        style={{ width: `${barW}%` }}>
                        {n > 0 && <span className="text-white text-sm font-bold">{n}</span>}
                      </div>
                      {n === 0 && <span className="absolute inset-0 flex items-center pl-3 text-xs text-gray-400">0</span>}
                    </div>
                    <span className="w-16 sm:w-20 text-xs text-gray-400 shrink-0 text-left">
                      {pct !== null ? `${pct}% from prev` : `${n} total`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{convs.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-violet-700">{count('Discover') + count('Sign Up')}</p>
                <p className="text-xs text-gray-500 mt-0.5">Top of funnel</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-amber-600">{count('Implement')}</p>
                <p className="text-xs text-gray-500 mt-0.5">In implementation</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-700">{count('Use') + count('Expand')}</p>
                <p className="text-xs text-gray-500 mt-0.5">Live & expanding</p>
              </div>
            </div>
          </div>

          {/* ── Detail panel ── */}
          {selectedConv && (
            <DetailPanel conv={selectedConv} onClose={() => setSelectedConv(null)} />
          )}

          {/* ── Kanban columns ── */}
          <div className="flex gap-4 overflow-x-auto pb-2 items-start">
            {visibleStages.map(stage => {
              const stageConvs = convs.filter(c => c.stage === stage);
              const cfg = STAGE_CFG[stage];
              return (
                <div key={stage} className="flex-1 min-w-[160px] sm:min-w-[200px]">
                  <div className={`${cfg.bg} rounded-t-xl px-4 py-2.5 flex items-center justify-between`}>
                    <span className="text-white font-semibold text-xs uppercase tracking-wide">{stage}</span>
                    <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stageConvs.length}</span>
                  </div>
                  <div className={`${cfg.light} border-x border-b ${cfg.border} rounded-b-xl p-2 space-y-2 min-h-[80px]`}>
                    {stageConvs.map((conv, i) => (
                      <ConvCard
                        key={i}
                        conv={conv}
                        selected={selectedConv === conv}
                        onSelect={() => setSelectedConv(c => c === conv ? null : conv)}
                      />
                    ))}
                    {stageConvs.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-6">None in this stage</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
