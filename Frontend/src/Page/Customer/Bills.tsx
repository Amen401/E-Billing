import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { useEffect, useState } from "react";
import type { Bill } from "@/types/types";
import { customerApi } from "@/lib/api";



const Bills = () => {
  const [previousBills, setPreviousBills] = useState<Bill[]>([]);
  useEffect(() => {
  const fetchPaidBills = async () => {
    try {
    const res=await customerApi.getpaidbills();
       setPreviousBills(res.bills);
    } catch (err) {
      console.error(err);
    }
  };

  fetchPaidBills();
}, []);

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
                  <TableCell className="font-medium">{`Bill-${bill.id.slice(-4)}`}</TableCell>
                  <TableCell>{bill.month}</TableCell>
                  <TableCell>{bill.consumption}</TableCell>
                  <TableCell>ETB {bill.amount.toFixed(2)}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <Badge className="bg-success bg-black text-white hover:bg-success/90">
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
