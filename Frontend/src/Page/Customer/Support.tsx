import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const complaintHistory = [
  { 
    id: "COMP001", 
    subject: "Billing Issue", 
    description: "Received an abnormally high bill for last month despite low usage.", 
    date: "2023-10-20", 
    status: "Pending" 
  },
  { 
    id: "COMP002", 
    subject: "Meter Fault", 
    description: "Meter display is not working, unable to read consumption.", 
    date: "2023-10-20", 
    status: "Resolved" 
  },
  { 
    id: "COMP003", 
    subject: "Other Service Issue", 
    description: "Frequent power outages in my area, affecting daily activities.", 
    date: "2023-09-15", 
    status: "Pending" 
  },
  { 
    id: "COMP004", 
    subject: "Account Management", 
    description: "Unable to update my contact information online.", 
    date: "2023-09-01", 
    status: "Resolved" 
  },
  { 
    id: "COMP005", 
    subject: "Technical Support", 
    description: "The mobile app crashes frequently when trying to view consumption.", 
    date: "2023-08-28", 
    status: "Pending" 
  },
];

const Support = () => {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Submit a Complaint/Feedback</h1>
      </div>

      <Card className="p-6">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select defaultValue="billing">
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="billing">Billing Issue</SelectItem>
                <SelectItem value="meter">Meter Fault</SelectItem>
                <SelectItem value="service">Other Service Issue</SelectItem>
                <SelectItem value="account">Account Management</SelectItem>
                <SelectItem value="technical">Technical Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Please describe your issue in detail..." 
              rows={6}
              className="resize-none"
            />
          </div>
          
          <Button type="submit" className="w-full py-6">
            Submit Complaint
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Complaint History</h2>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintHistory.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.id}</TableCell>
                  <TableCell className="font-medium">{complaint.subject}</TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                  <TableCell>{complaint.date}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={complaint.status === "Resolved" ? "default" : "secondary"}
                      className={complaint.status === "Resolved" ? "bg-primary hover:bg-primary/90" : "bg-muted text-foreground"}
                    >
                      {complaint.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Support;
