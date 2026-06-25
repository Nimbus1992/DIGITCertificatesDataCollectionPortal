import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/DataStore';
import type { SectionVisibility } from '../types';

const EXEC_SECTIONS: { key: keyof SectionVisibility; label: string }[] = [
  { key: 'execSummary',    label: 'Executive Summary' },
  { key: 'productOverview', label: 'Product Overview' },
  { key: 'okrs',           label: 'OKRs' },
  { key: 'roadmap',        label: 'Roadmap' },
  { key: 'budget',         label: 'Budget' },
  { key: 'deliverables',   label: 'Key Assets' },
  { key: 'conversations',  label: 'Conversations' },
  { key: 'risks',          label: 'Risk Registry' },
  { key: 'decisions',      label: 'Decision Log' },
  { key: 'changelog',      label: 'Changelog' },
  { key: 'appendix',       label: 'Appendix' },
];

const MODULES = [
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
  const { data, set, reset, publish } = useStore();
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);

  const vMeta = data._versionMeta ?? { draftVersion: '1.0', hasUnpublishedChanges: false };
  const isPublished = !vMeta.hasUnpublishedChanges && !!vMeta.publishedVersion;

  async function handlePublish() {
    setPublishing(true);
    setPublishResult(null);
    try {
      const { version } = await publish();
      setPublishResult(`Published V${version}`);
    } catch {
      setPublishResult('Publish failed — try again');
    } finally {
      setPublishing(false);
    }
  }

  const counts = {
    okrs: data.milestones.length,
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h2>
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

      {/* Publish Panel */}
      <div className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${isPublished ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <span className="text-sm font-semibold text-gray-900">V{vMeta.draftVersion}</span>
          </div>
          <p className="text-xs text-gray-500">
            {vMeta.publishedVersion
              ? isPublished
                ? `Last published ${vMeta.publishedAt ? new Date(vMeta.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} — visible in executive view`
                : `V${vMeta.publishedVersion} is live · V${vMeta.draftVersion} has unpublished changes`
              : 'Not yet published — executive view is empty until you publish'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {publishResult && (
            <span className="text-xs font-medium text-green-700">{publishResult}</span>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || isPublished}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isPublished
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : publishing
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {publishing ? 'Publishing…' : isPublished ? 'Up to date' : `Publish V${vMeta.draftVersion}`}
          </button>
        </div>
      </div>

      {/* Section Visibility */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Section Visibility</h3>
        <p className="text-xs text-gray-400 mb-4">Toggle which sections appear in the executive portal.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {EXEC_SECTIONS.map(({ key, label }) => {
            const on = data.sectionVisibility?.[key] ?? true;
            return (
              <div key={key} className={`flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2.5 transition-opacity ${!on ? 'opacity-50' : ''}`}>
                <span className="text-xs font-medium text-gray-700 truncate">{label}</span>
                <button
                  onClick={() => set('sectionVisibility', { ...data.sectionVisibility, [key]: !on })}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${on ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
