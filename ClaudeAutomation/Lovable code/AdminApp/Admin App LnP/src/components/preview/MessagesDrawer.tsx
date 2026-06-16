import React, { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePreview } from "./PreviewContext";
import { Smartphone, Mail, Inbox, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const fmt = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const MessagesDrawer: React.FC<Props> = ({ open, onOpenChange }) => {
  const { messages, applications } = usePreview();
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const sms = useMemo(() => messages.filter(m => m.channel === "SMS"), [messages]);
  const emails = useMemo(() => messages.filter(m => m.channel === "EMAIL"), [messages]);

  const appNumberFor = (id?: string) =>
    id ? applications.find(a => a.id === id)?.applicationNumber : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="h-4 w-4" /> Messages
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="sms" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-3 grid grid-cols-2">
            <TabsTrigger value="sms" className="gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> SMS
              {sms.length > 0 && (
                <span className="ml-1 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{sms.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
              {emails.length > 0 && (
                <span className="ml-1 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{emails.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* SMS */}
          <TabsContent value="sms" className="flex-1 overflow-y-auto px-5 py-4 m-0 space-y-3">
            {sms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No SMS yet.</p>
              </div>
            ) : (
              sms.map(m => {
                const appNo = appNumberFor(m.applicationId);
                return (
                  <div key={m.id} className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <Smartphone className="h-3 w-3" /> Gov Services
                      </span>
                      {appNo && (
                        <span className="font-mono px-1.5 py-0.5 rounded bg-muted">
                          {appNo.split("-").slice(-2).join("-")}
                        </span>
                      )}
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-950 leading-relaxed">
                      {m.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground pl-1">{fmt(m.timestamp)}</span>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* EMAIL */}
          <TabsContent value="email" className="flex-1 overflow-y-auto m-0">
            {emails.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No emails yet.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {emails.map(m => {
                  const isOpen = expandedEmail === m.id;
                  const appNo = appNumberFor(m.applicationId);
                  return (
                    <li key={m.id} className="hover:bg-muted/40 transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedEmail(isOpen ? null : m.id)}
                        className="w-full text-left px-5 py-3 flex items-start gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold text-indigo-900 truncate">
                              noreply@govservices.in
                            </p>
                            <span className="text-[10px] text-muted-foreground shrink-0">{fmt(m.timestamp)}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate mt-0.5">{m.title}</p>
                          {!isOpen && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{m.message}</p>
                          )}
                          {appNo && (
                            <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {appNo.split("-").slice(-2).join("-")}
                            </span>
                          )}
                          {isOpen && (
                            <div className="mt-2 text-xs text-foreground bg-muted/40 border rounded-md p-2.5 leading-relaxed whitespace-pre-wrap">
                              {m.message}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 mt-1 text-muted-foreground">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default MessagesDrawer;
