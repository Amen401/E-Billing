import React from "react";
import { CreditCard, User, MapPin, Phone, Hash } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import type { Customer } from "@/Page/Types/type";

interface CustomerTableProps {
  customers: Customer[];
  onProcessPayment: (customer: Customer) => void;
  isLoading?: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onProcessPayment,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No customers found</p>
        <p className="text-sm">Try searching with a different term</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </div>
            </TableHead>

            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Account No.
              </div>
            </TableHead>

            <TableHead className="font-semibold">Meter SN</TableHead>

            <TableHead className="text-right font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => {

            return (
              <TableRow
                key={customer._id}
                className="hover:bg-muted/30 transition-colors"
>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {customer.accountNumber}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {customer.meterReaderSN}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => onProcessPayment(customer)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;
