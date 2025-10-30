import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MeterReadings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const readings = [
    {
      accountNumber: "ACC-50123",
      meterNumber: "MET-45678",
      reading: "1250",
      date: "2024-07-22",
      status: "Normal",
    },
    {
      accountNumber: "ACC-50124",
      meterNumber: "MET-45679",
      reading: "3450",
      date: "2024-07-21",
      status: "Anomaly",
    },
    {
      accountNumber: "ACC-50125",
      meterNumber: "MET-45680",
      reading: "90",
      date: "2024-07-22",
      status: "Normal",
    },
    {
      accountNumber: "ACC-50126",
      meterNumber: "MET-45681",
      reading: "0",
      date: "2024-07-23",
      status: "Fraud Suspected",
    },
    {
      accountNumber: "ACC-50127",
      meterNumber: "MET-45682",
      reading: "5600",
      date: "2024-07-24",
      status: "Normal",
    },
    {
      accountNumber: "ACC-50128",
      meterNumber: "MET-45683",
      reading: "200",
      date: "2024-07-27",
      status: "Anomaly",
    },
  ];

  const filteredReadings = readings.filter((reading) =>
    reading.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reading.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return (
          <Badge className="bg-success text-success-foreground">
            <Activity className="mr-1 h-3 w-3" />
            Normal
          </Badge>
        );
      case "Anomaly":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <TrendingUp className="mr-1 h-3 w-3" />
            Anomaly
          </Badge>
        );
      case "Fraud Suspected":
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Fraud Suspected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    {
      label: "Total Meter Readings",
      value: "12,500",
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Active Meters",
      value: "9,800",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Readings with Anomaly",
      value: "345",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      label: "Fraud Suspected",
      value: "12",
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/officer/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Meter Reading & Anomaly Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of the latest meter readings and their AI detected status.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Recent Meter Readings</CardTitle>
                <CardDescription>
                  Overview of the latest meter readings and their AI detected status.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Meter Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Account Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Meter Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Reading (kWh)
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Reading Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      AI Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((reading, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {reading.accountNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {reading.meterNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{reading.reading}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{reading.date}</td>
                      <td className="py-3 px-4">{getStatusBadge(reading.status)}</td>
                      <td className="py-3 px-4">
                        <Button variant="link" size="sm" className="text-primary">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default MeterReadings;
