import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnifiedEvents, type UnifiedEvent } from "./AuditContext";
import { CategoryBadge, EnvBadge, StatusToneBadge, RelativeTime, EmptyState, LoadMore } from "./shared";

type SortKey = "timestamp" | "actor" | "category";

export const UnifiedAuditTable: React.FC<{ onSelect: (e: UnifiedEvent) => void; selectedId?: string }> = ({
  onSelect,
  selectedId,
}) => {
  const rows = useUnifiedEvents();
  const [shown, setShown] = useState(25);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "timestamp", dir: "desc" });

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "timestamp") {
        cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sort.key === "actor") {
        cmp = a.actor.localeCompare(b.actor);
      } else {
        cmp = a.category.localeCompare(b.category);
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort]);

  const visible = sorted.slice(0, shown);
  const toggleSort = (k: SortKey) =>
    setSort((s) => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }));

  if (rows.length === 0) return <div className="p-4"><EmptyState /></div>;

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b">
            <SortableHead label="Time" k="timestamp" sort={sort} onClick={toggleSort} className="pl-4 w-[140px]" />
            <SortableHead label="Actor" k="actor" sort={sort} onClick={toggleSort} className="w-[140px]" />
            <SortableHead label="Category" k="category" sort={sort} onClick={toggleSort} className="w-[130px]" />
            <Th>Action</Th>
            <Th className="w-[200px]">Entity</Th>
            <Th className="w-[140px]">Service</Th>
            <Th className="w-[110px]">Env</Th>
            <Th className="w-[110px]">Status</Th>
            <Th className="text-right pr-4 w-[130px]">ID</Th>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((r) => {
            const isSelected = r.id === selectedId;
            const severityBorder =
              r.severity === "failed"
                ? "border-l-2 border-l-destructive"
                : r.severity === "warning"
                ? "border-l-2 border-l-warning"
                : "border-l-2 border-l-transparent";
            return (
              <TableRow
                key={r.id}
                className={cn(
                  "group cursor-pointer border-b transition-colors",
                  severityBorder,
                  "hover:bg-muted/40",
                  isSelected && "bg-primary/[0.06] hover:bg-primary/[0.08]",
                )}
                onClick={() => onSelect(r)}
              >
                <TableCell className="py-3 pl-4 align-top">
                  <RelativeTime ts={r.timestamp} stacked />
                </TableCell>
                <TableCell className="py-3 align-top text-sm font-medium text-foreground truncate">{r.actor}</TableCell>
                <TableCell className="py-3 align-top">
                  <CategoryBadge category={r.category} />
                </TableCell>
                <TableCell className="py-3 align-top text-sm text-foreground">{r.action}</TableCell>
                <TableCell className="py-3 align-top text-sm text-muted-foreground truncate">{r.entity}</TableCell>
                <TableCell className="py-3 align-top text-xs text-muted-foreground truncate">
                  {r.service || "—"}
                </TableCell>
                <TableCell className="py-3 align-top">
                  {r.environment ? <EnvBadge env={r.environment} /> : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="py-3 align-top">
                  <StatusToneBadge tone={r.statusTone} label={r.statusLabel} />
                </TableCell>
                <TableCell className="py-3 align-top text-right pr-4 font-mono text-xs text-muted-foreground">
                  {r.id}
                </TableCell>
                <TableCell className="py-3 pr-3 align-middle text-right">
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground/50 transition-colors",
                      "group-hover:text-foreground",
                      isSelected && "text-primary",
                    )}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="px-4 py-3 border-t bg-muted/20">
        <LoadMore shown={Math.min(shown, rows.length)} total={rows.length} onMore={() => setShown((s) => s + 25)} />
      </div>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableHead className={cn("h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
    {children}
  </TableHead>
);

const SortableHead: React.FC<{
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onClick: (k: SortKey) => void;
  className?: string;
}> = ({ label, k, sort, onClick, className }) => (
  <TableHead
    onClick={() => onClick(k)}
    tabIndex={0}
    role="button"
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(k); } }}
    className={cn(
      "h-10 cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "text-foreground" : "text-muted-foreground/50")} />
    </span>
  </TableHead>
);
