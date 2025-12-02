import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "late" | "paid";
  lateFee?: number;
  meterNumber: string;
}

const STATUS_VARIANTS: Record<Payment["status"], string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  approved: "bg-primary/20 text-primary border-primary/30",
  late: "bg-destructive/20 text-destructive border-destructive/30",
  paid: "bg-success/20 text-success border-success/30",
};

const SchedulePayment = () => {
  const [payments, setPayments] = useState<Payment[]>([
    { id: "1", userId: "U001", userName: "Abebe Kebede", amount: 450, startDate: "2025-12-01", endDate: "2025-12-05", status: "pending", lateFee: 0, meterNumber: "ETH-2345-8901" },
    { id: "2", userId: "U002", userName: "Tigist Haile", amount: 680, startDate: "2025-12-03", endDate: "2025-12-10", status: "pending", lateFee: 0, meterNumber: "ETH-2345-8902" },
    { id: "3", userId: "U003", userName: "Yohannes Tadesse", amount: 320, startDate: "2025-11-25", endDate: "2025-11-28", status: "pending", lateFee: 0, meterNumber: "ETH-2345-8903" },
  ]);

  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Update payment status manually
  const handleStatusChange = (id: string, status: Payment["status"]) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated: Payment = {
            ...p,
            status,
            lateFee: status === "late" ? Math.round(p.amount * 0.1) : status === "paid" ? 0 : p.lateFee,
          };
          return updated;
        }
        return p;
      })
    );
    const payment = payments.find(p => p.id === id);
    if (payment) toast.success(`Payment status updated: ${payment.userName} → ${status}`);
  };

  // Compute dynamic status and late fee
  const filteredPayments = payments
    .map(p => {
      const today = new Date();
      const end = new Date(p.endDate);
      const isLate = today > end && p.status === "pending";
      return {
        ...p,
        status: isLate ? "late" : p.status,
        lateFee: isLate ? Math.round(p.amount * 0.1) : p.lateFee || 0,
      };
    })
    .filter(p => {
      if (!dateRange.start || !dateRange.end) return true;
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const paymentDate = new Date(p.startDate);
      return paymentDate >= start && paymentDate <= end;
    });

  const getStatusBadge = (status: Payment["status"]) => (
    <Badge variant="outline" className={STATUS_VARIANTS[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Officer Payment Schedule</h1>
          <p className="text-muted-foreground">View and manage customer payments by date range</p>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Schedule</CardTitle>
            <CardDescription>Select a date range to view payments</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="flex flex-col">
              <Label>Start Date</Label>
              <Input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="flex flex-col">
              <Label>End Date</Label>
              <Input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
            <Button onClick={() => toast.success("Filtered payments loaded")}>Apply Filter</Button>
          </CardContent>
        </Card>

        {/* Payment Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Payments ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Meter Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Late Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.userName}</TableCell>
                    <TableCell>{p.userId}</TableCell>
                    <TableCell>{p.meterNumber}</TableCell>
                    <TableCell>{p.amount} Birr</TableCell>
                    <TableCell>{new Date(p.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(p.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell>{p.lateFee || 0} Birr</TableCell>
                    <TableCell>
                      <Select value={p.status} onValueChange={v => handleStatusChange(p.id, v as Payment["status"])}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulePayment;
