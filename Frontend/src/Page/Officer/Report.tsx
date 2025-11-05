import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Calendar as CalendarIcon, FileDown, FileSpreadsheet } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Reports = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState("");
  const [department, setDepartment] = useState("");
  const [userGroup, setUserGroup] = useState("");

  const handleGenerateReport = () => {
    console.log("Generating report...", { startDate, endDate, reportType, department, userGroup });
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
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Report Generation</CardTitle>
          </div>
          <CardDescription>Configure options and click "Generate Report"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-registrations">New Registrations Summary</SelectItem>
                <SelectItem value="meter-readings">Meter Readings Report</SelectItem>
                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                <SelectItem value="customer-complaints">Customer Complaints</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department (Optional)</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
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
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="officers">Officers</SelectItem>
                <SelectItem value="managers">Managers</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateReport} className="w-full" size="lg">
            Generate Report
          </Button>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Choose your preferred format to download the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center gap-2">
                <FileDown className="h-6 w-6" />
                <span>Export to PDF</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-6 w-6" />
                <span>Export to Excel</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;