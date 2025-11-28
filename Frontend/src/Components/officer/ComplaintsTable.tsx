import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  customerName: string;
  subject: string;
  description: string;
  status: 'Pending' | 'Open' | 'In-Progress' | 'Resolved' | 'Closed';
  date: string;
}

interface ComplaintsTableProps {
  complaints: Complaint[];
  onViewDetails: (complaint: Complaint) => void;
}

const ComplaintsTable = ({ complaints, onViewDetails }: ComplaintsTableProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "destructive";       
      case "open":
        return "warning";           
      case "In-Progress":
        return "secondary";         
      case "Resolved":
        return "success";          
      case "Closed":
        return "default";           
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "text-destructive";
      case "Pending":
        return "text-warning";
      case "In-Progress":
        return "text-blue-500";
      case "Resolved":
        return "text-success";
      case "Closed":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No complaints found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell className="font-mono text-sm">
                CUPM.{complaint.id.substring(0, 6).toUpperCase()}
              </TableCell>

              <TableCell>{complaint.customerName}</TableCell>

              <TableCell className="font-medium">{complaint.subject}</TableCell>

              <TableCell className="font-medium">{complaint.description}</TableCell>

              <TableCell className="text-muted-foreground">
                {format(new Date(complaint.date), "MMM dd, yyyy HH:mm")}
              </TableCell>

              <TableCell>
                <Badge
                  variant={getStatusVariant(complaint.status)}
                  className={getStatusColor(complaint.status)}
                >
                  {complaint.status}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(complaint)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComplaintsTable;
