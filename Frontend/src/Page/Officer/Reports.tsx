import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileDown, FileText, Calendar, Download, Users, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const mockReportData = {
  "new-registrations": {
    title: "New Registrations Summary",
    data: [
      { date: "2025-10-21", residential: 15, commercial: 8, industrial: 3, total: 26 },
      { date: "2025-10-20", residential: 12, commercial: 6, industrial: 2, total: 20 },
      { date: "2025-10-19", residential: 18, commercial: 9, industrial: 4, total: 31 },
      { date: "2025-10-18", residential: 14, commercial: 7, industrial: 3, total: 24 },
    ],
    summary: { totalResidential: 59, totalCommercial: 30, totalIndustrial: 12, grandTotal: 101 }
  },
  "consumption": {
    title: "Water Consumption Report",
    data: [
      { zone: "Zone A", avgConsumption: 450, peakConsumption: 780, lowConsumption: 320, totalUsers: 150 },
      { zone: "Zone B", avgConsumption: 380, peakConsumption: 620, lowConsumption: 280, totalUsers: 120 },
      { zone: "Zone C", avgConsumption: 520, peakConsumption: 850, lowConsumption: 350, totalUsers: 180 },
      { zone: "Zone D", avgConsumption: 410, peakConsumption: 690, lowConsumption: 300, totalUsers: 135 },
    ],
    summary: { totalConsumption: 1760, avgPerUser: 12.3, peakZone: "Zone C" }
  },
  "complaints": {
    title: "Complaint Summary Report",
    data: [
      { category: "Water Quality", pending: 5, resolved: 12, total: 17, resolutionRate: "70.6%" },
      { category: "Low Pressure", pending: 8, resolved: 15, total: 23, resolutionRate: "65.2%" },
      { category: "Billing Issues", pending: 3, resolved: 20, total: 23, resolutionRate: "87.0%" },
      { category: "Meter Problems", pending: 2, resolved: 8, total: 10, resolutionRate: "80.0%" },
      { category: "Pipeline Leaks", pending: 6, resolved: 18, total: 24, resolutionRate: "75.0%" },
    ],
    summary: { totalPending: 24, totalResolved: 73, overallResolutionRate: "75.3%" }
  },
  "revenue": {
    title: "Revenue Collection Report",
    data: [
      { month: "October", collected: 1250000, pending: 180000, target: 1400000, achievement: "89.3%" },
      { month: "September", collected: 1180000, pending: 150000, target: 1350000, achievement: "87.4%" },
      { month: "August", collected: 1320000, pending: 120000, target: 1450000, achievement: "91.0%" },
      { month: "July", collected: 1280000, pending: 160000, target: 1400000, achievement: "91.4%" },
    ],
    summary: { totalCollected: 5030000, totalPending: 610000, avgAchievement: "89.8%" }
  },
  "anomaly": {
    title: "Anomaly Detection Report",
    data: [
      { type: "High Consumption", severity: "High", location: "Zone C-12", detectedDate: "2025-10-21", status: "Under Investigation" },
      { type: "Zero Consumption", severity: "Medium", location: "Zone B-08", detectedDate: "2025-10-20", status: "Resolved" },
      { type: "Unusual Pattern", severity: "Medium", location: "Zone A-15", detectedDate: "2025-10-19", status: "Monitoring" },
      { type: "Potential Leak", severity: "High", location: "Zone D-03", detectedDate: "2025-10-18", status: "Under Repair" },
    ],
    summary: { highSeverity: 2, mediumSeverity: 2, resolvedCases: 1 }
  }
};

