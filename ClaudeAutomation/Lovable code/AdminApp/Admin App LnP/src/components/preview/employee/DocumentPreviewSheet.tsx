import React from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Check, X, Repeat } from "lucide-react";
import { usePreview, type PreviewDocument } from "../PreviewContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: PreviewDocument | null;
  applicationId: string;
  uploadedBy?: string;
  allowActions?: boolean;
}

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const DocumentPreviewSheet: React.FC<Props> = ({
  open, onOpenChange, document, applicationId, uploadedBy, allowActions = false,
}) => {
  const { setDocumentStatus } = usePreview();
  if (!document) return null;

  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(document.name);
  const statusStyle =
    document.status === "Verified"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : document.status === "Rejected"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  const handle = (status: "Verified" | "Rejected") => {
    setDocumentStatus(applicationId, document.id, status);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-base">{document.type}</SheetTitle>
              <SheetDescription className="font-mono text-[11px] truncate">
                {document.name}
              </SheetDescription>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusStyle} shrink-0`}>
              {document.status}
            </span>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[11px] rounded-lg bg-muted/40 p-3">
            <div>
              <p className="text-muted-foreground">Uploaded by</p>
              <p className="font-medium text-foreground truncate">{uploadedBy || "Citizen"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Uploaded at</p>
              <p className="font-medium text-foreground">{fmtDate(document.uploadedAt)}</p>
            </div>
            {document.reused && (
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  <Repeat className="h-2.5 w-2.5" /> Reused from My Documents
                </span>
              </div>
            )}
          </div>

          {/* Mock preview area */}
          <div className="rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-slate-50 to-sky-50/40 aspect-[1/1.4] flex flex-col items-center justify-center p-6 text-center">
            {isImage ? (
              <>
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white shadow-lg mb-3">
                  <ImageIcon className="h-10 w-10" />
                </div>
                <p className="text-xs font-semibold text-foreground">Image preview</p>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg mb-3">
                  <FileText className="h-10 w-10" />
                </div>
                <p className="text-xs font-semibold text-foreground">Document preview</p>
              </>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 font-mono break-all max-w-full">
              {document.name}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-3">
              Mock preview — file content not available in demo.
            </p>
          </div>
        </div>

        {allowActions && (
          <SheetFooter className="mt-4 sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => handle("Rejected")}
              disabled={document.status === "Rejected"}
              className="flex-1 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 gap-1.5"
            >
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button
              onClick={() => handle("Verified")}
              disabled={document.status === "Verified"}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Check className="h-4 w-4" /> Verify
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DocumentPreviewSheet;
