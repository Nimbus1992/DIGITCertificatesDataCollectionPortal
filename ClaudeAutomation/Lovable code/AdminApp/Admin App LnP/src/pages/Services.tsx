import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateDetailView from "@/components/onboarding/TemplateDetailView";
import TemplateCard from "@/components/onboarding/TemplateCard";
import { allTemplates, type ServiceTemplate } from "@/data/serviceTemplates";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [detailTemplate, setDetailTemplate] = useState<ServiceTemplate | null>(null);

  const handleUse = (t: ServiceTemplate) => {
    navigate(`/templates/${t.id}/setup`);
  };

  if (detailTemplate) {
    return (
      <TemplateDetailView
        template={detailTemplate}
        onUseTemplate={detailTemplate.comingSoon ? undefined : () => handleUse(detailTemplate)}
        onBack={() => setDetailTemplate(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Choose a ready-to-use application template to get started quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allTemplates.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onViewDetails={() => setDetailTemplate(t)}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
