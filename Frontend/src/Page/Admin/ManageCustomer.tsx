import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Banknote, Search, Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { officerApi, adminApi } from "@/lib/api";
import type { Customer } from "@/types/customer";
import { CustomerTableRow } from "@/components/Customer/CustomerTableRow";
import { StatCard } from "@/components/Customer/StatCard";
import { useAuth } from "@/components/context/UnifiedContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

export default function ManageCustomers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
      setSearchParams(searchTerm ? { search: searchTerm } : {});
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
  }, [searchTerm, setSearchParams]);

  const shouldSearch = debouncedSearch.trim().length > 0;


  const { data: customers = [], isLoading, isError, error } = useQuery<Customer[]>({
    queryKey: ["customers", debouncedSearch],
    queryFn: () => shouldSearch ? officerApi.searchCustomers(debouncedSearch) : officerApi.getCustomers(),
    staleTime: 5000,
    keepPreviousData: true,
  });


  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.isActive).length;
    const totalDeposit = customers.reduce((sum, c) => sum + Number(c.depositBirr || 0), 0);
    return { total, active, inactive: total - active, totalDeposit };
  }, [customers]);


  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return customers.slice(start, start + ITEMS_PER_PAGE);
  }, [customers, currentPage]);
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);

  const handleToggleStatus = useCallback(async (customer: Customer) => {
    if (!user) return;
    const newStatus = !customer.isActive;

    queryClient.setQueryData<Customer[]>(["customers", debouncedSearch], (old) =>
      old?.map(c => c._id === customer._id ? { ...c, isActive: newStatus } : c)
    );

    try {
      await adminApi.activateDeactivateCustomer(customer._id, newStatus, user.id);
      toast.success(`Customer ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err: any) {
      queryClient.invalidateQueries(["customers", debouncedSearch]);
      toast.error(err?.message || "Failed to update customer status");
    }
  }, [queryClient, debouncedSearch, user]);

  const handleResetPassword = useCallback(async (customer: Customer) => {
    try {
      const response = await adminApi.customerResetPassword(customer._id);
      const newPassword = response?.password || "12345678";

      setSelectedCustomer(customer);
      setResetPasswordResult(newPassword);
      setIsResetPasswordDialogOpen(true);

      toast(`Password Reset Successfully`);
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(err?.message || "Something went wrong while resetting password");
    }
  }, []);

  const handleViewDetails = useCallback((customer: Customer) => {
    navigate(`/admin/customers/${customer._id}`);
  }, [navigate]);

  const handlePageChange = useCallback((direction: "prev" | "next") => {
    setCurrentPage(prev => direction === "prev" ? prev - 1 : prev + 1);
  }, []);

  return (
   <div className="min-h-screen bg-background p-2 md:p-8">
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Customer Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all registered customers and accounts
        </p>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Customers" value={stats.total} icon={Users} />
      <StatCard title="Active Customers" value={stats.active} icon={UserCheck} variant="success" />
      <StatCard title="Inactive Customers" value={stats.inactive} icon={UserX} variant="destructive" />
      <StatCard title="Total Deposit" value={`${stats.totalDeposit.toLocaleString()} ብር`} icon={Banknote} variant="warning" />
    </div>

    {/* Search + Filter */}
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or account number..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" /> Filter
      </Button>
    </div>

    {/* Table */}
    {!isLoading && !isError && (
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[600px] sm:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="hidden md:table-cell">Service Center</TableHead>
              <TableHead className="hidden lg:table-cell">Zone</TableHead>
              <TableHead className="text-center">Power</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Deposit</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map(customer => (
              <CustomerTableRow
                key={customer._id}
                customer={customer}
                onViewDetails={handleViewDetails}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    )}

    {/* Pagination */}
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, customers.length)} of {customers.length} customers
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange("prev")}>Previous</Button>
        <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages || 1}</span>
        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange("next")}>Next</Button>
      </div>
    </div>
  </div>
</div>
  );
}
