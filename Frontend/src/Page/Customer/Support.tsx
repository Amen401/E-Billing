import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { customerApi } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import type { ComplaintStatus, ComplaintType } from "../Types/type";


const Support = () => {
  const [complaintHistory, setComplaintHistory] = useState<ComplaintType[]>([]);
  const [subject, setSubject] = useState("billing");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const capitalizeStatus = (status: string): ComplaintStatus => {
    const s = status?.toLowerCase() || "";
    if (s === "resolved") return "Resolved";
    if (s === "pending") return "Pending";
    return "In Progress";
  };

  const normalizeComplaint = (c: any): ComplaintType | null => {
    try {
      if (!c) return null;
      
      const id = c.id || c._id;
      if (!id) {
        console.warn("Complaint missing ID:", c);
        return null;
      }

      return {
        id,
        subject: c.subject || "No subject",
        description: c.description || "No description",
        date: c.date ? new Date(c.date).toLocaleString() : "Unknown date",
        status: capitalizeStatus(c.status),
        customerName: c.customerName,
        customerAccNumber: c.customerAccNumber,
        resolvedBy: c.resolvedBy,
      };
    } catch (error) {
      console.error("Error normalizing complaint:", error, c);
      return null;
    }
  };

  const fetchComplaints = async () => {
    setFetchLoading(true);
    try {
      const res = await customerApi.getComplaints();
      

      const complaintsData = res.data?.myComplains || res.myComplains || res.data || [];
      
      if (!Array.isArray(complaintsData)) {
        console.error("Invalid complaints data format:", complaintsData);
        toast.error("Received invalid data format from server");
        return;
      }

      const normalized = complaintsData
        .map(normalizeComplaint)
        .filter((c): c is ComplaintType => c !== null);

      setComplaintHistory(normalized);
      
      if (normalized.length === 0 && complaintsData.length > 0) {
        toast.warning("Some complaints could not be loaded properly");
      }
    } catch (error: any) {
      console.error("Failed to fetch complaints:", error);
      toast.error(error.message || "Failed to load complaint history");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please enter a description for your complaint");
      return;
    }

    setLoading(true);
    try {
      const payload = { subject, description };
      const res = await customerApi.submitComplaint(payload);

      const newComplaint = normalizeComplaint(res.data || res);
      
      if (newComplaint) {
        setComplaintHistory((prev) => [newComplaint, ...prev]);
        setDescription("");
        toast.success("Complaint submitted successfully!");
      } else {
        toast.warning("Complaint submitted but could not be displayed");
      }
    } catch (error: any) {
      console.error("Failed to submit complaint:", error);
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "In Progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: ComplaintStatus) => {
    switch (status) {
      case "Resolved":
        return "default";
      case "In Progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Support Center
            </h1>
            <p className="text-muted-foreground">
              Submit complaints and track their status
            </p>
          </div>
        </div>

        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Submit New Complaint
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing Issue</SelectItem>
                  <SelectItem value="meter">Meter Fault</SelectItem>
                  <SelectItem value="service">Service Issue</SelectItem>
                  <SelectItem value="account">Account Management</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Complaint History
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchComplaints}
              disabled={fetchLoading}
            >
              {fetchLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {fetchLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading complaint history...
            </div>
          ) : complaintHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No complaints found
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto  max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaintHistory.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono text-xs">
                        Comp-{complaint.id.slice(-4)}
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {complaint.subject}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={complaint.description}>
                          {complaint.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {complaint.date}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(complaint.status)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(complaint.status)}
                          {complaint.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Support;
