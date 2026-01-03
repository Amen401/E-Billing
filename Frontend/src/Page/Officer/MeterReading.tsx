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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning";
}

const StatCard = ({ title, value, icon, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card className="bg-card shadow-sm border border-border hover:shadow-md transition-shadow animate-fade-in">
      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
        <div className={`flex items-center justify-center p-3 rounded-xl ${variantStyles[variant]}`}>
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-card-foreground">
            {value.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Normal":
        return "success";
      case "Anomaly":
        return "destructive";
      default:
        return "warning";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/officer/dashboard" },
            { label: "Meter Readings" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Meter Reading & Anomaly Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor and manage water meter readings
            </p>
          </div>
          <Button
            onClick={() => navigate("/officer/meter-readings/add")}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Reading</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Readings"
            value={stats.total}
            icon={<Activity className="h-5 w-5" />}
            variant="default"
          />
          <StatCard
            title="Active Meters"
            value={stats.active}
            icon={<Gauge className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Anomalies"
            value={stats.anomalies}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
          <StatCard
            title="Flagged"
            value={stats.flagged}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="warning"
          />
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border border-border animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
              <CardTitle className="text-lg sm:text-xl font-semibold">
                Recent Meter Readings
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 w-full sm:w-[280px] lg:w-[320px]"
                  />
                </div>
                <Button variant="outline" onClick={handleSearch} className="shrink-0">
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 p-4 sm:p-0">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredReadings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No meter readings found matching your search"
                    : "No meter readings available"}
                </div>
              ) : (
                filteredReadings.map((reading) => (
                  <Card
                    key={reading._id}
                    className="cursor-pointer hover:shadow-md transition-shadow border border-border"
                    onClick={() => navigate(`/officer/meter-readings/${reading._id}`)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-card-foreground">
                            {reading.customerId?.name || "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reading.customerId?.accountNumber || "-"}
                          </p>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {reading.killowatRead} kWh
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {reading.dateOfSubmission}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={getStatusVariant(reading.anomalyStatus) as "success" | "destructive" | "warning"}
                          className="text-xs"
                        >
                          {reading.anomalyStatus}
                        </Badge>
                        <Badge
                          variant={reading.paymentStatus === "Paid" ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {reading.paymentStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Customer Name</TableHead>
                    <TableHead className="font-semibold">Account Number</TableHead>
                    <TableHead className="font-semibold">Reading (kWh)</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredReadings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm
                          ? "No meter readings found matching your search"
                          : "No meter readings available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReadings.map((reading) => (
                      <TableRow
                        key={reading._id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/officer/meter-readings/${reading._id}`)}
                      >
                        <TableCell className="font-medium">
                          {reading.customerId?.name || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {reading.customerId?.accountNumber || "-"}
                        </TableCell>
                        <TableCell>{reading.killowatRead}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {reading.dateOfSubmission}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(reading.anomalyStatus) as "success" | "destructive" | "warning"}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(reading._id);
                            }}
                          >
                            {reading.anomalyStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={reading.paymentStatus === "Paid" ? "success" : "destructive"}
                          >
                            {reading.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeterReadings;
