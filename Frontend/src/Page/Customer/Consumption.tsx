import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const consumptionData = [
  { month: "Jan", consumption: 165, average: 150 },
  { month: "Feb", consumption: 195, average: 180 },
  { month: "Mar", consumption: 158, average: 165 },
  { month: "Apr", consumption: 260, average: 240 },
  { month: "May", consumption: 335, average: 310 },
  { month: "Jun", consumption: 268, average: 250 },
  { month: "Jul", consumption: 280, average: 265 },
  { month: "Aug", consumption: 365, average: 340 },
  { month: "Sep", consumption: 330, average: 310 },
  { month: "Oct", consumption: 348, average: 325 },
  { month: "Nov", consumption: 355, average: 335 },
  { month: "Dec", consumption: 365, average: 345 },
];

const detailedData = [
  { month: "Dec 2023", reading: "123456", consumption: 350, amount: 780.50, status: "Paid" },
  { month: "Nov 2023", reading: "123106", consumption: 310, amount: 690.25, status: "Paid" },
  { month: "Oct 2023", reading: "122796", consumption: 320, amount: 710.00, status: "Paid" },
  { month: "Sep 2023", reading: "122476", consumption: 270, amount: 600.75, status: "Paid" },
  { month: "Aug 2023", reading: "122206", consumption: 300, amount: 665.00, status: "Overdue" },
  { month: "Jul 2023", reading: "121906", consumption: 260, amount: 575.60, status: "Paid" },
  { month: "Jun 2023", reading: "121646", consumption: 280, amount: 620.00, status: "Paid" },
];

const Consumption = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Consumption History</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label className="text-sm text-muted-foreground mb-2">Date Range</Label>
            <div className="flex items-center gap-3">
              <Input type="date" defaultValue="2025-07-16" className="bg-background" />
              <span className="text-muted-foreground">-</span>
              <Input type="date" defaultValue="2025-10-19" className="bg-background" />
            </div>
          </div>
          <Button variant="outline">Apply Filter</Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">Monthly Consumption (kWh)</h3>
            <p className="text-sm text-muted-foreground">Overview of your electricity usage over time.</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="consumption" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                name="Consumption kWh"
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--muted-foreground))", r: 3 }}
                name="Average Usage kWh"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">Detailed Consumption Data</h3>
            <p className="text-sm text-muted-foreground">Your historical electricity usage records.</p>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Billing Month</TableHead>
                  <TableHead>Meter Reading</TableHead>
                  <TableHead>Consumption (kWh)</TableHead>
                  <TableHead>Amount (ETB)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>{row.reading}</TableCell>
                    <TableCell>{row.consumption}</TableCell>
                    <TableCell>{row.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={row.status === "Paid" ? "default" : "destructive"}
                        className={row.status === "Paid" ? "bg-success hover:bg-success/90" : ""}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Consumption;
