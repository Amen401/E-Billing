import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const previousBills = [
  { id: "B-001", month: "June 2024", consumption: 120, amount: 320.50, dueDate: "2024-06-15", status: "Paid" },
  { id: "B-002", month: "May 2024", consumption: 110, amount: 295.00, dueDate: "2024-05-15", status: "Paid" },
  { id: "B-003", month: "April 2024", consumption: 130, amount: 350.25, dueDate: "2024-04-15", status: "Paid" },
  { id: "B-004", month: "March 2024", consumption: 105, amount: 280.00, dueDate: "2024-03-15", status: "Paid" },
  { id: "B-005", month: "February 2024", consumption: 95, amount: 260.00, dueDate: "2024-02-15", status: "Paid" },
];

const Bills = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Bill History</h1>
      </div>

      <Card className="p-6">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Billing Month</TableHead>
                <TableHead>Consumption (kWh)</TableHead>
                <TableHead>Amount (ETB)</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previousBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>{bill.month}</TableCell>
                  <TableCell>{bill.consumption}</TableCell>
                  <TableCell>ETB {bill.amount.toFixed(2)}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <Badge className="bg-success hover:bg-success/90">
                      {bill.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Bills;