const Reports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    startDate: "2025-10-18",
    endDate: "2025-10-21",
    reportType: "",
    department: "",
    userGroup: "",
  });
  const [reportGenerated, setReportGenerated] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportData.reportType) {
      toast.error("Please select a report type");
      return;
    }

    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const report = mockReportData[reportData.reportType as keyof typeof mockReportData];
    if (report) {
      setCurrentReport({
        ...report,
        filters: {
          dateRange: `${reportData.startDate} to ${reportData.endDate}`,
          department: reportData.department || "All",
          userGroup: reportData.userGroup || "All"
        }
      });
      setReportGenerated(true);
      toast.success("Report generated successfully!");
    } else {
      toast.error("Failed to generate report");
    }
    
    setIsGenerating(false);
  };

  const exportToPDF = () => {
    if (!currentReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(currentReport.title, pageWidth / 2, 20, { align: "center" });
    
    // Report details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Date Range: ${currentReport.filters.dateRange}`, 20, 50);
    doc.text(`Department: ${currentReport.filters.department}`, 20, 60);
    doc.text(`User Group: ${currentReport.filters.userGroup}`, 20, 70);
    
    // Table data preparation
    const headers = [Object.keys(currentReport.data[0])];
    const data = currentReport.data.map((row: any) => Object.values(row));
    
    // Add table
    (doc as any).autoTable({
      startY: 80,
      head: headers,
      body: data,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, finalY);
    
    doc.setFont("helvetica", "normal");
    let yPos = finalY + 10;
    Object.entries(currentReport.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(`${label}: ${value}`, 20, yPos);
      yPos += 7;
    });
    
    doc.save(`${currentReport.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    toast.success("PDF exported successfully!");
  };

  const exportToExcel = () => {
    if (!currentReport) return;

    const workbook = XLSX.utils.book_new();
    
    // Main data sheet
    const wsData = [
      [currentReport.title],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Date Range: ${currentReport.filters.dateRange}`],
      [`Department: ${currentReport.filters.department}`],
      [`User Group: ${currentReport.filters.userGroup}`],
      [''], // Empty row for spacing
      ...currentReport.data.map((row: any) => Object.values(row))
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Summary sheet
    const summaryData = [
      ['Summary'],
      ...Object.entries(currentReport.summary).map(([key, value]) => [
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value
      ])
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, ws, 'Report Data');
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Summary');
    
    // Save file
    XLSX.writeFile(workbook, `${currentReport.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
    toast.success("Excel file exported successfully!");
  };

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case "new-registrations":
        return <Users className="h-5 w-5" />;
      case "consumption":
        return <TrendingUp className="h-5 w-5" />;
      case "complaints":
        return <AlertTriangle className="h-5 w-5" />;
      case "revenue":
        return <DollarSign className="h-5 w-5" />;
      case "anomaly":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      if (value > 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `$${(value / 1000).toFixed(1)}K`;
      return value.toString();
    }
    return String(value);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/officer/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Reports</h1>
          <p className="text-muted-foreground mt-1">
            Select your desired report parameters and generate custom reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>
              Configure options and click 'Generate Report'.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Date Range</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportData.startDate}
                    onChange={(e) =>
                      setReportData({ ...reportData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportData.endDate}
                    onChange={(e) =>
                      setReportData({ ...reportData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select
                value={reportData.reportType}
                onValueChange={(value) =>
                  setReportData({ ...reportData, reportType: value })
                }
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-registrations">New Registrations Summary</SelectItem>
                  <SelectItem value="consumption">Consumption Report</SelectItem>
                  <SelectItem value="complaints">Complaint Summary</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Select
                value={reportData.department}
                onValueChange={(value) =>
                  setReportData({ ...reportData, department: value })
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="customer-service">Customer Service</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Group (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="userGroup">User Group (Optional)</Label>
              <Select
                value={reportData.userGroup}
                onValueChange={(value) =>
                  setReportData({ ...reportData, userGroup: value })
                }
              >
                <SelectTrigger id="userGroup">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="officers">Officers</SelectItem>
                  <SelectItem value="managers">Managers</SelectItem>
                  <SelectItem value="administrators">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateReport}
              className="w-full"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <div className="lg:col-span-2 space-y-6">
          {reportGenerated && currentReport ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getReportIcon(reportData.reportType)}
                      {currentReport.title}
                    </CardTitle>
                    <CardDescription>
                      Report generated for {currentReport.filters.dateRange}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToPDF}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Report Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(currentReport.summary).map(([key, value], index) => (
                      <Card key={key} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-primary">
                            {formatValue(value)}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Data Table */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold">Detailed Data</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            {Object.keys(currentReport.data[0]).map((header) => (
                              <th key={header} className="text-left p-3 font-medium capitalize">
                                {header.replace(/([A-Z])/g, ' $1')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentReport.data.map((row: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-muted/30">
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="p-3">
                                  {formatValue(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Choose your preferred format to download the report.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={exportToPDF}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <FileDown className="h-6 w-6" />
                      <span>Export to PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToExcel}
                      className="h-20 flex flex-col items-center justify-center gap-2"
                    >
                      <FileDown className="h-6 w-6" />
                      <span>Export to Excel</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Configure and generate a report to see the preview here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-12 bg-muted/30 rounded-lg">
                  <div className="text-center space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground font-medium">
                        No report generated yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure your report options and click 'Generate Report'
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;