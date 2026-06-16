import { useState } from 'react';
import { Globe, Presentation, GitBranch, FileText, Link2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store/DataStore';
import { EmptyState } from './S03_OKRProgress';
import type { Artifact, ArtifactSection, DPIStage } from '../../types';

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

const STAGE_PILL: Record<DPIStage, string> = {
  Discovery: 'bg-gray-100 text-gray-600',
  Design:    'bg-indigo-100 text-indigo-700',
  Build:     'bg-orange-100 text-orange-700',
  Adoption:  'bg-green-100 text-green-700',
};

const SECTIONS: ArtifactSection[] = ['DPI Adoption', 'PLG Lifecycle', 'Ecosystem Building'];
const DPI_STAGES: DPIStage[] = ['Discovery', 'Design', 'Build', 'Adoption'];

function getIcon(type: string): LucideIcon {
  return TYPE_ICON[type] ?? Link2;
}

function normalizeUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function MetadataStrip({ art }: { art: Artifact }) {
  const Icon = getIcon(art.type);
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start gap-2">
        <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="font-semibold text-gray-900 text-sm leading-snug">{art.title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[art.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {art.status}
        </span>
        {art.version && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {art.version}
          </span>
        )}
        {art.stage && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_PILL[art.stage]}`}>
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

function IframeCard({ art }: { art: Artifact }) {
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
      <MetadataStrip art={art} />
    </a>
  );
}

function ThumbnailCard({ art }: { art: Artifact }) {
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
      <MetadataStrip art={art} />
    </a>
  );
}

function ArtifactCard({ art }: { art: Artifact }) {
  const hasCustomThumb = Boolean(art.thumbnailUrl);
  const isEmbed = (art.type === 'Web Page' || art.type === 'Prototype') && !hasCustomThumb;
  return isEmbed ? <IframeCard art={art} /> : <ThumbnailCard art={art} />;
}

function ArtifactGrid({ arts }: { arts: Artifact[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {arts.map((art, i) => <ArtifactCard key={i} art={art} />)}
    </div>
  );
}

export function S07_Deliverables() {
  const { data } = useStore();
  const artifacts = data.artifacts;
  const vis = data.sectionVisibility;
  const [activeStage, setActiveStage] = useState<string>('All');
  const [open, setOpen] = useState({ dpi: false, plg: false, eco: false });
  const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }));

  if (artifacts.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Key Assets</h2>
          <p className="text-gray-500 text-sm">Single source of truth for project deliverables</p>
        </div>
        <EmptyState label="Key Assets" adminPath="/admin/artifacts" />
      </div>
    );
  }

  const bySec = (sec: ArtifactSection) => artifacts.filter(a => a.section === sec);
  const dpiArts = bySec('DPI Adoption');
  const plgArts = bySec('PLG Lifecycle');
  const ecoArts = bySec('Ecosystem Building');
  const unassigned = artifacts.filter(a => !a.section);

  const dpiFiltered = activeStage === 'All' ? dpiArts : dpiArts.filter(a => a.stage === activeStage);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Key Assets</h2>
        <p className="text-gray-500 text-sm">Single source of truth for project deliverables</p>
      </div>

      {/* DPI Adoption */}
      {vis.dpiAdoption && dpiArts.length > 0 && (
        <section className="space-y-4">
          <button onClick={() => toggle('dpi')} className="w-full flex items-center gap-3 group cursor-pointer">
            <div className="h-px flex-1 bg-blue-100 transition-colors group-hover:bg-blue-300" />
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200 flex items-center gap-2 transition-all group-hover:bg-blue-100 group-hover:shadow-sm group-hover:scale-105 active:scale-95">
              DPI Adoption
              <span className="text-xs font-normal text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full">{dpiArts.length}</span>
              <span className={`text-blue-400 text-xs transition-transform duration-200 ${!open.dpi ? 'animate-bounce' : ''}`}>{open.dpi ? '▲' : '▼'}</span>
            </span>
            <div className="h-px flex-1 bg-blue-100 transition-colors group-hover:bg-blue-300" />
          </button>

          {open.dpi && (
            <div className="space-y-5">
              {/* Stage filter tabs — always show all 4, disable empty ones */}
              <div className="flex flex-wrap gap-2">
                {(['All', ...DPI_STAGES] as string[]).map(stage => {
                  const count = stage === 'All' ? dpiArts.length : dpiArts.filter(a => a.stage === stage).length;
                  const isEmpty = stage !== 'All' && count === 0;
                  const isActive = activeStage === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => !isEmpty && setActiveStage(stage)}
                      disabled={isEmpty}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isEmpty
                          ? 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed'
                          : isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {stage}
                      <span className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-blue-500 text-white' : isEmpty ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeStage === 'All' ? (
                <div className="space-y-8">
                  {DPI_STAGES.map(stage => {
                    const stageArts = dpiArts.filter(a => a.stage === stage);
                    if (stageArts.length === 0) return null;
                    return (
                      <div key={stage} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STAGE_PILL[stage]}`}>{stage}</span>
                          <span className="text-xs text-gray-400">{stageArts.length} asset{stageArts.length !== 1 ? 's' : ''}</span>
                        </div>
                        <ArtifactGrid arts={stageArts} />
                      </div>
                    );
                  })}
                  {dpiArts.filter(a => !a.stage).length > 0 && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">Untagged</span>
                      <ArtifactGrid arts={dpiArts.filter(a => !a.stage)} />
                    </div>
                  )}
                </div>
              ) : (
                <ArtifactGrid arts={dpiFiltered} />
              )}
            </div>
          )}
        </section>
      )}

      {/* PLG Lifecycle */}
      {vis.plgLifecycle && plgArts.length > 0 && (
        <section className="space-y-4">
          <button onClick={() => toggle('plg')} className="w-full flex items-center gap-3 group cursor-pointer">
            <div className="h-px flex-1 bg-purple-100 transition-colors group-hover:bg-purple-300" />
            <span className="text-sm font-bold text-purple-700 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200 flex items-center gap-2 transition-all group-hover:bg-purple-100 group-hover:shadow-sm group-hover:scale-105 active:scale-95">
              PLG Lifecycle
              <span className="text-xs font-normal text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">{plgArts.length}</span>
              <span className={`text-purple-400 text-xs transition-transform duration-200 ${!open.plg ? 'animate-bounce' : ''}`}>{open.plg ? '▲' : '▼'}</span>
            </span>
            <div className="h-px flex-1 bg-purple-100 transition-colors group-hover:bg-purple-300" />
          </button>
          {open.plg && <ArtifactGrid arts={plgArts} />}
        </section>
      )}

      {/* Ecosystem Building */}
      {vis.ecosystemBuilding && ecoArts.length > 0 && (
        <section className="space-y-4">
          <button onClick={() => toggle('eco')} className="w-full flex items-center gap-3 group cursor-pointer">
            <div className="h-px flex-1 bg-emerald-100 transition-colors group-hover:bg-emerald-300" />
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 transition-all group-hover:bg-emerald-100 group-hover:shadow-sm group-hover:scale-105 active:scale-95">
              Ecosystem Building
              <span className="text-xs font-normal text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded-full">{ecoArts.length}</span>
              <span className={`text-emerald-400 text-xs transition-transform duration-200 ${!open.eco ? 'animate-bounce' : ''}`}>{open.eco ? '▲' : '▼'}</span>
            </span>
            <div className="h-px flex-1 bg-emerald-100 transition-colors group-hover:bg-emerald-300" />
          </button>
          {open.eco && <ArtifactGrid arts={ecoArts} />}
        </section>
      )}

      {/* Unassigned assets */}
      {unassigned.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-4 py-1 rounded-full border border-gray-200">
              Other Assets
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <ArtifactGrid arts={unassigned} />
        </section>
      )}
    </div>
  );
}
