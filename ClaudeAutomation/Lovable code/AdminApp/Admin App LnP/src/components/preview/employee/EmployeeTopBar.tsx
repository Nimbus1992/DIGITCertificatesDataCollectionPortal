import React, { useState } from "react";
import { Bell } from "lucide-react";
import { usePreview } from "../PreviewContext";
import NotificationsPanel from "../NotificationsPanel";
import { useBranding } from "@/hooks/useBranding";

interface Props {
  rightSlot?: React.ReactNode;
}

const EmployeeTopBar: React.FC<Props> = ({ rightSlot }) => {
  const { unreadCount, markNotificationsRead } = usePreview();
  const [notifOpen, setNotifOpen] = useState(false);
  const { branding } = useBranding();

  const openNotifications = () => {
    setNotifOpen(true);
    markNotificationsRead();
  };

  return (
    <>
      <div className="bg-primary text-primary-foreground px-6 py-3 text-sm font-medium flex items-center gap-2">
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

        <div className="ml-auto flex items-center gap-2">
          {rightSlot}
          <button
            onClick={openNotifications}
            className="relative p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4 opacity-90" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
};

export default EmployeeTopBar;
