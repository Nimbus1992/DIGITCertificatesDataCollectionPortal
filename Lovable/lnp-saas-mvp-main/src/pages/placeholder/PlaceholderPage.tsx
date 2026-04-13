import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Construction className="h-7 w-7 text-accent" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
};

export default PlaceholderPage;
