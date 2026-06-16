import React, { useState } from "react";
import { AuditProvider, type UnifiedEvent } from "@/components/audit/AuditContext";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { UnifiedAuditTable } from "@/components/audit/UnifiedAuditTable";
import { AuditDetailDrawer } from "@/components/audit/AuditDetailDrawer";

interface Props {
  scopeId?: string;
}

export const AuditView: React.FC<Props> = ({ scopeId }) => {
  const [selected, setSelected] = useState<UnifiedEvent | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <AuditProvider serviceScopeId={scopeId}>
      <div className="rounded-md border bg-card overflow-hidden">
        <AuditFilterBar showCategory showQuickViews />
        <UnifiedAuditTable
          selectedId={selected?.id}
          onSelect={(e) => {
            setSelected(e);
            setOpen(true);
          }}
        />
      </div>
      <AuditDetailDrawer event={selected} open={open} onOpenChange={setOpen} />
    </AuditProvider>
  );
};
