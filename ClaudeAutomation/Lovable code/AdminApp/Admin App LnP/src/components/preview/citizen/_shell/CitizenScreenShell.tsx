import React from "react";
import { ArrowLeft, Bell, MessageSquare } from "lucide-react";
import { usePreview } from "../../PreviewContext";
import { useBranding } from "@/hooks/useBranding";

interface Props {
  /** Back chip target screen, omit to hide back chip */
  onBack?: () => void;
  backLabel?: string;
  /** Wizard progress slot (rendered below back chip) */
  progress?: React.ReactNode;
  /** Sticky bottom CTA */
  footer?: React.ReactNode;
  /** Show messages + bell? Defaults true on home/catalogue */
  showHeaderActions?: boolean;
  children: React.ReactNode;
}

const CitizenScreenShell: React.FC<Props> = ({
  onBack,
  backLabel = "Back",
  progress,
  footer,
  showHeaderActions = false,
  children,
}) => {
  const {
    unreadCount, markNotificationsRead,
    unreadMessagesCount, markMessagesRead, setMessagesDrawerOpen,
  } = usePreview();
  const { branding } = useBranding();

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ backgroundColor: "#F5F7FA" }}>
      {/* Portal header — branded */}
      <div
        className="text-primary-foreground px-4 py-3 flex items-center justify-between text-sm font-medium shrink-0 bg-primary"
      >
        <div className="flex items-center gap-2 min-w-0">
          {branding.logoDataUrl ? (
            <img src={branding.logoDataUrl} alt="" className="h-5 w-5 object-contain rounded-sm bg-white/10" />
          ) : (
            <span className="grid grid-cols-2 gap-0.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
              <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
              <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
              <span className="w-1.5 h-1.5 rounded-sm bg-white/80" />
            </span>
          )}
          <span className="truncate">{branding.portalName}</span>
        </div>
        {showHeaderActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setMessagesDrawerOpen(true); markMessagesRead(); }}
              className="relative p-1 -m-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Messages"
            >
              <MessageSquare className="h-4 w-4 text-white/80" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: "#F4A261" }}>
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => markNotificationsRead()}
              className="relative p-1 -m-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-1 rounded-full bg-destructive text-[9px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Back chip */}
      {onBack && (
        <div className="px-4 pt-3 pb-1 shrink-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors"
            style={{ color: "#1D3557", backgroundColor: "#EAF2FB" }}
          >
            <ArrowLeft className="h-3 w-3" /> {backLabel}
          </button>
        </div>
      )}

      {/* Wizard progress slot */}
      {progress && <div className="px-4 pt-2 pb-1 shrink-0">{progress}</div>}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>

      {/* Sticky footer */}
      {footer && (
        <div className="shrink-0 bg-white border-t" style={{ borderColor: "#E0E0E0" }}>
          <div className="px-4 py-3">{footer}</div>
          {branding.copyright && (
            <div className="px-4 pb-2 text-center text-[10px] text-muted-foreground">
              {branding.copyright}
            </div>
          )}
        </div>
      )}

      {!footer && branding.copyright && (
        <div className="shrink-0 px-4 py-2 text-center text-[10px] text-muted-foreground bg-white/60 border-t" style={{ borderColor: "#E0E0E0" }}>
          {branding.copyright}
        </div>
      )}
    </div>
  );
};

export default CitizenScreenShell;
