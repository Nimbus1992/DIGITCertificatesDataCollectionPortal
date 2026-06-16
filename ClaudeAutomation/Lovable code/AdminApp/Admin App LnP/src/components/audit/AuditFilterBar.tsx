import React from "react";
import { Search, X, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAudit, SERVICE_OPTIONS, USER_OPTIONS, type AuditFilters } from "./AuditContext";

const ENV_OPTIONS = ["all", "production", "staging", "sandbox"] as const;
const SEVERITY_OPTIONS = ["all", "success", "warning", "failed"] as const;
const STATUS_OPTIONS = ["all", "published", "draft", "failed", "rolled_back", "approved", "pending", "in_progress"] as const;
const EVENT_TYPE_OPTIONS = [
  "all",
  "submitted",
  "approved",
  "rejected",
  "sent_back",
  "payment_completed",
  "document_verified",
  "certificate_generated",
] as const;

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "governance", label: "Governance" },
  { value: "config", label: "Configuration" },
  { value: "deployment", label: "Deployments" },
  { value: "runtime", label: "Runtime" },
] as const;

const QUICK_VIEWS: { value: string; label: string }[] = [
  { value: "all", label: "All activity" },
  { value: "failures", label: "Only failures" },
  { value: "permissions", label: "Permission & role changes" },
  { value: "config", label: "Configuration changes" },
  { value: "deployments", label: "Deployments" },
  { value: "approvals", label: "Runtime approvals" },
  { value: "security", label: "Security events" },
];

const labelize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type SecondaryKey = "service" | "user" | "environment" | "eventType" | "severity" | "status";

const SECONDARY_LABELS: Record<SecondaryKey, string> = {
  service: "Service",
  user: "User",
  environment: "Environment",
  eventType: "Event type",
  severity: "Severity",
  status: "Status",
};

export const AuditFilterBar: React.FC<{ scoped?: boolean; showCategory?: boolean; showQuickViews?: boolean }> = ({
  scoped,
  showCategory,
  showQuickViews,
}) => {
  const { filters, setFilters } = useAudit();

  const activeSecondary: SecondaryKey[] = (
    ["service", "user", "environment", "eventType", "severity", "status"] as SecondaryKey[]
  ).filter((k) => {
    if (scoped && k === "service") return false;
    return (filters[k] as string) !== "all";
  });

  const dateActive = !!(filters.dateRange.from || filters.dateRange.to);
  const categoryActive = showCategory && filters.category !== "all";
  const hasActive =
    filters.search ||
    activeSecondary.length > 0 ||
    dateActive ||
    categoryActive ||
    (showQuickViews && filters.quickView !== "all");

  const reset = () =>
    setFilters((f) => ({
      ...f,
      search: "",
      service: "all",
      user: "all",
      environment: "all",
      eventType: "all",
      severity: "all",
      status: "all",
      dateRange: {},
      category: "all",
      quickView: "all",
    }));

  const clearOne = (k: SecondaryKey) => setFilters((f) => ({ ...f, [k]: "all" } as AuditFilters));

  return (
    <div className="bg-muted/30 border-b">
      <div className="px-4 py-2.5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by ID, user, service, action, application…"
            className="h-9 pl-8 text-sm bg-background"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5 text-sm font-normal bg-background",
                dateActive && "border-primary/40 text-foreground",
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateActive
                ? `${filters.dateRange.from ? format(filters.dateRange.from, "MMM d") : "…"} – ${
                    filters.dateRange.to ? format(filters.dateRange.to, "MMM d") : "…"
                  }`
                : "Any time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
              onSelect={(range) =>
                setFilters((f) => ({ ...f, dateRange: { from: range?.from, to: range?.to } }))
              }
              numberOfMonths={2}
              initialFocus
            />
            <div className="flex justify-between border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setFilters((f) => ({ ...f, dateRange: {} }))}
              >
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {showCategory && (
          <Select
            value={filters.category}
            onValueChange={(v) => setFilters((f) => ({ ...f, category: v as AuditFilters["category"] }))}
          >
            <SelectTrigger className="h-9 w-[160px] text-sm bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm font-normal bg-background">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More filters
              {activeSecondary.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1.5 rounded-full text-[10px] font-semibold"
                >
                  {activeSecondary.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-4" align="end">
            <div className="grid grid-cols-2 gap-3">
              {!scoped && (
                <FilterField label="Service">
                  <Select
                    value={filters.service}
                    onValueChange={(v) => setFilters((f) => ({ ...f, service: v }))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s === "all" ? "All services" : s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>
              )}
              <FilterField label="User">
                <Select value={filters.user} onValueChange={(v) => setFilters((f) => ({ ...f, user: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USER_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>{u === "all" ? "All users" : u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Environment">
                <Select
                  value={filters.environment}
                  onValueChange={(v: string) =>
                    setFilters((f) => ({ ...f, environment: v as typeof filters.environment }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENV_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>{e === "all" ? "All envs" : labelize(e)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Event type">
                <Select value={filters.eventType} onValueChange={(v) => setFilters((f) => ({ ...f, eventType: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e}>{e === "all" ? "All events" : labelize(e)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Severity">
                <Select
                  value={filters.severity}
                  onValueChange={(v: string) =>
                    setFilters((f) => ({ ...f, severity: v as typeof filters.severity }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s === "all" ? "All severities" : labelize(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Status">
                <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : labelize(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </div>
          </PopoverContent>
        </Popover>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-9 gap-1 text-xs text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear all
          </Button>
        )}
      </div>

      {showQuickViews && (
        <div className="px-4 pb-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Quick views
          </span>
          {QUICK_VIEWS.map((q) => {
            const active = filters.quickView === q.value;
            return (
              <button
                key={q.value}
                onClick={() => setFilters((f) => ({ ...f, quickView: q.value }))}
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs font-medium border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground/80 border-border hover:bg-muted",
                )}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      )}

      {(activeSecondary.length > 0 || dateActive || categoryActive) && (
        <div className="px-4 pb-2.5 flex flex-wrap items-center gap-1.5">
          {dateActive && (
            <ActivePill
              label={`Date: ${filters.dateRange.from ? format(filters.dateRange.from, "MMM d") : "…"} – ${
                filters.dateRange.to ? format(filters.dateRange.to, "MMM d") : "…"
              }`}
              onClear={() => setFilters((f) => ({ ...f, dateRange: {} }))}
            />
          )}
          {categoryActive && (
            <ActivePill
              label={`Category: ${labelize(filters.category)}`}
              onClear={() => setFilters((f) => ({ ...f, category: "all" }))}
            />
          )}
          {activeSecondary.map((k) => (
            <ActivePill
              key={k}
              label={`${SECONDARY_LABELS[k]}: ${labelize(String(filters[k]))}`}
              onClear={() => clearOne(k)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const ActivePill: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <button
    onClick={onClear}
    className="inline-flex items-center gap-1 h-6 px-2 rounded-full border bg-background text-[11px] font-medium text-foreground/80 hover:bg-muted transition-colors"
  >
    {label}
    <X className="h-3 w-3 text-muted-foreground" />
  </button>
);
