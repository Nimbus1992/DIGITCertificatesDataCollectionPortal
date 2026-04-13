import React from "react";
import { Building2, Globe, Briefcase, Languages, Palette, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";

const fields = [
  { key: "orgName", label: "Organization Name", icon: Building2, fallback: "Not set" },
  { key: "country", label: "Country", icon: Globe, fallback: "Not set" },
  { key: "department", label: "Department", icon: Briefcase, fallback: "Not set" },
  { key: "language", label: "Language", icon: Languages, fallback: "Not set" },
  { key: "themeColor", label: "Theme Color", icon: Palette, fallback: "Not set" },
  { key: "logoUrl", label: "Logo", icon: Image, fallback: "No logo uploaded" },
] as const;

const OrganizationProfile: React.FC = () => {
  const { state } = useOnboarding();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organization Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your organization details collected during onboarding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(({ key, label, icon: Icon, fallback }) => {
            const value = state[key as keyof typeof state] as string;
            const hasValue = value && value.trim().length > 0;

            return (
              <div key={key} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  {key === "themeColor" && hasValue ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: value }} />
                      <span className="text-sm text-foreground">{value}</span>
                    </div>
                  ) : key === "logoUrl" && hasValue ? (
                    <img src={value} alt="Organization logo" className="h-10 mt-1 rounded" />
                  ) : (
                    <p className={`text-sm ${hasValue ? "text-foreground" : "text-muted-foreground italic"}`}>
                      {hasValue ? value : fallback}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationProfile;
