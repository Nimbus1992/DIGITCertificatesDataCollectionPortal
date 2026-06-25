import { useState } from 'react';
import { Globe, Presentation, GitBranch, FileText, Link2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { Artifact, ArtifactCategory } from '../../types';

// ── 5-Thread framework (eGov Foundation — egov.org.in/about-us/our-approach) ──
const FIVE_THREADS: Record<string, { label: string; description: string }> = {
  'thread-1': {
    label: '1 · RE-IMAGINE',
    description: 'By bringing together government, civil society, and market players, eGov ensures that all stakeholders are aligned from the start with the citizen at the centre of re-imagination. This alignment allows for faster decision-making and resource mobilisation.',
  },
  'thread-2': {
    label: '2 · RE-IMAGINE',
    description: 'eGov\'s DPGs are built as modular, reusable products that can be quickly adapted to different contexts. This modular design enables rapid scaling across regions without rebuilding solutions from scratch.',
  },
  'thread-3': {
    label: '3 · RE-SOLVE',
    description: 'Real-world demonstrations build ecosystem trust and encourage faster adoption. When governments and other actors see the value of DPGs solving problems at scale, they are more likely to implement the solution quickly.',
  },
  'thread-4': {
    label: '4 · SCALE',
    description: 'By establishing governance structures, playbooks, and frameworks, eGov enables governments, civil society, and private sector players to adopt DPGs independently, creating a self-sustaining cycle of adoption.',
  },
  'thread-5': {
    label: '5 · SUSTAIN',
    description: 'By transferring ownership to local actors, solutions continue delivering value over time. These solutions sustain, growing exponentially as more participants leverage the infrastructure for new solutions.',
  },
};

const SECTION_COLORS = [
  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    selBorder: 'border-blue-500',    selBg: 'bg-blue-100',    dot: 'bg-blue-500' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  selBorder: 'border-violet-500',  selBg: 'bg-violet-100',  dot: 'bg-violet-500' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   selBorder: 'border-amber-500',   selBg: 'bg-amber-100',   dot: 'bg-amber-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', selBorder: 'border-emerald-500', selBg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    selBorder: 'border-rose-500',    selBg: 'bg-rose-100',    dot: 'bg-rose-500' },
];

const SUBCATEGORY_PILL_COLORS = [
  'bg-gray-100 text-gray-600',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700',
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
];

// ── Card visuals ───────────────────────────────────────────────────────────
const TYPE_ICON: Record<string, LucideIcon> = {
  'Web Page':     Globe,
  'Prototype':    Globe,
  'Pitch Deck':   Presentation,
  'Deck':         Presentation,
  'Git Link':     GitBranch,
  'Tech Design':  GitBranch,
  'PRD':          FileText,
  'Report':       FileText,
  'Research':     FileText,
  'Meeting Notes':FileText,
  'Decision Doc': FileText,
};

const STATUS_STYLE: Record<string, string> = {
  'Complete':    'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Draft':       'bg-gray-100 text-gray-700',
  'Review':      'bg-amber-100 text-amber-800',
};

