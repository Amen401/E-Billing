import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Pay Your Bills</h1>
      </div>

      <Card className="p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Current Outstanding Bill</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Consumption Charges:</span>
            <span className="font-medium text-foreground">ETB 350.75</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Tax (VAT 15%):</span>
            <span className="font-medium text-foreground">ETB 45.20</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium text-foreground">2024-07-15</span>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total Amount Due:</span>
              <span className="text-3xl font-bold text-primary">ETB 395.95</span>
            </div>
          </div>
        </div>

        <Button className="w-full py-6 text-lg" size="lg">
          Pay Now
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Previous Bills</h2>
        
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
