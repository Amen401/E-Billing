import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Complaint {
  ticketId: string;
  customerAccountNo: string;
  customerName?: string;
  customerEmail?: string;
  subject: string;
  description?: string;
  category?: string;
  date: string;
  status: "urgent" | "pending" | "resolved";
}

interface ComplaintDetailsDialogProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (ticketId: string, newStatus: "urgent" | "pending" | "resolved") => void;
}

const getStatusBadge = (status: string) => {
  const variants = {
    urgent: "destructive",
    pending: "secondary",
    resolved: "default",
  } as const;

  const labels = {
    urgent: "Urgent",
    pending: "Pending",
    resolved: "Resolved",
  };

  return (
    <Badge variant={variants[status as keyof typeof variants]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};

const ComplaintDetailsDialog = ({
  complaint,
  open,
  onOpenChange,
  onStatusChange,
}: ComplaintDetailsDialogProps) => {
  if (!complaint) return null;

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(complaint.ticketId, newStatus as "urgent" | "pending" | "resolved");
    toast({
      title: "Status Updated",
      description: `Complaint status changed to ${newStatus}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Complaint Details
            {getStatusBadge(complaint.status)}
          </DialogTitle>
          <DialogDescription>
            Ticket ID: {complaint.ticketId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Account Number</Label>
                <p className="font-medium">{complaint.customerAccountNo}</p>
              </div>
              {complaint.customerName && (
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{complaint.customerName}</p>
                </div>
              )}
              {complaint.customerEmail && (
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{complaint.customerEmail}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Complaint Details</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{complaint.subject}</p>
              </div>
              {complaint.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm leading-relaxed mt-1">{complaint.description}</p>
                </div>
              )}
              {complaint.category && (
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium capitalize">{complaint.category}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Date Registered</Label>
                <p className="font-medium">{new Date(complaint.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Update Status</h3>
            <Select value={complaint.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetailsDialog;
