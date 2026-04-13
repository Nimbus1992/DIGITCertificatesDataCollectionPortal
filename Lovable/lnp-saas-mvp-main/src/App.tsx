import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ServiceConfig from "./pages/ServiceConfig";
import GoLive from "./pages/GoLive";
import OrganizationProfile from "./pages/setup/OrganizationProfile";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import BrandingTheme from "./pages/BrandingTheme";

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
              <Route path="/services" element={<PlaceholderPage title="Services" description="Manage all your licenses & permits services. Create new services or configure existing ones." />} />
              <Route path="/service/:id/configure" element={<ServiceConfig />} />
              <Route path="/go-live" element={<GoLive />} />

              {/* Setup */}
              <Route path="/setup/organization" element={<OrganizationProfile />} />
              <Route path="/setup/users" element={<PlaceholderPage title="Users & Roles" description="Invite and manage team members. Assign roles like Admin, Operator, or Approver." />} />
              <Route path="/setup/deployment" element={<PlaceholderPage title="Deployment / Zones" description="Configure where your services are available — by state, city, district, or department." />} />
              <Route path="/setup/auth" element={<PlaceholderPage title="Authentication" description="Set up how your team signs in — Email, Single Sign-On, or One-Time Password." />} />
              <Route path="/setup/license" element={<PlaceholderPage title="License & Billing" description="Manage your license key, subscription plan, and usage." />} />

              {/* Configuration */}
              <Route path="/config/branding" element={<BrandingTheme />} />
              <Route path="/config/languages" element={<PlaceholderPage title="Languages" description="Add language support and manage translations for your services." />} />
              
              <Route path="/config/integrations" element={<PlaceholderPage title="Integrations" description="Connect payment gateways, document verification, and external APIs." />} />

              {/* Utilities */}
              <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" description="Track who did what and when. Important for government compliance requirements." />} />
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
