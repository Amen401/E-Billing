import ComplaintDetailsDialog from "@/Components/officer/ComplaintDetails";
import ComplaintMetrics from "@/Components/officer/ComplaintMetrics";
import ComplaintsTable from "@/Components/officer/ComplaintsTable";
import ComplaintFilters from "@/Components/officer/ComplanintsFilter";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { officerApi } from "@/lib/api";
import type { ComplaintsApiResponse } from "../Types/type";
import { useSearchParams } from "react-router-dom";

interface Complaint {
  id: string;
  customerName: string;
  customerAccNumber: string;
  subject: string;
  description: string;
  category: string;
  status: "pending" | "open" | "in-progress" | "resolved" | "closed";
  date: string;
}

const DEBOUNCE_DELAY = 400;

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [categoryFilter, setCategoryFilter] = useState("all-cases");

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [metrics, setMetrics] = useState({
    allComplients: 0,
    urgentComplients: 0,
    pendingComplients: 0,
    resolvedComplients: 0,
  });

  const fetchComplaints = async () => {
    setLoading(true);

    try {
      const res: ComplaintsApiResponse = await officerApi.customercomplaintInfos();

      setMetrics({
        allComplients: res.allComplients ?? 0,
        urgentComplients: res.urgentComplients ?? 0,
        pendingComplients: res.pendingComplients ?? 0,
        resolvedComplients: res.resolvedComplients ?? 0,
      });

      const list = res?.someComplients ?? [];

      const data: Complaint[] = list.map((item: any) => ({
        id: item.id,
        customerAccNumber: item.customerAccNumber,
        customerName: item.customerName || "N/A",
        subject: item.subject,
        description: item.description,
        category: item.subject?.toLowerCase() || "general",
        date: item.date,
        status: normalizeStatus(item.status),
        resolvedBy: item.resolvedBy,
      }));

      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      toast.error("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status: string): Complaint["status"] => {
    if (!status) return "pending";

    const normalized = status.toLowerCase().replace(/[\s_]/g, "-");
    const validStatuses: Complaint["status"][] = [
      "pending",
      "open",
      "in-progress",
      "resolved",
      "closed",
    ];

    return validStatuses.includes(normalized as Complaint["status"])
      ? (normalized as Complaint["status"])
      : "pending";
  };

  const updateComplaintStatus = async (
    complaintId: string,
    newStatus: Complaint["status"]
  ) => {
    const previousComplaints = [...complaints];
    const previousSelectedComplaint = selectedComplaint;

    try {
      const updatedComplaints = complaints.map((c) =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      );

      setComplaints(updatedComplaints);
      setMetrics((prev) => ({
        ...prev,
        pendingComplients:
          newStatus === "resolved"
            ? prev.pendingComplients - 1
            : prev.pendingComplients + 1,
        resolvedComplients:
          newStatus === "resolved"
            ? prev.resolvedComplients + 1
            : prev.resolvedComplients - 1,
      }));

      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }

      applyFilters(searchQuery, statusFilter, categoryFilter, updatedComplaints);

      await officerApi.updatecomplaintstatus(complaintId, newStatus);

      toast.success("Complaint status updated successfully!");
    } catch (error: any) {
      console.error("Failed to update complaint status:", error);
      setComplaints(previousComplaints);
      setSelectedComplaint(previousSelectedComplaint);
      applyFilters(searchQuery, statusFilter, categoryFilter, previousComplaints);

      toast.error(error?.message || "Failed to update complaint status.");
    }
  };

 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      const newSearchParams = searchTerm ? { search: searchTerm } : {};
      setSearchParams(newSearchParams);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const applyFilters = useCallback(
    (
      search: string,
      status: string,
      category: string,
      complaintList: Complaint[] = complaints
    ) => {
      let filtered = [...complaintList];

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();

        filtered = filtered.filter((c) => {
          return (
            c.id?.toLowerCase().includes(searchLower) ||
            c.customerAccNumber?.toLowerCase().includes(searchLower) ||
            c.subject?.toLowerCase().includes(searchLower) ||
            c.customerName?.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
          );
        });
      }

      if (status !== "all-statuses") {
        filtered = filtered.filter((complaint) => complaint.status === status);
      }

      if (category !== "all-cases") {
        filtered = filtered.filter((complaint) => complaint.category === category);
      }

      setFilteredComplaints(filtered);
    },
    [complaints]
  );

  useEffect(() => {
    applyFilters(debouncedSearch, statusFilter, categoryFilter);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = useCallback(
    (status: string) => {
      setStatusFilter(status);
      applyFilters(debouncedSearch, status, categoryFilter);
    },
    [debouncedSearch, categoryFilter, applyFilters]
  );

  const handleCategoryFilter = useCallback(
    (category: string) => {
      setCategoryFilter(category);
      applyFilters(debouncedSearch, statusFilter, category);
    },
    [debouncedSearch, statusFilter, applyFilters]
  );

  const handleViewDetails = useCallback((complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  }, []);

  useEffect(() => {
    fetchComplaints();

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaint Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage customer complaints efficiently
          </p>
        </div>

        <ComplaintMetrics metrics={metrics} />

        <ComplaintFilters
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onCategoryFilter={handleCategoryFilter}
        />

        {loading ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : (
          <ComplaintsTable
            complaints={filteredComplaints}
            onViewDetails={handleViewDetails}
          />
        )}

        <ComplaintDetailsDialog
          complaint={selectedComplaint}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onStatusChange={(ticketId, status) =>
            updateComplaintStatus(ticketId, status)
          }
        />
      </div>
    </div>
  );
};

export default Complaints;
