import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ServiceConfig from "./pages/ServiceConfig";
import ServicePreview from "./components/preview/ServicePreview";
import GoLive from "./pages/GoLive";
import ServiceManage from "./pages/ServiceManage";
import OrganizationProfile from "./pages/setup/OrganizationProfile";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import BrandingTheme from "./pages/BrandingTheme";
import Services from "./pages/Services";
import TemplateSetup from "./pages/TemplateSetup";
import ResponsiveQA from "./pages/ResponsiveQA";
import UsersAccess from "./pages/UsersAccess";
import AuditLogs from "./pages/AuditLogs";
import ApplicationAreas from "./pages/setup/ApplicationAreas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OnboardingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* App shell with sidebar */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/templates/:templateId/setup" element={<TemplateSetup />} />
              <Route path="/service/:id/configure" element={<ServiceConfig />} />
              <Route path="/service/:id/preview" element={<ServicePreview />} />
              <Route path="/service/:id/manage" element={<ServiceManage />} />
              <Route path="/go-live" element={<GoLive />} />

              {/* Setup */}
              <Route path="/setup/organization" element={<OrganizationProfile />} />
              <Route path="/setup/users" element={<UsersAccess />} />
              <Route path="/setup/deployment" element={<ApplicationAreas />} />
              <Route path="/setup/auth" element={<PlaceholderPage title="Authentication" description="Set up how your team signs in — Email, Single Sign-On, or One-Time Password." />} />
              <Route path="/setup/license" element={<PlaceholderPage title="License & Billing" description="Manage your license key, subscription plan, and usage." />} />

              {/* Configuration */}
              <Route path="/config/branding" element={<BrandingTheme />} />
              <Route path="/config/languages" element={<PlaceholderPage title="Languages" description="Add language support and manage translations for your applications." />} />
              
              <Route path="/config/integrations" element={<PlaceholderPage title="Integrations" description="Connect payment gateways, document verification, and external APIs." />} />

              {/* Utilities */}
              <Route path="/audit-log" element={<AuditLogs />} />
              <Route path="/responsive-qa" element={<ResponsiveQA />} />
              <Route path="/help" element={<PlaceholderPage title="Help & Support" description="Access documentation, FAQs, and contact support." />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" description="General platform settings, data export, and account management." />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OnboardingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
