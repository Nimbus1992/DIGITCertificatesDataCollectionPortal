import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { Decision, DecisionStatus } from '../../types';

const OPEN_STYLE = 'bg-blue-100 text-blue-700 border border-blue-200';
const CLOSED_STYLE = 'bg-gray-100 text-gray-600 border border-gray-200';
const PENDING_STYLE = 'bg-amber-100 text-amber-700 border border-amber-200';

const STATUS_STYLE: Record<DecisionStatus, string> = {
  Open: OPEN_STYLE,
  Closed: CLOSED_STYLE,
  Pending: PENDING_STYLE,
};

function DecisionTable({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-[45%]">Decision</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Date</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Participants</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((dec, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              <td className="py-3 px-4 text-gray-900 text-sm align-top">{dec.decision}</td>
              <td className="py-3 px-4 text-gray-500 text-sm whitespace-nowrap align-top">{dec.date || '—'}</td>
              <td className="py-3 px-4 text-gray-600 text-sm align-top">{dec.owner || '—'}</td>
              <td className="py-3 px-4 align-top">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[dec.status]}`}>
                  {dec.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function S10_DecisionLog() {
  const { data } = useStore();
  const decisions = data.decisions;

  const open = decisions.filter(d => d.status === 'Open' || d.status === 'Pending');
  const closed = decisions.filter(d => d.status === 'Closed');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Decision Log</h2>
        <p className="text-gray-500 text-sm">Key decisions and outcomes</p>
      </div>

      {decisions.length === 0 ? <EmptyState label="Decisions" adminPath="/admin/decisions" /> : (
        <div className="space-y-8">
          {open.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Open ({open.length})</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <DecisionTable decisions={open} />
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Closed ({closed.length})</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <DecisionTable decisions={closed} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