function getSectionColor(idx: number) { return SECTION_COLORS[idx % SECTION_COLORS.length]; }
function getSubcategoryColor(idx: number) { return SUBCATEGORY_PILL_COLORS[idx % SUBCATEGORY_PILL_COLORS.length]; }
function getIcon(type: string): LucideIcon { return TYPE_ICON[type] ?? Link2; }
function normalizeUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// ── Card components ────────────────────────────────────────────────────────
function MetadataStrip({ art, subcategoryColor }: { art: Artifact; subcategoryColor?: string }) {
  const Icon = getIcon(art.type);
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start gap-2">
        <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{art.title}</p>
          {art.heading && (
            <p className="text-xs font-medium text-gray-600 mt-0.5 leading-snug">{art.heading}</p>
          )}
        </div>
      </div>
      {art.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{art.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[art.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {art.status}
        </span>
        {art.version && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {art.version}
          </span>
        )}
        {art.stage && subcategoryColor && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subcategoryColor}`}>
            {art.stage}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-500">
        <span className="truncate">Owner: {art.owner}</span>
        <span>Updated: {art.date}</span>
        {art.reviewedBy && <span className="col-span-2 truncate">Reviewed by: {art.reviewedBy}</span>}
      </div>
    </div>
  );
}

function IframeCard({ art, subcategoryColor }: { art: Artifact; subcategoryColor?: string }) {
  const [loaded, setLoaded] = useState(false);
  const safeLink = normalizeUrl(art.link);
  return (
    <a href={safeLink} target="_blank" rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative w-full h-[90px] bg-gray-100">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={safeLink}
          title={art.title}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full border-0 transition-opacity duration-300 pointer-events-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <MetadataStrip art={art} subcategoryColor={subcategoryColor} />
    </a>
  );
}

function ThumbnailCard({ art, subcategoryColor }: { art: Artifact; subcategoryColor?: string }) {
  const [imgError, setImgError] = useState(false);
  const Icon = getIcon(art.type);
  const safeLink = normalizeUrl(art.link);
  const customThumb = art.thumbnailUrl ? normalizeUrl(art.thumbnailUrl) : null;
  const autoThumb = safeLink ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(safeLink)}?w=400&h=300` : null;
  const thumb = customThumb || autoThumb;

  return (
    <a href={safeLink} target="_blank" rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-[90px] bg-gray-100 overflow-hidden">
        {!thumb || imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
            <Icon size={40} />
            <p className="text-xs mt-2 text-gray-400">Preview unavailable</p>
          </div>
        ) : (
          <img
            src={thumb}
            alt={art.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {!imgError && thumb && (
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
            <Icon size={14} className="text-gray-700" />
          </div>
        )}
      </div>
      <MetadataStrip art={art} subcategoryColor={subcategoryColor} />
    </a>
  );
}

function ArtifactCard({ art, subcategoryColor }: { art: Artifact; subcategoryColor?: string }) {
  const hasCustomThumb = Boolean(art.thumbnailUrl);
  const isEmbed = (art.type === 'Web Page' || art.type === 'Prototype') && !hasCustomThumb;
  return isEmbed
    ? <IframeCard art={art} subcategoryColor={subcategoryColor} />
    : <ThumbnailCard art={art} subcategoryColor={subcategoryColor} />;
}

function ArtifactGrid({ arts, subcategoryColors }: { arts: Artifact[]; subcategoryColors?: Record<string, string> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {arts.map((art, i) => (
        <ArtifactCard key={i} art={art} subcategoryColor={subcategoryColors?.[art.stage ?? '']} />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function S07_Deliverables() {
  const { data } = useStore();
  const artifacts = data.artifacts;
  const categories: ArtifactCategory[] = data.artifactCategories ?? [];
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);

  const visibleCats = categories.filter(c => c.visible);
  const selectedCat = visibleCats.find(c => c.id === selectedThread) ?? null;

  function handleThreadClick(catId: string) {
    if (selectedThread === catId) {
      setSelectedThread(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedThread(catId);
      setSelectedSubcategory(null);
    }
  }

  const filteredArts = (() => {
    if (!selectedThread || !selectedCat) return artifacts;
    const catArts = artifacts.filter(a => a.section === selectedCat.name);
    if (!selectedSubcategory) return catArts;
    return catArts.filter(a => a.stage === selectedSubcategory);
  })();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Key Assets</h2>
        <p className="text-gray-500 text-sm">
          {selectedThread
            ? `Showing assets for: ${selectedCat?.name ?? selectedThread}`
            : 'Click a thread to filter, or browse all assets below'}
        </p>
      </div>

      {/* ── Thread filter boxes ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-start">
        {visibleCats.map((cat, idx) => {
          const thread = FIVE_THREADS[cat.id];
          const col = getSectionColor(idx);
          const isSelected = selectedThread === cat.id;
          const isExpanded = expandedThread === cat.id;
          const catCount = artifacts.filter(a => a.section === cat.name).length;

          return (
            <div
              key={cat.id}
              onClick={() => handleThreadClick(cat.id)}
              className={`rounded-xl border-2 text-left cursor-pointer transition-all ${
                isSelected
                  ? `${col.selBg} ${col.selBorder}`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Main content */}
              <div className="p-4">
                {thread && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isSelected ? col.text : 'text-gray-400'}`}>
                    {thread.label}
                  </p>
                )}
                <p className={`text-sm font-bold leading-snug ${isSelected ? col.text : 'text-gray-800'}`}>
                  {cat.name}
                </p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isSelected ? `${col.bg} ${col.text}` : 'bg-gray-100 text-gray-500'
                  }`}>
                    {catCount} asset{catCount !== 1 ? 's' : ''}
                  </span>
                  {isSelected && <span className={`text-[10px] font-semibold ${col.text}`}>✓ Active</span>}
                </div>
              </div>

              {/* Inline Read more */}
              {thread?.description && (
                <div
                  className={`border-t px-4 pb-3 ${isSelected ? col.border : 'border-gray-100'}`}
                  onClick={e => e.stopPropagation()}
                >
                  {isExpanded && (
                    <p className={`text-xs leading-relaxed mt-3 mb-2 ${isSelected ? col.text : 'text-gray-600'}`}>
                      {thread.description}
                    </p>
                  )}
                  <button
                    onClick={() => setExpandedThread(isExpanded ? null : cat.id)}
                    className={`mt-2 text-[11px] font-medium transition-colors ${
                      isExpanded
                        ? isSelected ? col.text : 'text-gray-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isExpanded ? '▲ Hide' : '▼ Read more'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Subcategory pills — shown when a thread with subcategories is selected ── */}
      {selectedCat && selectedCat.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {([null, ...selectedCat.subcategories] as (string | null)[]).map((sub) => {
            const catArts = artifacts.filter(a => a.section === selectedCat.name);
            const count = sub === null ? catArts.length : catArts.filter(a => a.stage === sub).length;
            const isActive = selectedSubcategory === sub;
            const isEmpty = sub !== null && count === 0;
            return (
              <button
                key={sub ?? '__all__'}
                disabled={isEmpty}
                onClick={() => !isEmpty && setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isEmpty
                    ? 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {sub ?? 'All'}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  isActive ? 'bg-blue-500 text-white' : isEmpty ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Asset grid ── */}
      {artifacts.length === 0 ? (
        <EmptyState label="Key Assets" adminPath="/admin/artifacts" />
      ) : selectedThread ? (
        filteredArts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">No assets tagged to this thread yet.</p>
        ) : (
          <ArtifactGrid
            arts={filteredArts}
            subcategoryColors={
              selectedCat
                ? Object.fromEntries(
                    selectedCat.subcategories.map((s, i) => [s, getSubcategoryColor(i)])
                  )
                : {}
            }
          />
        )
      ) : (
        // No thread selected — grouped view
        <div className="space-y-10">
          {visibleCats.map((cat, catIdx) => {
            const catArts = artifacts.filter(a => a.section === cat.name);
            if (catArts.length === 0) return null;
            const col = getSectionColor(catIdx);
            const subColorMap: Record<string, string> = {};
            cat.subcategories.forEach((sub, i) => { subColorMap[sub] = getSubcategoryColor(i); });
            return (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${col.dot}`} />
                  <span className={`text-sm font-semibold ${col.text}`}>{cat.name}</span>
                  <span className="text-xs text-gray-400">{catArts.length} asset{catArts.length !== 1 ? 's' : ''}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <ArtifactGrid arts={catArts} subcategoryColors={subColorMap} />
              </div>
            );
          })}
          {/* Unassigned */}
          {(() => {
            const unassigned = artifacts.filter(a => !a.section);
            if (unassigned.length === 0) return null;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0 bg-gray-300" />
                  <span className="text-sm font-semibold text-gray-500">Other Assets</span>
                  <span className="text-xs text-gray-400">{unassigned.length} asset{unassigned.length !== 1 ? 's' : ''}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <ArtifactGrid arts={unassigned} />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
