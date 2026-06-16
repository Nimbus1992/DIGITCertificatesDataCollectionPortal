import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DataStoreProvider } from './store/DataStore';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { LandingPage } from './LandingPage';
import { ExecLayout } from './executive/ExecLayout';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { ExecSummaryEditor } from './admin/modules/ExecSummaryEditor';
import { ProductOverviewEditor } from './admin/modules/ProductOverviewEditor';
import { OKREditor } from './admin/modules/OKREditor';
import { BudgetEditor } from './admin/modules/BudgetEditor';
import { RoadmapEditor } from './admin/modules/RoadmapEditor';
import { ArtifactEditor } from './admin/modules/ArtifactEditor';
import { ConversationEditor } from './admin/modules/ConversationEditor';
import { RiskEditor } from './admin/modules/RiskEditor';
import { DecisionEditor } from './admin/modules/DecisionEditor';
import { MetricsEditor } from './admin/modules/MetricsEditor';
import { ChangelogEditor } from './admin/modules/ChangelogEditor';
import { TeamEditor } from './admin/modules/TeamEditor';
import { S01_ExecSummary } from './executive/sections/S01_ExecSummary';
import { S02_ProductOverview } from './executive/sections/S02_ProductOverview';
import { S03_OKRProgress } from './executive/sections/S03_OKRProgress';
import { S04_Roadmap } from './executive/sections/S04_Roadmap';
import { S05_Budget } from './executive/sections/S05_Budget';
import { S07_Deliverables } from './executive/sections/S07_Deliverables';
import { S08_Conversations } from './executive/sections/S08_Conversations';
import { S09_Risks } from './executive/sections/S09_Risks';
import { S10_DecisionLog } from './executive/sections/S10_DecisionLog';
import { S11_Changelog } from './executive/sections/S11_Changelog';
import { S12_Appendix } from './executive/sections/S12_Appendix';
import { PRODUCTS } from './products';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function ProductShell({ children }: { children: ReactNode }) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const validSlug = PRODUCTS.find(p => p.slug === productSlug && !p.comingSoon)?.slug;
  if (!validSlug) return <Navigate to="/" replace />;
  return <DataStoreProvider productId={validSlug}>{children}</DataStoreProvider>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/:productSlug/executive" element={
        <RequireAuth><ProductShell><ExecLayout /></ProductShell></RequireAuth>
      }>
        <Route index element={<Navigate to="summary" replace />} />
        <Route path="summary" element={<S01_ExecSummary />} />
        <Route path="overview" element={<S02_ProductOverview />} />
        <Route path="okrs" element={<S03_OKRProgress />} />
        <Route path="roadmap" element={<S04_Roadmap />} />
        <Route path="budget" element={<S05_Budget />} />
        <Route path="metrics" element={<Navigate to="overview" replace />} />
        <Route path="deliverables" element={<S07_Deliverables />} />
        <Route path="conversations" element={<S08_Conversations />} />
        <Route path="risks" element={<S09_Risks />} />
        <Route path="decisions" element={<S10_DecisionLog />} />
        <Route path="changelog" element={<S11_Changelog />} />
        <Route path="appendix" element={<S12_Appendix />} />
      </Route>

      <Route path="/:productSlug/admin" element={
        <RequireAuth><ProductShell><AdminLayout /></ProductShell></RequireAuth>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="exec-summary" element={<ExecSummaryEditor />} />
        <Route path="product-overview" element={<ProductOverviewEditor />} />
        <Route path="okrs" element={<OKREditor />} />
        <Route path="budget" element={<BudgetEditor />} />
        <Route path="roadmap" element={<RoadmapEditor />} />
        <Route path="artifacts" element={<ArtifactEditor />} />
        <Route path="conversations" element={<ConversationEditor />} />
        <Route path="risks" element={<RiskEditor />} />
        <Route path="decisions" element={<DecisionEditor />} />
        <Route path="metrics" element={<MetricsEditor />} />
        <Route path="changelog" element={<ChangelogEditor />} />
        <Route path="team" element={<TeamEditor />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
