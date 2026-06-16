import { Link } from 'react-router-dom';
import { useStore } from '../store/DataStore';

const MODULES = [
  { to: 'exec-summary', label: 'Executive Summary', icon: '📊', desc: 'Status, KPIs, highlights, actions required' },
  { to: 'product-overview', label: 'Product Overview', icon: '🗺', desc: 'Problem, vision, scope, target users' },
  { to: 'okrs', label: 'OKR Manager', icon: '🎯', desc: 'Add and edit objectives and key results' },
  { to: 'budget', label: 'Budget Manager', icon: '💰', desc: 'Track budget rows and utilization' },
  { to: 'roadmap', label: 'Roadmap Editor', icon: '🛣', desc: 'Manage roadmap items and delivery windows' },
  { to: 'artifacts', label: 'Artifact Repository', icon: '📁', desc: 'Track deliverables and document links' },
  { to: 'conversations', label: 'Conversation Manager', icon: '💬', desc: 'Track external stakeholder conversations' },
  { to: 'risks', label: 'Risk Registry', icon: '⚠️', desc: 'Log and track risks and mitigations' },
  { to: 'decisions', label: 'Decision Log', icon: '⚖️', desc: 'Record decisions and their outcomes' },
  { to: 'metrics', label: 'Metrics Editor', icon: '📈', desc: 'Update delivery and outcome metrics' },
  { to: 'changelog', label: 'Changelog', icon: '📋', desc: 'Log what changed and when' },
];

export function AdminDashboard() {
  const { data, reset } = useStore();

  const counts = {
    okrs: data.okrs.length,
    budget: data.budget.length,
    roadmap: data.roadmap.length,
    artifacts: data.artifacts.length,
    conversations: data.conversations.length,
    risks: data.risks.length,
    decisions: data.decisions.length,
    metrics: data.metrics.length,
    changelog: data.changelog.length,
  };

  const totalEntries = Object.values(counts).reduce((s, c) => s + c, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">{totalEntries} total entries across all sections · all data saved locally in your browser</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all portal data? This cannot be undone.')) reset();
          }}
          className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
        >
          Reset all data
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {MODULES.map(mod => {
          const count = counts[mod.to as keyof typeof counts];
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{mod.icon}</span>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{mod.label}</h3>
                </div>
                {count !== undefined && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
