import { Badge } from "@/Components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

type BillRow = {
  month: string;
  reading: number;
  consumption: number;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | string;
};

interface BillsTableProps {
  data: BillRow[];
  isLoading: boolean;
  isError: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    Paid: {
      variant: "default" as const,
      className: "bg-success hover:bg-success/90 text-success-foreground",
      icon: CheckCircle2,
    },
    Pending: {
      variant: "secondary" as const,
      className: "bg-warning/10 text-warning border-warning/20",
      icon: Clock,
    },
    Overdue: {
      variant: "destructive" as const,
      className: "bg-destructive hover:bg-destructive/90",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
};

export const BillsTable = ({ data, isLoading, isError }: BillsTableProps) => {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading billing data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-medium">Failed to load billing data</p>
            <p className="text-muted-foreground text-sm mt-1">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Billing Month</TableHead>
            <TableHead className="font-semibold">Meter Reading</TableHead>
            <TableHead className="font-semibold">Consumption (kWh)</TableHead>
            <TableHead className="font-semibold">Amount (ETB)</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="font-medium">No records found</p>
                  <p className="text-sm mt-1">Adjust the date range to view more data</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow 
                key={index} 
                className="transition-colors hover:bg-muted/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium">{row.month}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{row.reading.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="font-semibold text-primary">{row.consumption.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm ml-1">kWh</span>
                </TableCell>
                <TableCell className="font-mono">{row.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BillsTable;
