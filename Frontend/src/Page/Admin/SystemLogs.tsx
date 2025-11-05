import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import { adminApi } from "@/lib/api"; 
import { toast } from "sonner";

const SystemLogs = () => {
  const [systemActivities, setSystemActivities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "default";
      case "warning":
        return "destructive";
      case "pending":
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const activities = await adminApi.getSystemActivities();
      setSystemActivities(activities);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch system activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredActivities = systemActivities.filter((log) =>
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to export logs as CSV
  const exportLogs = () => {
    if (systemActivities.length === 0) {
      toast.error("No logs to export");
      return;
    }

    const header = ["Event", "User", "Timestamp", "IP Address", "Status"];
    const rows = systemActivities.map((log) => [
      `"${log.event}"`,
      `"${log.user}"`,
      `"${log.timestamp}"`,
      `"${log.ipAddress}"`,
      `"${log.status}"`,
    ]);

    const csvContent =
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `system_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="text-sm text-slate-600 mt-1">Monitor all system activities and events</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportLogs}>
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search logs by event, user, or timestamp..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{activity.event}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.timestamp}</TableCell>
                    <TableCell className="text-slate-600">{activity.ipAddress}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
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

export default SystemLogs;
