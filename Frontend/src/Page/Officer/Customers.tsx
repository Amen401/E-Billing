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
import { Breadcrumb } from "@/components/BreadCrumb";
import { Search, Eye, Users, Plus } from "lucide-react";
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
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

const BREADCRUMB_ITEMS = [
  { label: "Dashboard", href: "/officer/dashboard" },
  { label: "Customers" },
];

const Customers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const shouldSearch = debouncedSearch.trim().length > 0;

  const { data = [], isLoading } = useQuery({
    queryKey: ["customers", debouncedSearch],
    queryFn: () =>
      shouldSearch
        ? officerApi.searchCustomers(debouncedSearch)
        : officerApi.getCustomers(),
    keepPreviousData: true,
  });

  const customers: Customer[] = data;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
      setSearchParams(searchTerm ? { search: searchTerm } : {});
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-6">
      <Breadcrumb items={BREADCRUMB_ITEMS} />

      {/* Header */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Registered Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage registered customers
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link to="/officer/register-customer">
            <Plus className="mr-2 h-4 w-4" />
            Register Customer
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Customer List</CardTitle>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 📱 MOBILE VIEW – CARDS */}
          <div className="space-y-3 md:hidden">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground">
                Loading customers…
              </p>
            ) : paginatedCustomers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No customers found
              </p>
            ) : (
              paginatedCustomers.map((customer) => (
                <Card key={customer._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.region}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/officer/customers/${customer._id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Power:</span>{" "}
                      {customer.powerApproved} KW
                    </p>
                    <p>
                      <span className="font-medium">Deposit:</span>{" "}
                      {customer.depositBirr?.toLocaleString()} Birr
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* 🖥 DESKTOP VIEW – TABLE */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Service Center</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead className="text-right">Power</TableHead>
                  <TableHead className="text-right">Deposit</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.region}</TableCell>
                    <TableCell>{customer.serviceCenter}</TableCell>
                    <TableCell>{customer.zone}</TableCell>
                    <TableCell className="text-right">
                      {customer.powerApproved}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.depositBirr?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/officer/customers/${customer._id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
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
