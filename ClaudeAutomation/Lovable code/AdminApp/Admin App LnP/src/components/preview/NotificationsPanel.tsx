import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePreview } from "./PreviewContext";
import { Bell, Inbox } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const fmt = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const NotificationsPanel: React.FC<Props> = ({ open, onOpenChange }) => {
  const { notifications, role, applications } = usePreview();

  // Role-scope: show only PUSH notifications targeted at the active role
  // (legacy entries with no recipientRole are shown to everyone).
  const visible = notifications.filter(n => !n.recipientRole || n.recipientRole === role);

  const appNumberFor = (id?: string) =>
    id ? applications.find(a => a.id === id)?.applicationNumber : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-100px)] pr-1">
          {visible.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            visible.map((n) => {
              const appNo = appNumberFor(n.applicationId);
              return (
                <div
                  key={n.id}
                  className={`border rounded-lg p-3 ${n.read ? "bg-muted/30" : "bg-accent/5 border-accent/30"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {appNo && (
                      <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {appNo.split("-").slice(-2).join("-")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{fmt(n.timestamp)}</p>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
