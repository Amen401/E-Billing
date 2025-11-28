import { memo } from "react";
import { Eye, KeyRound, Power, MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/types/customer";

interface CustomerTableRowProps {
  customer: Customer;
  onViewDetails: (customer: Customer) => void;
  onResetPassword: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

export const CustomerTableRow = memo(function CustomerTableRow({
  customer,
  onViewDetails,
  onResetPassword,
  onToggleStatus,
}: CustomerTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.region}</TableCell>
      <TableCell className="hidden md:table-cell">{customer.serviceCenter}</TableCell>
      <TableCell className="hidden lg:table-cell">{customer.zone}</TableCell>
      <TableCell className="text-center">{customer.powerApproved} KW</TableCell>
      <TableCell className="text-center hidden sm:table-cell">
        <span className={customer.depositBirr > 0 ? "text-warning font-semibold" : ""}>
          {customer.depositBirr} ብር
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={customer.isActive ? "default" : "destructive"}>
          {customer.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(customer)}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onResetPassword(customer)}>
              <KeyRound className="h-4 w-4 mr-2" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(customer)}>
              <Power className="h-4 w-4 mr-2" />
              {customer.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
