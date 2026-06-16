import { DataPreview } from './DataPreview';

export const OKRManager = () => (
  <DataPreview tabKey="okrs" title="OKR Manager" description="Preview OKR and milestone data from your tracker" icon="🎯" />
);

export const BudgetManager = () => (
  <DataPreview tabKey="budget" title="Budget Manager" description="Preview budget rows and forecast data" icon="💰" />
);

export const RoadmapManager = () => (
  <DataPreview tabKey="roadmap" title="Roadmap Manager" description="Preview roadmap items and delivery windows" icon="🗺" />
);

export const ArtifactManager = () => (
  <DataPreview tabKey="artifacts" title="Artifact Repository" description="Preview deliverables and artifact links" icon="📁" />
);

export const ConversationManager = () => (
  <DataPreview tabKey="conversations" title="Conversation Manager" description="Preview external conversation funnel data" icon="💬" />
);

export const RiskManager = () => (
  <DataPreview tabKey="risks" title="Risk Registry" description="Preview risk descriptions, severity, and mitigations" icon="⚠️" />
);

export const DecisionManager = () => (
  <DataPreview tabKey="decisions" title="Decision Log" description="Preview decision entries and their status" icon="⚖️" />
);

export const MetricsManager = () => (
  <DataPreview tabKey="metrics" title="Metrics Editor" description="Preview delivery and outcome metrics" icon="📈" />
);
