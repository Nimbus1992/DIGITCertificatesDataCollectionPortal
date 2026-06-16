import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { ConversationStage } from '../../types';

const STAGES: ConversationStage[] = ['Discovery', 'Evaluation', 'Proposal', 'Pilot', 'Blocked', 'Closed'];
const STAGE_STYLE: Record<ConversationStage, string> = {
  Discovery: 'bg-gray-100 text-gray-700', Evaluation: 'bg-blue-100 text-blue-800',
  Proposal: 'bg-purple-100 text-purple-800', Pilot: 'bg-green-100 text-green-800',
  Blocked: 'bg-red-100 text-red-800', Closed: 'bg-emerald-100 text-emerald-800',
};

export function S08_Conversations() {
  const { data } = useStore();
  const convs = data.conversations;
  const bystage = STAGES.reduce<Record<string, number>>((acc, s) => { acc[s] = convs.filter(c => c.stage === s).length; return acc; }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">External Conversations</h2>
        <p className="text-gray-500 text-sm">Market and ecosystem engagement</p>
      </div>

      {convs.length === 0 ? <EmptyState label="Conversations" adminPath="/admin/conversations" /> : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Conversation Funnel</h3>
            <div className="flex gap-3 flex-wrap">
              {STAGES.map(stage => (
                <div key={stage} className="flex-1 min-w-20 text-center">
                  <div className={`rounded-lg py-3 px-2 mb-2 ${STAGE_STYLE[stage]}`}>
                    <p className="text-2xl font-bold">{bystage[stage]}</p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{stage}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center"><p className="text-xl font-bold text-gray-900">{convs.length}</p><p className="text-xs text-gray-500">Total</p></div>
              <div className="text-center"><p className="text-xl font-bold text-blue-700">{convs.filter(c => ['Discovery', 'Evaluation', 'Proposal', 'Pilot'].includes(c.stage)).length}</p><p className="text-xs text-gray-500">Active</p></div>
              <div className="text-center"><p className="text-xl font-bold text-green-700">{bystage['Closed']}</p><p className="text-xs text-gray-500">Converted</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Organisation', 'Owner', 'Objective', 'Stage', 'Latest Update', 'Next Step'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {convs.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.organization}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.owner}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs">{c.objective}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_STYLE[c.stage]}`}>{c.stage}</span></td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs">{c.latestUpdate}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.nextStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
