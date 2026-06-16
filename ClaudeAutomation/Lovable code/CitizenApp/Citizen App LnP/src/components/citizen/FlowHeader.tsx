import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import logo from "@/assets/cape-town-logo.png";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  brand?: "egov" | "digit";
};

export function FlowHeader({ title = "City of Cape Town", showBack = true, onBack, brand = "egov" }: Props) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    router.history.back();
  };
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-brand-teal text-brand-teal-foreground">
        <div className="flex items-center gap-2 px-4 pt-3 pb-3">
          <img src={logo} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 rounded-full bg-white/15 p-0.5" />
          <span className="text-base font-semibold">{title}</span>
        </div>
      </div>
      {showBack && (
        <div className="bg-card px-4 pt-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:text-brand-teal-deep"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      )}
    </header>
  );
}