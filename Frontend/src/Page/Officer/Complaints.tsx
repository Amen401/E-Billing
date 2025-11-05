import ComplaintDetailsDialog from "@/Components/officer/ComplaintDetails";
import ComplaintMetrics from "@/Components/officer/ComplaintMetrics";
import ComplaintsTable from "@/Components/officer/ComplaintsTable";
import ComplaintFilters from "@/Components/officer/ComplanintsFilter";
import { useState } from "react";

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

const initialComplaints: Complaint[] = [
  {
    ticketId: "CMP001",
    customerAccountNo: "CUST-1001",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    subject: "Faulty Product Delivery - Item 4",
    description: "Received a damaged product. The packaging was torn and the item inside was broken.",
    category: "delivery",
    date: "2023-10-28",
    status: "urgent",
  },
  {
    ticketId: "CMP002",
    customerAccountNo: "CUST-1002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    subject: "Billing Error - Incorrect Charge for Service 7",
    description: "I was charged twice for the same service. Need a refund for the duplicate charge.",
    category: "billing",
    date: "2023-10-25",
    status: "pending",
  },
  {
    ticketId: "CMP003",
    customerAccountNo: "CUST-1003",
    customerName: "Michael Brown",
    customerEmail: "m.brown@example.com",
    subject: "Late Delivery of Order #12345",
    description: "Order was supposed to arrive 5 days ago but still hasn't been delivered.",
    category: "delivery",
    date: "2023-10-24",
    status: "resolved",
  },
  {
    ticketId: "CMP004",
    customerAccountNo: "CUST-1004",
    customerName: "Emily Davis",
    customerEmail: "emily.d@example.com",
    subject: "Unresponsive Customer Support - General Inquiry",
    description: "Called customer support multiple times but no one is answering.",
    category: "support",
    date: "2023-10-23",
    status: "urgent",
  },
  {
    ticketId: "CMP005",
    customerAccountNo: "CUST-1005",
    customerName: "David Wilson",
    customerEmail: "d.wilson@example.com",
    subject: "Difficulty with Software Installation - App v2.0",
    description: "Unable to install the latest version of the software. Getting error code 404.",
    category: "support",
    date: "2023-10-22",
    status: "pending",
  },
  {
    ticketId: "CMP006",
    customerAccountNo: "CUST-1006",
    customerName: "Jessica Martinez",
    customerEmail: "jessica.m@example.com",
    subject: "Incorrect Product Description on Website",
    description: "Product description didn't match what I received. Need clarification.",
    category: "product",
    date: "2023-10-21",
    status: "resolved",
  },
];

const Compliants = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>(initialComplaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [categoryFilter, setCategoryFilter] = useState("all-cases");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, categoryFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, categoryFilter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    applyFilters(searchQuery, statusFilter, category);
  };

  const applyFilters = (search: string, status: string, category: string) => {
    let filtered = [...complaints];

    if (search) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.ticketId.toLowerCase().includes(search.toLowerCase()) ||
          complaint.customerAccountNo.toLowerCase().includes(search.toLowerCase()) ||
          complaint.subject.toLowerCase().includes(search.toLowerCase()) ||
          complaint.customerName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all-statuses") {
      filtered = filtered.filter((complaint) => complaint.status === status);
    }

    if (category !== "all-cases") {
      filtered = filtered.filter((complaint) => complaint.category === category);
    }

    setFilteredComplaints(filtered);
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };

  const handleStatusChange = (ticketId: string, newStatus: "urgent" | "pending" | "resolved") => {
    const updatedComplaints = complaints.map((complaint) =>
      complaint.ticketId === ticketId ? { ...complaint, status: newStatus } : complaint
    );
    setComplaints(updatedComplaints);
    
    if (selectedComplaint?.ticketId === ticketId) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
    
    applyFilters(searchQuery, statusFilter, categoryFilter);
  };

  const metrics = {
    total: complaints.length,
    urgent: complaints.filter((c) => c.status === "urgent").length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaint Management</h1>
          </div>
        </div>

        <ComplaintMetrics metrics={metrics} />
        <ComplaintFilters
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onCategoryFilter={handleCategoryFilter}
        />
        <ComplaintsTable
          complaints={filteredComplaints}
          onViewDetails={handleViewDetails}
        />

        <ComplaintDetailsDialog
          complaint={selectedComplaint}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default Compliants;
