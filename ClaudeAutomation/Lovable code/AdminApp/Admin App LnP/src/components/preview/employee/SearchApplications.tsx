import React, { useState, useMemo } from "react";
import { usePreview } from "../PreviewContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search as SearchIcon, Hash, Briefcase } from "lucide-react";
import { getStatusStyle } from "./InboxView";
import EmployeeTopBar from "./EmployeeTopBar";

const StatusPill: React.FC<{ stateId: string; label: string }> = ({ stateId, label }) => {
  const s = getStatusStyle(stateId);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
};

const SearchApplications: React.FC = () => {
  const { applications, setScreen, serviceName } = usePreview();
  const [appNumberFilter, setAppNumberFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searched, setSearched] = useState(false);

  const results = useMemo(() => {
    if (!searched) return [];
    return applications.filter(app => {
      if (appNumberFilter && !app.applicationNumber.toLowerCase().includes(appNumberFilter.toLowerCase())) return false;
      if (statusFilter && app.status !== statusFilter) return false;
      return true;
    });
  }, [applications, appNumberFilter, statusFilter, searched]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-background to-sky-50/40">
      <EmployeeTopBar />

      <div className="px-6 py-2 text-xs">
        <button onClick={() => setScreen({ type: "employee_home" })} className="text-accent hover:underline">Home</button>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="text-muted-foreground">Search</span>
      </div>

      <div className="px-6 pb-6">
        <h2 className="text-2xl font-bold text-accent mb-4">Search</h2>

        {/* Filters */}
        <div className="rounded-xl p-5 mb-6 bg-card border border-border/50 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <Hash className="h-3.5 w-3.5 text-accent" />
                Application Number
              </label>
              <Input
                placeholder="Search..."
                value={appNumberFilter}
                onChange={(e) => setAppNumberFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-accent" />
                Business Service
              </label>
              <Input value={serviceName} disabled className="bg-muted" />
            </div>
            <button
              onClick={() => { setAppNumberFilter(""); setStatusFilter(""); setSearched(false); }}
              className="text-sm text-accent hover:underline self-end pb-2"
            >
              Clear
            </button>
            <Button
              onClick={() => setSearched(true)}
              className="bg-gradient-to-r from-accent to-teal-600 text-accent-foreground hover:from-accent/90 hover:to-teal-600/90 shadow-md shadow-accent/20 gap-1.5"
            >
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-accent/5 to-transparent hover:bg-gradient-to-r hover:from-accent/5 hover:to-transparent">
                  <TableHead className="text-accent font-semibold">Application Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Business Application</TableHead>
                  <TableHead>Application Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-60" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                        <circle cx="28" cy="28" r="16" stroke="hsl(var(--accent) / 0.5)" strokeWidth="3" fill="hsl(var(--accent) / 0.05)" />
                        <line x1="40" y1="40" x2="52" y2="52" stroke="hsl(var(--accent) / 0.5)" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <p className="text-sm font-semibold text-foreground">No matching applications</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your search filters.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-accent/5 border-l-4 border-l-transparent hover:border-l-accent transition-colors"
                      onClick={() => setScreen({ type: "application_review", applicationId: app.id })}
                    >
                      <TableCell className="text-accent text-xs font-mono font-semibold">{app.applicationNumber}</TableCell>
                      <TableCell><StatusPill stateId={app.currentStateId} label={app.status} /></TableCell>
                      <TableCell className="text-sm">{serviceName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Request_{serviceName.replace(/\s+/g, "_")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {results.length > 0 && (
              <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center justify-end gap-4 bg-muted/30">
                <span>Rows per page 10</span>
                <span>{results.length > 0 ? `1-${results.length} of ${results.length}` : "0"}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchApplications;
