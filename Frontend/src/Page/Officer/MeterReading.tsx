import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Gauge, Search, TrendingUp, AlertTriangle, Activity, Eye, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { api, officerApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface MeterReading {
  _id: string;
  account_number: string;
  meter_number: string;
  reading_kwh: number;
  reading_date: string;
  ai_status: "Normal" | "Anomaly" | "Need Investigation";
}

const MeterReadings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["meter-readings"],
    queryFn: async () => {
      const response = await officerApi.getMeterReadings();
      return response.data || [];
    },
  });

  const filteredReadings = readings.filter(
    (reading) =>
      reading.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.meter_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: readings.length,
    active: readings.filter((r) => r.ai_status === "Normal").length,
    anomalies: readings.filter((r) => r.ai_status === "Anomaly").length,
    flagged: readings.filter((r) => r.ai_status === "Need Investigation").length,
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Meter Readings" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meter Reading & Anomaly Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage water meter readings</p>
        </div>
        <Button onClick={() => navigate("/officer/meter-readings/add")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Reading
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Readings" value={stats.total} icon={<Activity className="h-5 w-5 text-primary" />} />
        <StatCard title="Active Meters" value={stats.active} icon={<Gauge className="h-5 w-5 text-green-600" />} />
        <StatCard title="Readings with Anomaly" value={stats.anomalies} icon={<AlertTriangle className="h-5 w-5 text-red-600" />} />
        <StatCard title="Flagged Suspected" value={stats.flagged} icon={<TrendingUp className="h-5 w-5 text-yellow-600" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Recent Meter Readings</CardTitle>
            <CardDescription>Overview of the latest meter readings and their AI-detected status</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Account or Meter Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[280px] md:w-[350px]"
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px]">
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
                  <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : filteredReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
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

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: JSX.Element }) => (
  <Card className="bg-white shadow-md border border-gray-200">
    <CardContent className="flex items-center justify-between gap-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-xl font-bold">{value.toLocaleString()}</span>
      </div>
    </CardContent>
  </Card>
);

export default MeterReadings;
