import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Breadcrumb } from "@/components/BreadCrumb";
import { Search, Eye, Users, AlertCircle, Plus } from "lucide-react";
import { officerApi } from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  region: string;
  serviceCenter: string;
  zone: string;
  powerApproved: number;
  depositBirr: number;
  accountNumber: string;
  isActive: boolean;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

const BREADCRUMB_ITEMS = [
  { label: "Dashboard", href: "/officer/dashboard" },

  { label: "Customers" },
  { label: "Register Customer", href: "/officer/register-customer" },
];
const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const navigate = useNavigate();
  const shouldSearch = debouncedSearch.trim().length > 0;

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customers", debouncedSearch],
    queryFn: () =>
      shouldSearch
        ? officerApi.searchCustomers(debouncedSearch)
        : officerApi.getCustomers(),
    keepPreviousData: true,
  });

  const customers: Customer[] = apiResponse || [];
  const totalCustomers = customers.length;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);

      const newSearchParams = searchTerm ? { search: searchTerm } : {};
      setSearchParams(newSearchParams);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  const LoadingState = () => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">
            {shouldSearch ? "Searching customers..." : "Loading customers..."}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );

  const EmptyState = () => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8">
        <div className="text-muted-foreground">
          {shouldSearch
            ? "No customers found matching your search"
            : "No customers registered yet"}
        </div>
      </TableCell>
    </TableRow>
  );

  const CustomerRow = ({ customer }: { customer: Customer }) => (
    <TableRow key={customer._id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.region}</TableCell>
      <TableCell className="hidden md:table-cell">
        {customer.serviceCenter}
      </TableCell>
      <TableCell className="hidden lg:table-cell">{customer.zone}</TableCell>
      <TableCell className="text-right">{customer.powerApproved}</TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        {customer.depositBirr?.toLocaleString()}
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-primary/10"
          onClick={() => navigate(`/officer/customers/${customer._id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  const PaginationItems = () => {
    const visiblePages = Math.min(5, totalPages);
    const pages = Array.from({ length: visiblePages }, (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    });

    return pages.map((pageNum) => (
      <PaginationItem key={pageNum}>
        <PaginationLink
          onClick={() => handlePageClick(pageNum)}
          isActive={currentPage === pageNum}
          className="cursor-pointer"
        >
          {pageNum}
        </PaginationLink>
      </PaginationItem>
    ));
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <Breadcrumb items={BREADCRUMB_ITEMS} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Registered Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all registered customers
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link to="/officer/register-customer" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Register New Customer
            </Link>
          </Button>
        </div>
      </div>

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
                onChange={handleSearchChange}
                className="pl-9 w-full sm:w-[300px]"
              />
            </div>
          </div>
          <CardDescription>
            {shouldSearch ? (
              <>Showing search results for "{debouncedSearch}"</>
            ) : (
              <>Total Customers: {totalCustomers}</>
            )}
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
                  <LoadingState />
                ) : paginatedCustomers.length === 0 ? (
                  <EmptyState />
                ) : (
                  paginatedCustomers.map((customer: Customer) => (
                    <CustomerRow key={customer._id} customer={customer} />
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
                      onClick={handlePreviousPage}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer hover:bg-muted"
                      }
                    />
                  </PaginationItem>

                  <PaginationItems />

                  <PaginationItem>
                    <PaginationNext
                      onClick={handleNextPage}
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
