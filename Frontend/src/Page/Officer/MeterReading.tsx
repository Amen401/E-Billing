import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gauge, Search, TrendingUp, AlertTriangle, Activity, Eye } from "lucide-react";
import { Breadcrumb } from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface MeterReading {
  _id: string;
  account_number: string;
  meter_number: string;
  reading_kwh: number;
  reading_date: string;
  ai_status: "Normal" | "Anomaly" | "Need Investigation";
  customer_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MeterReadings = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["meter-readings"],
    queryFn: async () => {
      const response = await api.get<{ data: MeterReading[] }>("/officer/meter-readings");
      return response.data || [];
    },
  });

  const filteredReadings = readings.filter(reading =>
    reading.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reading.meter_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: readings.length,
    active: readings.filter(r => r.ai_status === "Normal").length,
    anomalies: readings.filter(r => r.ai_status === "Anomaly").length,
    flagged: readings.filter(r => r.ai_status === "Need Investigation").length,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb 
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Meter Readings" }
        ]} 
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meter Reading & Anomaly Management</h1>
        <p className="text-muted-foreground">Monitor and manage water meter readings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Meter Readings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Meters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold">{stats.active.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Readings with Anomaly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-2xl font-bold">{stats.anomalies}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flagged Suspected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <p className="text-2xl font-bold">{stats.flagged}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Meter Readings</CardTitle>
              <CardDescription>Overview of the latest meter readings and their AI-detected status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Account or Meter Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline">Filters</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Meter Number</TableHead>
                <TableHead>Reading (kWh)</TableHead>
                <TableHead>Reading Date</TableHead>
                <TableHead>AI Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {searchTerm ? "No meter readings found matching your search" : "No meter readings available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReadings.map((reading) => (
                  <TableRow key={reading._id}>
                    <TableCell className="font-medium">{reading.account_number}</TableCell>
                    <TableCell>{reading.meter_number}</TableCell>
                    <TableCell>{reading.reading_kwh}</TableCell>
                    <TableCell>{new Date(reading.reading_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reading.ai_status === "Normal"
                            ? "default"
                            : reading.ai_status === "Anomaly"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {reading.ai_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterReadings;