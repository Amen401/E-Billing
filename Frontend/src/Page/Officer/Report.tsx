import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Calendar as CalendarIcon, FileDown, FileSpreadsheet, Loader2, Download, Eye } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


interface ReportData {
  reportType: string;
  officerId: string;
  generatedAt: string;
  summary: {
    customersRegistered: number;
    meterReadingsSubmitted: number;
    paymentsProcessed: number;
    complaintsHandled: number;
    pendingComplaints: number;
    resolvedComplaints: number;
  };
  details: {
    customersRegistered: any[];
    meterReadings: any[];
    payments: any[];
    complaints: any[];
    activities: any[];
  };
}

const Reports = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState("officer-report");
  const [department, setDepartment] = useState("");
  const [userGroup, setUserGroup] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setIsGenerating(true);
    try {
      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        ...(department && department !== "all" && { department }),
        ...(userGroup && userGroup !== "all" && { userGroup }),
      });

      let endpoint = "";
      switch (reportType) {
        case "officer-report":
          endpoint = "/api/reports/officer";
          break;
        case "new-registrations":
          endpoint = "/api/reports/registrations";
          break;
        case "meter-readings":
          endpoint = "/api/reports/meter-readings";
          break;
        case "revenue":
          endpoint = "/api/reports/revenue";
          break;
        case "customer-complaints":
          endpoint = "/api/reports/complaints";
          break;
        default:
          endpoint = "/api/reports/officer";
      }

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data = await response.json();
      setReportData(data);
      toast.success("Report generated successfully");
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    if (!reportData) {
      toast.error("Please generate a report first");
      return;
    }

    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          reportData,
          format,
          reportType,
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${format(new Date(), "yyyyMMdd_HHmmss")}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const resetReport = () => {
    setReportData(null);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Reports" }
        ]} 
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Reports</h1>
        <p className="text-muted-foreground">Select your desired report parameters and generate custom reports</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Report Generation</CardTitle>
            </div>
            {reportData && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetReport}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          <CardDescription>Configure options and click "Generate Report"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Report Type *</Label>
            <Select value={reportType} onValueChange={(value) => {
              setReportType(value);
              resetReport();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="officer-report">Officer Activity Report</SelectItem>
                <SelectItem value="new-registrations">New Registrations Summary</SelectItem>
                <SelectItem value="meter-readings">Meter Readings Report</SelectItem>
                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                <SelectItem value="customer-complaints">Customer Complaints</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department (Optional)</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="customer-service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User Group (Optional)</Label>
              <Select value={userGroup} onValueChange={setUserGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="officers">Officers</SelectItem>
                  <SelectItem value="managers">Managers</SelectItem>
                  <SelectItem value="admins">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport} 
            className="w-full" 
            size="lg"
            disabled={isGenerating || !startDate || !endDate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Report"
            )}
          </Button>
        </CardContent>
      </Card>

      {reportData ? (
        <Card>
          <CardHeader>
            <CardTitle>Report Overview</CardTitle>
            <CardDescription>
              Generated on {new Date(reportData.generatedAt).toLocaleDateString()} | 
              Officer ID: {reportData.officerId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    {reportData.summary.customersRegistered}
                  </div>
                  <p className="text-sm text-muted-foreground">Customers Registered</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.meterReadingsSubmitted}
                  </div>
                  <p className="text-sm text-muted-foreground">Meter Readings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.paymentsProcessed}
                  </div>
                  <p className="text-sm text-muted-foreground">Payments Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-600">
                    {reportData.summary.complaintsHandled}
                  </div>
                  <p className="text-sm text-muted-foreground">Complaints Handled</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.summary.pendingComplaints}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Complaints</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-emerald-600">
                    {reportData.summary.resolvedComplaints}
                  </div>
                  <p className="text-sm text-muted-foreground">Resolved Complaints</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
              <Button 
                onClick={() => setShowExportModal(true)}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Report Overview</CardTitle>
            <CardDescription>A quick summary or preview of the generated report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-24 w-24 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <p className="text-muted-foreground">
                No report generated yet. Configure options and click "Generate Report".
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* {reportData && (
        <>
          <ReportPreview
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            reportData={reportData}
            startDate={startDate}
            endDate={endDate}
            reportType={reportType}
          />
          
          <ReportExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            reportType={reportType}
          />
        </>
      )} */}
    </div>
  );
};

export default Reports;