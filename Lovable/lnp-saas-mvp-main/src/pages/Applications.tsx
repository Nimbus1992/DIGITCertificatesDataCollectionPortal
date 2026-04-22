import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  FileText, Search, Eye, CheckCircle2, XCircle, Clock,
  AlertCircle, MessageSquare, Download, Filter, TrendingUp,
  ChevronRight, User, Calendar, CreditCard,
} from "lucide-react";

interface Application {
  id: string;
  referenceNumber: string;
  applicantName: string;
  applicantEmail: string;
  serviceName: string;
  templateId: string;
  status: "submitted" | "in_review" | "query_raised" | "approved" | "rejected" | "draft";
  currentStage: string;
  submittedAt: string;
  fee: number;
  paymentStatus: "unpaid" | "paid" | "waived";
  priority: "normal" | "high" | "urgent";
}

const STATUS_CONFIG: Record<Application["status"], { label: string; className: string; icon: React.ElementType }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", icon: Clock },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700", icon: FileText },
  in_review: { label: "In Review", className: "bg-amber-100 text-amber-700", icon: Clock },
  query_raised: { label: "Query Raised", className: "bg-orange-100 text-orange-700", icon: MessageSquare },
  approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
};

const PRIORITY_CONFIG: Record<Application["priority"], string> = {
  normal: "",
  high: "border-l-4 border-l-amber-400",
  urgent: "border-l-4 border-l-red-400",
};

const mockApplications: Application[] = [
  { id: "a1", referenceNumber: "BL-2026-AB1234", applicantName: "Rajesh Kumar", applicantEmail: "rajesh@example.com", serviceName: "Business License", templateId: "business-license", status: "in_review", currentStage: "Under Scrutiny", submittedAt: "2026-04-13", fee: 350, paymentStatus: "paid", priority: "normal" },
  { id: "a2", referenceNumber: "FL-2026-CD5678", applicantName: "Priya Sharma", applicantEmail: "priya@example.com", serviceName: "Food License", templateId: "food-license", status: "query_raised", currentStage: "Query Raised", submittedAt: "2026-04-12", fee: 200, paymentStatus: "paid", priority: "high" },
  { id: "a3", referenceNumber: "BP-2026-EF9012", applicantName: "Ahmed Khan", applicantEmail: "ahmed@example.com", serviceName: "Building Permit", templateId: "building-permit", status: "submitted", currentStage: "Application Submitted", submittedAt: "2026-04-14", fee: 750, paymentStatus: "unpaid", priority: "normal" },
  { id: "a4", referenceNumber: "BL-2026-GH3456", applicantName: "Meena Patel", applicantEmail: "meena@example.com", serviceName: "Business License", templateId: "business-license", status: "approved", currentStage: "Approved", submittedAt: "2026-04-10", fee: 350, paymentStatus: "paid", priority: "normal" },
  { id: "a5", referenceNumber: "FL-2026-IJ7890", applicantName: "Suresh Reddy", applicantEmail: "suresh@example.com", serviceName: "Food License", templateId: "food-license", status: "rejected", currentStage: "Rejected", submittedAt: "2026-04-09", fee: 200, paymentStatus: "waived", priority: "normal" },
  { id: "a6", referenceNumber: "BL-2026-KL2345", applicantName: "Anita Singh", applicantEmail: "anita@example.com", serviceName: "Business License", templateId: "business-license", status: "in_review", currentStage: "Field Inspection", submittedAt: "2026-04-11", fee: 350, paymentStatus: "paid", priority: "urgent" },
];

const ApplicationsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = mockApplications.filter((a) => {
    const matchSearch =
      !search ||
      a.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.applicantEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchService = serviceFilter === "all" || a.serviceName === serviceFilter;
    return matchSearch && matchStatus && matchService;
  });

  const tabCounts = {
    all: mockApplications.length,
    in_review: mockApplications.filter((a) => a.status === "in_review").length,
    query_raised: mockApplications.filter((a) => a.status === "query_raised").length,
    approved: mockApplications.filter((a) => a.status === "approved").length,
    rejected: mockApplications.filter((a) => a.status === "rejected").length,
  };

  const services = [...new Set(mockApplications.map((a) => a.serviceName))];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review and process all incoming applications
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: mockApplications.length, color: "text-foreground" },
            { label: "In Review", value: tabCounts.in_review, color: "text-amber-600" },
            { label: "Query Raised", value: tabCounts.query_raised, color: "text-orange-600" },
            { label: "Approved", value: tabCounts.approved, color: "text-green-600" },
            { label: "Rejected", value: tabCounts.rejected, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by reference number, name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs + Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="in_review">In Review ({tabCounts.in_review})</TabsTrigger>
            <TabsTrigger value="query_raised">Query ({tabCounts.query_raised})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({tabCounts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({tabCounts.rejected})</TabsTrigger>
          </TabsList>

          {["all", "in_review", "query_raised", "approved", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-2">
                {filtered
                  .filter((a) => tab === "all" || a.status === tab)
                  .map((app) => {
                    const statusCfg = STATUS_CONFIG[app.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <Card
                        key={app.id}
                        className={`hover:shadow-sm transition-all cursor-pointer ${PRIORITY_CONFIG[app.priority]}`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          {/* Reference + Name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-semibold text-foreground">
                                {app.referenceNumber}
                              </span>
                              {app.priority !== "normal" && (
                                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${app.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                                  {app.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {app.applicantName} · {app.serviceName}
                            </p>
                          </div>

                          {/* Stage */}
                          <div className="hidden md:block">
                            <p className="text-xs text-muted-foreground">Stage</p>
                            <p className="text-xs font-medium text-foreground">{app.currentStage}</p>
                          </div>

                          {/* Date */}
                          <div className="hidden md:block">
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="text-xs text-foreground">{app.submittedAt}</p>
                          </div>

                          {/* Fee */}
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold text-foreground">${app.fee}</p>
                            <p className={`text-[10px] ${app.paymentStatus === "paid" ? "text-green-600" : app.paymentStatus === "waived" ? "text-muted-foreground" : "text-red-600"}`}>
                              {app.paymentStatus}
                            </p>
                          </div>

                          {/* Status */}
                          <Badge className={`text-[10px] px-2 py-0.5 gap-1 flex items-center border-0 ${statusCfg.className} shrink-0`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusCfg.label}
                          </Badge>

                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })}

                {filtered.filter((a) => tab === "all" || a.status === tab).length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    No applications found
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedApp?.referenceNumber}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Badge className={`text-xs px-2 py-1 border-0 ${STATUS_CONFIG[selectedApp.status].className}`}>
                  {STATUS_CONFIG[selectedApp.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">Current stage: <strong>{selectedApp.currentStage}</strong></span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{selectedApp.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{selectedApp.applicantEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{selectedApp.serviceName}</p>
                      <p className="text-xs text-muted-foreground">Service</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{selectedApp.submittedAt}</p>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">${selectedApp.fee}</p>
                      <p className={`text-xs capitalize ${selectedApp.paymentStatus === "paid" ? "text-green-600" : "text-muted-foreground"}`}>
                        {selectedApp.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(selectedApp.status === "submitted" || selectedApp.status === "in_review") && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <MessageSquare className="h-4 w-4" /> Raise Query
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 ml-auto">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              )}
              {selectedApp.status === "approved" && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
                    <Download className="h-4 w-4" /> Download Certificate
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsPage;
