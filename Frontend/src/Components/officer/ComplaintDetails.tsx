import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, User, Mail, FileText, Hash } from "lucide-react";
import type { Complaint } from "@/Page/Types/type";

interface ComplaintDetailsDialogProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (ticketId: string, status: Complaint["status"]) => void;
}

const ComplaintDetailsDialog = ({
  complaint,
  open,
  onOpenChange,
  onStatusChange,
}: ComplaintDetailsDialogProps) => {
  if (!complaint) return null;

  const getStatusColor = (status: Complaint["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "resolved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "closed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatStatus = (status: Complaint["status"]) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complaint Details</DialogTitle>
          <DialogDescription className="break-all">
            Ticket ID: <span className="font-mono">CUPM.{complaint.id.substring(0, 8).toUpperCase()}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Badge className={getStatusColor(complaint.status)}>
              {formatStatus(complaint.status)}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(complaint.date), "MMM dd, yyyy HH:mm")}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Customer Name</span>
                </div>
                <p className="font-medium break-words">{complaint.customerName || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Account Number</span>
                </div>
                <p className="font-medium font-mono break-words">{complaint.customerAccNumber}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Category</span>
              </div>
              <p className="font-medium capitalize break-words">{complaint.category}</p>
            </div>

            {complaint.resolvedBy && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Resolved By</span>
                </div>
                <p className="font-medium break-words">{complaint.resolvedBy}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Subject</p>
              <p className="text-lg font-semibold break-words">{complaint.subject}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <div className="rounded-lg bg-muted p-4 min-h-[100px] break-words">
                <p className="whitespace-pre-wrap">
                  {complaint.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Update Status</p>
            <Select
              value={complaint.status}
              onValueChange={(value) =>
                onStatusChange(complaint.id, value as Complaint["status"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changes are saved automatically
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetailsDialog;
