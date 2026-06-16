import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { PreviewProvider, usePreview, type DeviceMode } from "./PreviewContext";
import PreviewTopBar from "./PreviewTopBar";
import PreviewSidebar from "./PreviewSidebar";
import BrandingScope from "@/components/BrandingScope";
import MobileFrame from "./MobileFrame";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import CitizenHome from "./citizen/CitizenHome";
import ApplicationForm from "./citizen/ApplicationForm";
import ApplicationIntro from "./citizen/ApplicationIntro";
import SuccessScreen from "./citizen/SuccessScreen";
import MyApplications from "./citizen/MyApplications";
import MyDocuments from "./citizen/MyDocuments";
import ApplicationDetail from "./citizen/ApplicationDetail";
import PaymentScreen from "./citizen/PaymentScreen";
import LicenseView from "./citizen/LicenseView";
import DemandNoticeView from "./citizen/DemandNoticeView";
import InvoiceView from "./citizen/InvoiceView";
import ServiceCatalogue from "./citizen/ServiceCatalogue";
import EmployeeHome from "./employee/EmployeeHome";
import InboxView from "./employee/InboxView";
import SearchApplications from "./employee/SearchApplications";
import ApplicationReview from "./employee/ApplicationReview";
import { ServiceConfigProvider } from "@/contexts/ServiceConfigContext";

const embeddedDevices: { mode: DeviceMode; icon: React.ElementType }[] = [
  { mode: "mobile", icon: Smartphone },
  { mode: "tablet", icon: Tablet },
  { mode: "desktop", icon: Monitor },
];

const EmbeddedDeviceToggle: React.FC = () => {
  const { deviceMode, setDeviceMode } = usePreview();
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-card border-b">
      <div className="w-[120px]" />

      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        {embeddedDevices.map(({ mode, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setDeviceMode(mode)}
            className={`p-1.5 rounded-md transition-colors ${
              deviceMode === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="w-[120px]" />
    </div>
  );
};

export const PreviewContent: React.FC = () => {
  const { screen, deviceMode, role } = usePreview();

  const renderScreen = () => {
    switch (screen.type) {
      case "catalogue": return <ServiceCatalogue />;
      case "home": return role === "citizen" ? <CitizenHome /> : <EmployeeHome />;
      case "apply_intro": return <ApplicationIntro />;
      case "apply": return <ApplicationForm />;
      case "renew": return <ApplicationForm />;
      case "success": return <SuccessScreen />;
      case "my_applications": return <MyApplications />;
      case "my_documents": return <MyDocuments />;
      case "application_detail": return <ApplicationDetail />;
      case "payment": return <PaymentScreen />;
      case "license": return <LicenseView />;
      case "demand_notice": return <DemandNoticeView />;
      case "invoice": return <InvoiceView />;
      case "employee_home": return <EmployeeHome />;
      case "inbox": return <InboxView />;
      case "search": return <SearchApplications />;
      case "application_review": return <ApplicationReview />;
      default: return role === "citizen" ? <ServiceCatalogue /> : <EmployeeHome />;
    }
  };

  const isMobile = deviceMode === "mobile";

  if (isMobile) {
    return (
      <div className="flex-1 bg-[#444] overflow-hidden">
        <MobileFrame>{renderScreen()}</MobileFrame>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#444] overflow-hidden p-6">
      <div className="bg-card rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground">
            digit-studio/preview
          </div>
        </div>
        <div className="flex-1 overflow-auto">{renderScreen()}</div>
      </div>
    </div>
  );
};

const ServicePreviewInner: React.FC<{ embedded?: boolean; onExit?: () => void }> = ({ embedded, onExit }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { setActiveService, state } = useOnboarding();

  useEffect(() => {
    if (id && state.activeServiceId !== id) setActiveService(id);
  }, [id, state.activeServiceId, setActiveService]);

  const handleExit =
    onExit ??
    (() => {
      if (location.key === "default") {
        navigate(`/service/${id}/configure`);
      } else {
        navigate(-1);
      }
    });

  return (
    <BrandingScope applyToRoot className={embedded ? "flex flex-col bg-background h-full" : "h-screen flex flex-col bg-background"}>
      {!embedded && <PreviewTopBar onExit={handleExit} />}
      {embedded && <EmbeddedDeviceToggle />}
      <div className="flex-1 flex overflow-hidden">
        <PreviewContent />
        <PreviewSidebar />
      </div>
    </BrandingScope>
  );
};

export const ServicePreviewWorkspace: React.FC = () => {
  const { state } = useOnboarding();
  const serviceName = state.serviceName || "Business License";
  return (
    <PreviewProvider serviceName={serviceName}>
      <ServicePreviewInner embedded />
    </PreviewProvider>
  );
};

const ServicePreview: React.FC = () => {
  const { state } = useOnboarding();
  const { id } = useParams();
  const serviceName = state.serviceName || "Business License";

  return (
    <ServiceConfigProvider serviceId={id ?? state.activeServiceId ?? ""}>
      <PreviewProvider serviceName={serviceName}>
        <ServicePreviewInner />
      </PreviewProvider>
    </ServiceConfigProvider>
  );
};

export default ServicePreview;
