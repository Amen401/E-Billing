import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface ComplaintsTableProps {
  complaints: Complaint[];
  onViewDetails: (complaint: Complaint) => void;
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

const ComplaintsTable = ({ complaints, onViewDetails }: ComplaintsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Complaints</CardTitle>
        <p className="text-sm text-muted-foreground">
          Overview of the latest complaint records and their detected status
        </p>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No complaints found matching your filters
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer Account No.</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.ticketId}>
                  <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                  <TableCell>{complaint.customerAccountNo}</TableCell>
                  <TableCell>{complaint.subject}</TableCell>
                  <TableCell>{complaint.date}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(complaint)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplaintsTable;
