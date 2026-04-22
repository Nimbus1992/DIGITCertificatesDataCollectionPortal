import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Search, Download, Filter, User, Settings, FileText, CreditCard, LogIn } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  resourceType: "application" | "service" | "user" | "payment" | "auth" | "config";
  resourceId: string;
  description: string;
  ipAddress: string;
}

const RESOURCE_ICONS: Record<AuditEntry["resourceType"], React.ElementType> = {
  application: FileText,
  service: Settings,
  user: User,
  payment: CreditCard,
  auth: LogIn,
  config: Settings,
};

const RESOURCE_COLORS: Record<AuditEntry["resourceType"], string> = {
  application: "bg-blue-100 text-blue-700",
  service: "bg-purple-100 text-purple-700",
  user: "bg-green-100 text-green-700",
  payment: "bg-amber-100 text-amber-700",
  auth: "bg-gray-100 text-gray-700",
  config: "bg-pink-100 text-pink-700",
};

const mockEntries: AuditEntry[] = [
  { id: "1", timestamp: "2026-04-14 09:32:15", userEmail: "admin@cityofaustin.gov", action: "application.approved", resourceType: "application", resourceId: "BL-2026-AB1234", description: "Application BL-2026-AB1234 approved at Pending Approval stage", ipAddress: "192.168.1.1" },
  { id: "2", timestamp: "2026-04-14 09:15:03", userEmail: "officer@cityofaustin.gov", action: "application.query_raised", resourceType: "application", resourceId: "FL-2026-CD5678", description: "Query raised on FL-2026-CD5678: Additional documents required", ipAddress: "192.168.1.24" },
  { id: "3", timestamp: "2026-04-14 08:55:44", userEmail: "admin@cityofaustin.gov", action: "service.published", resourceType: "service", resourceId: "Food License", description: "Service 'Food License' published successfully", ipAddress: "192.168.1.1" },
  { id: "4", timestamp: "2026-04-14 08:30:10", userEmail: "admin@cityofaustin.gov", action: "user.invited", resourceType: "user", resourceId: "james@example.com", description: "Invitation sent to james@example.com with role: Field Inspector", ipAddress: "192.168.1.1" },
  { id: "5", timestamp: "2026-04-13 17:44:22", userEmail: "billing@cityofaustin.gov", action: "payment.recorded", resourceType: "payment", resourceId: "BL-2026-GH3456", description: "Offline cash payment of $350 recorded for BL-2026-GH3456", ipAddress: "192.168.1.55" },
  { id: "6", timestamp: "2026-04-13 16:20:05", userEmail: "admin@cityofaustin.gov", action: "config.workflow_updated", resourceType: "config", resourceId: "Business License", description: "Workflow definition updated for Business License service", ipAddress: "192.168.1.1" },
  { id: "7", timestamp: "2026-04-13 14:10:33", userEmail: "system", action: "auth.login", resourceType: "auth", resourceId: "officer@cityofaustin.gov", description: "User officer@cityofaustin.gov signed in via email", ipAddress: "10.0.0.42" },
  { id: "8", timestamp: "2026-04-13 11:05:18", userEmail: "admin@cityofaustin.gov", action: "service.fee_rule_added", resourceType: "service", resourceId: "Building Permit", description: "Fee rule 'Large Business Surcharge' added to Building Permit", ipAddress: "192.168.1.1" },
];

const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");

  const filtered = mockEntries.filter((e) => {
    const matchSearch =
      !search ||
      e.userEmail.includes(search) ||
      e.action.includes(search) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.resourceId.toLowerCase().includes(search.toLowerCase());
    const matchResource = resourceFilter === "all" || e.resourceType === resourceFilter;
    return matchSearch && matchResource;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete trail of all actions taken in your account
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by user, action, or resource..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="config">Config</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log entries */}
        <div className="space-y-2">
          {filtered.map((entry) => {
            const Icon = RESOURCE_ICONS[entry.resourceType];
            return (
              <Card key={entry.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${RESOURCE_COLORS[entry.resourceType]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm text-foreground">{entry.description}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{entry.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">{entry.userEmail}</span>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${RESOURCE_COLORS[entry.resourceType]}`}>
                        {entry.resourceType}
                      </Badge>
                      <code className="text-[10px] text-muted-foreground font-mono">{entry.action}</code>
                      <span className="text-[10px] text-muted-foreground">{entry.ipAddress}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <Shield className="h-8 w-8 mx-auto mb-3 opacity-20" />
              No audit entries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
