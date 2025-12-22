import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { format } from "date-fns";

interface ReportData {
  reportType: string;
  generatedBy?: string;
  generatedAt: string;
  filters?: {
    startDate: string;
    endDate: string;
    department?: string;
    userGroup?: string;
  };
  data: any;
}

interface ReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: ReportData | null;
}

const formatReportType = (type: string) => {
  const types: Record<string, string> = {
    "officer-report": "Officer Activity Report",
    "meter-readings": "Meter Readings Report",
    revenue: "Revenue Analysis Report",
    "customer-complaints": "Customer Complaints Report",
  };
  return types[type] || type;
};

const formatDateSafe = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recent";
    return format(date, "PPP 'at' p");
  } catch {
    return "Recent";
  }
};

export const ReportPreview = ({
  open,
  onOpenChange,
  reportData,
}: ReportPreviewProps) => {
  if (!reportData) return null;

  const renderDataContent = () => {
    const { data, reportType } = reportData;

    const renderTable = (columns: string[], rows: any[], renderRow: (row: any, idx: number) => JSX.Element) => (
      <div className="overflow-x-auto">
        <Table className="min-w-[400px] md:min-w-full">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{rows.map(renderRow)}</TableBody>
        </Table>
      </div>
    );

    switch (reportType) {
      case "meter-readings":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Readings" value={data.totalReadings} />
              <StatCard label="Paid" value={data.paid} variant="success" />
              <StatCard label="Pending" value={data.pending} variant="warning" />
              <StatCard label="Failed" value={data.failed} variant="destructive" />
            </div>
            {data.readings?.length > 0 &&
              renderTable(
                ["ID", "Status", "Fee", "Date"],
                data.readings.slice(0, 10),
                (reading: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{reading._id?.slice(-8) || idx + 1}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reading.paymentStatus === "Paid"
                            ? "default"
                            : reading.paymentStatus === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {reading.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${reading.fee?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateSafe(reading.createdAt)}</TableCell>
                  </TableRow>
                )
              )}
          </div>
        );

      case "revenue":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Total Payments" value={data.totalPayments} />
              <StatCard label="Total Revenue" value={`$${data.totalRevenue?.toFixed(2) || "0.00"}`} variant="success" />
            </div>
          </div>
        );

      case "customer-complaints":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard label="Total" value={data.totalComplaints} />
              <StatCard label="Resolved" value={data.summary.resolved} variant="success" />
              <StatCard label="Pending" value={data.summary.pending} variant="warning" />
              <StatCard label="In Progress" value={data.summary.inProgress} variant="default" />
            </div>
            {data.complaints?.length > 0 &&
              renderTable(
                [ "Account Number", "Subject", "Status", "Date"],
                data.complaints.slice(0, 10),
                (complaint: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{complaint.accountNumber || "N/A"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{complaint.subject}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          complaint.status === "Resolved"
                            ? "success"
                            : complaint.status === "Pending"
                            ? "warning"
                            : "default"
                        }
                      >
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateSafe(complaint.createdAt)}</TableCell>
                  </TableRow>
                )
              )}
          </div>
        );

      default:
        return (
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full md:max-w-4xl max-h-[85vh] p-2">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">{formatReportType(reportData.reportType)}</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Generated on {formatDateSafe(reportData.generatedAt)}
            {reportData.filters && (
              <span className="ml-2">
                • {reportData.filters.startDate} to {reportData.filters.endDate}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-2">{renderDataContent()}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "destructive";
}) => {
  const variantClasses = {
    default: "bg-muted",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className={`p-4 rounded-lg ${variantClasses[variant]} flex flex-col`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
};
