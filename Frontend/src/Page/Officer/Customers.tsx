import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Eye, Users, AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import type { Customer } from "../Types/type";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
      if (searchTerm) {
        setSearchParams({ search: searchTerm });
      } else {
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers", debouncedSearch],
    queryFn: () => officerApi.searchCustomers(debouncedSearch),
  });

  const customers = data?.data || [];
  const totalCustomers = data?.total || 0;

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Register Customer", href: "/officer/register-customer" },
          { label: "Customers" },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Registered Customers
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all registered customers
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load customers. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Customer List</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-[300px]"
              />
            </div>
          </div>
          <CardDescription>
            Total Customers: {totalCustomers}
            {debouncedSearch && ` (filtered)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Service Center
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Zone</TableHead>
                  <TableHead className="text-right">Power (KW)</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Deposit (Birr)
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-muted-foreground">
                          Loading customers...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {debouncedSearch
                          ? "No customers found matching your search"
                          : "No customers registered yet"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.region}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {customer.service_center}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {customer.zone}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.power_approved}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {customer.deposit_birr.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && !isLoading && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-muted"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-muted"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
