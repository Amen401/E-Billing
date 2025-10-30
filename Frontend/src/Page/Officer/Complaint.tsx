import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "@/Components/Context/ActivityContext";
import {
  generateActivityMessage,
  getDefaultStatus,
} from "@/Components/utils/activityHelpers";

// ✅ Main Component
const Complaints = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const { addActivity } = useActivity();

  // Sample Complaints
  const complaints = [
    {
      id: "CMP001",
      customerName: "Abebe Kebede",
      accountNumber: "CUST-1001",
      subject: "Faulty Product Delivery - Item #11234",
      date: "2023-10-26",
      status: "Urgent",
      resolution: "Awaiting product replacement",
      details: "Customer received a damaged product and requested a replacement.",
    },
    {
      id: "CMP002",
      customerName: "Mekdes Alemu",
      accountNumber: "CUST-1002",
      subject: "Billing Error - Incorrect Charge for Service Y",
      date: "2023-10-25",
      status: "Pending",
      resolution: "Under review by billing department",
      details: "Customer charged extra for service Y; investigation ongoing.",
    },
    {
      id: "CMP003",
      customerName: "Kebede Tadesse",
      accountNumber: "CUST-1003",
      subject: "Late Delivery of Order #12340",
      date: "2023-10-24",
      status: "Resolved",
      resolution: "Delivered and confirmed by customer.",
      details: "Customer received delayed order, complaint resolved satisfactorily.",
    },
  ];

  // ✅ Search filter
  const filteredComplaints = complaints.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Urgent":
        return <Badge className="bg-destructive text-white">Urgent</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case "Resolved":
        return <Badge className="bg-green-600 text-white">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // ✅ Complaint Stats
  const stats = [
    { label: "Total Complaints", value: complaints.length, color: "text-primary" },
    { label: "Urgent", value: complaints.filter((c) => c.status === "Urgent").length, color: "text-destructive" },
    { label: "Pending", value: complaints.filter((c) => c.status === "Pending").length, color: "text-yellow-500" },
    { label: "Resolved", value: complaints.filter((c) => c.status === "Resolved").length, color: "text-green-600" },
  ];

  // ✅ Handle Complaint Resolution
  const handleResolveComplaint = (complaint: any) => {
    addActivity({
      type: "COMPLAINT_RESOLVED",
      date: new Date().toISOString().split("T")[0],
      activity: generateActivityMessage("COMPLAINT_RESOLVED", complaint.customerName, {
        complaintId: complaint.id,
      }),
      customer: complaint.customerName,
      status: getDefaultStatus("COMPLAINT_RESOLVED"),
      metadata: {
        complaintId: complaint.id,
        resolution: complaint.resolution,
      },
    });
    alert(`Complaint ${complaint.id} marked as resolved.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/officer/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complaint Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage customer complaints efficiently.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <MessageSquare className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>View and manage all customer complaints.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {["Ticket ID", "Customer", "Subject", "Date", "Status", "Actions"].map((col) => (
                    <th
                      key={col}
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{complaint.id}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{complaint.customerName}</td>
                    <td className="py-3 px-4 text-sm text-foreground max-w-xs truncate">{complaint.subject}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{complaint.date}</td>
                    <td className="py-3 px-4">{getStatusBadge(complaint.status)}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                        View
                      </Button>
                      {complaint.status !== "Resolved" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleResolveComplaint(complaint)}
                        >
                          Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-xl shadow-xl w-full max-w-lg animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2">{selectedComplaint.subject}</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Customer:</strong> {selectedComplaint.customerName}
            </p>
            <p className="text-sm mb-2">{selectedComplaint.details}</p>
            <p className="text-sm mb-4 text-muted-foreground">
              <strong>Date:</strong> {selectedComplaint.date}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedComplaint(null)}>
                Close
              </Button>
              {selectedComplaint.status !== "Resolved" && (
                <Button
                  onClick={() => {
                    handleResolveComplaint(selectedComplaint);
                    setSelectedComplaint(null);
                  }}
                >
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
