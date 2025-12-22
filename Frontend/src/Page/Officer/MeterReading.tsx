import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Gauge,
  Search,
  TrendingUp,
  AlertTriangle,
  Activity,
  Eye,
  Plus,
} from "lucide-react";
import { Breadcrumb } from "@/components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface MeterReading {
  _id: string;
  customerId: { _id: string; name: string; accountNumber: string };
  killowatRead: number;
  anomalyStatus: "Normal" | "Anomaly" | "Need Investigation";
  paymentStatus: "Paid" | "Not Paid";
  dateOfSubmission: string;
  photo: { secure_url: string };
}

const MeterReadings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const {
    data: readings = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["meter-readings"],
    queryFn: async () => {
      const response = await officerApi.getAllMeterReadings();
      return response || [];
    },
  });

  const handleSearch = async () => {
    if (!searchTerm) return refetch();
    const response = await officerApi.searchMeterReadings(searchTerm);
    return response || [];
  };

  const toggleStatus = async (readingId: string) => {
    try {
      await officerApi.chnageMeterReadingStatus({ id: readingId });
      refetch();
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  const filteredReadings = readings.filter((reading) => {
    const search = searchTerm.toLowerCase();
    const customerName = reading.customerId?.name?.toLowerCase() || "";
    const accountNumber = reading.customerId?.accountNumber?.toLowerCase() || "";
    const paymentStatus = reading.paymentStatus?.toLowerCase() || "";

    return (
      customerName.includes(search) ||
      accountNumber.includes(search) ||
      paymentStatus.includes(search)
    );
  });

  const stats = {
    total: readings.length,
    active: readings.filter((r) => r.anomalyStatus === "Normal").length,
    anomalies: readings.filter((r) => r.anomalyStatus === "Anomaly").length,
    flagged: readings.filter((r) => r.anomalyStatus === "Need Investigation").length,
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Meter Readings" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-6 gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">
            Meter Reading & Anomaly Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage water meter readings
          </p>
        </div>
        <Button
          onClick={() => navigate("/officer/meter-readings/add")}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Add Reading
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Readings"
          value={stats.total}
          icon={<Activity className="h-5 w-5 text-primary mr-2" />}
        />
        <StatCard
          title="Active Meters"
          value={stats.active}
          icon={<Gauge className="h-5 w-5 text-green-600 mr-2" />}
        />
        <StatCard
          title="Readings with Anomaly"
          value={stats.anomalies}
          icon={<AlertTriangle className="h-5 w-5 text-red-600 mr-2" />}
        />
        <StatCard
          title="Flagged Suspected"
          value={stats.flagged}
          icon={<TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Recent Meter Readings</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Customer Name, Account or Payment Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={handleSearch}
                className="pl-10 w-[280px] md:w-[350px]"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Reading (kWh)</TableHead>
                <TableHead>Date of Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {searchTerm
                      ? "No meter readings found matching your search"
                      : "No meter readings available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReadings.map((reading) => (
                  <TableRow
                    key={reading._id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      navigate(`/officer/meter-readings/${reading._id}`)
                    }
                  >
                    <TableCell>{reading.customerId?.name || "-"}</TableCell>
                    <TableCell>{reading.customerId?.accountNumber || "-"}</TableCell>
                    <TableCell>{reading.killowatRead}</TableCell>
                    <TableCell>{reading.dateOfSubmission}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={
                          reading.anomalyStatus === "Normal"
                            ? "default"
                            : reading.anomalyStatus === "Anomaly"
                            ? "destructive"
                            : "secondary"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(reading._id);
                        }}
                      >
                        {reading.anomalyStatus}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reading.paymentStatus === "Paid" ? "default" : "destructive"
                        }
                        size="sm"
                      >
                        {reading.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Eye className="h-4 w-4" />
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

const StatCard = ({ title, value, icon }) => (
  <Card className="bg-white shadow-md border border-gray-200">
    <CardContent className="flex items-center gap-6 p-4">
      <div className="flex items-center justify-center p-2 rounded-md bg-gray-100">
        {icon}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-xl font-bold">{value.toLocaleString()}</span>
      </div>
    </CardContent>
  </Card>
);

export default MeterReadings;
